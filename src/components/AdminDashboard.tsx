import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Database, 
  Smartphone, 
  Globe, 
  Download, 
  Eye, 
  Mail, 
  Calendar, 
  Megaphone, 
  User, 
  Trash2, 
  Plus, 
  Edit, 
  Check, 
  X, 
  Save, 
  FolderPlus, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  UserCheck 
} from 'lucide-react';
import { 
  Portfolio, 
  Website, 
  App, 
  RoadmapItem, 
  Announcement, 
  Contact, 
  AnalyticsStats, 
  Experience 
} from '../types';
import ImageCropperModal from './ImageCropperModal';

interface AdminDashboardProps {
  portfolio: Portfolio;
  websites: Website[];
  apps: App[];
  roadmap: RoadmapItem[];
  announcements: Announcement[];
  contacts: Contact[];
  analytics: AnalyticsStats;
  onUpdatePortfolio: (portfolio: Portfolio) => void;
  onAddWebsite: (website: Omit<Website, 'id' | 'views' | 'clicks' | 'createdAt'>) => void;
  onEditWebsite: (website: Website) => void;
  onDeleteWebsite: (id: string) => void;
  onAddApp: (app: Omit<App, 'id' | 'views' | 'downloads'>, onProgress?: (percent: number) => void) => Promise<void>;
  onEditApp: (app: App, onProgress?: (percent: number) => void) => Promise<void>;
  onDeleteApp: (id: string) => void;
  onAddRoadmap: (item: Omit<RoadmapItem, 'id' | 'createdAt'>) => void;
  onEditRoadmap: (item: RoadmapItem) => void;
  onDeleteRoadmap: (id: string) => void;
  onAddAnnouncement: (ann: Omit<Announcement, 'id' | 'createdAt'>) => void;
  onEditAnnouncement: (ann: Announcement) => void;
  onDeleteAnnouncement: (id: string) => void;
  onToggleContactRead: (id: string, read: boolean) => void;
  onDeleteContact: (id: string) => void;
}

