import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Github, Linkedin, Twitter, Mail, ArrowDown, Globe, Cpu, Sparkles, DownloadCloud, Instagram, Facebook, Music } from 'lucide-react';
import { Portfolio, Website, App } from '../types';

interface HeroProps {
  portfolio: Portfolio;
  websites: Website[];
  apps: App[];
  onNavigate: (section: string) => void;
}

export default function Hero({ portfolio, websites, apps, onNavigate }: HeroProps) {
  const { scrollY } = useScroll();
  // Transform scroll position into a scale value.
  // When scroll is 0, scale is 1. When scroll goes up to 600px, the scale grows smoothly to 1.35.
  const profileScale = useTransform(scrollY, [0, 600], [1, 1.35]);

  const totalWebsites = websites.length;
  const totalApps = apps.length;
  const totalProjects = totalWebsites + totalApps;

  const titles = [
    portfolio.title || "Full Stack Mobile Craftsman",
    "Android APK Developer",
    "Web Application Creator",
    "Digital Products Sandbox",
    "Full-Stack Software Craftsman"
  ];
  const [titleIndex, setTitleIndex] = React.useState(0);
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTitleIndex((prev) => (prev + 1) % titles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [titles.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  };

  const circleVariants = {
    animate1: {
      x: [0, 25, -15, 0],
      y: [0, -35, 20, 0],
      scale: [1, 1.1, 0.9, 1],
      transition: { duration: 18, repeat: Infinity, ease: 'easeInOut' }
    },
    animate2: {
      x: [0, -30, 20, 0],
      y: [0, 40, -25, 0],
      scale: [1, 0.95, 1.1, 1],
      transition: { duration: 22, repeat: Infinity, ease: 'easeInOut' }
    }
  };

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300 py-16 px-4 bg-grid-pattern">
      
      {/* Drifting Parallax Blurred Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          variants={circleVariants}
          animate="animate1"
          className="absolute -top-10 -left-10 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-gradient-to-tr from-blue-400/15 to-indigo-500/5 blur-3xl opacity-60 dark:opacity-40"
        />
        <motion.div 
          variants={circleVariants}
          animate="animate2"
          className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-indigo-500/15 to-purple-500/10 blur-3xl opacity-50 dark:opacity-35"
        />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Owner Profile Info & Badges */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-7 flex flex-col items-start gap-6 text-left"
        >
          {/* Greet Tag */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm border border-indigo-500/10"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to my Sandbox</span>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            variants={itemVariants}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none"
          >
            Hello, I'm <br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-700 bg-clip-text text-transparent">
              {portfolio.name}
            </span>
          </motion.h1>

          {/* Subheading/Bio - Animated word transition */}
          <div className="h-8 overflow-hidden relative">
            <motion.div
              key={titleIndex}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -24, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="text-lg sm:text-xl font-display font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
              {titles[titleIndex]}
            </motion.div>
          </div>

          <motion.p 
            variants={itemVariants}
            className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed font-sans"
          >
            {portfolio.aboutMe}
          </motion.p>

          {/* Statistics Counters in Glass Cards */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-lg mt-2"
          >
            <div 
              onClick={() => onNavigate('websites')}
              className="glass p-3 rounded-2xl cursor-pointer hover:border-indigo-500/50 hover:shadow-md transition-all duration-300 group text-center"
              id="stat-websites"
            >
              <div className="text-2xl sm:text-3xl font-display font-extrabold text-indigo-600 dark:text-indigo-400">
                {totalWebsites}
              </div>
              <div className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1 flex items-center justify-center gap-1">
                <Globe className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                <span>Websites</span>
              </div>
            </div>

            <div 
              onClick={() => onNavigate('apps')}
              className="glass p-3 rounded-2xl cursor-pointer hover:border-indigo-500/50 hover:shadow-md transition-all duration-300 group text-center"
              id="stat-apps"
            >
              <div className="text-2xl sm:text-3xl font-display font-extrabold text-indigo-500 dark:text-indigo-400">
                {totalApps}
              </div>
              <div className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1 flex items-center justify-center gap-1">
                <Cpu className="w-3 h-3 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                <span>Mobile Apps</span>
              </div>
            </div>

            <div 
              className="glass p-3 rounded-2xl hover:border-indigo-500/50 hover:shadow-md transition-all duration-300 group text-center"
              id="stat-projects"
            >
              <div className="text-2xl sm:text-3xl font-display font-extrabold text-indigo-600 dark:text-indigo-400">
                {totalProjects}
              </div>
              <div className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                <span>Projects</span>
              </div>
            </div>
          </motion.div>

          {/* Social Media Row */}
          <motion.div 
            variants={itemVariants}
            className="flex items-center gap-3.5 mt-2"
          >
            {portfolio.socialLinks.github && (
              <a 
                href={portfolio.socialLinks.github} 
                target="_blank" 
                rel="noreferrer"
                className="p-2.5 rounded-full bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 text-slate-700 dark:text-slate-300 transition-all shadow-sm"
                aria-label="GitHub Link"
              >
                <Github className="w-5 h-5" />
              </a>
            )}
            {portfolio.socialLinks.linkedin && (
              <a 
                href={portfolio.socialLinks.linkedin} 
                target="_blank" 
                rel="noreferrer"
                className="p-2.5 rounded-full bg-slate-200/50 dark:bg-slate-800/50 hover:bg-sky-600 hover:text-white text-slate-700 dark:text-slate-300 transition-all shadow-sm"
                aria-label="LinkedIn Link"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {portfolio.socialLinks.twitter && (
              <a 
                href={portfolio.socialLinks.twitter} 
                target="_blank" 
                rel="noreferrer"
                className="p-2.5 rounded-full bg-slate-200/50 dark:bg-slate-800/50 hover:bg-sky-400 hover:text-white text-slate-700 dark:text-slate-300 transition-all shadow-sm"
                aria-label="Twitter Link"
              >
                <Twitter className="w-5 h-5" />
              </a>
            )}
            {portfolio.socialLinks.instagram && (
              <a 
                href={portfolio.socialLinks.instagram} 
                target="_blank" 
                rel="noreferrer"
                className="p-2.5 rounded-full bg-slate-200/50 dark:bg-slate-800/50 hover:bg-pink-600 hover:text-white text-slate-700 dark:text-slate-300 transition-all shadow-sm"
                aria-label="Instagram Link"
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {portfolio.socialLinks.facebook && (
              <a 
                href={portfolio.socialLinks.facebook} 
                target="_blank" 
                rel="noreferrer"
                className="p-2.5 rounded-full bg-slate-200/50 dark:bg-slate-800/50 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 transition-all shadow-sm"
                aria-label="Facebook Link"
              >
                <Facebook className="w-5 h-5" />
              </a>
            )}
            {portfolio.socialLinks.tiktok && (
              <a 
                href={portfolio.socialLinks.tiktok} 
                target="_blank" 
                rel="noreferrer"
                className="p-2.5 rounded-full bg-slate-200/50 dark:bg-slate-800/50 hover:bg-rose-500 hover:text-white text-slate-700 dark:text-slate-300 transition-all shadow-sm"
                aria-label="TikTok Link"
              >
                <Music className="w-5 h-5" />
              </a>
            )}
            {portfolio.socialLinks.email && (
              <a 
                href={`mailto:${portfolio.socialLinks.email}`}
                className="p-2.5 rounded-full bg-slate-200/50 dark:bg-slate-800/50 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-300 transition-all shadow-sm"
                aria-label="Email Link"
              >
                <Mail className="w-5 h-5" />
              </a>
            )}
          </motion.div>

          {/* Action Call buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex items-center gap-3 mt-4"
          >
            <button
              onClick={() => onNavigate('apps')}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-2"
              id="hero-explore-apps-btn"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>Browse Mobile Apps</span>
            </button>
            <button
              onClick={() => onNavigate('websites')}
              className="px-6 py-3 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-semibold text-sm transition-all border border-transparent hover:border-slate-300/50 active:scale-95 flex items-center gap-2"
              id="hero-explore-webs-btn"
            >
              <Globe className="w-4 h-4" />
              <span>Visit Web Apps</span>
            </button>
          </motion.div>
        </motion.div>

        {/* Right Side: Interactive Frame / Photo & Tech stack floaters */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 relative flex justify-center items-center"
        >
          {/* Behind Photo Glow */}
          <div className="absolute w-72 h-72 rounded-full bg-indigo-500/10 blur-2xl animate-pulse" />

          {/* Core Card Container (Glassmorphic Outer Frame) */}
          <div className="relative p-6 rounded-3xl glass-premium shadow-2xl max-w-sm w-full border border-white/20 dark:border-white/5 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
            
            {/* Owner Photo Ring */}
            <motion.div 
              style={{ scale: profileScale }}
              className="relative mx-auto w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-4 border-indigo-500/20 dark:border-indigo-400/10 bg-slate-900 shadow-xl"
            >
              <img
                src={portfolio.profilePhoto || "/input_file_0.png"}
                alt="Mohamad Osiullah Profile"
                className="w-full h-full object-cover transition-all duration-700 hover:scale-110"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=350&q=80';
                }}
              />
            </motion.div>

            {/* Profile Brief Info */}
            <div className="mt-6 text-center">
              <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
                {portfolio.name}
              </h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono tracking-widest uppercase mt-1">
                Full Stack Mobile Craftsman
              </p>
              
              {/* Dynamic Tech Chips */}
              <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                {portfolio.skills.slice(0, 4).map((skill, idx) => (
                  <span 
                    key={idx}
                    className="px-2.5 py-1 text-[10px] font-semibold bg-gray-150/80 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 rounded-full border border-gray-200/30 dark:border-slate-700/30"
                  >
                    {skill.split(' (')[0]}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Float Badge 1 */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-6 right-2 sm:right-6 glass p-2 rounded-xl flex items-center gap-2 shadow-md border border-indigo-500/10"
          >
            <span className="p-1.5 rounded-lg bg-indigo-600 text-white"><Globe className="w-3.5 h-3.5" /></span>
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase font-bold font-mono">Web UI</div>
              <div className="text-[11px] font-bold dark:text-white text-slate-800">100% Responsive</div>
            </div>
          </motion.div>

          {/* Float Badge 2 */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute -bottom-6 left-2 sm:left-6 glass p-2 rounded-xl flex items-center gap-2 shadow-md border border-indigo-500/10"
          >
            <span className="p-1.5 rounded-lg bg-indigo-500 text-white"><Cpu className="w-3.5 h-3.5" /></span>
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase font-bold font-mono">Mobile App</div>
              <div className="text-[11px] font-bold dark:text-white text-slate-800">Native APKs</div>
            </div>
          </motion.div>
        </motion.div>

      </div>

      {/* Down Chevron Indicator */}
      <div 
        onClick={() => onNavigate('websites')}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 cursor-pointer p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors animate-bounce"
        title="Scroll Down"
        id="scroll-down-arrow"
      >
        <ArrowDown className="w-5 h-5 text-gray-400 dark:text-slate-500" />
      </div>

    </section>
  );
}
