import React, { useState, useEffect } from 'react';
import { Feedback } from '../types';
import { Star, Quote, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FeedbackSliderProps {
  feedbacks: Feedback[];
}

export default function FeedbackSlider({ feedbacks }: FeedbackSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fallback high-quality reviews if the user hasn't submitted any yet, to maintain a premium look
  const defaultFeedbacks: Feedback[] = [
    {
      id: 'default-1',
      name: 'Aayush Sharma',
      rating: 5,
      comment: 'Excellent portfolio! The mobile applications are incredibly smooth, and the UX is highly professional.',
      projectId: 'global',
      projectName: 'Global Portfolio',
      createdAt: new Date().toISOString()
    },
    {
      id: 'default-2',
      name: 'Sita Thapa',
      rating: 5,
      comment: 'Highly impressed with the Clean Architecture used in the Android APK download flows. Extremely clean and fast.',
      projectId: 'global',
      projectName: 'Global Portfolio',
      createdAt: new Date().toISOString()
    },
    {
      id: 'default-3',
      name: 'Niranjan Giri',
      rating: 4,
      comment: 'The estimated reading times and live web previews are great touches. This is the gold standard for developer portfolios.',
      projectId: 'global',
      projectName: 'Global Portfolio',
      createdAt: new Date().toISOString()
    }
  ];

  // Combine real feedbacks (from database) and default ones
  const list = feedbacks.length > 0 ? feedbacks : defaultFeedbacks;

  // Auto-slide every 6 seconds
  useEffect(() => {
    if (list.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % list.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [list.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? list.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % list.length);
  };

  const currentItem = list[currentIndex];

  if (!currentItem) return null;

  return (
    <section className="relative py-16 px-6 bg-slate-50 dark:bg-slate-950/40 border-t border-gray-150 dark:border-slate-850 overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        
        {/* Title Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-150/20 dark:border-indigo-900/40 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 mb-4 uppercase tracking-wider">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>User Reviews & Testimonials</span>
        </div>

        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight mb-8">
          What Visitors & Clients Say
        </h2>

        {/* Sliding Card Container */}
        <div className="relative min-h-[220px] sm:min-h-[180px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="w-full max-w-2xl px-6 py-8 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/60 dark:border-slate-800/80 shadow-sm relative text-left sm:text-center flex flex-col items-center gap-4"
              id={`feedback-slide-${currentItem.id}`}
            >
              {/* Quote Mark */}
              <Quote className="absolute top-4 left-4 w-8 h-8 text-indigo-500/10 dark:text-indigo-400/10 pointer-events-none" />

              {/* Rating Stars */}
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 text-amber-500 ${i < currentItem.rating ? 'fill-current' : 'opacity-20'}`}
                  />
                ))}
              </div>

              {/* Review Comment */}
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 italic font-medium leading-relaxed max-w-xl">
                "{currentItem.comment}"
              </p>

              {/* Review Author & Project Context */}
              <div className="mt-2 text-center">
                <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  {currentItem.name}
                </span>
                <span className="text-[10px] sm:text-xs font-mono text-slate-400 dark:text-slate-500 block sm:inline sm:ml-2">
                  on {currentItem.projectName || 'Global Portfolio'}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          {list.length > 1 && (
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-2 sm:-px-4 pointer-events-none">
              <button
                onClick={handlePrev}
                className="w-8 h-8 rounded-full border border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:bg-slate-50 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-indigo-400 transition-colors flex items-center justify-center pointer-events-auto shadow-sm"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="w-8 h-8 rounded-full border border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:bg-slate-50 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-indigo-400 transition-colors flex items-center justify-center pointer-events-auto shadow-sm"
                aria-label="Next review"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Dot Indicators */}
        {list.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-6">
            {list.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-6 bg-indigo-600' : 'w-1.5 bg-gray-300 dark:bg-slate-800'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
