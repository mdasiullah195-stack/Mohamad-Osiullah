import { collection, doc, writeBatch, getDocs, setDoc } from 'firebase/firestore';
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
  const colRef = collection(db, 'apps', appId, 'apkChunks');
  const snapshot = await getDocs(colRef);
  
  if (snapshot.empty) {
    throw new Error("No APK chunks found in database. The file may be missing or corrupt.");
  }

  // Sort docs by their chunk index
  const docs = [...snapshot.docs].sort((a, b) => {
    const aData = a.data();
    const bData = b.data();
    return (aData.index ?? 0) - (bData.index ?? 0);
  });

  let fullBase64 = '';
  const total = docs.length;

  for (let i = 0; i < total; i++) {
    const docData = docs[i].data();
    fullBase64 += docData.data || '';
    if (onProgress) {
      onProgress(Math.round(((i + 1) / total) * 100));
    }
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
