import React, { useState } from 'react';
import { Announcement } from '../types';
import { Megaphone, X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AnnouncementBannerProps {
  announcements: Announcement[];
}

export default function AnnouncementBanner({ announcements }: AnnouncementBannerProps) {
  const activeAnnouncements = announcements.filter(a => a.active);
  const [closedIds, setClosedIds] = useState<string[]>([]);

  const visibleAnnouncements = activeAnnouncements.filter(a => !closedIds.includes(a.id));

  if (visibleAnnouncements.length === 0) return null;

  const getStyles = (type: Announcement['type']) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/30 text-indigo-800 dark:text-indigo-300',
          icon: <CheckCircle className="w-5 h-5 text-indigo-500" />
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-300',
          icon: <AlertTriangle className="w-5 h-5 text-amber-500" />
        };
      default:
        return {
          bg: 'bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-900/30 text-sky-800 dark:text-sky-300',
          icon: <Info className="w-5 h-5 text-sky-500" />
        };
    }
  };

  return (
    <AnimatePresence>
      {visibleAnnouncements.map((ann, idx) => {
        const styles = getStyles(ann.type);
        return (
          <motion.div
            key={ann.id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`border-b ${styles.bg} transition-colors duration-300`}
            id={`announcement-banner-${ann.id}`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <span className="flex-shrink-0">{styles.icon}</span>
                <div className="text-sm font-medium">
                  <span className="font-bold mr-1">{ann.title}</span>
                  <span className="opacity-90">{ann.message}</span>
                </div>
              </div>
              <button
                onClick={() => setClosedIds([...closedIds, ann.id])}
                className="flex-shrink-0 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                aria-label="Dismiss"
                id={`announcement-close-btn-${ann.id}`}
              >
                <X className="w-4 h-4 opacity-70 hover:opacity-100" />
              </button>
            </div>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}
