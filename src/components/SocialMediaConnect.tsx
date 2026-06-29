import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Github, Facebook, Instagram, Mail, X, HelpCircle } from 'lucide-react';

// TikTok Custom SVG icon as lucide fallback since TikTok can sometimes be missing or named differently
const TikTokIcon = () => (
  <svg 
    className="w-4 h-4 fill-current" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.74-.22-.23-.45-.48-.64-.73v7.28c-.02 1.56-.39 3.16-1.25 4.47-1.13 1.76-3.1 2.87-5.18 3.01-1.89.15-3.88-.35-5.34-1.61C4.38 19.34 3.5 17.27 3.65 15.1c.11-2.22 1.34-4.39 3.32-5.39 1.48-.77 3.2-.95 4.8-.52l-.46 3.97c-1.12-.31-2.36-.18-3.34.45-.92.57-1.48 1.66-1.48 2.74.02 1.09.61 2.15 1.55 2.7 1 .58 2.26.54 3.19-.11.83-.56 1.25-1.57 1.25-2.55V.02z"/>
  </svg>
);

export default function SocialMediaConnect() {
  const [isOpen, setIsOpen] = useState(false);

  const socialLinks = [
    { 
      name: 'GitHub', 
      icon: <Github className="w-4 h-4" />, 
      url: 'https://github.com', 
      color: 'bg-slate-900 dark:bg-slate-800 border-slate-750 text-white hover:bg-slate-950 hover:shadow-slate-500/10' 
    },
    { 
      name: 'TikTok', 
      icon: <TikTokIcon />, 
      url: 'https://tiktok.com', 
      color: 'bg-black text-white border-slate-900 hover:shadow-pink-500/10' 
    },
    { 
      name: 'Facebook', 
      icon: <Facebook className="w-4 h-4" />, 
      url: 'https://facebook.com', 
      color: 'bg-blue-600 border-blue-500 text-white hover:bg-blue-700 hover:shadow-blue-500/10' 
    },
    { 
      name: 'Instagram', 
      icon: <Instagram className="w-4 h-4" />, 
      url: 'https://instagram.com', 
      color: 'bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 border-purple-500 text-white hover:shadow-red-500/10' 
    },
    { 
      name: 'Email', 
      icon: <Mail className="w-4 h-4" />, 
      url: 'mailto:mdasiullah195@gmail.com', 
      color: 'bg-amber-500 border-amber-400 text-white hover:bg-amber-600 hover:shadow-amber-500/10' 
    },
  ];

  // Distribution in semi-circle upwards (180 to 360 degrees)
  // 5 items fanning out with radius 75px
  const getCoordinates = (index: number, total: number) => {
    const radius = 80; // pixels
    const startAngle = Math.PI; // 180 degrees (left)
    const endAngle = 2 * Math.PI; // 360 degrees (right)
    
    // Distribute angles evenly
    const angle = startAngle + (index / (total - 1)) * (endAngle - startAngle);
    
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
    };
  };

  return (
    <div className="relative inline-block z-30" id="social-media-connect">
      {/* Fan out Social Icons */}
      <AnimatePresence>
        {isOpen && (
          <div className="absolute inset-0">
            {socialLinks.map((item, idx) => {
              const { x, y } = getCoordinates(idx, socialLinks.length);
              
              return (
                <motion.a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    x, 
                    y, 
                    opacity: 1,
                    transition: {
                      type: 'spring',
                      stiffness: 160,
                      damping: 14,
                      delay: idx * 0.02
                    }
                  }}
                  exit={{ 
                    scale: 0, 
                    x: 0, 
                    y: 0, 
                    opacity: 0,
                    transition: {
                      type: 'spring',
                      stiffness: 200,
                      damping: 18,
                      delay: (socialLinks.length - 1 - idx) * 0.015
                    }
                  }}
                  whileHover={{ scale: 1.15, y: y - 4 }}
                  className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center border shadow-md transition-all cursor-pointer ${item.color}`}
                  title={item.name}
                  id={`social-fan-link-${item.name.toLowerCase()}`}
                >
                  {item.icon}
                </motion.a>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Center Trigger Share Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className={`w-11 h-11 rounded-full flex items-center justify-center border shadow-lg transition-all cursor-pointer ${
          isOpen
            ? 'bg-rose-500 border-rose-400 text-white hover:bg-rose-600 shadow-rose-500/20'
            : 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-700 shadow-indigo-500/20'
        }`}
        id="social-fan-trigger-btn"
        aria-label="Share & Connect"
      >
        <motion.div
          animate={{ rotate: isOpen ? 135 : 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="flex items-center justify-center"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
        </motion.div>
      </motion.button>
    </div>
  );
}
