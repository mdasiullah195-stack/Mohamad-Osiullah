import React, { useState } from 'react';
import { Website, App } from '../types';
import { Globe, Download, Eye, ExternalLink, Share2, Star, Smartphone, Calendar, FileText, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchAndReassembleApk, downloadBase64File } from '../utils/apkDownloader';

interface ProjectCardProps {
  project: Website | App;
  type: 'website' | 'app';
  onViewDetails: (project: Website | App, type: 'website' | 'app') => void;
  onIncrementCount: (projectId: string, type: 'website' | 'app', field: 'views' | 'clicks' | 'downloads') => void;
  onShowToast?: (message: string, type: 'success' | 'info' | 'error' | 'download') => void;
  onToggleLike?: (projectId: string, type: 'website' | 'app') => void;
  userLikes?: string[];
}

export default function ProjectCard({ 
  project, 
  type, 
  onViewDetails, 
  onIncrementCount, 
  onShowToast,
  onToggleLike,
  userLikes = []
}: ProjectCardProps) {
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = window.location.href;
    const title = `Check out ${project.name} - ${project.category}`;
    const text = project.description;
    
    if (navigator.share) {
      navigator.share({ title, text, url: shareUrl }).catch(err => {
        console.log('Error sharing:', err);
      });
    } else {
      // Fallback: Copy link to clipboard
      navigator.clipboard.writeText(`${shareUrl}#${type}-${project.id}`);
      alert(`Copied link to clipboard: ${shareUrl}#${type}-${project.id}`);
    }
  };

  const handleVisitOrDownload = async (e: React.MouseEvent, field: 'clicks' | 'downloads') => {
    e.stopPropagation();
    
    if (type === 'website') {
      onIncrementCount(project.id, type, field);
      const web = project as Website;
      window.open(web.url, '_blank', 'noopener,noreferrer');
    } else {
      const app = project as App;
      onShowToast?.(`Starting download of ${app.name} v${app.version}...`, 'download');
      if (app.apkUrl && app.apkUrl.startsWith('chunks://')) {
        if (downloadProgress !== null) return; // already downloading
        try {
          setDownloadProgress(0);
          onIncrementCount(project.id, type, field);
          const base64 = await fetchAndReassembleApk(app.id, (percent) => {
            setDownloadProgress(percent);
          });
          downloadBase64File(base64, `${app.name.toLowerCase().replace(/\s+/g, '_')}_v${app.version}.apk`);
          setDownloadProgress(null);
        } catch (err) {
          console.error(err);
          alert("Failed to download APK. File may be corrupted or inaccessible.");
          setDownloadProgress(null);
        }
      } else if (app.apkUrl && app.apkUrl.startsWith('data:')) {
        onIncrementCount(project.id, type, field);
        downloadBase64File(app.apkUrl, `${app.name.toLowerCase().replace(/\s+/g, '_')}_v${app.version}.apk`);
      } else {
        onIncrementCount(project.id, type, field);
        window.open(app.apkUrl || '#', '_blank', 'noopener,noreferrer');
      }
    }
  };

  const isWeb = type === 'website';
  const webProj = project as Website;
  const appProj = project as App;

  return (
    <div 
      onClick={() => {
        onViewDetails(project, type);
        onIncrementCount(project.id, type, 'views');
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onViewDetails(project, type);
          onIncrementCount(project.id, type, 'views');
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${project.name}`}
      className="group relative flex flex-col h-full rounded-2xl glass hover:shadow-xl dark:hover:shadow-slate-900/30 transition-all duration-300 border border-gray-200/50 dark:border-slate-800/60 cursor-pointer overflow-hidden transform hover:-translate-y-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/80 dark:focus:ring-indigo-400/80"
      id={`project-card-${type}-${project.id}`}
    >
      
      {/* Featured Banner Accent */}
      {project.featured && (
        <div className="absolute top-3 left-3 z-10 px-2.5 py-1 text-[10px] font-bold bg-indigo-600 text-white rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" />
          <span>Featured</span>
        </div>
      )}

      {/* Main Card Image Header */}
      <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-900 border-b border-gray-200/30 dark:border-slate-800/30">
        <img
          src={isWeb ? webProj.screenshot : appProj.banner || appProj.screenshots[0] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'}
          alt={project.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';
          }}
        />
        {/* Category Badge overlay */}
        <div className="absolute bottom-3 right-3 px-2 py-0.5 text-[10px] font-semibold tracking-wider font-mono bg-slate-900/80 backdrop-blur-sm text-white rounded-md uppercase">
          {project.category}
        </div>
      </div>

      {/* Card Content body */}
      <div className="flex-1 p-5 flex flex-col justify-between text-left">
        <div>
          {/* Rating and Meta metrics */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1 text-indigo-500 dark:text-indigo-400">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star 
                  key={idx} 
                  className={`w-3 h-3 ${idx < project.rating ? 'fill-current' : 'opacity-25'}`} 
                />
              ))}
            </div>
            {/* Version & Size (Apps) */}
            {!isWeb && (
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 font-mono">
                {appProj.version} • {appProj.size}
              </span>
            )}
          </div>

          {/* Name & Icon Row */}
          <div className="flex gap-3 items-start mb-3">
            {!isWeb && (
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200/50 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0 shadow-sm flex items-center justify-center p-1">
                <img
                  src={appProj.icon}
                  alt={project.name}
                  className="max-w-full max-h-full object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=150&q=80';
                  }}
                />
              </div>
            )}
            <div>
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                {project.name}
              </h3>
              {isWeb && (
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold uppercase tracking-wider block mt-0.5">
                  Web App
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed font-sans">
            {project.description}
          </p>
        </div>

        {/* Analytics Tracker row & Action buttons */}
        <div>
          {/* Counters bar */}
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 dark:text-slate-500 mb-4 border-t border-gray-200/20 dark:border-slate-800/30 pt-3.5">
            <div className="flex items-center gap-1 shrink-0">
              <Eye className="w-3.5 h-3.5" />
              <span>{project.views} views</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {isWeb ? <Globe className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              <span>
                {isWeb ? `${webProj.clicks} clicks` : `${appProj.downloads} dls`}
              </span>
            </div>
            {/* Animated Likes counter */}
            <div className="flex items-center gap-1 text-rose-500 font-bold shrink-0">
              <Heart className={`w-3.5 h-3.5 ${userLikes.includes(project.id) ? 'fill-rose-500' : ''}`} />
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={project.likes || 0}
                  initial={{ y: -8, opacity: 0, scale: 0.8 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 8, opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="inline-block"
                >
                  {project.likes || 0} likes
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Button Actions row */}
          <div className="grid grid-cols-12 gap-2">
            <button
              onClick={(e) => handleVisitOrDownload(e, isWeb ? 'clicks' : 'downloads')}
              className="col-span-6 px-3 py-2 rounded-xl text-xs font-semibold bg-gray-900 dark:bg-slate-100 text-white dark:text-gray-900 hover:bg-indigo-600 dark:hover:bg-indigo-600 dark:hover:text-white hover:text-white transition-all shadow-sm flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
              id={`project-card-action-${type}-${project.id}`}
            >
              {isWeb ? (
                <>
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Visit</span>
                </>
              ) : (
                <>
                  <Download className={`w-3.5 h-3.5 ${downloadProgress !== null ? 'animate-bounce' : ''}`} />
                  <span>
                    {downloadProgress !== null 
                      ? `${downloadProgress}%` 
                      : 'Download'}
                  </span>
                </>
              )}
            </button>

            {/* Heart Like action button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike?.(project.id, type);
              }}
              className={`col-span-2 p-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                userLikes.includes(project.id)
                  ? 'border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  : 'border-gray-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/20'
              }`}
              title={userLikes.includes(project.id) ? "Unlike Project" : "Like Project"}
              id={`project-card-like-${type}-${project.id}`}
            >
              <motion.div
                whileTap={{ scale: 1.4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <Heart className={`w-3.5 h-3.5 ${userLikes.includes(project.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
              </motion.div>
            </button>

            <button
              onClick={handleShare}
              className="col-span-2 p-2 rounded-xl border border-gray-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center cursor-pointer"
              title="Share Project"
              id={`project-card-share-${type}-${project.id}`}
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(project, type);
                onIncrementCount(project.id, type, 'views');
              }}
              className="col-span-2 p-2 rounded-xl border border-gray-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center cursor-pointer"
              title="View Details"
              id={`project-card-details-${type}-${project.id}`}
            >
              <FileText className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="relative flex flex-col h-[400px] rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-gray-200/50 dark:border-slate-800/60 overflow-hidden animate-pulse">
      {/* Image Block Skeleton */}
      <div className="h-36 sm:h-40 w-full bg-slate-200/60 dark:bg-slate-800/60" />
      
      {/* Content Skeleton */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Rating Block Skeleton */}
          <div className="flex justify-between items-center">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-3 h-3 bg-slate-200/60 dark:bg-slate-800/60 rounded-full" />
              ))}
            </div>
            <div className="w-14 h-3 bg-slate-200/60 dark:bg-slate-800/60 rounded" />
          </div>

          {/* Icon & Title Row Skeleton */}
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-lg bg-slate-200/60 dark:bg-slate-800/60 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-slate-200/60 dark:bg-slate-800/60 rounded w-3/4" />
              <div className="h-3.5 bg-slate-200/60 dark:bg-slate-800/60 rounded w-1/3" />
            </div>
          </div>

          {/* Description Lines Skeleton */}
          <div className="space-y-2 mt-4">
            <div className="h-3 bg-slate-200/60 dark:bg-slate-800/60 rounded w-full" />
            <div className="h-3 bg-slate-200/60 dark:bg-slate-800/60 rounded w-5/6" />
          </div>
        </div>

        {/* Action Row Skeleton */}
        <div className="space-y-4 mt-6">
          <div className="h-px bg-slate-200/40 dark:bg-slate-800/40" />
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-8 h-8 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl" />
            <div className="col-span-2 h-8 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl" />
            <div className="col-span-2 h-8 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

