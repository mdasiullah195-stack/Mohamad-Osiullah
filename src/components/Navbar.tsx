import React, { useState, useRef, useEffect } from 'react';
import { Search, Sun, Moon, Lock, ShieldCheck, Menu, X, LogOut, Settings } from 'lucide-react';
import { User } from 'firebase/auth';
import { Language, translations } from '../utils/translations';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  isAdmin: boolean;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onNavigate: (section: string) => void;
  currentSection: string;
  logo?: string;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function Navbar({
  darkMode,
  setDarkMode,
  isAdmin,
  user,
  onLogin,
  onLogout,
  searchQuery,
  setSearchQuery,
  onNavigate,
  currentSection,
  logo,
  language,
  onLanguageChange
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchExpanded]);

  const t = translations[language];

  const navItems = [
    { id: 'home', label: t.home },
    { id: 'websites', label: t.websites },
    { id: 'apps', label: t.apps },
    { id: 'roadmap', label: t.roadmap },
    { id: 'contact', label: t.contactMe },
  ];

  return (
    <nav className="sticky top-0 z-50 transition-colors duration-300 glass border-b border-gray-200/50 dark:border-slate-800/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Desktop Nav Links (PC Left-aligned Navigation) */}
          <div className="flex items-center gap-6 shrink-0">
            {/* Logo Section */}
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => onNavigate('home')}
              id="nav-logo"
            >
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-600 bg-slate-900 shadow-md">
                <img
                  src={logo || "/input_file_0.png"}
                  alt="Mohamad Osiullah Logo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback if logo fails to load
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
                  }}
                />
              </div>
              <div className="hidden md:block">
                <span className="font-display font-bold text-base tracking-tight text-gray-900 dark:text-white block leading-none">
                  Mohamad Osiullah
                </span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono tracking-widest uppercase block mt-1">
                  {t.portfolioHub}
                </span>
              </div>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = currentSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? 'text-indigo-700 dark:text-indigo-400 font-semibold bg-indigo-50/50 dark:bg-indigo-950/30'
                        : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    id={`nav-link-${item.id}`}
                  >
                    <span>{item.label}</span>
                    <span className={`absolute bottom-1 left-4 right-4 h-[2px] bg-indigo-600 dark:bg-indigo-400 transition-transform duration-300 origin-left ${
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Icons Section */}
          <div className="flex items-center gap-2">
            
            {/* Sliding Search Bar (All Screens) */}
            <div className="relative flex items-center" id="sliding-search-container">
              <motion.div
                initial={false}
                animate={{
                  width: searchExpanded ? 160 : 0,
                  opacity: searchExpanded ? 1 : 0
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="overflow-hidden relative flex items-center"
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={t.searchPlaceholder || "Search..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="pl-3 pr-8 py-1.5 text-xs bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 rounded-full focus:outline-none text-gray-950 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 w-full"
                  id="sliding-search-input"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
                    id="sliding-search-clear-btn"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </motion.div>
              
              <button
                onClick={() => setSearchExpanded(!searchExpanded)}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  searchExpanded 
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30' 
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
                title="Search Projects"
                id="sliding-search-trigger"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Language Switcher Toggle */}
            <button
              onClick={() => onLanguageChange(language === 'EN' ? 'NE' : 'EN')}
              className="p-1.5 px-2 rounded-lg text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-all font-mono text-xs font-bold border border-gray-200/60 dark:border-slate-800/80 flex items-center gap-1 shadow-sm shrink-0"
              aria-label="Toggle Language"
              title="Toggle Language EN / NE"
              id="language-toggle-btn"
            >
              <span className={language === 'EN' ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'opacity-60'}>EN</span>
              <span className="opacity-40">/</span>
              <span className={language === 'NE' ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'opacity-60'}>NE</span>
            </button>

            {/* Dark Mode Switcher */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-all shadow-sm"
              aria-label="Toggle Dark Mode"
              id="theme-toggle-navbar"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>

            {/* Admin Controls (Desktop and large screens only) */}
            {isAdmin ? (
              <div className="hidden lg:flex items-center gap-1.5">
                <button
                  onClick={() => onNavigate('admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    currentSection === 'admin'
                      ? 'bg-indigo-600 border-indigo-700 text-white shadow-md'
                      : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30 hover:bg-emerald-100/60'
                  }`}
                  id="admin-dashboard-btn"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </button>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all border border-transparent hover:border-rose-200/50"
                  title="Sign Out"
                  id="admin-logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-1">
                {/* Admin Sign-In Button */}
                <button
                  onClick={onLogin}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-150 dark:text-gray-900 transition-all shadow-sm"
                  id="admin-login-btn"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
              aria-label="Toggle Menu"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown with smooth animated entry */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ 
              scale: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] },
              opacity: { duration: 0.2, ease: "easeOut" },
              y: { duration: 0.25, ease: "easeOut" }
            }}
            className="lg:hidden relative mx-auto max-w-sm w-[calc(100%-2rem)] mt-2 p-4 flex flex-col gap-1 rounded-2xl border border-white/30 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/75 backdrop-blur-2xl shadow-xl shadow-indigo-500/10 overflow-hidden"
            id="mobile-dropdown-menu"
          >
            {/* Liquid Background Glow Blobs */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full filter blur-2xl pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-tr from-amber-500/15 to-emerald-500/15 rounded-full filter blur-2xl pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />

            {/* Premium Mini-Window Notch Accent */}
            <div className="relative z-10 w-12 h-1 bg-slate-300/80 dark:bg-slate-700/80 rounded-full mx-auto mb-2.5 pointer-events-none" />
            


            {/* Navigation Links with animated underlines */}
            <div className="relative z-10 flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = currentSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`relative w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 group ${
                      isActive
                        ? 'text-indigo-700 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-sm border border-indigo-100/10'
                        : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className={`absolute bottom-1 left-3 right-3 h-[2px] bg-indigo-600 dark:bg-indigo-400 transition-transform duration-300 origin-left ${
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`} />
                  </button>
                );
              })}
            </div>

            {/* Language Switcher Button for Mobile */}
            <div className="relative z-10">
              <button
                onClick={() => {
                  onLanguageChange(language === 'EN' ? 'NE' : 'EN');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-gray-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-slate-800/40 flex items-center gap-2 mt-0.5 border-t border-gray-200/30 dark:border-slate-800/40 pt-2"
                id="mobile-language-toggle-btn"
              >
                <span className="font-mono text-[10px] border border-gray-300 dark:border-slate-700 px-1 py-0.5 rounded font-extrabold bg-gray-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
                  {language}
                </span>
                <span>Toggle Language (EN / NE)</span>
              </button>
            </div>

            {/* Admin Controls inside Dropdown for Mobile/Tablet views */}
            <div className="relative z-10 mt-1.5 pt-2 border-t border-gray-200/30 dark:border-slate-800/40 flex flex-col gap-1.5">
              <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest px-3 mb-0.5">
                Administrator Actions
              </span>
              {isAdmin ? (
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => {
                      onNavigate('admin');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-semibold border transition-all ${
                      currentSection === 'admin'
                        ? 'bg-indigo-600 border-indigo-700 text-white shadow-md'
                        : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Go to Admin Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all border border-dashed border-rose-200/30 hover:border-rose-400"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout Session</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-slate-900 transition-all shadow-md"
                  id="mobile-admin-login-btn"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin Sign In</span>
                </button>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
