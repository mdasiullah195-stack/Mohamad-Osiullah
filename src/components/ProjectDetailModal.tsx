import React, { useState } from 'react';
import { Website, App, Feedback, Comment } from '../types';
import { X, Globe, Download, Eye, ExternalLink, Share2, Star, Calendar, ShieldCheck, Smartphone, QrCode, Copy, Check, Clock, MessageSquare, Send, LogIn, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchAndReassembleApk, downloadBase64File } from '../utils/apkDownloader';
import { signInWithGoogle } from '../firebase';

interface ProjectDetailModalProps {
  project: Website | App | null;
  type: 'website' | 'app' | null;
  onClose: () => void;
  onIncrementCount: (projectId: string, type: 'website' | 'app', field: 'views' | 'clicks' | 'downloads') => void;
  onShowToast?: (message: string, type: 'success' | 'info' | 'error' | 'download') => void;
  feedbacks: Feedback[];
  onSubmitFeedback: (name: string, rating: number, comment: string) => Promise<void>;
  user: any;
  comments: Comment[];
  onPostComment: (projectId: string, projectName: string, projectType: 'website' | 'app', text: string) => Promise<void>;
}

export default function ProjectDetailModal({ 
  project, 
  type, 
  onClose, 
  onIncrementCount, 
  onShowToast,
  feedbacks = [],
  onSubmitFeedback,
  user,
  comments = [],
  onPostComment
}: ProjectDetailModalProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showQr, setShowQr] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  const openLightbox = (idx: number) => {
    setLightboxIdx(idx);
    setLightboxOpen(true);
  };
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [fbName, setFbName] = useState('');
  const [fbRating, setFbRating] = useState(5);
  const [fbHoverRating, setFbHoverRating] = useState<number | null>(null);
  const [fbComment, setFbComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !project) return;
    setSubmittingComment(true);
    try {
      await onPostComment(project.id, project.name, type === 'website' ? 'website' : 'app', commentText.trim());
      setCommentText('');
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbName.trim() || !fbComment.trim()) return;
    setSubmittingFeedback(true);
    try {
      await onSubmitFeedback(fbName.trim(), fbRating, fbComment.trim());
      setFbName('');
      setFbRating(5);
      setFbComment('');
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleCopyLink = () => {
    const directUrl = `${window.location.origin}${window.location.pathname}#${type}-${project.id}`;
    navigator.clipboard.writeText(directUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy link:', err);
    });
  };

  if (!project || !type) return null;

  const isWeb = type === 'website';
  const webProj = project as Website;
  const appProj = project as App;

  // Dynamically calculate Estimated Reading Time based on description text
  const wordCount = project.description ? project.description.trim().split(/\s+/).filter(Boolean).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 180)); // 180 words per minute is a standard comfortable speed

  // Handle visit / download actions
  const handleAction = async (field: 'clicks' | 'downloads') => {
    if (isWeb) {
      onIncrementCount(project.id, type, field);
      window.open(webProj.url, '_blank', 'noopener,noreferrer');
    } else {
      onShowToast?.(`Starting download of ${appProj.name} v${appProj.version}...`, 'download');
      if (appProj.apkUrl && appProj.apkUrl.startsWith('chunks://')) {
        if (downloadProgress !== null) return; // already downloading
        try {
          setDownloadProgress(0);
          onIncrementCount(project.id, type, field);
          const base64 = await fetchAndReassembleApk(appProj.id, (percent) => {
            setDownloadProgress(percent);
          });
          downloadBase64File(base64, `${appProj.name.toLowerCase().replace(/\s+/g, '_')}_v${appProj.version}.apk`);
          setDownloadProgress(null);
        } catch (err) {
          console.error(err);
          alert("Failed to download APK. File may be corrupted or inaccessible.");
          setDownloadProgress(null);
        }
      } else if (appProj.apkUrl && appProj.apkUrl.startsWith('data:')) {
        onIncrementCount(project.id, type, field);
        downloadBase64File(appProj.apkUrl, `${appProj.name.toLowerCase().replace(/\s+/g, '_')}_v${appProj.version}.apk`);
      } else {
        onIncrementCount(project.id, type, field);
        window.open(appProj.apkUrl || '#', '_blank', 'noopener,noreferrer');
      }
    }
  };

  // Generate QR Code URL
  const qrTargetUrl = `${window.location.origin}${window.location.pathname}#${type}-${project.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrTargetUrl)}`;

  // Share action
  const handleShare = () => {
    const directUrl = `${window.location.origin}${window.location.pathname}#${type}-${project.id}`;
    const title = `Check out ${project.name} - Mohamad Osiullah`;
    const text = project.description || `Check out ${project.name} on Mohamad Osiullah's Platform.`;
    
    if (navigator.share) {
      navigator.share({
        title,
        text,
        url: directUrl
      })
      .then(() => {
        onShowToast?.('Shared successfully!', 'success');
      })
      .catch(err => {
        console.log('Error sharing via Web Share API:', err);
      });
    } else {
      navigator.clipboard.writeText(directUrl).then(() => {
        setCopied(true);
        onShowToast?.('Project link copied to clipboard!', 'success');
        setTimeout(() => setCopied(false), 2000);
      }).catch(err => {
        console.error('Failed to copy link:', err);
      });
    }
  };

  // Compile list of gallery screenshots
  const screenshots = isWeb 
    ? (webProj.screenshots && webProj.screenshots.length > 0 ? webProj.screenshots : [webProj.screenshot])
    : (appProj.screenshots && appProj.screenshots.length > 0 ? appProj.screenshots : []);

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4"
        id="project-detail-modal"
      >
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Sheet container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800/80 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
        >
          
          {/* Close floating button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-black/40 backdrop-blur-md hover:bg-black/60 text-white rounded-full transition-colors"
            aria-label="Close details"
            id="modal-close-floating-btn"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Scrollable contents */}
          <div className="overflow-y-auto flex-1">
            
            {/* Header Banner image */}
            <div className="relative h-48 sm:h-64 bg-slate-900">
              <img
                src={isWeb ? (webProj.bannerImage || webProj.screenshot) : (appProj.banner || appProj.screenshots[0])}
                alt={project.name}
                className="w-full h-full object-cover opacity-85"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-black/10" />
              
              {/* Overlay Meta items */}
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
                <div className="flex gap-4 items-start sm:items-end">
                  
                  {/* Floating App Icon (only for Apps) */}
                  {!isWeb && (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-white bg-white shadow-lg shrink-0">
                      <img
                        src={appProj.icon}
                        alt={project.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=150&q=80';
                        }}
                      />
                    </div>
                  )}

                  <div className="text-left text-white">
                    <span className="px-2 py-0.5 text-[10px] font-bold font-mono tracking-wider bg-indigo-650 text-white rounded-md uppercase">
                      {project.category}
                    </span>
                    <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight mt-1">
                      {project.name}
                    </h2>
                  </div>
                </div>

                {/* Stars */}
                <div className="hidden sm:flex items-center gap-1 text-indigo-500 dark:text-indigo-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < project.rating ? 'fill-current' : 'opacity-30'}`} />
                  ))}
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
              
              {/* Left Column: Details, Screenshots, Changelog */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Description */}
                <div>
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                      About Project
                    </h3>
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-[10px] font-mono font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-100/20 dark:border-indigo-900/30 shadow-sm" id="reading-time-badge">
                      <Clock className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                      <span>{readingTime} min read</span>
                    </div>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans text-sm sm:text-base">
                    {project.description}
                  </p>
                </div>

                {/* Enhanced Horizontal Screenshots Gallery */}
                {screenshots.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                        Screenshots Gallery
                      </h3>
                      {screenshots.length > 1 && (
                        <span className="text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/40 px-2 py-0.5 rounded-md">
                          {screenshots.length} Images • Scroll Horizontally →
                        </span>
                      )}
                    </div>
                    
                    {/* Horizontal scrollable row */}
                    <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scroll-smooth no-scrollbar" id="screenshots-horizontal-row">
                      {screenshots.map((shot, idx) => (
                        <div
                          key={idx}
                          onClick={() => openLightbox(idx)}
                          className="relative w-64 sm:w-72 aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-gray-200/50 dark:border-slate-800/80 shrink-0 cursor-pointer snap-start group shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <img
                            src={shot}
                            alt={`${project.name} preview ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
                            }}
                          />
                          {/* Hover Overlay with Zoom icon */}
                          <div className="absolute inset-0 bg-slate-950/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              whileHover={{ scale: 1 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="p-2.5 rounded-full bg-white/10 border border-white/20 text-white backdrop-blur-md shadow-lg"
                            >
                              <ZoomIn className="w-5 h-5 text-white" />
                            </motion.div>
                          </div>
                          
                          {/* Small Index badge on bottom right */}
                          <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-mono text-white/80 border border-white/5 opacity-80 group-hover:opacity-100 transition-opacity">
                            {idx + 1} / {screenshots.length}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Changelog Section (only for Apps) */}
                {!isWeb && appProj.changelog && (
                  <div className="p-5 rounded-2xl bg-gray-50 dark:bg-slate-800/30 border border-gray-150 dark:border-slate-850">
                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-2">
                      Changelog & Release Notes ({appProj.version})
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-mono whitespace-pre-line leading-relaxed">
                      {appProj.changelog}
                    </p>
                  </div>
                )}

                {/* Changelog Section (for Websites) */}
                {isWeb && webProj.changelog && (
                  <div className="p-5 rounded-2xl bg-gray-50 dark:bg-slate-800/30 border border-gray-150 dark:border-slate-850">
                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-2">
                      Changelog & Release Notes ({webProj.version || 'v1.0.0'})
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-mono whitespace-pre-line leading-relaxed">
                      {webProj.changelog}
                    </p>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* User Reviews & Ratings Section */}
                {/* ------------------------------------------------------------- */}
                <div className="p-5 rounded-2xl bg-gray-55/30 dark:bg-slate-850/20 border border-gray-150 dark:border-slate-800/50 space-y-6 mt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/20 pb-3">
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                        User Reviews & Ratings
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Share your thoughts or rate this project
                      </p>
                    </div>
                    
                    {/* Overall User Score Badge */}
                    {(() => {
                      const projectFeedbacks = feedbacks.filter(fb => fb.projectId === project.id);
                      const totalReviews = projectFeedbacks.length;
                      const avgRating = totalReviews > 0 
                        ? (projectFeedbacks.reduce((sum, f) => sum + f.rating, 0) / totalReviews).toFixed(1)
                        : null;
                        
                      return avgRating ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs font-mono self-start sm:self-auto">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{avgRating} ★ ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono italic self-start sm:self-auto">No reviews yet</span>
                      );
                    })()}
                  </div>

                  {/* Submit Feedback Form */}
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 font-mono mb-1">Your Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="Your Name"
                          value={fbName}
                          onChange={(e) => setFbName(e.target.value)}
                          className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg font-sans placeholder-slate-400 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 font-mono mb-1">Your Rating *</label>
                        <div className="flex items-center gap-1.5 py-1.5">
                          {Array.from({ length: 5 }).map((_, i) => {
                            const starValue = i + 1;
                            const isFilled = fbHoverRating !== null ? starValue <= fbHoverRating : starValue <= fbRating;
                            
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setFbRating(starValue)}
                                onMouseEnter={() => setFbHoverRating(starValue)}
                                onMouseLeave={() => setFbHoverRating(null)}
                                className="text-amber-500 transition-transform duration-100 hover:scale-125 focus:outline-none cursor-pointer"
                              >
                                <Star className={`w-5 h-5 ${isFilled ? 'fill-current' : 'opacity-30'}`} />
                              </button>
                            );
                          })}
                          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 font-mono ml-2">
                            ({fbRating}/5)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 font-mono mb-1">Your Review / Comment *</label>
                      <textarea
                        rows={2}
                        required
                        placeholder="Write a brief comment about this project..."
                        value={fbComment}
                        onChange={(e) => setFbComment(e.target.value)}
                        className="block w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg font-sans placeholder-slate-400 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingFeedback}
                      className="px-4 py-2 bg-slate-950 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold text-[11px] font-mono uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submittingFeedback ? 'Submitting...' : 'Submit Review'}</span>
                    </button>
                  </form>

                  {/* Reviews List */}
                  {(() => {
                    const projectFeedbacks = feedbacks.filter(fb => fb.projectId === project.id);
                    if (projectFeedbacks.length === 0) return null;
                    
                    return (
                      <div className="space-y-3 pt-3 border-t border-gray-200/10">
                        <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                          Recent Comments ({projectFeedbacks.length})
                        </h4>
                        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                          {projectFeedbacks.map(fb => (
                            <div key={fb.id} className="p-3.5 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-gray-200/30 dark:border-slate-850/30 space-y-1.5 text-left">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{fb.name}</span>
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 text-amber-500 ${i < fb.rating ? 'fill-current' : 'opacity-20'}`} />
                                  ))}
                                  <span className="text-[9px] text-slate-400 font-mono ml-1">
                                    {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : ''}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal font-sans italic">
                                "{fb.comment}"
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* ------------------------------------------------------------- */}
                {/* Real-time Project Comments Section */}
                {/* ------------------------------------------------------------- */}
                <div className="p-5 rounded-2xl bg-indigo-50/10 dark:bg-indigo-950/5 border border-indigo-150/15 dark:border-indigo-900/10 space-y-5 mt-6" id="discussion-section">
                  <div className="flex items-center gap-2 border-b border-gray-200/20 pb-3">
                    <MessageSquare className="w-4 h-4 text-indigo-500" />
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest font-mono">
                        Real-time Discussion
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Authenticated live chat and project feedback
                      </p>
                    </div>
                  </div>

                  {/* Comment Form or Sign-in Prompt */}
                  {user ? (
                    <form onSubmit={handleCommentSubmit} className="flex gap-3" id="post-comment-form">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-indigo-200 dark:border-slate-850 shrink-0 bg-slate-100">
                        <img 
                          src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName || 'Anon'}`} 
                          alt={user.displayName || 'Avatar'} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 font-mono">
                          Posting as <span className="text-indigo-600 dark:text-indigo-400">{user.displayName || user.email}</span>
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            placeholder="Type a comment or ask a question..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="block w-full pl-3 pr-10 py-2.5 text-xs bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-xl font-sans placeholder-slate-400 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                          />
                          <button
                            type="submit"
                            disabled={submittingComment}
                            className="absolute right-1 top-1 bottom-1 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
                          >
                            <Send className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="p-4 rounded-xl bg-gray-55/30 dark:bg-slate-950/40 border border-gray-200/50 dark:border-slate-850/50 text-center space-y-2.5" id="login-to-comment">
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-sans">
                        To keep this showcase safe and secure, only authenticated Google profiles can post comments.
                      </p>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await signInWithGoogle();
                          } catch (err) {
                            console.error('Sign-in failed', err);
                          }
                        }}
                        className="mx-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-mono font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 shadow-sm hover:shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In with Google</span>
                      </button>
                    </div>
                  )}

                  {/* Comments list */}
                  {(() => {
                    const projectComments = comments.filter(c => c.projectId === project.id);
                    return (
                      <div className="space-y-3 pt-3 border-t border-gray-200/10" id="comments-list-section">
                        <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                          Project Comments ({projectComments.length})
                        </h4>
                        
                        {projectComments.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic text-center py-4 font-mono">
                            No comments posted yet. Be the first to start the discussion!
                          </p>
                        ) : (
                          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                            {projectComments.map(c => (
                              <div key={c.id} className="p-3.5 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-gray-200/30 dark:border-slate-850/30 flex gap-3 text-left">
                                <div className="w-7 h-7 rounded-full overflow-hidden border border-gray-200/50 dark:border-slate-850 shrink-0 bg-slate-100">
                                  <img 
                                    src={c.userPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${c.userName}`} 
                                    alt={c.userName} 
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-bold text-slate-850 dark:text-slate-200 leading-none">
                                      {c.userName}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-mono">
                                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                                    {c.text}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

              </div>

              {/* Right Column: Key Spec, QR Code, Actions */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Project Specs Table */}
                <div className="p-5 rounded-2xl glass border border-gray-200/50 dark:border-slate-800/60 space-y-3.5">
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono border-b border-gray-250/20 dark:border-slate-800/50 pb-2">
                    Project Specs
                  </h4>

                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-500">Platform</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                      {isWeb ? <Globe className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                      {isWeb ? 'Web / Browser' : 'Android App'}
                    </span>
                  </div>

                  {!isWeb && (
                    <>
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-500">Version</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {appProj.version}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-500">File Size</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {appProj.size}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-500">Downloads</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {appProj.downloads}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-500">Release Date</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {appProj.releaseDate}
                        </span>
                      </div>
                    </>
                  )}

                  {isWeb && (
                    <>
                      {webProj.version && (
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-slate-500">Version</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {webProj.version}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-500">Views</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {webProj.views}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-500">Link Clicks</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {webProj.clicks}
                        </span>
                      </div>
                      {webProj.releaseDate && (
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-slate-500">Release Date</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {webProj.releaseDate}
                          </span>
                        </div>
                      )}
                      {webProj.updateDate && (
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-slate-500">Update Date</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {webProj.updateDate}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-500">Created At</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {new Date(webProj.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Actions Box */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleAction(isWeb ? 'clicks' : 'downloads')}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                    id="modal-main-action-btn"
                  >
                    {isWeb ? (
                      <>
                        <Globe className="w-4 h-4" />
                        <span>Launch Live Website</span>
                      </>
                    ) : (
                      <>
                        <Download className={`w-4 h-4 ${downloadProgress !== null ? 'animate-bounce' : ''}`} />
                        <span>
                          {downloadProgress !== null 
                            ? `Assembling App (${downloadProgress}%)` 
                            : 'Download APK File'}
                        </span>
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={handleShare}
                      className="py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 text-xs font-semibold transition-all flex flex-col items-center justify-center gap-1"
                      id="modal-share-btn"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="text-[10px] sm:text-xs">Share</span>
                    </button>

                    <button
                      onClick={handleCopyLink}
                      className={`py-2.5 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center justify-center gap-1 ${
                        copied 
                          ? 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400 font-bold' 
                          : 'border-gray-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                      }`}
                      id="modal-copy-link-btn"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-500 animate-bounce" />
                          <span className="text-[10px] sm:text-xs text-green-600 dark:text-green-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[10px] sm:text-xs">Copy Link</span>
                        </>
                      )}
                    </button>
                    
                    {/* QR Code Toggle button */}
                    <button
                      onClick={() => setShowQr(!showQr)}
                      className={`py-2.5 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center justify-center gap-1 ${
                        showQr 
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                          : 'border-gray-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                      }`}
                      id="modal-qr-toggle-btn"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span className="text-[10px] sm:text-xs">{showQr ? 'Hide QR' : 'Show QR'}</span>
                    </button>
                  </div>
                </div>

                {/* QR Code Container overlay inside modal */}
                {showQr && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-indigo-500/10 text-center flex flex-col items-center gap-3 shadow-md"
                    id="modal-qr-container"
                  >
                    <div className="p-1.5 bg-white rounded-xl border border-gray-150">
                      <img
                        src={qrCodeUrl}
                        alt="Project QR Code"
                        className="w-36 h-36"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                        Scan to Access Project
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 max-w-[180px] mx-auto leading-normal">
                        Point your mobile camera at this QR code to download the APK or open the link instantly.
                      </p>
                    </div>
                  </motion.div>
                )}

              </div>

            </div>

          </div>

        </motion.div>

        {/* Full-screen Lightbox overlay */}
        <AnimatePresence>
          {lightboxOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-black/95 flex flex-col items-center justify-center p-4"
              id="lightbox-overlay"
            >
              {/* Close button */}
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors z-[120] cursor-pointer"
                aria-label="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Navigation Left Button */}
              {screenshots.length > 1 && (
                <button
                  onClick={() => setLightboxIdx((lightboxIdx - 1 + screenshots.length) % screenshots.length)}
                  className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 hover:bg-white/15 text-white border border-white/5 transition-colors z-[120] cursor-pointer"
                  aria-label="Previous Image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Navigation Right Button */}
              {screenshots.length > 1 && (
                <button
                  onClick={() => setLightboxIdx((lightboxIdx + 1) % screenshots.length)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 hover:bg-white/15 text-white border border-white/5 transition-colors z-[120] cursor-pointer"
                  aria-label="Next Image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

              {/* Main Lightbox Image Frame */}
              <div className="relative max-w-5xl max-h-[75vh] w-full h-full flex items-center justify-center p-4">
                <motion.img
                  key={lightboxIdx}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  src={screenshots[lightboxIdx]}
                  alt={`${project.name} expanded preview ${lightboxIdx + 1}`}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-white/10 select-none"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Lightbox Footer text & indicators */}
              <div className="absolute bottom-6 left-0 right-0 text-center text-white/80 select-none z-[120]">
                <span className="text-xs font-mono bg-white/10 border border-white/10 px-3 py-1 rounded-full">
                  Screenshot {lightboxIdx + 1} of {screenshots.length}
                </span>
                
                {/* Indicators bullets */}
                {screenshots.length > 1 && (
                  <div className="flex gap-2 justify-center mt-4">
                    {screenshots.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setLightboxIdx(i)}
                        className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                          lightboxIdx === i 
                            ? 'bg-indigo-500 scale-125 shadow-lg shadow-indigo-500/50' 
                            : 'bg-white/30 hover:bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </AnimatePresence>
  );
}
