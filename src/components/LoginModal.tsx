import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmailLogin: (email: string, pass: string) => Promise<void>;
  onGoogleLogin: () => Promise<void>;
}

export default function LoginModal({
  isOpen,
  onClose,
  onEmailLogin,
  onGoogleLogin
}: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onEmailLogin(email, password);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    setError('');
    setLoading(true);
    try {
      await onGoogleLogin();
      onClose();
    } catch (err: any) {
      console.error('Google Sign-In caught error:', err);
      const errMsg = err?.message || String(err);
      if (
        errMsg.includes('unauthorized-domain') || 
        errMsg.includes('auth/unauthorized-domain') ||
        (err?.code && err.code.includes('unauthorized-domain'))
      ) {
        setError(
          `unauthorized-domain: This hosting domain (${window.location.hostname}) is not authorized in your Firebase Project.\n\n` +
          `👉 Quick Fix:\n` +
          `1. Go to Firebase Console -> Authentication -> Settings -> Authorized Domains\n` +
          `2. Add: ${window.location.hostname}\n\n` +
          `💡 Instant Bypass:\n` +
          `Use the Email & Password option below to log in immediately without whitelisting the domain!`
        );
      } else {
        setError(`Google login failed: ${errMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 text-left overflow-hidden"
            id="admin-login-modal"
          >
            {/* Top Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              aria-label="Close Login Modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl text-indigo-600 dark:text-indigo-400 mb-3 border border-indigo-500/10">
                <ShieldCheck className="w-6 h-6 animate-pulse" />
              </div>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono tracking-widest uppercase font-bold flex items-center gap-1 justify-center">
                <Sparkles className="w-3 h-3" />
                <span>Admin Gateway</span>
              </span>
              <h3 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white mt-1 leading-snug">
                Authorized Access Only
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                Log in to publish hosted web pages, release APK mobile apps, check inquiries, and configure portfolio details.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/30 rounded-xl text-xs flex gap-2 items-start"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="whitespace-pre-line text-left font-sans font-medium">{error}</span>
              </motion.div>
            )}

            {/* Credentials Quick Autofill Panel */}
            <div className="mb-4 p-3 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 dark:border-amber-500/10 rounded-2xl text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-amber-800 dark:text-amber-400 font-sans">Developer Credentials</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('mohamadosiullah@gmail.com');
                    setPassword('Aamir,@1234');
                  }}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white font-mono text-[9px] font-bold rounded-lg transition-all active:scale-95 cursor-pointer"
                  id="autofill-admin-credentials-btn"
                >
                  Autofill Admin
                </button>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                If Google login fails with an <code className="bg-slate-100 dark:bg-slate-800/60 px-1 py-0.5 rounded font-mono text-rose-500 font-bold">unauthorized-domain</code> error, autofill these credentials and sign in instantly.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    disabled={loading}
                    placeholder="mohamadosiullah@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl focus:ring-2 focus:ring-indigo-500/15 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">
                  Security Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    disabled={loading}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl focus:ring-2 focus:ring-indigo-500/15 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                id="modal-submit-login-btn"
              >
                {loading ? 'Authenticating...' : 'Sign In with Email'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-mono text-[10px]">
                  Or Alternative
                </span>
              </div>
            </div>

            {/* Google Sign-In */}
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleClick}
              className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              id="modal-google-login-btn"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 0, 0)">
                  <path d="M21.35,11.1H12v2.7h5.38C17.15,14.93,16,16.21,14.34,17.27l2.15,1.66C17.75,17.77,21.5,13.68,21.35,11.1z" fill="#4285F4" />
                  <path d="M12,20.4c2.54,0,4.86-.84,6.54-2.27l-2.15-1.66c-1.15.77-2.61,1.23-4.39,1.23-3.39,0-6.26-2.28-7.29-5.36L2.45,14.07C4.12,17.82,7.76,20.4,12,20.4z" fill="#34A853" />
                  <path d="M4.71,12.34C4.44,11.53,4.3,10.68,4.3,9.8s.14-1.73.41-2.54L2.55,5.63C1.67,7.4,1.18,9.4,1.18,11.5s.49,4.1,1.37,5.87z" fill="#FBBC05" />
                  <path d="M12,3.6c1.73,0,3.29.6,4.51,1.76l2.15-2.15C17.33,1.93,14.82,1.2,12,1.2c-4.24,0-7.88,2.58-9.55,6.33l2.16,1.67C5.64,5.88,8.51,3.6,12,3.6z" fill="#EA4335" />
                </g>
              </svg>
              <span>Authenticate with Google</span>
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
