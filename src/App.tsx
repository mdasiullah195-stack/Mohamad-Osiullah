import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  db, 
  auth, 
  signInWithGoogle, 
  signInWithEmail,
  logOut, 
  handleFirestoreError, 
  OperationType 
} from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  increment, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

// Types
import { 
  Portfolio, 
  Website, 
  App as MobileApp, 
  RoadmapItem, 
  Announcement, 
  Contact, 
  AnalyticsStats 
} from './types';

// APK Chunking utilities
import { saveApkChunks, deleteApkChunks } from './utils/apkDownloader';
import { Language, translations } from './utils/translations';

// Seed Fallback Data
import { 
  defaultPortfolio, 
  defaultWebsites, 
  defaultApps, 
  defaultRoadmap, 
  defaultAnnouncements 
} from './seedData';

// Sub Components
import Navbar from './components/Navbar';
import AnnouncementBanner from './components/AnnouncementBanner';
import Hero from './components/Hero';
import ProjectCard, { ProjectCardSkeleton } from './components/ProjectCard';
import ProjectDetailModal from './components/ProjectDetailModal';
import RoadmapSection from './components/RoadmapSection';
import ContactForm from './components/ContactForm';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';

// Icons
import { Globe, Smartphone, Sparkles, Calendar, Mail, Compass, Star, ChevronRight, Lock, Laptop, ArrowUp, Search, Megaphone, Bell, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

// Framer Motion staggered animation configurations
const gridContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const gridItemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

export default function App() {
  
  // Theme State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    // Fallback: Default to dark theme for that premium cosmic vibe
    return true;
  });

  // Section Navigation & Scroll Ref hooks
  const [currentSection, setCurrentSection] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const currentSectionRef = useRef('home');
  useEffect(() => {
    currentSectionRef.current = currentSection;
  }, [currentSection]);

  const homeRef = useRef<HTMLDivElement>(null);
  const websitesRef = useRef<HTMLDivElement>(null);
  const appsRef = useRef<HTMLDivElement>(null);
  const roadmapRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  // Firestore DB States
  const [portfolio, setPortfolio] = useState<Portfolio>(() => {
    try {
      const cached = localStorage.getItem('cached_portfolio_v1');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn("Could not read cached portfolio", e);
    }
    return defaultPortfolio;
  });
  const [websites, setWebsites] = useState<Website[]>([]);
  const [apps, setApps] = useState<MobileApp[]>([]);
  const [websitesLoaded, setWebsitesLoaded] = useState<boolean>(false);
  const [appsLoaded, setAppsLoaded] = useState<boolean>(false);
  const loading = !websitesLoaded || !appsLoaded;

  // Language switcher state
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('portfolio_lang');
    if (stored === 'EN' || stored === 'NE') {
      return stored as Language;
    }
    return 'EN';
  });

  useEffect(() => {
    localStorage.setItem('portfolio_lang', language);
  }, [language]);

  const t = translations[language];
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsStats>({
    visitors: 0, clicks: 0, downloads: 0, views: 0, dailyLogs: {}
  });

  // Auth States
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);

  // Modals & Overlays
  const [selectedProject, setSelectedProject] = useState<Website | MobileApp | null>(null);
  const [selectedType, setSelectedType] = useState<'website' | 'app' | null>(null);

  // Dark Mode side effects
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'dark-none'); // Disable
    }
  }, [darkMode]);

  // Track Auth Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Authorize if user email is mdasiullah195@gmail.com or mohamadosiullah@gmail.com
        const hasAccess = currentUser.email === 'mdasiullah195@gmail.com' || currentUser.email === 'mohamadosiullah@gmail.com';
        setIsAdmin(hasAccess);
        if (!hasAccess) {
          console.log(`Signed in but not authorized as admin: ${currentUser.email}`);
        }
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // -------------------------------------------------------------
  // Load and Listen to Firestore Real-time Collections
  // -------------------------------------------------------------
  useEffect(() => {
    // 1. Listen to Portfolio
    const unsubPortfolio = onSnapshot(doc(db, 'portfolio', 'main'), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Portfolio;
        setPortfolio(data);
        try {
          localStorage.setItem('cached_portfolio_v1', JSON.stringify(data));
        } catch (e) {
          console.warn('Could not cache portfolio', e);
        }
      } else {
        // Seed Portfolio if blank
        setDoc(doc(db, 'portfolio', 'main'), defaultPortfolio).catch(err => {
          console.warn('Silent fallback: Could not write portfolio seed', err);
        });
        setPortfolio(defaultPortfolio);
      }
    }, (err) => {
      console.warn('Firestore portfolio offline, falling back to seed');
    });

    // 2. Listen to Websites
    const unsubWebsites = onSnapshot(query(collection(db, 'websites'), orderBy('createdAt', 'desc')), (snap) => {
      if (!snap.empty) {
        const webList: Website[] = [];
        snap.forEach(docSnap => {
          webList.push({ id: docSnap.id, ...docSnap.data() } as Website);
        });
        setWebsites(webList);
        localStorage.setItem('portfolio_seeded_websites_v1', 'true');
      } else {
        const hasSeeded = localStorage.getItem('portfolio_seeded_websites_v1');
        if (!hasSeeded) {
          // Seed default websites
          defaultWebsites.forEach(web => {
            const { id, ...data } = web;
            setDoc(doc(db, 'websites', id), data).catch(() => {});
          });
          setWebsites(defaultWebsites);
          localStorage.setItem('portfolio_seeded_websites_v1', 'true');
        } else {
          setWebsites([]);
        }
      }
      setWebsitesLoaded(true);
    }, (err) => {
      setWebsites(defaultWebsites);
      setWebsitesLoaded(true);
    });

    // 3. Listen to Apps
    const unsubApps = onSnapshot(collection(db, 'apps'), (snap) => {
      if (!snap.empty) {
        const appList: MobileApp[] = [];
        snap.forEach(docSnap => {
          appList.push({ id: docSnap.id, ...docSnap.data() } as MobileApp);
        });
        setApps(appList);
        localStorage.setItem('portfolio_seeded_apps_v1', 'true');
      } else {
        const hasSeeded = localStorage.getItem('portfolio_seeded_apps_v1');
        if (!hasSeeded) {
          // Seed default apps
          defaultApps.forEach(appItem => {
            const { id, ...data } = appItem;
            setDoc(doc(db, 'apps', id), data).catch(() => {});
          });
          setApps(defaultApps);
          localStorage.setItem('portfolio_seeded_apps_v1', 'true');
        } else {
          setApps([]);
        }
      }
      setAppsLoaded(true);
    }, (err) => {
      setApps(defaultApps);
      setAppsLoaded(true);
    });

    // 4. Listen to Roadmap Milestones
    const unsubRoadmap = onSnapshot(collection(db, 'roadmap'), (snap) => {
      if (!snap.empty) {
        const roadList: RoadmapItem[] = [];
        snap.forEach(docSnap => {
          roadList.push({ id: docSnap.id, ...docSnap.data() } as RoadmapItem);
        });
        setRoadmap(roadList);
        localStorage.setItem('portfolio_seeded_roadmap_v1', 'true');
      } else {
        const hasSeeded = localStorage.getItem('portfolio_seeded_roadmap_v1');
        if (!hasSeeded) {
          // Seed default roadmap
          defaultRoadmap.forEach(item => {
            const { id, ...data } = item;
            setDoc(doc(db, 'roadmap', id), data).catch(() => {});
          });
          setRoadmap(defaultRoadmap);
          localStorage.setItem('portfolio_seeded_roadmap_v1', 'true');
        } else {
          setRoadmap([]);
        }
      }
    }, (err) => {
      setRoadmap(defaultRoadmap);
    });

    // 5. Listen to Announcement Banner notices
    const unsubAnnouncements = onSnapshot(collection(db, 'announcements'), (snap) => {
      if (!snap.empty) {
        const annList: Announcement[] = [];
        snap.forEach(docSnap => {
          annList.push({ id: docSnap.id, ...docSnap.data() } as Announcement);
        });
        setAnnouncements(annList);
        localStorage.setItem('portfolio_seeded_announcements_v1', 'true');
      } else {
        const hasSeeded = localStorage.getItem('portfolio_seeded_announcements_v1');
        if (!hasSeeded) {
          // Seed announcements
          defaultAnnouncements.forEach(ann => {
            const { id, ...data } = ann;
            setDoc(doc(db, 'announcements', id), data).catch(() => {});
          });
          setAnnouncements(defaultAnnouncements);
          localStorage.setItem('portfolio_seeded_announcements_v1', 'true');
        } else {
          setAnnouncements([]);
        }
      }
    }, (err) => {
      setAnnouncements(defaultAnnouncements);
    });

    // 6. Listen to Site Analytics stats
    const unsubAnalytics = onSnapshot(doc(db, 'analytics', 'stats'), (snap) => {
      if (snap.exists()) {
        setAnalytics(snap.data() as AnalyticsStats);
      } else {
        // Seed analytics stats
        const initStats: AnalyticsStats = { visitors: 1, clicks: 0, downloads: 0, views: 1, dailyLogs: {} };
        setDoc(doc(db, 'analytics', 'stats'), initStats).catch(() => {});
      }
    }, (err) => {
      // offline fallback
    });

    return () => {
      unsubPortfolio();
      unsubWebsites();
      unsubApps();
      unsubRoadmap();
      unsubAnnouncements();
      unsubAnalytics();
    };
  }, [user]);

  // 7. Listen to Contact messages (Only if logged in as Admin)
  useEffect(() => {
    if (!isAdmin) return;
    const unsubContacts = onSnapshot(query(collection(db, 'contacts'), orderBy('createdAt', 'desc')), (snap) => {
      const msgList: Contact[] = [];
      snap.forEach(docSnap => {
        const data = docSnap.data();
        msgList.push({
          id: docSnap.id,
          name: data.name,
          email: data.email,
          message: data.message,
          createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
          read: data.read || false
        });
      });
      setContacts(msgList);
    }, (err) => {
      console.warn('Contacts listener offline');
    });
    return () => unsubContacts();
  }, [isAdmin]);

  // One-time cleanup for obsolete seeded welcome announcement
  useEffect(() => {
    const cleanObsoleteWelcomeAnnouncement = async () => {
      try {
        await deleteDoc(doc(db, 'announcements', 'ann-welcome'));
      } catch (err) {
        console.warn('Silent cleanup of obsolete welcome announcement ignored:', err);
      }
    };
    cleanObsoleteWelcomeAnnouncement();
  }, []);

  // Handle direct links via URL hash
  useEffect(() => {
    if (websites.length > 0 || apps.length > 0) {
      const handleHashChange = () => {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#')) {
          const parts = hash.substring(1).split('-');
          if (parts.length >= 2) {
            const type = parts[0];
            const id = parts.slice(1).join('-');
            if (type === 'website') {
              const found = websites.find(w => w.id === id);
              if (found) {
                setSelectedProject(found);
                setSelectedType('website');
              }
            } else if (type === 'app') {
              const found = apps.find(a => a.id === id);
              if (found) {
                setSelectedProject(found);
                setSelectedType('app');
              }
            }
          }
        }
      };

      handleHashChange();
      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }
  }, [websites, apps]);

  // -------------------------------------------------------------
  // Global View Analytics & Visit Logging
  // -------------------------------------------------------------
  useEffect(() => {
    // Increment total visitors on initial page load
    const visitorLogged = sessionStorage.getItem('portfolio_visitor_logged');
    if (!visitorLogged) {
      sessionStorage.setItem('portfolio_visitor_logged', 'true');
      const statsDoc = doc(db, 'analytics', 'stats');
      updateDoc(statsDoc, {
        visitors: increment(1),
        views: increment(1)
      }).catch(() => {
        // fallback silent
      });
    }
  }, []);

  // -------------------------------------------------------------
  // Scroll reveal trigger listener, Back to Top visibility, Scrollspy & Progress Bar
  // -------------------------------------------------------------
  useEffect(() => {
    const handleScroll = () => {
      const reveals = document.querySelectorAll('.reveal-on-scroll');
      reveals.forEach((elem) => {
        const rect = elem.getBoundingClientRect();
        if (rect.top < window.innerHeight - 80) {
          elem.classList.add('active');
        }
      });

      // Show back to top button when scrolled past hero section (approx 500px)
      if (window.scrollY > 500) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }

      // Calculate scroll progress percentage
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }

      // Scrollspy logic to automatically highlight the current active section
      if (currentSectionRef.current !== 'admin') {
        const sections = ['home', 'websites', 'apps', 'roadmap', 'contact'];
        const offset = 140; // sticky navbar offset + safe padding
        let activeSec = 'home';
        
        for (const sec of sections) {
          const el = document.getElementById(sec);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= offset) {
              activeSec = sec;
            }
          }
        }
        
        if (currentSectionRef.current !== activeSec) {
          setCurrentSection(activeSec);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Trigger initially
    return () => window.removeEventListener('scroll', handleScroll);
  }, [websites, apps]);

  // -------------------------------------------------------------
  // Keyboard Shortcuts Handler
  // -------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger shortcuts if user is typing in inputs or textareas
      const activeEl = document.activeElement;
      if (activeEl) {
        const tagName = activeEl.tagName.toLowerCase();
        if (
          tagName === 'input' || 
          tagName === 'textarea' || 
          activeEl.getAttribute('contenteditable') === 'true'
        ) {
          return;
        }
      }

      const key = e.key.toLowerCase();
      if (key === 'w') {
        e.preventDefault();
        handleNavigate('websites');
      } else if (key === 'a') {
        e.preventDefault();
        handleNavigate('apps');
      } else if (key === 'c') {
        e.preventDefault();
        handleNavigate('contact');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // -------------------------------------------------------------
  // Navigation Handler (Page Scroll or Tab Change)
  // -------------------------------------------------------------
  const handleNavigate = (section: string) => {
    setCurrentSection(section);
    
    if (section === 'admin') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Map section IDs to refs
    let targetRef: React.RefObject<HTMLDivElement | null> | null = null;
    switch (section) {
      case 'home': targetRef = homeRef; break;
      case 'websites': targetRef = websitesRef; break;
      case 'apps': targetRef = appsRef; break;
      case 'roadmap': targetRef = roadmapRef; break;
      case 'contact': targetRef = contactRef; break;
    }

    if (targetRef && targetRef.current) {
      const offset = 80; // offset for sticky navbar
      const elementPosition = targetRef.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  };

  // -------------------------------------------------------------
  // Admin Authentication Handlers
  // -------------------------------------------------------------
  const handleOpenLogin = () => {
    setLoginModalOpen(true);
  };

  const handleGoogleLogin = async () => {
    try {
      const signedInUser = await signInWithGoogle();
      if (signedInUser && (signedInUser.email === 'mdasiullah195@gmail.com' || signedInUser.email === 'mohamadosiullah@gmail.com')) {
        setIsAdmin(true);
        setCurrentSection('admin');
        alert(`Welcome back, Mohamad! Admin authentication successful.`);
      } else {
        alert(`Access Denied: Only mohamadosiullah@gmail.com or mdasiullah195@gmail.com can manage database documents.`);
        await logOut();
        setIsAdmin(false);
      }
    } catch (err) {
      console.error('Google login error', err);
      throw err;
    }
  };

  const handleEmailLogin = async (email: string, pass: string) => {
    try {
      const signedInUser = await signInWithEmail(email, pass);
      if (signedInUser && (signedInUser.email === 'mdasiullah195@gmail.com' || signedInUser.email === 'mohamadosiullah@gmail.com')) {
        setIsAdmin(true);
        setCurrentSection('admin');
        alert(`Welcome back, Mohamad! Email authentication successful.`);
      } else {
        alert(`Access Denied: Unrecognized administrator credentials.`);
        await logOut();
        setIsAdmin(false);
      }
    } catch (err: any) {
      console.error('Email login error', err);
      throw err;
    }
  };

  const handleLogout = async () => {
    await logOut();
    setIsAdmin(false);
    setCurrentSection('home');
    alert('Logged out from admin panel.');
  };

  // -------------------------------------------------------------
  // Dynamic Real-time Increments (Downloads / Views / Clicks)
  // -------------------------------------------------------------
  const handleIncrementCount = async (
    projectId: string, 
    type: 'website' | 'app', 
    field: 'views' | 'clicks' | 'downloads'
  ) => {
    try {
      const coll = type === 'website' ? 'websites' : 'apps';
      const projectDocRef = doc(db, coll, projectId);
      
      // 1. Increment on Project doc
      await updateDoc(projectDocRef, {
        [field]: increment(1)
      });

      // 2. Increment global stats
      const statsDocRef = doc(db, 'analytics', 'stats');
      const statField = field === 'clicks' ? 'clicks' : (field === 'downloads' ? 'downloads' : 'views');
      await updateDoc(statsDocRef, {
        [statField]: increment(1)
      });
    } catch (error) {
      console.warn('Real-time counter increment error', error);
    }
  };

  // -------------------------------------------------------------
  // Portfolio Crud Operations
  // -------------------------------------------------------------
  const handleUpdatePortfolio = async (updatedPortfolio: Portfolio) => {
    const portfolioPath = 'portfolio/main';
    try {
      await setDoc(doc(db, 'portfolio', 'main'), updatedPortfolio);
      setPortfolio(updatedPortfolio);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, portfolioPath);
    }
  };

  // -------------------------------------------------------------
  // Websites Crud Operations
  // -------------------------------------------------------------
  const handleAddWebsite = async (newWeb: Omit<Website, 'id' | 'views' | 'clicks' | 'createdAt'>) => {
    const webPath = 'websites';
    try {
      const generatedId = `web-${Date.now()}`;
      const payload: Website = {
        id: generatedId,
        ...newWeb,
        views: 0,
        clicks: 0,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, webPath, generatedId), payload);
      alert('Website added to directory successfully.');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, webPath);
    }
  };

  const handleEditWebsite = async (updatedWeb: Website) => {
    const webPath = `websites/${updatedWeb.id}`;
    try {
      await updateDoc(doc(db, 'websites', updatedWeb.id), {
        name: updatedWeb.name,
        description: updatedWeb.description,
        category: updatedWeb.category,
        url: updatedWeb.url,
        screenshot: updatedWeb.screenshot,
        bannerImage: updatedWeb.bannerImage || '',
        featured: updatedWeb.featured,
        rating: updatedWeb.rating,
        screenshots: updatedWeb.screenshots || [],
        version: updatedWeb.version || 'v1.0.0',
        releaseDate: updatedWeb.releaseDate || '',
        updateDate: updatedWeb.updateDate || '',
        changelog: updatedWeb.changelog || ''
      });
      alert('Website directory record updated successfully.');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, webPath);
    }
  };

  const handleDeleteWebsite = async (id: string) => {
    const webPath = `websites/${id}`;
    try {
      await deleteDoc(doc(db, 'websites', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, webPath);
    }
  };

  // -------------------------------------------------------------
  // Apps Crud Operations
  // -------------------------------------------------------------
  const handleAddApp = async (newApp: Omit<MobileApp, 'id' | 'views' | 'downloads'>, onProgress?: (percent: number) => void) => {
    const appPath = 'apps';
    try {
      const generatedId = `app-${Date.now()}`;
      
      let finalApkUrl = newApp.apkUrl;
      if (newApp.apkUrl && newApp.apkUrl.startsWith('data:')) {
        finalApkUrl = await saveApkChunks(generatedId, newApp.apkUrl, onProgress);
      }

      const payload: MobileApp = {
        id: generatedId,
        ...newApp,
        apkUrl: finalApkUrl,
        views: 0,
        downloads: 0
      };
      await setDoc(doc(db, appPath, generatedId), payload);
      alert('Mobile application published successfully.');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, appPath);
    }
  };

  const handleEditApp = async (updatedApp: MobileApp, onProgress?: (percent: number) => void) => {
    const appPath = `apps/${updatedApp.id}`;
    try {
      let finalApkUrl = updatedApp.apkUrl;
      if (updatedApp.apkUrl && updatedApp.apkUrl.startsWith('data:')) {
        finalApkUrl = await saveApkChunks(updatedApp.id, updatedApp.apkUrl, onProgress);
      }

      await updateDoc(doc(db, 'apps', updatedApp.id), {
        name: updatedApp.name,
        description: updatedApp.description,
        category: updatedApp.category,
        icon: updatedApp.icon,
        apkUrl: finalApkUrl,
        version: updatedApp.version,
        size: updatedApp.size,
        changelog: updatedApp.changelog,
        featured: updatedApp.featured,
        rating: updatedApp.rating,
        releaseDate: updatedApp.releaseDate,
        updateDate: updatedApp.updateDate,
        screenshots: updatedApp.screenshots,
        banner: updatedApp.banner || ''
      });
      alert('Application catalog record updated successfully.');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, appPath);
    }
  };

  const handleDeleteApp = async (id: string) => {
    const appPath = `apps/${id}`;
    try {
      await deleteApkChunks(id);
      await deleteDoc(doc(db, 'apps', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, appPath);
    }
  };

  // -------------------------------------------------------------
  // Roadmap Crud Operations
  // -------------------------------------------------------------
  const handleAddRoadmap = async (newRoad: Omit<RoadmapItem, 'id' | 'createdAt'>) => {
    const roadPath = 'roadmap';
    try {
      const generatedId = `road-${Date.now()}`;
      const payload: RoadmapItem = {
        id: generatedId,
        ...newRoad,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, roadPath, generatedId), payload);
      alert('Milestone added to roadmap track.');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, roadPath);
    }
  };

  const handleEditRoadmap = async (updatedRoad: RoadmapItem) => {
    const roadPath = `roadmap/${updatedRoad.id}`;
    try {
      await updateDoc(doc(db, 'roadmap', updatedRoad.id), {
        title: updatedRoad.title,
        description: updatedRoad.description,
        date: updatedRoad.date,
        status: updatedRoad.status
      });
      alert('Roadmap milestone updated.');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, roadPath);
    }
  };

  const handleDeleteRoadmap = async (id: string) => {
    const roadPath = `roadmap/${id}`;
    try {
      await deleteDoc(doc(db, 'roadmap', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, roadPath);
    }
  };

  // -------------------------------------------------------------
  // Announcement Crud Operations
  // -------------------------------------------------------------
  const handleAddAnnouncement = async (newAnn: Omit<Announcement, 'id' | 'createdAt'>) => {
    const annPath = 'announcements';
    try {
      const generatedId = `ann-${Date.now()}`;
      const payload: Announcement = {
        id: generatedId,
        ...newAnn,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, annPath, generatedId), payload);
      alert('Announcement published.');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, annPath);
    }
  };

  const handleEditAnnouncement = async (updatedAnn: Announcement) => {
    const annPath = `announcements/${updatedAnn.id}`;
    try {
      await updateDoc(doc(db, 'announcements', updatedAnn.id), {
        title: updatedAnn.title,
        message: updatedAnn.message,
        type: updatedAnn.type,
        active: updatedAnn.active
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, annPath);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    const annPath = `announcements/${id}`;
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, annPath);
    }
  };

  // -------------------------------------------------------------
  // Inquiries Crud Operations
  // -------------------------------------------------------------
  const handleToggleContactRead = async (id: string, read: boolean) => {
    const contactPath = `contacts/${id}`;
    try {
      await updateDoc(doc(db, 'contacts', id), { read });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, contactPath);
    }
  };

  const handleDeleteContact = async (id: string) => {
    const contactPath = `contacts/${id}`;
    try {
      await deleteDoc(doc(db, 'contacts', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, contactPath);
    }
  };

  // -------------------------------------------------------------
  // Search and Filter Logic
  // -------------------------------------------------------------
  const filteredWebsites = websites.filter(web => {
    const queryLower = searchQuery.toLowerCase();
    return (
      web.name.toLowerCase().includes(queryLower) ||
      web.category.toLowerCase().includes(queryLower) ||
      web.description.toLowerCase().includes(queryLower)
    );
  });

  const filteredApps = apps.filter(app => {
    const queryLower = searchQuery.toLowerCase();
    return (
      app.name.toLowerCase().includes(queryLower) ||
      app.category.toLowerCase().includes(queryLower) ||
      app.description.toLowerCase().includes(queryLower)
    );
  });

  const featuredProjects = [...websites, ...apps].filter(proj => proj.featured);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Dynamic Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 z-[9999] transition-all duration-75 ease-out"
        style={{ width: `${scrollProgress}%` }}
        id="scroll-progress-bar"
      />

      {/* 1. ANNOUNCEMENTS NOTICE BAR */}
      <AnnouncementBanner announcements={announcements} />

      {/* 2. MAIN HEADER STICKY NAVIGATION */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isAdmin={isAdmin}
        user={user}
        onLogin={handleOpenLogin}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onNavigate={handleNavigate}
        currentSection={currentSection}
        logo={portfolio.logo}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* Search Overlay Indicators */}
      {searchQuery && (
        <div className="bg-amber-500/10 dark:bg-amber-400/5 border-b border-amber-500/10 text-center py-2.5 text-xs text-amber-600 dark:text-amber-400 font-semibold font-mono">
          🔍 Active Search Filters: "{searchQuery}" — Showing {filteredWebsites.length} websites and {filteredApps.length} apps.
        </div>
      )}

      {/* 3. CORE ROUTING & SCROLL SECTIONS */}
      {currentSection === 'admin' ? (
        
        // ADMIN PANEL FULL WIDTH VIEW
        <main className="flex-1 bg-gray-50/50 dark:bg-slate-950 transition-all">
          <AdminDashboard
            portfolio={portfolio}
            websites={websites}
            apps={apps}
            roadmap={roadmap}
            announcements={announcements}
            contacts={contacts}
            analytics={analytics}
            onUpdatePortfolio={handleUpdatePortfolio}
            onAddWebsite={handleAddWebsite}
            onEditWebsite={handleEditWebsite}
            onDeleteWebsite={handleDeleteWebsite}
            onAddApp={handleAddApp}
            onEditApp={handleEditApp}
            onDeleteApp={handleDeleteApp}
            onAddRoadmap={handleAddRoadmap}
            onEditRoadmap={handleEditRoadmap}
            onDeleteRoadmap={handleDeleteRoadmap}
            onAddAnnouncement={handleAddAnnouncement}
            onEditAnnouncement={handleEditAnnouncement}
            onDeleteAnnouncement={handleDeleteAnnouncement}
            onToggleContactRead={handleToggleContactRead}
            onDeleteContact={handleDeleteContact}
          />
        </main>

      ) : (

        // PUBLIC PORTFOLIO SHOWCASE MAIN TIMELINE
        <main className="flex-1">
          
          {/* HERO BANNER SECTION */}
          <div ref={homeRef} id="home">
            <Hero 
              portfolio={portfolio} 
              websites={websites} 
              apps={apps} 
              onNavigate={handleNavigate} 
            />
          </div>

          {/* LATEST ANNOUNCEMENTS SECTION */}
          {announcements.filter(a => a.active).length > 0 && !searchQuery && (
            <section className="py-12 bg-indigo-50/30 dark:bg-slate-900/30 border-b border-gray-150 dark:border-slate-800/40 relative">
              <div className="absolute top-0 right-1/4 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono tracking-widest uppercase flex items-center gap-1.5">
                      <Megaphone className="w-4 h-4 text-indigo-500 animate-bounce" />
                      <span>{t.latestAnnouncements}</span>
                    </span>
                    <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white mt-1">
                      {t.latestAnnouncements}
                    </h2>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md font-sans">
                    {t.latestAnnouncementsDesc}
                  </p>
                </div>

                {/* Announcement Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {announcements.filter(a => a.active).map((ann) => {
                    let typeBg = 'bg-white dark:bg-slate-900 border-gray-150 dark:border-slate-800/60';
                    let typeIcon = <Bell className="w-5 h-5 text-indigo-500" />;
                    let typeAccent = 'border-l-4 border-l-indigo-500';

                    if (ann.type === 'success') {
                      typeBg = 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30';
                      typeIcon = <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
                      typeAccent = 'border-l-4 border-l-emerald-500';
                    } else if (ann.type === 'warning') {
                      typeBg = 'bg-amber-50/30 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30';
                      typeIcon = <AlertTriangle className="w-5 h-5 text-amber-500" />;
                      typeAccent = 'border-l-4 border-l-amber-500';
                    } else if (ann.type === 'info') {
                      typeBg = 'bg-sky-50/30 dark:bg-sky-950/10 border-sky-100 dark:border-sky-900/30';
                      typeIcon = <Info className="w-5 h-5 text-sky-500" />;
                      typeAccent = 'border-l-4 border-l-sky-500';
                    }

                    return (
                      <div 
                        key={ann.id} 
                        className={`p-6 rounded-2xl border ${typeBg} ${typeAccent} shadow-sm hover:shadow-md transition-all duration-300 flex gap-4`}
                      >
                        <div className="p-2 bg-slate-100/55 dark:bg-slate-800/60 rounded-xl h-fit">
                          {typeIcon}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-display font-bold text-base text-slate-850 dark:text-slate-100">
                              {ann.title}
                            </h3>
                            {ann.createdAt && (
                              <span className="text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500 bg-slate-100/70 dark:bg-slate-800/50 px-2 py-0.5 rounded-md">
                                {(() => {
                                  try {
                                    const dateObj = (ann.createdAt as any)?.seconds 
                                      ? new Date((ann.createdAt as any).seconds * 1000) 
                                      : new Date(ann.createdAt);
                                    return dateObj.toLocaleDateString(language === 'EN' ? 'en-US' : 'ne-NP', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    });
                                  } catch (err) {
                                    return '';
                                  }
                                })()}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                            {ann.message}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* DYNAMIC SCROLL TRANSITIONS REVEAL SECTIONS */}
          
          {/* FEATURED PROJECTS SHEETS (Carousel/Grid highlights if any) */}
          {featuredProjects.length > 0 && !searchQuery && (
            <section className="py-16 bg-white dark:bg-slate-900 border-t border-b border-gray-150 dark:border-slate-800/40 relative">
              <div className="absolute top-0 left-1/4 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="text-center max-w-xl mx-auto mb-10 reveal-on-scroll">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono tracking-widest uppercase flex items-center justify-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current text-indigo-500 animate-pulse" />
                    <span>Selected Creations</span>
                  </span>
                  <h2 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white mt-1">
                    Featured Highlights
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredProjects.map((proj) => {
                    const isApp = 'apkUrl' in proj;
                    return (
                      <div key={proj.id} className="reveal-on-scroll">
                        <ProjectCard
                          project={proj}
                          type={isApp ? 'app' : 'website'}
                          onViewDetails={(p, t) => { setSelectedProject(p); setSelectedType(t); }}
                          onIncrementCount={handleIncrementCount}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* WEB APPLICATIONS DIRECTORY SHOWCASE */}
          <section ref={websitesRef} id="websites" className="py-20 relative bg-slate-50 dark:bg-slate-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              {/* Directory Title */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 text-left reveal-on-scroll">
                <div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono tracking-widest uppercase flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    <span>Hosted Directories</span>
                  </span>
                  <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mt-1">
                    {t.webShowcase}
                  </h2>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md font-sans">
                  {t.webShowcaseDesc}
                </p>
              </div>

              {/* Websites Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="websites-skeleton-grid">
                  {[...Array(3)].map((_, i) => (
                    <ProjectCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <motion.div 
                  variants={gridContainerVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-100px" }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  id="websites-motion-grid"
                >
                  {filteredWebsites.map((web) => (
                    <motion.div key={web.id} variants={gridItemVariants}>
                      <ProjectCard
                        project={web}
                        type="website"
                        onViewDetails={(p, t) => { setSelectedProject(p); setSelectedType(t); }}
                        onIncrementCount={handleIncrementCount}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {filteredWebsites.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white/45 dark:bg-slate-900/45 border border-dashed border-gray-200 dark:border-slate-800 rounded-3xl max-w-xl mx-auto shadow-sm animate-fade-in" id="empty-state-websites">
                  <div className="relative mb-6">
                    {/* Glowing Radar Waves */}
                    <div className="absolute -inset-4 bg-indigo-500/10 rounded-full blur-xl animate-pulse" />
                    <div className="relative w-16 h-16 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                      <Globe className="w-8 h-8 animate-pulse" />
                      <Search className="w-4 h-4 absolute -bottom-1 -right-1 text-amber-500 bg-white dark:bg-slate-950 rounded-full p-0.5 border border-amber-300 dark:border-amber-800" />
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-lg text-slate-850 dark:text-slate-100">
                    {t.noWebsites}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm font-sans leading-relaxed">
                    We couldn't find any hosted web apps matching <span className="text-indigo-600 dark:text-indigo-400 font-mono font-semibold">"{searchQuery}"</span>. Please try refining your query or resetting filters.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-mono font-bold text-xs rounded-xl shadow-md shadow-indigo-500/10 transition-all active:scale-95 cursor-pointer"
                  >
                    Clear Search Query
                  </button>
                </div>
              )}

            </div>
          </section>

          {/* MOBILE APPLICATIONS APK CENTER SHOWCASE */}
          <section ref={appsRef} id="apps" className="py-20 bg-white dark:bg-slate-900 border-t border-gray-150 dark:border-slate-800/40 relative">
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              {/* Catalog Title */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 text-left reveal-on-scroll">
                <div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono tracking-widest uppercase flex items-center gap-1">
                    <Smartphone className="w-4 h-4 animate-bounce" />
                    <span>Mobile Software APKs</span>
                  </span>
                  <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mt-1">
                    {t.appShowcase}
                  </h2>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md font-sans">
                  {t.appShowcaseDesc}
                </p>
              </div>

              {/* Apps Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="apps-skeleton-grid">
                  {[...Array(3)].map((_, i) => (
                    <ProjectCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <motion.div 
                  variants={gridContainerVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-100px" }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  id="apps-motion-grid"
                >
                  {filteredApps.map((appItem) => (
                    <motion.div key={appItem.id} variants={gridItemVariants}>
                      <ProjectCard
                        project={appItem}
                        type="app"
                        onViewDetails={(p, t) => { setSelectedProject(p); setSelectedType(t); }}
                        onIncrementCount={handleIncrementCount}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {filteredApps.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white/45 dark:bg-slate-900/45 border border-dashed border-gray-200 dark:border-slate-800 rounded-3xl max-w-xl mx-auto shadow-sm animate-fade-in" id="empty-state-apps">
                  <div className="relative mb-6">
                    {/* Glowing Radar Waves */}
                    <div className="absolute -inset-4 bg-indigo-500/10 rounded-full blur-xl animate-pulse" />
                    <div className="relative w-16 h-16 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                      <Smartphone className="w-8 h-8 animate-pulse" />
                      <Search className="w-4 h-4 absolute -bottom-1 -right-1 text-amber-500 bg-white dark:bg-slate-950 rounded-full p-0.5 border border-amber-300 dark:border-amber-800" />
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-lg text-slate-850 dark:text-slate-100">
                    No Application Packages Found
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm font-sans leading-relaxed">
                    No compiled Android packages match <span className="text-indigo-600 dark:text-indigo-400 font-mono font-semibold">"{searchQuery}"</span>. Clear search to show the full mobile software directory.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-mono font-bold text-xs rounded-xl shadow-md shadow-indigo-500/10 transition-all active:scale-95 cursor-pointer"
                  >
                    Clear Search Query
                  </button>
                </div>
              )}

            </div>
          </section>

          {/* ROADMAP TIMELINE TRACK SECTION */}
          <section ref={roadmapRef} id="roadmap" className="py-20 bg-slate-50 dark:bg-slate-950 relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              
              {/* Header */}
              <div className="text-center max-w-xl mx-auto mb-16 reveal-on-scroll">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono tracking-widest uppercase flex items-center justify-center gap-1">
                  <Compass className="w-4 h-4 animate-spin-slow" />
                  <span>Next Milestones</span>
                </span>
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mt-1">
                  {t.futureRoadmap}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-sans">
                  {t.roadmapDesc}
                </p>
              </div>

              <RoadmapSection roadmap={roadmap} />

            </div>
          </section>

          {/* CONTACT INBOX INQUIRIES SECTION */}
          <section ref={contactRef} id="contact" className="py-20 bg-white dark:bg-slate-900 border-t border-gray-150 dark:border-slate-800/40 relative">
            <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Left Info Column */}
                <div className="lg:col-span-5 text-left space-y-6 reveal-on-scroll">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono tracking-widest uppercase flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span>Inboxes Sync</span>
                  </span>
                  
                  <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">
                    {t.getInTouch}
                  </h2>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                    {t.getInTouchDesc}
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400">
                      <span className="p-2 bg-slate-100 dark:bg-slate-850 rounded-lg text-indigo-500"><Laptop className="w-4 h-4" /></span>
                      <span>{t.primaryEmail}: mdasiullah195@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400">
                      <span className="p-2 bg-slate-100 dark:bg-slate-850 rounded-lg text-indigo-500"><Smartphone className="w-4 h-4" /></span>
                      <span>{t.targetResponse}: {t.within24h}</span>
                    </div>
                  </div>
                </div>

                {/* Right Form Column */}
                <div className="lg:col-span-7 reveal-on-scroll">
                  <ContactForm />
                </div>

              </div>

            </div>
          </section>

        </main>
      )}

      {/* 4. FOOTER CREDITS */}
      <Footer portfolio={portfolio} onNavigate={handleNavigate} logo={portfolio.logo} />

      {/* 5. IMMERSIVE PROJECT DETAILS SLIDE-OVER / MODAL */}
      <ProjectDetailModal
        project={selectedProject}
        type={selectedType}
        onClose={() => { setSelectedProject(null); setSelectedType(null); }}
        onIncrementCount={handleIncrementCount}
      />

      {/* 6. ADMIN SECURITY LOGIN GATEWAY */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onEmailLogin={handleEmailLogin}
      />

      {/* 7. FLOATING BACK TO TOP BUTTON */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleNavigate('home')}
            className="fixed bottom-6 right-6 p-3.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-xl hover:shadow-amber-500/30 active:scale-95 transition-all z-40 flex items-center justify-center cursor-pointer border border-amber-400/30 group"
            title="Back to Top"
            aria-label="Back to Top"
            id="back-to-top-btn"
          >
            <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* PRINT-ONLY RESUME DYNAMIC DATA TEMPLATE */}
      <div className="print-only-resume" id="dynamic-resume-container">
        <div className="border-b-2 border-slate-900 pb-5 mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase mb-1">{portfolio.name || 'Mohamad Osiullah'}</h1>
            <p className="text-lg font-medium text-slate-700 tracking-wide">{portfolio.title || 'Professional Software Engineer & App Creator'}</p>
          </div>
          <div className="text-right text-xs text-slate-600 space-y-1 font-mono">
            <div>Email: mdasiullah195@gmail.com</div>
            <div>Portfolio Hub: {window.location.origin}</div>
            {portfolio.socialLinks?.github && <div>GitHub: {portfolio.socialLinks.github}</div>}
            {portfolio.socialLinks?.linkedin && <div>LinkedIn: {portfolio.socialLinks.linkedin}</div>}
          </div>
        </div>

        {/* Section: Professional Profile */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">Professional Profile</h2>
          <p className="text-sm text-slate-800 leading-relaxed">
            {portfolio.bio || "A highly skilled and adaptive Software Engineer specializing in premium web application architectures and native Android app compiling. Focused on high-fidelity user interactions, security hardening, and resilient database setups."}
          </p>
        </div>

        {/* Section: Technical Competence */}
        {portfolio.skills && portfolio.skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">Technical Competence</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-slate-800">
              {portfolio.skills.map((skill, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Showcase Websites */}
        {websites && websites.length > 0 && (
          <div className="mb-6 break-inside-avoid">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-3">Curated Web Engineering Projects</h2>
            <div className="space-y-4">
              {websites.map((web) => (
                <div key={web.id} className="space-y-1 break-inside-avoid">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-sm">{web.name}</span>
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">{web.category}</span>
                  </div>
                  <div className="text-xs text-slate-600 font-mono">Status: Production Live | Link: {web.url}</div>
                  <p className="text-xs text-slate-700 leading-relaxed">{web.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Software Directory */}
        {apps && apps.length > 0 && (
          <div className="mb-6 break-inside-avoid">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-3">Compiled Mobile & Desktop Applications</h2>
            <div className="space-y-4">
              {apps.map((appItem) => (
                <div key={appItem.id} className="space-y-1 break-inside-avoid">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-sm">{appItem.name}</span>
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">{appItem.category} | {appItem.version} ({appItem.size})</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{appItem.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Roadmap / Focus Points */}
        {roadmap && roadmap.length > 0 && (
          <div className="mb-6 break-inside-avoid">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-3">Product Roadmap & Milestones</h2>
            <div className="grid grid-cols-2 gap-4">
              {roadmap.map((item) => (
                <div key={item.id} className="border-l-2 border-slate-300 pl-3 py-1 space-y-1 text-xs break-inside-avoid">
                  <div className="font-bold text-slate-900">{item.title}</div>
                  <div className="text-slate-500 font-mono text-[10px] uppercase">Timeline: {item.date} | Status: {item.status.replace('_', ' ')}</div>
                  <p className="text-slate-700">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Experience Timeline */}
        {portfolio.experience && portfolio.experience.length > 0 && (
          <div className="mb-6 break-inside-avoid">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-3">Professional Experience History</h2>
            <div className="space-y-3">
              {portfolio.experience.map((exp: any, index) => (
                <div key={index} className="text-xs break-inside-avoid">
                  <div className="flex justify-between items-center font-bold text-slate-900 text-sm">
                    <span>{exp.role || exp.title || 'Software Engineer'}</span>
                    <span>{exp.duration || exp.date || ''}</span>
                  </div>
                  <div className="text-slate-600 font-mono text-[10px]">{exp.company || exp.organization || ''}</div>
                  <p className="text-slate-700 mt-1 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center text-[10px] text-slate-400 font-mono border-t border-slate-200 pt-4 mt-8">
          Self-generated dynamically from Mohamad Osiullah's Curated Portfolio Database on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
        </div>
      </div>

    </div>
  );
}
