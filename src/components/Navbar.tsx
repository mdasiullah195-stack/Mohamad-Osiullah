import React, { useState } from 'react';
import { Search, Sun, Moon, Lock, ShieldCheck, Menu, X, LogOut, Settings } from 'lucide-react';
import { User } from 'firebase/auth';

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
  logo
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'websites', label: 'Websites' },
    { id: 'apps', label: 'Apps' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'contact', label: 'Contact Me' },
  ];

  return (
    <nav className="sticky top-0 z-50 transition-colors duration-300 glass border-b border-gray-200/50 dark:border-slate-800/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo Section */}
          <div 
            className="flex items-center gap-3 cursor-pointer shrink-0"
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
                Portfolio Hub
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentSection === item.id
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 font-semibold'
                    : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-slate-800/40'
                }`}
                id={`nav-link-${item.id}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="hidden sm:block relative max-w-xs w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className={`w-4 h-4 transition-colors ${searchFocused ? 'text-indigo-500' : 'text-gray-400'}`} />
            </div>
            <input
              type="text"
              placeholder="Search apps, tools, web..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="block w-full pl-9 pr-4 py-1.5 text-sm bg-gray-100/80 dark:bg-slate-800/70 border border-transparent focus:border-indigo-500/50 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-gray-900 dark:text-white transition-all duration-300 placeholder-gray-400 dark:placeholder-slate-500"
              id="global-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-white"
                id="search-clear-btn"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Icons Section */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Switcher */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-all shadow-sm"
              aria-label="Toggle Dark Mode"
              id="theme-toggle-navbar"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>

            {/* Admin Controls */}
            {isAdmin ? (
              <div className="flex items-center gap-1.5">
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
                  <span className="hidden sm:inline">Admin Panel</span>
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
              <div className="flex items-center gap-1">
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

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass border-t border-gray-200 dark:border-slate-800 py-3 px-4 flex flex-col gap-2 transition-all">
          
          {/* Mobile Search Input */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-150 dark:bg-slate-800 border border-transparent focus:border-amber-500 rounded-lg text-gray-900 dark:text-white"
            />
          </div>

          {/* Navigation Links */}
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentSection === item.id
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 font-semibold'
                  : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}

        </div>
      )}
    </nav>
  );
}