export default function AdminDashboard({
  portfolio,
  websites,
  apps,
  roadmap,
  announcements,
  contacts,
  analytics,
  onUpdatePortfolio,
  onAddWebsite,
  onEditWebsite,
  onDeleteWebsite,
  onAddApp,
  onEditApp,
  onDeleteApp,
  onAddRoadmap,
  onEditRoadmap,
  onDeleteRoadmap,
  onAddAnnouncement,
  onEditAnnouncement,
  onDeleteAnnouncement,
  onToggleContactRead,
  onDeleteContact
}: AdminDashboardProps) {
  
  const [activeTab, setActiveTab] = useState<'analytics' | 'portfolio' | 'websites' | 'apps' | 'roadmap' | 'announcements' | 'messages'>('analytics');

  // Sub-state for lists / add forms
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Image Cropper State
  const [cropperState, setCropperState] = useState<{
    imageSrc: string;
    aspectRatio: number;
    title: string;
    onComplete: (croppedBase64: string) => void;
  } | null>(null);

  // Custom Delete Confirmation state (Prevents native browser confirm dialog issues in iFrame)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    id: string;
    type: 'website' | 'app' | 'roadmap' | 'announcement' | 'contact';
    title: string;
  } | null>(null);

  // APK converting state
  const [isApkProcessing, setIsApkProcessing] = useState(false);

  // Firestore App upload progress state (0 to 100)
  const [appUploadProgress, setAppUploadProgress] = useState<number | null>(null);
  
  // 1. Portfolio State
  const [profileForm, setProfileForm] = useState<Portfolio>({ ...portfolio });
  const [newSkill, setNewSkill] = useState('');
  const [newExp, setNewExp] = useState<Omit<Experience, 'id'>>({ role: '', company: '', duration: '', description: '' });

  useEffect(() => {
    setProfileForm({ ...portfolio });
  }, [portfolio]);

  // File to Base64 utility
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Helper to format file sizes (bytes to dynamic label)
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // 2. Websites Forms State
  const [webForm, setWebForm] = useState({
    name: '',
    description: '',
    category: 'AI Tools',
    url: '',
    screenshot: '',
    bannerImage: '',
    featured: false,
    rating: 5,
    screenshotsInput: '',
    version: 'v1.0.0',
    releaseDate: new Date().toISOString().split('T')[0],
    updateDate: new Date().toISOString().split('T')[0],
    changelog: ''
  });

  // 3. Apps Forms State
  const [appForm, setAppForm] = useState({
    name: '',
    description: '',
    category: 'Productivity',
    icon: '',
    apkUrl: '',
    version: 'v1.0.0',
    size: '0 Bytes',
    changelog: '',
    featured: false,
    rating: 5,
    releaseDate: new Date().toISOString().split('T')[0],
    updateDate: new Date().toISOString().split('T')[0],
    screenshotsInput: '',
    banner: ''
  });

  // 4. Roadmap State
  const [roadForm, setRoadForm] = useState({
    title: '',
    description: '',
    date: 'Q3 2026',
    status: 'planned' as RoadmapItem['status']
  });

  // 5. Announcements State
  const [annForm, setAnnForm] = useState({
    title: '',
    message: '',
    type: 'info' as Announcement['type'],
    active: true
  });

  // Sum Stats
  const totalWebsites = websites.length;
  const totalApps = apps.length;
  const totalProjects = totalWebsites + totalApps;
  const totalDownloads = apps.reduce((sum, app) => sum + (app.downloads || 0), 0);
  const totalClicks = websites.reduce((sum, web) => sum + (web.clicks || 0), 0);
  const totalViews = websites.reduce((sum, web) => sum + (web.views || 0), 0) + apps.reduce((sum, app) => sum + (app.views || 0), 0) + (analytics.views || 0);

  // Experience Managers
  const handleAddExp = () => {
    if (!newExp.role || !newExp.company) return;
    const expItem: Experience = {
      id: `exp-${Date.now()}`,
      ...newExp
    };
    const updated = {
      ...profileForm,
      experience: [...profileForm.experience, expItem]
    };
    setProfileForm(updated);
    onUpdatePortfolio(updated);
    setNewExp({ role: '', company: '', duration: '', description: '' });
  };

  const handleRemoveExp = (id: string) => {
    const updated = {
      ...profileForm,
      experience: profileForm.experience.filter(e => e.id !== id)
    };
    setProfileForm(updated);
    onUpdatePortfolio(updated);
  };

  // Skill Managers
  const handleAddSkill = () => {
    if (!newSkill.trim() || profileForm.skills.includes(newSkill.trim())) return;
    const updated = {
      ...profileForm,
      skills: [...profileForm.skills, newSkill.trim()]
    };
    setProfileForm(updated);
    onUpdatePortfolio(updated);
    setNewSkill('');
  };

  const handleRemoveSkill = (skill: string) => {
    const updated = {
      ...profileForm,
      skills: profileForm.skills.filter(s => s !== skill)
    };
    setProfileForm(updated);
    onUpdatePortfolio(updated);
  };

  // -------------------------------------------------------------
  // File Upload Handlers (Base64 Converters with Cropping option)
  // -------------------------------------------------------------
  const handleProfilePhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setCropperState({
          imageSrc: base64,
          aspectRatio: 1,
          title: "Crop Profile Photo (1:1)",
          onComplete: (cropped) => {
            setProfileForm(prev => ({ ...prev, profilePhoto: cropped }));
            setCropperState(null);
          }
        });
      } catch (err) {
        alert("Failed to convert profile photo file.");
      }
    }
  };

  const handleCoverImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setCropperState({
          imageSrc: base64,
          aspectRatio: 16/9,
          title: "Crop Cover Image (16:9)",
          onComplete: (cropped) => {
            setProfileForm(prev => ({ ...prev, coverImage: cropped }));
            setCropperState(null);
          }
        });
      } catch (err) {
        alert("Failed to convert cover image file.");
      }
    }
  };

  const handleLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setCropperState({
          imageSrc: base64,
          aspectRatio: 1,
          title: "Crop Logo Image (1:1)",
          onComplete: (cropped) => {
            setProfileForm(prev => ({ ...prev, logo: cropped }));
            setCropperState(null);
          }
        });
      } catch (err) {
        alert("Failed to convert logo image file.");
      }
    }
  };

  const handleWebScreenshotFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setCropperState({
          imageSrc: base64,
          aspectRatio: 16/9,
          title: "Crop Website Screenshot (16:9)",
          onComplete: (cropped) => {
            setWebForm(prev => ({ ...prev, screenshot: cropped }));
            setCropperState(null);
          }
        });
      } catch (err) {
        alert("Failed to convert image file.");
      }
    }
  };

  const handleWebBannerFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setCropperState({
          imageSrc: base64,
          aspectRatio: 16/9,
          title: "Crop Web Banner Image (16:9)",
          onComplete: (cropped) => {
            setWebForm(prev => ({ ...prev, bannerImage: cropped }));
            setCropperState(null);
          }
        });
      } catch (err) {
        alert("Failed to convert image file.");
      }
    }
  };

  const handleWebGalleryFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        const base64Promises = Array.from(files).map((f: File) => fileToBase64(f));
        const base64s = await Promise.all(base64Promises);
        const currentInput = webForm.screenshotsInput ? webForm.screenshotsInput.trim() + '\n' : '';
        setWebForm(prev => ({ ...prev, screenshotsInput: currentInput + base64s.join('\n') }));
        alert(`${files.length} screenshot(s) uploaded and added to website gallery.`);
      } catch (err) {
        alert("Failed to convert one or more screenshot files.");
      }
    }
  };

  const handleAppIconFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setCropperState({
          imageSrc: base64,
          aspectRatio: 1,
          title: "Crop App Icon (1:1)",
          onComplete: (cropped) => {
            setAppForm(prev => ({ ...prev, icon: cropped }));
            setCropperState(null);
          }
        });
      } catch (err) {
        alert("Failed to convert image file.");
      }
    }
  };

  const handleAppApkFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 300 * 1024 * 1024) {
        alert("The selected APK file exceeds the 300 MB size limit. Please upload a smaller file.");
        return;
      }
      try {
        setIsApkProcessing(true);
        const base64 = await fileToBase64(file);
        const autoSize = formatBytes(file.size);
        const todayStr = new Date().toISOString().split('T')[0];
        setAppForm(prev => ({ 
          ...prev, 
          apkUrl: base64, 
          size: autoSize, 
          releaseDate: todayStr, 
          updateDate: todayStr 
        }));
        alert(`APK Uploaded & processed successfully! File size: ${autoSize}. Release date set to today: ${todayStr}.`);
      } catch (err) {
        alert("Failed to convert APK file.");
      } finally {
        setIsApkProcessing(false);
      }
    }
  };

  const handleAppBannerFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setCropperState({
          imageSrc: base64,
          aspectRatio: 16/9,
          title: "Crop App Banner Image (16:9)",
          onComplete: (cropped) => {
            setAppForm(prev => ({ ...prev, banner: cropped }));
            setCropperState(null);
          }
        });
      } catch (err) {
        alert("Failed to convert banner file.");
      }
    }
  };

  const handleAppGalleryFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        const base64Promises = Array.from(files).map((f: File) => fileToBase64(f));
        const base64s = await Promise.all(base64Promises);
        const currentInput = appForm.screenshotsInput ? appForm.screenshotsInput.trim() + '\n' : '';
        setAppForm(prev => ({ ...prev, screenshotsInput: currentInput + base64s.join('\n') }));
        alert(`${files.length} screenshot(s) uploaded and added to mobile app gallery.`);
      } catch (err) {
        alert("Failed to convert one or more screenshot files.");
      }
    }
  };

  // Portfolio Save
  const handleSavePortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePortfolio(profileForm);
    alert('Portfolio details saved to Firestore successfully!');
  };

  // Website Save
  const handleSaveWebsite = (e: React.FormEvent) => {
    e.preventDefault();
    const screenshotList = webForm.screenshotsInput ? webForm.screenshotsInput.split('\n').filter(Boolean) : [];
    
    if (editingId) {
      const match = websites.find(w => w.id === editingId);
      if (match) {
        onEditWebsite({
          ...match,
          name: webForm.name,
          description: webForm.description,
          category: webForm.category,
          url: webForm.url,
          screenshot: webForm.screenshot || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80',
          bannerImage: webForm.bannerImage,
          featured: webForm.featured,
          rating: Number(webForm.rating),
          screenshots: screenshotList,
          version: webForm.version,
          releaseDate: webForm.releaseDate,
          updateDate: webForm.updateDate,
          changelog: webForm.changelog
        });
      }
      setEditingId(null);
    } else {
      onAddWebsite({
        name: webForm.name,
        description: webForm.description,
        category: webForm.category,
        url: webForm.url,
        screenshot: webForm.screenshot || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80',
        bannerImage: webForm.bannerImage,
        featured: webForm.featured,
        rating: Number(webForm.rating),
        screenshots: screenshotList,
        version: webForm.version,
        releaseDate: webForm.releaseDate,
        updateDate: webForm.updateDate,
        changelog: webForm.changelog
      });
    }
    // reset
    setWebForm({
      name: '',
      description: '',
      category: 'AI Tools',
      url: '',
      screenshot: '',
      bannerImage: '',
      featured: false,
      rating: 5,
      screenshotsInput: '',
      version: 'v1.0.0',
      releaseDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
      changelog: ''
    });
  };

  const handleEditWebTrigger = (web: Website) => {
    setEditingId(web.id);
    setWebForm({
      name: web.name,
      description: web.description,
      category: web.category,
      url: web.url,
      screenshot: web.screenshot,
      bannerImage: web.bannerImage || '',
      featured: web.featured,
      rating: web.rating,
      screenshotsInput: web.screenshots ? web.screenshots.join('\n') : '',
      version: web.version || 'v1.0.0',
      releaseDate: web.releaseDate || new Date().toISOString().split('T')[0],
      updateDate: web.updateDate || new Date().toISOString().split('T')[0],
      changelog: web.changelog || ''
    });
  };

  // App Save
  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    const screenshotList = appForm.screenshotsInput ? appForm.screenshotsInput.split('\n').filter(Boolean) : [];

    try {
      setAppUploadProgress(0);
      if (editingId) {
        const match = apps.find(a => a.id === editingId);
        if (match) {
          await onEditApp({
            ...match,
            name: appForm.name,
            description: appForm.description,
            category: appForm.category,
            icon: appForm.icon || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=150&q=80',
            apkUrl: appForm.apkUrl,
            version: appForm.version,
            size: appForm.size,
            changelog: appForm.changelog,
            featured: appForm.featured,
            rating: Number(appForm.rating),
            releaseDate: appForm.releaseDate,
            updateDate: appForm.updateDate,
            screenshots: screenshotList,
            banner: appForm.banner
          }, (percent) => {
            setAppUploadProgress(percent);
          });
        }
        setEditingId(null);
      } else {
        await onAddApp({
          name: appForm.name,
          description: appForm.description,
          category: appForm.category,
          icon: appForm.icon || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=150&q=80',
          apkUrl: appForm.apkUrl,
          version: appForm.version,
          size: appForm.size,
          changelog: appForm.changelog,
          featured: appForm.featured,
          rating: Number(appForm.rating),
          releaseDate: appForm.releaseDate,
          updateDate: appForm.updateDate,
          screenshots: screenshotList,
          banner: appForm.banner
        }, (percent) => {
          setAppUploadProgress(percent);
        });
      }
      
      // reset
      setAppForm({
        name: '',
        description: '',
        category: 'Productivity',
        icon: '',
        apkUrl: '',
        version: 'v1.0.0',
        size: '10 MB',
        changelog: '',
        featured: false,
        rating: 5,
        releaseDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0],
        screenshotsInput: '',
        banner: ''
      });
    } catch (err) {
      console.error(err);
      alert("Failed to save mobile app.");
    } finally {
      setAppUploadProgress(null);
    }
  };

  const handleEditAppTrigger = (app: App) => {
    setEditingId(app.id);
    setAppForm({
      name: app.name,
      description: app.description,
      category: app.category,
      icon: app.icon,
      apkUrl: app.apkUrl,
      version: app.version,
      size: app.size,
      changelog: app.changelog,
      featured: app.featured,
      rating: app.rating,
      releaseDate: app.releaseDate,
      updateDate: app.updateDate,
      screenshotsInput: app.screenshots ? app.screenshots.join('\n') : '',
      banner: app.banner || ''
    });
  };

  // Roadmap Save
  const handleSaveRoadmap = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const match = roadmap.find(r => r.id === editingId);
      if (match) {
        onEditRoadmap({
          ...match,
          title: roadForm.title,
          description: roadForm.description,
          date: roadForm.date,
          status: roadForm.status
        });
      }
      setEditingId(null);
    } else {
      onAddRoadmap({
        title: roadForm.title,
        description: roadForm.description,
        date: roadForm.date,
        status: roadForm.status
      });
    }
    setRoadForm({ title: '', description: '', date: 'Q3 2026', status: 'planned' });
  };

  const handleEditRoadmapTrigger = (item: RoadmapItem) => {
    setEditingId(item.id);
    setRoadForm({
      title: item.title,
      description: item.description,
      date: item.date,
      status: item.status
    });
  };

  // Announcement Save
  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const match = announcements.find(a => a.id === editingId);
      if (match) {
        onEditAnnouncement({
          ...match,
          title: annForm.title,
          message: annForm.message,
          type: annForm.type,
          active: annForm.active
        });
      }
      setEditingId(null);
    } else {
      onAddAnnouncement({
        title: annForm.title,
        message: annForm.message,
        type: annForm.type,
        active: annForm.active
      });
    }
    setAnnForm({ title: '', message: '', type: 'info', active: true });
  };

  const handleEditAnnounceTrigger = (ann: Announcement) => {
    setEditingId(ann.id);
    setAnnForm({
      title: ann.title,
      message: ann.message,
      type: ann.type,
      active: ann.active
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left" id="admin-dashboard-container">
      
      {/* Header and Greeting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono tracking-widest uppercase flex items-center gap-1">
            <UserCheck className="w-4 h-4" />
            <span>Authenticated Admin Session</span>
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mt-1">
            Management Panel
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-slate-150 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 px-3.5 py-2 rounded-xl border border-gray-200/50 dark:border-slate-800">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>Sync Status: <span className="text-emerald-500 font-bold uppercase">Connected</span></span>
        </div>
      </div>

      {/* Main Tabs and Content Wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-2">
          {[
            { id: 'analytics', label: 'Analytics Board', icon: <BarChart className="w-4 h-4" /> },
            { id: 'portfolio', label: 'Owner Portfolio', icon: <User className="w-4 h-4" /> },
            { id: 'websites', label: 'Web Directory', icon: <Globe className="w-4 h-4" /> },
            { id: 'apps', label: 'App Catalog', icon: <Smartphone className="w-4 h-4" /> },
            { id: 'roadmap', label: 'Future Roadmap', icon: <Calendar className="w-4 h-4" /> },
            { id: 'announcements', label: 'Announcement Board', icon: <Megaphone className="w-4 h-4" /> },
            { id: 'messages', label: `Inquiries (${contacts.filter(c=>!c.read).length})`, icon: <Mail className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setEditingId(null);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800/50'
              }`}
              id={`admin-tab-btn-${tab.id}`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Form or List View Container */}
        <div className="lg:col-span-9 glass p-6 sm:p-8 rounded-3xl border border-gray-200/50 dark:border-slate-800/60 min-h-[500px]">
          
          {/* 1. ANALYTICS BOARD */}
          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-fade-in" id="admin-panel-analytics">
              <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white border-b border-gray-200/20 pb-3">
                Live Visitor & Access Metrics
              </h3>
              
              {/* Counters Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/30 border border-gray-150 text-left">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Total Projects</span>
                    <Database className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalProjects}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{totalApps} apps • {totalWebsites} websites</div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/30 border border-gray-150 text-left">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">APK Downloads</span>
                    <Download className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalDownloads}</div>
                  <div className="text-[10px] text-slate-400 mt-1">From mobile Android clients</div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/30 border border-gray-150 text-left">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Web Clicks</span>
                    <Globe className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalClicks}</div>
                  <div className="text-[10px] text-slate-400 mt-1">External portfolio links visited</div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/30 border border-gray-150 text-left">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Page Views</span>
                    <Eye className="w-4 h-4 text-sky-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalViews}</div>
                  <div className="text-[10px] text-slate-400 mt-1">Global page & project visits</div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/30 border border-gray-150 text-left">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Inquiries Received</span>
                    <Mail className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{contacts.length}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{contacts.filter(c=>!c.read).length} unread messages</div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/30 border border-gray-150 text-left col-span-2 md:col-span-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Unique Visitors</span>
                    <User className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{analytics.visitors || 42}</div>
                  <div className="text-[10px] text-slate-400 mt-1">Daily unique device logs</div>
                </div>
              </div>

              {/* Dynamic Bar Charts (Mock Logs visualized with custom styled CSS grids) */}
              <div className="p-5 rounded-2xl bg-gray-55/40 dark:bg-slate-950/20 border border-gray-200/50 dark:border-slate-800/60 text-left">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-6 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  <span>Interactive Site Activity Graphs (Last 7 Days)</span>
                </h4>
                
                {/* Visual Chart Bars */}
                <div className="h-48 flex items-end gap-3 sm:gap-6 pt-6 border-b border-gray-200/40 dark:border-slate-800/40 pb-2 relative">
                  {[
                    { day: 'Mon', visits: 18, downloads: 4 },
                    { day: 'Tue', visits: 24, downloads: 9 },
                    { day: 'Wed', visits: 15, downloads: 3 },
                    { day: 'Thu', visits: 32, downloads: 14 },
                    { day: 'Fri', visits: 28, downloads: 11 },
                    { day: 'Sat', visits: 12, downloads: 5 },
                    { day: 'Sun', visits: 35, downloads: 18 }
                  ].map((bar, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative">
                      
                      {/* Floating tooltip */}
                      <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[10px] font-mono px-2 py-1 rounded shadow-md z-20 pointer-events-none transition-opacity text-center min-w-[70px]">
                        Visits: {bar.visits}<br/>Down: {bar.downloads}
                      </div>

                      <div className="flex gap-1 w-full h-full justify-center items-end">
                        {/* Visits Bar */}
                        <div 
                          className="w-3 sm:w-4 bg-amber-500 rounded-t-md hover:brightness-110 transition-all duration-300"
                          style={{ height: `${(bar.visits / 40) * 100}%` }}
                        />
                        {/* Downloads Bar */}
                        <div 
                          className="w-3 sm:w-4 bg-indigo-500 rounded-t-md hover:brightness-110 transition-all duration-300"
                          style={{ height: `${(bar.downloads / 40) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 mt-2 block">{bar.day}</span>
                    </div>
                  ))}
                </div>

                {/* Legends */}
                <div className="flex items-center gap-4 text-xs font-mono mt-4 justify-center">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-amber-500 block" />
                    <span className="text-slate-500">Unique Visits</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-indigo-500 block" />
                    <span className="text-slate-500">APK Downloads</span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* 2. PORTFOLIO MANAGER */}
          {activeTab === 'portfolio' && (
            <form onSubmit={handleSavePortfolio} className="space-y-6 text-left animate-fade-in" id="admin-portfolio-form">
              <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white border-b border-gray-200/20 pb-3">
                Edit Bio & Portfolio Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1.5">Owner Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="block w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-800 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1.5">Professional Title</label>
                  <input
                    type="text"
                    required
                    value={profileForm.title}
                    onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                    className="block w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-800 rounded-xl"
                  />
                </div>
              </div>               <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1.5">Profile Photo Link or File Upload</label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={profileForm.profilePhoto}
                    onChange={(e) => setProfileForm({ ...profileForm, profilePhoto: e.target.value })}
                    placeholder="/input_file_0.png"
                    className="block w-full px-3.5 py-2 text-sm bg-gray-55/60 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-800 rounded-xl"
                  />
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-200/50 dark:border-indigo-800/30 transition-all font-mono">
                      Upload Profile Photo File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePhotoFile}
                        className="hidden"
                      />
                    </label>
                    {profileForm.profilePhoto && (
                      <div className="flex items-center gap-2">
                        <img 
                          src={profileForm.profilePhoto} 
                          alt="Profile Preview" 
                          className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=350&q=80';
                          }}
                        />
                        <button 
                          type="button"
                          onClick={() => setProfileForm({ ...profileForm, profilePhoto: '' })}
                          className="text-[10px] font-bold text-red-500 hover:text-red-600 font-mono cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1.5">Cover Image Link or File Upload</label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={profileForm.coverImage}
                    onChange={(e) => setProfileForm({ ...profileForm, coverImage: e.target.value })}
                    className="block w-full px-3.5 py-2 text-sm bg-gray-55/60 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-800 rounded-xl"
                  />
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-200/50 dark:border-indigo-800/30 transition-all font-mono">
                      Upload Cover Image File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageFile}
                        className="hidden"
                      />
                    </label>
                    {profileForm.coverImage && (
                      <div className="flex items-center gap-2">
                        <img 
                          src={profileForm.coverImage} 
                          alt="Cover Preview" 
                          className="w-16 h-8 rounded object-cover border border-slate-300 dark:border-slate-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        <button 
                          type="button"
                          onClick={() => setProfileForm({ ...profileForm, coverImage: '' })}
                          className="text-[10px] font-bold text-red-500 hover:text-red-600 font-mono cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1.5">Navbar Logo Link or File Upload</label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={profileForm.logo || ''}
                    placeholder="https://example.com/logo.png"
                    onChange={(e) => setProfileForm({ ...profileForm, logo: e.target.value })}
                    className="block w-full px-3.5 py-2 text-sm bg-gray-55/60 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-800 rounded-xl"
                  />
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-200/50 dark:border-indigo-800/30 transition-all font-mono">
                      Upload Logo File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFile}
                        className="hidden"
                      />
                    </label>
                    {profileForm.logo && (
                      <div className="flex items-center gap-2">
                        <img 
                          src={profileForm.logo} 
                          alt="Logo Preview" 
                          className="w-10 h-10 rounded object-contain border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 p-0.5"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=80&q=80';
                          }}
                        />
                        <button 
                          type="button"
                          onClick={() => setProfileForm({ ...profileForm, logo: '' })}
                          className="text-[10px] font-bold text-red-500 hover:text-red-600 font-mono cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1.5">Short Bio tagline</label>
                <input
                  type="text"
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="block w-full px-3.5 py-2 text-sm bg-gray-55/60 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-800 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1.5">Detailed About Me</label>
                <textarea
                  rows={4}
                  value={profileForm.aboutMe}
                  onChange={(e) => setProfileForm({ ...profileForm, aboutMe: e.target.value })}
                  className="block w-full px-3.5 py-2 text-sm bg-gray-55/60 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-800 rounded-xl"
                />
              </div>

              {/* Skills Editor */}
              <div className="space-y-3 border-t border-gray-200/10 pt-4">
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1.5">Skills Tag List</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="e.g., Kotlin Coroutines"
                    className="flex-1 px-3.5 py-2 text-sm bg-gray-55/60 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-800 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-xs font-bold hover:bg-amber-500 transition-colors shrink-0"
                  >
                    Add Skill
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {profileForm.skills.map((skill, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full border border-amber-500/20 flex items-center gap-1"
                    >
                      <span>{skill}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-amber-600 hover:text-rose-500 shrink-0 font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Experiences Timeline Manager */}
              <div className="space-y-4 border-t border-gray-200/10 pt-4">
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Work & Technical Experience</label>
                
                {/* Add timeline experience form */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/30 border border-gray-150 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Role Title (e.g. Android Engineer)"
                      value={newExp.role}
                      onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
                      className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={newExp.company}
                      onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                      className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Duration (e.g., 2022 - 2024)"
                      value={newExp.duration}
                      onChange={(e) => setNewExp({ ...newExp, duration: e.target.value })}
                      className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleAddExp}
                      className="px-3 py-1.5 bg-amber-500 text-white font-bold rounded-lg text-xs hover:bg-amber-600 transition-all flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Experience Block</span>
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Key tasks completed..."
                    value={newExp.description}
                    onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg"
                  />
                </div>

                {/* List timeline records */}
                <div className="space-y-2">
                  {profileForm.experience.map((exp) => (
                    <div key={exp.id} className="flex justify-between items-start p-3 bg-gray-55/35 dark:bg-slate-800/10 rounded-xl border border-gray-150">
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{exp.role} @ {exp.company}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{exp.duration}</div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{exp.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveExp(exp.id)}
                        className="p-1 hover:bg-rose-50 rounded text-rose-500 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-4 border-t border-gray-200/10 pt-4">
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Social Media Channels</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {[
                    { key: 'github', label: 'GitHub Link' },
                    { key: 'linkedin', label: 'LinkedIn Profile' },
                    { key: 'twitter', label: 'Twitter Handle' },
                    { key: 'instagram', label: 'Instagram Link' },
                    { key: 'facebook', label: 'Facebook Link' },
                    { key: 'tiktok', label: 'TikTok Link' }
                  ].map((field) => (
                    <div key={field.key} className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-slate-400 w-24 text-left">{field.label}:</span>
                      <input
                        type="text"
                        value={profileForm.socialLinks[field.key as keyof typeof profileForm.socialLinks] || ''}
                        onChange={(e) => {
                          const links = { ...profileForm.socialLinks, [field.key]: e.target.value };
                          setProfileForm({ ...profileForm, socialLinks: links });
                        }}
                        className="flex-1 px-3 py-1.5 text-xs bg-gray-55/60 dark:bg-slate-800/50 border border-gray-200 rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                id="admin-save-portfolio-btn"
              >
                <Save className="w-4 h-4" />
                <span>Save Portfolio Settings</span>
              </button>
            </form>
          )}

          {/* 3. WEBSITE DIRECTORY */}
          {activeTab === 'websites' && (
            <div className="space-y-8 text-left animate-fade-in" id="admin-panel-websites">
              <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white border-b border-gray-200/20 pb-3 flex items-center justify-between">
                <span>Manage Web Projects</span>
                {editingId && (
                  <button onClick={() => setEditingId(null)} className="text-xs text-rose-500 font-mono">Cancel Editing</button>
                )}
              </h3>

              {/* Add or Edit Web Form */}
              <form onSubmit={handleSaveWebsite} className="p-5 rounded-2xl bg-gray-50 dark:bg-slate-800/20 border border-gray-150 dark:border-slate-850 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                  {editingId ? '✍️ Edit Selected Website' : '➕ Add Hosted Web Application'}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">Website Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="AM Resume Builder"
                      value={webForm.name}
                      onChange={(e) => setWebForm({ ...webForm, name: e.target.value })}
                      className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">Website Category *</label>
                    <select
                      value={webForm.category}
                      onChange={(e) => setWebForm({ ...webForm, category: e.target.value })}
                      className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg text-slate-900 dark:text-slate-300"
                    >
                      {["AI Tools", "Resume Builder", "Education", "Finance", "Utility", "Converter", "Travel", "Business", "Portfolio", "Productivity"].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">Website URL (Hosted Link) *</label>
                    <input
                      type="url"
                      required
                      placeholder="https://example.com/builder"
                      value={webForm.url}
                      onChange={(e) => setWebForm({ ...webForm, url: e.target.value })}
                      className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">Thumbnail Screenshot URL or File Upload</label>
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={webForm.screenshot || ''}
                        onChange={(e) => setWebForm({ ...webForm, screenshot: e.target.value })}
                        className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg"
                      />
                      <div className="flex items-center gap-4">
                        <label className="cursor-pointer px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-200/50 dark:border-indigo-800/30 transition-all font-mono">
                          Upload Thumbnail Image File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleWebScreenshotFile}
                            className="hidden"
                          />
                        </label>
                        {webForm.screenshot && (
                          <div className="flex items-center gap-2">
                            <img 
                              src={webForm.screenshot} 
                              alt="Web Thumbnail Preview" 
                              className="w-12 h-8 rounded object-cover border border-slate-300 dark:border-slate-700 bg-slate-100"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=80&q=80';
                              }}
                            />
                            <button 
                              type="button"
                              onClick={() => setWebForm({ ...webForm, screenshot: '' })}
                              className="text-[10px] font-bold text-red-500 hover:text-red-600 font-mono cursor-pointer"
                            >
                              Clear
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">Banner Cover Image URL or File Upload</label>
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        placeholder="Banner cover photo URL"
                        value={webForm.bannerImage || ''}
                        onChange={(e) => setWebForm({ ...webForm, bannerImage: e.target.value })}
                        className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg"
                      />
                      <div className="flex items-center gap-4">
                        <label className="cursor-pointer px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-200/50 dark:border-indigo-800/30 transition-all font-mono">
                          Upload Banner Image File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleWebBannerFile}
                            className="hidden"
                          />
                        </label>
                        {webForm.bannerImage && (
                          <div className="flex items-center gap-2">
                            <img 
                              src={webForm.bannerImage} 
                              alt="Web Banner Preview" 
                              className="w-12 h-8 rounded object-cover border border-slate-300 dark:border-slate-700 bg-slate-100"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=80&q=80';
                              }}
                            />
                            <button 
                              type="button"
                              onClick={() => setWebForm({ ...webForm, bannerImage: '' })}
                              className="text-[10px] font-bold text-red-500 hover:text-red-600 font-mono cursor-pointer"
                            >
                              Clear
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">Admin Rating (1 - 5 Stars)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={webForm.rating}
                      onChange={(e) => setWebForm({ ...webForm, rating: Number(e.target.value) })}
                      className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-4 md:mt-8">
                    <input
                      type="checkbox"
                      id="web-featured"
                      checked={webForm.featured}
                      onChange={(e) => setWebForm({ ...webForm, featured: e.target.checked })}
                      className="w-4 h-4 text-amber-500 rounded border-gray-300"
                    />
                    <label htmlFor="web-featured" className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">Pin as Featured</label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">Version</label>
                    <input
                      type="text"
                      placeholder="v1.0.0"
                      value={webForm.version}
                      onChange={(e) => setWebForm({ ...webForm, version: e.target.value })}
                      className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">Release Date</label>
                    <input
                      type="date"
                      value={webForm.releaseDate}
                      onChange={(e) => setWebForm({ ...webForm, releaseDate: e.target.value })}
                      className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg text-slate-900 dark:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">Update Date</label>
                    <input
                      type="date"
                      value={webForm.updateDate}
                      onChange={(e) => setWebForm({ ...webForm, updateDate: e.target.value })}
                      className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg text-slate-900 dark:text-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">Changelog / Release Note</label>
                  <textarea
                    rows={2}
                    placeholder="Initial stable release with full-stack capabilities..."
                    value={webForm.changelog}
                    onChange={(e) => setWebForm({ ...webForm, changelog: e.target.value })}
                    className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">Description *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="A professional résumé manager..."
                    value={webForm.description}
                    onChange={(e) => setWebForm({ ...webForm, description: e.target.value })}
                    className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">Extra Gallery Screenshots (One URL/Base64 per line)</label>
                  <div className="space-y-1.5">
                    <textarea
                      rows={3}
                      placeholder="https://images.unsplash.com/...\nhttps://images.unsplash.com/..."
                      value={webForm.screenshotsInput}
                      onChange={(e) => setWebForm({ ...webForm, screenshotsInput: e.target.value })}
                      className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg font-mono"
                    />
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-200/50 dark:border-indigo-800/30 transition-all font-mono">
                        Upload Screenshot Files (Select Multiple)
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleWebGalleryFiles}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                  id="admin-website-submit-btn"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>{editingId ? 'Save Changes' : 'Publish Web Project'}</span>
                </button>
              </form>

              {/* Websites List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                  Existing Directories ({websites.length})
                </h4>
                {websites.map(web => (
                  <div key={web.id} className="p-4 rounded-xl bg-gray-55/30 dark:bg-slate-800/10 border border-gray-150 flex items-center justify-between gap-4">
                    <div className="flex gap-3 items-center text-left">
                      <div className="w-14 h-10 rounded overflow-hidden bg-slate-100 border shrink-0">
                        <img src={web.screenshot} alt={web.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{web.name}</div>
                        <div className="text-[10px] text-amber-500 font-mono uppercase mt-0.5">{web.category} • {web.rating} ★</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditWebTrigger(web)}
                        className="p-1.5 hover:bg-amber-500/10 hover:text-amber-500 rounded text-slate-500 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmation({ id: web.id, type: 'website', title: web.name })}
                        className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded text-rose-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* 4. APP CATALOG */}
          {activeTab === 'apps' && (
            <div className="space-y-8 text-left animate-fade-in" id="admin-panel-apps">
              <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white border-b border-gray-200/20 pb-3 flex items-center justify-between">
                <span>Manage Mobile Applications</span>
                {editingId && (
                  <button onClick={() => setEditingId(null)} className="text-xs text-rose-500 font-mono">Cancel Editing</button>
                )}
              </h3>

              {/* Add or Edit App Form */}
              <form onSubmit={handleSaveApp} className="p-5 rounded-2xl bg-gray-50 dark:bg-slate-800/20 border border-gray-150 dark:border-slate-850 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                  {editingId ? '✍️ Edit Selected Android App' : '➕ Add APK Android Application'}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">App Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="TaskFlow Mobile"
                      value={appForm.name}
                      onChange={(e) => setAppForm({ ...appForm, name: e.target.value })}
                      className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">App Category *</label>
                    <select
                      value={appForm.category}
                      onChange={(e) => setAppForm({ ...appForm, category: e.target.value })}
                      className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg text-slate-900 dark:text-slate-300"
                    >
                      {["Productivity", "Education", "Utility", "Converter", "Finance", "AI Tools", "Travel", "Business"].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">App Icon URL or File Upload</label>
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        placeholder="Icon photo link"
                        value={appForm.icon || ''}
                        onChange={(e) => setAppForm({ ...appForm, icon: e.target.value })}
                        className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg"
                      />
                      <div className="flex items-center gap-4">
                        <label className="cursor-pointer px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-200/50 dark:border-indigo-800/30 transition-all font-mono">
                          Upload Icon File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAppIconFile}
                            className="hidden"
                          />
                        </label>
                        {appForm.icon && (
                          <div className="flex items-center gap-2">
                            <img 
                              src={appForm.icon} 
                              alt="App Icon Preview" 
                              className="w-8 h-8 rounded object-cover border border-slate-300 dark:border-slate-700 bg-slate-100"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=80&q=80';
                              }}
                            />
                            <button 
                              type="button"
                              onClick={() => setAppForm({ ...appForm, icon: '' })}
                              className="text-[10px] font-bold text-red-500 hover:text-red-600 font-mono cursor-pointer"
                            >
                              Clear
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">APK File Link or Upload APK File *</label>
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        required
                        placeholder="GitHub RAW release link or URL"
                        value={appForm.apkUrl || ''}
                        onChange={(e) => setAppForm({ ...appForm, apkUrl: e.target.value })}
                        className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg"
                      />
                      <div className="flex items-center gap-4">
                        <label className={`cursor-pointer px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-200/50 dark:border-indigo-800/30 transition-all font-mono ${isApkProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
                          {isApkProcessing ? 'Processing...' : 'Upload APK File'}
                          <input
                            type="file"
                            accept=".apk"
                            disabled={isApkProcessing}
                            onChange={handleAppApkFile}
                            className="hidden"
                          />
                        </label>
                        {isApkProcessing && (
                          <div className="flex items-center gap-1.5">
                            <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[10px] text-indigo-500 font-mono animate-pulse">Reading big binary file to memory (up to 300MB)...</span>
                          </div>
                        )}
                        {!isApkProcessing && appForm.apkUrl && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-green-500 font-mono font-bold">
                              {appForm.apkUrl.startsWith('data:') ? '✓ APK Loaded (Base64)' : '✓ Link Set'}
                            </span>
                            <button 
                              type="button"
                              onClick={() => setAppForm({ ...appForm, apkUrl: '' })}
                              className="text-[10px] font-bold text-red-500 hover:text-red-600 font-mono cursor-pointer"
                            >
                              Clear
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">Banner Cover Image URL or File Upload</label>
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        placeholder="Banner photo link"
                        value={appForm.banner || ''}
                        onChange={(e) => setAppForm({ ...appForm, banner: e.target.value })}
                        className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg"
                      />
                      <div className="flex items-center gap-4">
                        <label className="cursor-pointer px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-200/50 dark:border-indigo-800/30 transition-all font-mono">
                          Upload Banner Image File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAppBannerFile}
                            className="hidden"
                          />
                        </label>
                        {appForm.banner && (
                          <div className="flex items-center gap-2">
                            <img 
                              src={appForm.banner} 
                              alt="App Banner Preview" 
                              className="w-12 h-8 rounded object-cover border border-slate-300 dark:border-slate-700 bg-slate-100"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=80&q=80';
                              }}
                            />
                            <button 
                              type="button"
                              onClick={() => setAppForm({ ...appForm, banner: '' })}
                              className="text-[10px] font-bold text-red-500 hover:text-red-600 font-mono cursor-pointer"
                            >
                              Clear
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">Version *</label>
                    <input
                      type="text"
                      required
                      placeholder="v2.1.0"
                      value={appForm.version}
                      onChange={(e) => setAppForm({ ...appForm, version: e.target.value })}
                      className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">File Size *</label>
                    <input
                      type="text"
                      required
                      placeholder="14.5 MB"
                      value={appForm.size}
                      onChange={(e) => setAppForm({ ...appForm, size: e.target.value })}
                      className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">Release Date</label>
                    <input
                      type="date"
                      value={appForm.releaseDate}
                      onChange={(e) => setAppForm({ ...appForm, releaseDate: e.target.value })}
                      className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg text-slate-900 dark:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">Update Date</label>
                    <input
                      type="date"
                      value={appForm.updateDate}
                      onChange={(e) => setAppForm({ ...appForm, updateDate: e.target.value })}
                      className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg text-slate-900 dark:text-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">Admin Rating Stars (1-5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={appForm.rating}
                      onChange={(e) => setAppForm({ ...appForm, rating: Number(e.target.value) })}
                      className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <input
                      type="checkbox"
                      id="app-featured"
                      checked={appForm.featured}
                      onChange={(e) => setAppForm({ ...appForm, featured: e.target.checked })}
                      className="w-4 h-4 text-amber-500 rounded border-gray-300"
                    />
                    <label htmlFor="app-featured" className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">Pin as Featured</label>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">Description *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="TaskFlow offline-first productivity planner..."
                    value={appForm.description}
                    onChange={(e) => setAppForm({ ...appForm, description: e.target.value })}
                    className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">Changelog & Version Notes</label>
                  <textarea
                    rows={3}
                    placeholder="- Added SQLite sync.\n- Redesigned widgets."
                    value={appForm.changelog}
                    onChange={(e) => setAppForm({ ...appForm, changelog: e.target.value })}
                    className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg font-mono font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">Gallery Screenshots (One URL/Base64 per line)</label>
                  <div className="space-y-1.5">
                    <textarea
                      rows={3}
                      placeholder="https://images.unsplash.com/...\nhttps://images.unsplash.com/..."
                      value={appForm.screenshotsInput}
                      onChange={(e) => setAppForm({ ...appForm, screenshotsInput: e.target.value })}
                      className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg font-mono"
                    />
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-200/50 dark:border-indigo-800/30 transition-all font-mono">
                        Upload Screenshot Files (Select Multiple)
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleAppGalleryFiles}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={appUploadProgress !== null}
                  className={`w-full py-2.5 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md ${
                    appUploadProgress !== null 
                      ? 'bg-amber-500 hover:bg-amber-600 cursor-not-allowed animate-pulse' 
                      : 'bg-slate-900 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700'
                  }`}
                  id="admin-app-submit-btn"
                >
                  {appUploadProgress !== null ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving to Database ({appUploadProgress}%) ...</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4" />
                      <span>{editingId ? 'Save App changes' : 'Publish Mobile App'}</span>
                    </>
                  )}
                </button>
              </form>

              {/* Apps List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                  Existing Apps Catalog ({apps.length})
                </h4>
                {apps.map(app => (
                  <div key={app.id} className="p-4 rounded-xl bg-gray-55/30 dark:bg-slate-800/10 border border-gray-150 flex items-center justify-between gap-4">
                    <div className="flex gap-3 items-center text-left">
                      <div className="w-10 h-10 rounded overflow-hidden bg-slate-100 border shrink-0">
                        <img src={app.icon} alt={app.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{app.name}</div>
                        <div className="text-[10px] text-indigo-500 font-mono uppercase mt-0.5">{app.category} • {app.version} • {app.size}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditAppTrigger(app)}
                        className="p-1.5 hover:bg-amber-500/10 hover:text-amber-500 rounded text-slate-500 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmation({ id: app.id, type: 'app', title: app.name })}
                        className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded text-rose-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* 5. ROADMAP MANAGER */}
          {activeTab === 'roadmap' && (
            <div className="space-y-8 text-left animate-fade-in" id="admin-panel-roadmap">
              <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white border-b border-gray-200/20 pb-3 flex items-center justify-between">
                <span>Milestone Project Roadmap</span>
                {editingId && (
                  <button onClick={() => setEditingId(null)} className="text-xs text-rose-500 font-mono">Cancel Editing</button>
                )}
              </h3>

              {/* Form */}
              <form onSubmit={handleSaveRoadmap} className="p-5 rounded-2xl bg-gray-50 dark:bg-slate-800/20 border border-gray-150 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                  {editingId ? '✍️ Edit Selected Milestone' : '➕ Add Roadmap Milestone'}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">Milestone/Project Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="AgriTrack IoT Native Clients"
                      value={roadForm.title}
                      onChange={(e) => setRoadForm({ ...roadForm, title: e.target.value })}
                      className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">Target Date/Timeline *</label>
                    <input
                      type="text"
                      required
                      placeholder="Q3 2026"
                      value={roadForm.date}
                      onChange={(e) => setRoadForm({ ...roadForm, date: e.target.value })}
                      className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">Status *</label>
                    <select
                      value={roadForm.status}
                      onChange={(e) => setRoadForm({ ...roadForm, status: e.target.value as any })}
                      className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg text-slate-900 dark:text-slate-300"
                    >
                      <option value="planned">Planned</option>
                      <option value="in_progress">In Development</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">Brief Description *</label>
                    <input
                      type="text"
                      required
                      placeholder="Built custom Bluetooth sync support..."
                      value={roadForm.description}
                      onChange={(e) => setRoadForm({ ...roadForm, description: e.target.value })}
                      className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-amber-500 dark:bg-slate-150 text-white dark:text-gray-900 dark:hover:text-white font-bold text-xs rounded-xl"
                  id="admin-roadmap-submit-btn"
                >
                  <span>{editingId ? 'Save Milestone' : 'Add Milestone Item'}</span>
                </button>
              </form>

              {/* Roadmap list */}
              <div className="space-y-2">
                {roadmap.map(item => (
                  <div key={item.id} className="p-4 rounded-xl bg-gray-55/30 dark:bg-slate-800/10 border border-gray-150 flex items-center justify-between gap-4">
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.date} • <span className="font-bold text-amber-500 uppercase">{item.status}</span></div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEditRoadmapTrigger(item)} className="p-1 hover:bg-amber-500/10 text-slate-400 hover:text-amber-500 rounded">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteConfirmation({ id: item.id, type: 'roadmap', title: item.title })} className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* 6. ANNOUNCEMENT BOARD */}
          {activeTab === 'announcements' && (
            <div className="space-y-8 text-left animate-fade-in" id="admin-panel-announcements">
              <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white border-b border-gray-200/20 pb-3 flex items-center justify-between">
                <span>Broadcast Announcements</span>
                {editingId && (
                  <button onClick={() => setEditingId(null)} className="text-xs text-rose-500 font-mono">Cancel Editing</button>
                )}
              </h3>

              {/* Form */}
              <form onSubmit={handleSaveAnnouncement} className="p-5 rounded-2xl bg-gray-50 dark:bg-slate-800/20 border border-gray-150 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                  {editingId ? '✍️ Edit Announcement' : '➕ Add New Announcement'}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">Announcement Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="🎉 Welcome to my platform!"
                      value={annForm.title}
                      onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                      className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">Notice Color Class (Theme) *</label>
                    <select
                      value={annForm.type}
                      onChange={(e) => setAnnForm({ ...annForm, type: e.target.value as any })}
                      className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg text-slate-900 dark:text-slate-300"
                    >
                      <option value="info">Info (Blue Sky theme)</option>
                      <option value="success">Success (Emerald celebration theme)</option>
                      <option value="warning">Warning (Amber warning theme)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">Notification Message Content *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Provide details about releases, down-times, or welcomes..."
                    value={annForm.message}
                    onChange={(e) => setAnnForm({ ...annForm, message: e.target.value })}
                    className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 rounded-lg"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="ann-active"
                    checked={annForm.active}
                    onChange={(e) => setAnnForm({ ...annForm, active: e.target.checked })}
                    className="w-4 h-4 text-amber-500 rounded border-gray-300"
                  />
                  <label htmlFor="ann-active" className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">Show/Activate immediately on top banner</label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-amber-500 dark:bg-slate-150 text-white dark:text-gray-900 dark:hover:text-white font-bold text-xs rounded-xl"
                  id="admin-announcement-submit-btn"
                >
                  <span>{editingId ? 'Save Broadcast' : 'Publish Broadcast'}</span>
                </button>
              </form>

              {/* Announcement List */}
              <div className="space-y-2">
                {announcements.map(ann => (
                  <div key={ann.id} className="p-4 rounded-xl bg-gray-55/30 dark:bg-slate-800/10 border border-gray-150 flex items-center justify-between gap-4">
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {ann.title} {ann.active && <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase rounded ml-1">Active</span>}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{ann.message}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEditAnnounceTrigger(ann)} className="p-1 hover:bg-amber-500/10 text-slate-400 hover:text-amber-500 rounded">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteConfirmation({ id: ann.id, type: 'announcement', title: ann.title })} className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* 7. CONTACT FORM INBOX */}
          {activeTab === 'messages' && (
            <div className="space-y-6 text-left animate-fade-in" id="admin-panel-messages">
              <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white border-b border-gray-200/20 pb-3 flex items-center justify-between">
                <span>Inquiries Inbox</span>
                <span className="text-xs text-slate-400 font-mono font-semibold">{contacts.length} messages total</span>
              </h3>

              <div className="space-y-4">
                {contacts.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`p-5 rounded-2xl border text-left transition-all ${
                      msg.read 
                        ? 'bg-gray-55/20 dark:bg-slate-800/10 border-gray-150' 
                        : 'bg-amber-500/5 dark:bg-amber-400/5 border-amber-500/20 shadow-sm'
                    }`}
                    id={`message-item-${msg.id}`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
                      <div>
                        <div className="text-xs font-bold text-slate-850 dark:text-slate-150">{msg.name}</div>
                        <a href={`mailto:${msg.email}`} className="text-[10px] text-slate-400 hover:text-amber-500 font-mono block mt-0.5">{msg.email}</a>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : 'N/A'}
                        </span>
                        
                        {/* Toggle Read */}
                        <button
                          onClick={() => onToggleContactRead(msg.id, !msg.read)}
                          className={`p-1.5 rounded transition-all ${
                            msg.read 
                              ? 'hover:bg-amber-500/10 text-slate-400 hover:text-amber-500' 
                              : 'bg-amber-500 text-white hover:bg-amber-600'
                          }`}
                          title={msg.read ? "Mark as Unread" : "Mark as Read"}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmation({ id: msg.id, type: 'contact', title: `Message from ${msg.name}` })}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded transition-all"
                          title="Delete message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Message content */}
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-sans whitespace-pre-wrap leading-relaxed border-t border-gray-100 dark:border-slate-800/50 pt-3">
                      {msg.message}
                    </p>
                  </div>
                ))}

                {contacts.length === 0 && (
                  <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                    <Mail className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-sm font-semibold">Your Inbox is completely empty!</p>
                    <p className="text-xs mt-0.5">When users fill in the contact form, their queries appear here.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

      {cropperState && (
        <ImageCropperModal
          imageSrc={cropperState.imageSrc}
          aspectRatio={cropperState.aspectRatio}
          title={cropperState.title}
          onCropComplete={cropperState.onComplete}
          onCancel={() => setCropperState(null)}
        />
      )}

      {/* Modern Custom Delete Confirmation Dialog Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in" id="delete-confirm-modal">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 border border-gray-150 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/30 rounded-full flex items-center justify-center text-rose-500 mx-auto animate-pulse">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">Confirm Deletion</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                Are you sure you want to permanently delete <span className="font-semibold text-slate-700 dark:text-slate-200">"{deleteConfirmation.title}"</span>? This action is irreversible.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="flex-1 py-2 text-xs font-semibold bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const { id, type } = deleteConfirmation;
                  if (type === 'website') onDeleteWebsite(id);
                  else if (type === 'app') onDeleteApp(id);
                  else if (type === 'roadmap') onDeleteRoadmap(id);
                  else if (type === 'announcement') onDeleteAnnouncement(id);
                  else if (type === 'contact') onDeleteContact(id);
                  setDeleteConfirmation(null);
                }}
                className="flex-1 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
