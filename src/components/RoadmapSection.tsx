import React from 'react';
import { RoadmapItem } from '../types';
import { Compass, Hourglass, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface RoadmapSectionProps {
  roadmap: RoadmapItem[];
}

export default function RoadmapSection({ roadmap }: RoadmapSectionProps) {
  
  // Sort by date or creation time
  const sortedRoadmap = [...roadmap].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getStatusDetails = (status: RoadmapItem['status']) => {
    switch (status) {
      case 'completed':
        return {
          color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
          bgLine: 'bg-emerald-500',
          label: 'Completed',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        };
      case 'in_progress':
        return {
          color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
          bgLine: 'bg-indigo-600',
          label: 'In Development',
          icon: <Hourglass className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin-slow" />
        };
      default:
        return {
          color: 'text-slate-400 bg-slate-150 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700',
          bgLine: 'bg-slate-300 dark:bg-slate-800',
          label: 'Planned',
          icon: <Clock className="w-4 h-4 text-slate-400" />
        };
    }
  };

  return (
    <div className="py-6 max-w-3xl mx-auto text-left" id="roadmap-timeline-section">
      <div className="relative border-l-2 border-gray-200 dark:border-slate-800/80 pl-6 ml-3 space-y-10">
        
        {sortedRoadmap.map((item, idx) => {
          const status = getStatusDetails(item.status);
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="relative group"
            >
              
              {/* Timeline Bullet node */}
              <div className="absolute -left-[35px] top-1.5 w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center bg-slate-50 dark:bg-slate-950 shadow-sm z-10 transition-transform duration-300 group-hover:scale-110">
                {status.icon}
              </div>

              {/* Roadmap Content Card */}
              <div className="p-5 rounded-2xl glass border border-gray-200/50 dark:border-slate-800/60 hover:border-indigo-500/30 hover:shadow-md transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                  
                  {/* Title */}
                  <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h3>

                  {/* Badges */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${status.color}`}>
                      {status.label}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400 dark:text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.date}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  {item.description}
                </p>
              </div>

            </motion.div>
          );
        })}

        {sortedRoadmap.length === 0 && (
          <div className="text-center py-6 text-slate-400 dark:text-slate-500">
            No active milestones listed. Check back soon!
          </div>
        )}

      </div>
    </div>
  );
}
