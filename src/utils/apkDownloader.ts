import { collection, doc, writeBatch, getDocs, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Chunk size in characters (approx 900 KB each, very safe for Firestore 1MB document limit)
const CHUNK_SIZE = 900000;

// Helper sleep function to pace Firestore writes
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function saveApkChunks(
  appId: string, 
  base64Data: string,
  onProgress?: (percent: number, currentChunk: number, totalChunks: number) => void
): Promise<string> {
  // 1. Delete any existing chunks first to prevent leftovers
  await deleteApkChunks(appId);

  // 2. Split base64 into chunks
  const totalLength = base64Data.length;
  const numChunks = Math.ceil(totalLength / CHUNK_SIZE);
  
  // Write chunks in small batches of 4 to keep single-request payload size under 4MB
  // and to avoid write stream exhaustion by waiting longer between sequential commits
  const batchSize = 4;
  for (let i = 0; i < numChunks; i += batchSize) {
    const batch = writeBatch(db);
    const limit = Math.min(i + batchSize, numChunks);
    
    for (let k = i; k < limit; k++) {
      const start = k * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, totalLength);
      const chunkData = base64Data.substring(start, end);

      const chunkRef = doc(db, 'apps', appId, 'apkChunks', `chunk-${k}`);
      batch.set(chunkRef, {
        index: k,
        data: chunkData,
      });
    }

    // Commit batch and wait for completion
    await batch.commit();

    if (onProgress) {
      const currentWritten = limit;
      const percent = Math.round((currentWritten / numChunks) * 100);
      onProgress(percent, currentWritten, numChunks);
    }

    // A sleep of 600ms to allow the client stream buffer to fully drain
    await sleep(600);
  }

  // Save info doc with metadata for fast sequential/parallel reads
  try {
    await setDoc(doc(db, 'apps', appId, 'apkChunks', 'info'), { numChunks });
  } catch (err) {
    console.error("Failed to write chunks info document:", err);
  }

  // Return special indicator URL so the downloader knows to fetch from chunks subcollection
  return `chunks://${appId}`;
}

export async function deleteApkChunks(appId: string) {
  try {
    const colRef = collection(db, 'apps', appId, 'apkChunks');
    const snapshot = await getDocs(colRef);
    
    if (!snapshot.empty) {
      const docs = snapshot.docs;
      const batchSize = 200;
      for (let i = 0; i < docs.length; i += batchSize) {
        const batch = writeBatch(db);
        const limit = Math.min(i + batchSize, docs.length);
        for (let k = i; k < limit; k++) {
          batch.delete(docs[k].ref);
        }
        await batch.commit();
        await sleep(200);
      }
    }
  } catch (err) {
    console.error("Error deleting old APK chunks:", err);
  }
}

export async function fetchAndReassembleApk(appId: string, onProgress?: (percent: number) => void): Promise<string> {
  // First, try to fetch the 'info' document
  let numChunks = 0;
  try {
    const infoSnap = await getDoc(doc(db, 'apps', appId, 'apkChunks', 'info'));
    if (infoSnap.exists()) {
      numChunks = infoSnap.data().numChunks || 0;
    }
  } catch (err) {
    console.warn("Failed to fetch APK chunks info document, falling back to query:", err);
  }

  if (numChunks > 0) {
    const chunkPromises: Promise<string>[] = [];
    let completedCount = 0;

    // We can fetch chunks concurrently!
    const fetchChunk = async (index: number): Promise<string> => {
      const chunkDoc = await getDoc(doc(db, 'apps', appId, 'apkChunks', `chunk-${index}`));
      if (!chunkDoc.exists()) {
        throw new Error(`Chunk ${index} not found.`);
      }
      completedCount++;
      if (onProgress) {
        onProgress(Math.round((completedCount / numChunks) * 100));
      }
      return chunkDoc.data().data || '';
    };

    // Create array of promises
    for (let i = 0; i < numChunks; i++) {
      chunkPromises.push(fetchChunk(i));
    }

    // Wait for all chunks to resolve in parallel (extremely fast!)
    const chunks = await Promise.all(chunkPromises);
    return chunks.join('');
  }

  // Fallback if no info document exists yet (self-healing)
  const colRef = collection(db, 'apps', appId, 'apkChunks');
  const snapshot = await getDocs(colRef);
  
  if (snapshot.empty) {
    throw new Error("No APK chunks found in database. The file may be missing or corrupt.");
  }

  // Filter out the info document itself if it exists
  const chunkDocs = snapshot.docs.filter(d => d.id !== 'info');

  // Sort docs by their chunk index
  const sortedDocs = [...chunkDocs].sort((a, b) => {
    const aData = a.data();
    const bData = b.data();
    return (aData.index ?? 0) - (bData.index ?? 0);
  });

  let fullBase64 = '';
  const total = sortedDocs.length;

  for (let i = 0; i < total; i++) {
    const docData = sortedDocs[i].data();
    fullBase64 += docData.data || '';
    if (onProgress) {
      onProgress(Math.round(((i + 1) / total) * 100));
    }
  }

  // Self-heal: Write back the info document for future lightning-fast loads
  try {
    await setDoc(doc(db, 'apps', appId, 'apkChunks', 'info'), { numChunks: total });
  } catch (err) {
    console.warn("Failed to write back info document for self-healing:", err);
  }

  return fullBase64;
}

export function downloadBase64File(base64Data: string, fileName: string) {
  try {
    // Check if it is a valid data URI
    if (!base64Data.startsWith('data:')) {
      throw new Error("Invalid base64 format");
    }

    const parts = base64Data.split(';base64,');
    if (parts.length < 2) {
      throw new Error("Base64 segment not found");
    }

    const contentType = parts[0].split(':')[1] || 'application/vnd.android.package-archive';
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    const blob = new Blob([uInt8Array], { type: contentType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up object URL after a short delay
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  } catch (e) {
    console.error("Failed to download file:", e);
    alert("Could not process and download this app binary.");
  }
}
