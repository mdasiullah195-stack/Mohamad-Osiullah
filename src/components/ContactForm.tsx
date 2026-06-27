import React, { useState } from 'react';
import { Send, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import confetti from 'canvas-confetti';
import { Language, translations } from '../utils/translations';

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const storedLang = localStorage.getItem('portfolio_lang');
  const language = (storedLang === 'EN' || storedLang === 'NE' ? storedLang : 'EN') as Language;
  const t = translations[language];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus('error');
      setErrorMessage('Please fill in all the required fields.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    const contactPath = 'contacts';
    try {
      // Create contact record matching security schema
      await addDoc(collection(db, contactPath), {
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
        createdAt: serverTimestamp(), // Enforces compliance with request.time
        read: false
      });
      
      setStatus('success');
      confetti({
        particleCount: 150,
        spread: 85,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#f59e0b', '#10b981', '#3b82f6']
      });
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setStatus('error');
      setErrorMessage('Failed to send message. Please try again.');
      try {
        handleFirestoreError(error, OperationType.CREATE, contactPath);
      } catch (logErr) {
        // Log is already printed, keep UI graceful
      }
    }
  };

  return (
    <div 
      className="p-6 sm:p-8 rounded-3xl glass border border-gray-200/50 dark:border-slate-800/60 shadow-xl max-w-xl mx-auto text-left relative overflow-hidden"
      id="contact-form-container"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />

      <h3 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white mb-2">
        {t.letsCreate}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 font-sans">
        {t.contactDesc}
      </p>

      {/* Status Messages */}
      {status === 'success' && (
        <div className="mb-5 p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/30 rounded-2xl flex items-start gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">{t.messageSent}</span>
            <span>{t.messageSuccess}</span>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="mb-5 p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 border border-rose-200/50 dark:border-rose-900/30 rounded-2xl flex items-start gap-3 text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Submission Failed</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1.5">
            {t.fullName}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            disabled={status === 'loading'}
            className="block w-full px-4 py-2.5 text-sm bg-gray-55/60 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-gray-900 dark:text-white transition-all disabled:opacity-50 placeholder-gray-400"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1.5">
            {t.emailAddr}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            disabled={status === 'loading'}
            className="block w-full px-4 py-2.5 text-sm bg-gray-55/60 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-gray-900 dark:text-white transition-all disabled:opacity-50 placeholder-gray-400"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1.5">
            {t.message}
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={4}
            value={formData.message}
            onChange={handleChange}
            placeholder="Tell me about your project, idea, or request..."
            disabled={status === 'loading'}
            className="block w-full px-4 py-3 text-sm bg-gray-55/60 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-gray-900 dark:text-white transition-all disabled:opacity-50 placeholder-gray-400"
          />
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full py-3 rounded-xl bg-gray-900 dark:bg-slate-100 text-white dark:text-gray-900 font-bold text-sm hover:bg-indigo-600 dark:hover:bg-indigo-600 dark:hover:text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer"
          id="contact-submit-btn"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t.sending}</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>{t.sendMessage}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
