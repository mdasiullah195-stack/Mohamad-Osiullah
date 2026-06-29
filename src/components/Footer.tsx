import React, { useState } from 'react';
import { Github, Linkedin, Twitter, ArrowUp, Mail, Copyright, Facebook, Music, CheckCircle2, Loader2, Send } from 'lucide-react';
import { Portfolio } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Language, translations } from '../utils/translations';
import SocialMediaConnect from './SocialMediaConnect';

interface FooterProps {
  portfolio: Portfolio;
  onNavigate: (section: string) => void;
  logo?: string;
}

export default function Footer({ portfolio, onNavigate, logo }: FooterProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const storedLang = localStorage.getItem('portfolio_lang');
  const language = (storedLang === 'EN' || storedLang === 'NE' ? storedLang : 'EN') as Language;
  const t = translations[language];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setErrMsg('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setErrMsg('');

    const subscribersPath = 'subscribers';
    try {
      await addDoc(collection(db, subscribersPath), {
        email: email.trim(),
        subscribedAt: serverTimestamp()
      });
      setStatus('success');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setErrMsg(t.failedSend);
      try {
        handleFirestoreError(error, OperationType.CREATE, subscribersPath);
      } catch (logErr) {
        // Log is already printed, keep UI graceful
      }
    }
  };
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black text-slate-300 border-t border-slate-900 py-12 transition-colors duration-300 no-print" id="global-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Newsletter Signup Row */}
        <div className="border-b border-slate-900 pb-8 mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="max-w-md text-left">
            <h4 className="text-white font-display font-bold text-lg">{t.subscribeTitle}</h4>
            <p className="text-xs text-slate-500 mt-1">{t.subscribeDesc}</p>
          </div>
          
          <form onSubmit={handleSubscribe} className="w-full lg:max-w-md flex flex-col sm:flex-row gap-2 relative">
            <div className="relative flex-1">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'success' || status === 'error') setStatus('idle');
                }}
                disabled={status === 'loading'}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900/60 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500 transition-colors disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-5 py-2.5 text-sm font-bold bg-white text-black hover:bg-indigo-600 hover:text-white rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer active:scale-95"
            >
              {status === 'loading' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{t.subscribeBtn}</span>
            </button>

            {/* Float messages */}
            {status === 'success' && (
              <span className="absolute -bottom-6 left-1 text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {t.subscribedSuccess}
              </span>
            )}
            {status === 'error' && (
              <span className="absolute -bottom-6 left-1 text-[11px] text-rose-400 font-medium">
                {errMsg}
              </span>
            )}
          </form>
        </div>

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

          {/* Social Row with Dynamic Expanding Share Menu */}
          <div className="flex items-center gap-4 py-2" id="footer-social-expansion-container">
            <span className="text-xs text-slate-500 font-mono font-semibold mr-1">Share & Connect:</span>
            <SocialMediaConnect />
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
