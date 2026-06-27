import React from 'react';
import { Github, Linkedin, Twitter, ArrowUp, Mail, Copyright, Facebook, Music } from 'lucide-react';
import { Portfolio } from '../types';

interface FooterProps {
  portfolio: Portfolio;
  onNavigate: (section: string) => void;
  logo?: string;
}

export default function Footer({ portfolio, onNavigate, logo }: FooterProps) {
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black text-slate-300 border-t border-slate-900 py-12 transition-colors duration-300" id="global-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          
          {/* Brand/Signature with Logo */}
          <div className="text-left flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border border-slate-800 bg-slate-900 shrink-0">
              <img
                src={logo || "/input_file_0.png"}
                alt="Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
                }}
              />
            </div>
            <div>
              <span className="font-display font-extrabold text-base text-white tracking-tight">
                {portfolio.name}
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm leading-tight">
                Digital product gallery, mobile APK distribution, & software directory.
              </p>
            </div>
          </div>

          {/* Social Row */}
          <div className="flex items-center gap-4 bg-slate-900/30 px-5 py-2.5 rounded-full border border-slate-900">
            {portfolio.socialLinks.github && (
              <a 
                href={portfolio.socialLinks.github} 
                target="_blank" 
                rel="noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {portfolio.socialLinks.linkedin && (
              <a 
                href={portfolio.socialLinks.linkedin} 
                target="_blank" 
                rel="noreferrer"
                className="text-slate-400 hover:text-sky-400 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {portfolio.socialLinks.twitter && (
              <a 
                href={portfolio.socialLinks.twitter} 
                target="_blank" 
                rel="noreferrer"
                className="text-slate-400 hover:text-sky-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {portfolio.socialLinks.facebook && (
              <a 
                href={portfolio.socialLinks.facebook} 
                target="_blank" 
                rel="noreferrer"
                className="text-slate-400 hover:text-blue-500 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            )}
            {portfolio.socialLinks.tiktok && (
              <a 
                href={portfolio.socialLinks.tiktok} 
                target="_blank" 
                rel="noreferrer"
                className="text-slate-400 hover:text-rose-400 transition-colors"
                aria-label="TikTok"
              >
                <Music className="w-4 h-4" />
              </a>
            )}
            {portfolio.socialLinks.email && (
              <a 
                href={`mailto:${portfolio.socialLinks.email}`}
                className="text-slate-400 hover:text-indigo-400 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Top Button and Copyright */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
              <Copyright className="w-3.5 h-3.5" />
              <span>{new Date().getFullYear()} {portfolio.name}.</span>
            </span>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-slate-905 hover:bg-indigo-600 border border-slate-800 text-slate-400 hover:text-white transition-all shadow-md cursor-pointer"
              title="Back to Top"
              id="footer-back-to-top-btn"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </footer>
  );
}
