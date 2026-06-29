import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { X, Mail, Lock, ShieldCheck, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmailLogin: (email: string, pass: string) => Promise<void>;
}

export default function LoginModal({
  isOpen,
  onClose,
  onEmailLogin
}: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOn, setIsOn] = useState(false);

  // Framer Motion values for the pull cord drag gesture
  const dragY = useMotionValue(0);
  
  // Transform the motion values for the SVG line and bead coordinates dynamically
  const cordLineY2 = useTransform(dragY, [0, 50], [170, 220]);
  const cordBeadY = useTransform(dragY, [0, 50], [180, 230]);

  // Handle Drag releases and trigger lamp switch
  const handleDragEnd = () => {
    const currentY = dragY.get();
    if (currentY > 25) {
      toggleLamp();
    }
    // Return pull-cord to starting position with spring physics
    dragY.set(0);
  };

  const toggleLamp = () => {
    setIsOn(prev => !prev);
    // Play sweet tick pull cord click sound safely
    try {
      const audio = new Audio("https://assets.codepen.io/605876/click.mp3");
      audio.volume = 0.35;
      audio.play().catch(() => {});
    } catch (err) {
      // Audio playback blocked by browser/gesture rules
    }
  };

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

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsOn(false);
      setError('');
      setEmail('');
      setPassword('');
    }
  }, [isOpen]);

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
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className={`relative w-full max-w-xl border rounded-[28px] shadow-2xl z-10 overflow-hidden transition-all duration-500 ${
              isOn 
                ? 'bg-[#1c1f24] border-slate-700/60 shadow-amber-500/5' 
                : 'bg-[#121417] border-slate-800/40 shadow-none'
            }`}
            id="admin-login-modal"
          >
            {/* Top Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all z-20 cursor-pointer border border-white/5"
              aria-label="Close Gateway"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Glowing Lamp Light Cone Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none transition-opacity duration-700 bg-[radial-gradient(circle_at_30%_35%,rgba(255,214,110,0.1),transparent_60%)]"
              style={{ opacity: isOn ? 1 : 0 }}
            />

            {/* Two Column Layout: Lamp and Form */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 p-5 sm:p-7 relative z-10 items-center">
              
              {/* Column 1: Small Interactive Cute Lamp */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center text-center relative py-2">
                
                {/* Cute Mini Lamp Widget Frame */}
                <div className="w-28 h-36 relative flex items-center justify-center">
                  <svg 
                    className="w-full h-full overflow-visible select-none" 
                    viewBox="0 0 200 280" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Radial Lamp Inner Soft Light */}
                    <ellipse 
                      className="transition-all duration-700 blur-xl" 
                      cx="100" 
                      cy="110" 
                      rx="55" 
                      ry="28" 
                      fill="#ffdb8a" 
                      style={{ opacity: isOn ? 0.65 : 0 }}
                    />
                    
                    {/* Stem Base */}
                    <rect fill="#d1ccc2" x="93" y="100" width="14" height="130" rx="7" />
                    
                    {/* Stand Footer */}
                    <rect fill="#d1ccc2" x="65" y="225" width="70" height="10" rx="5" />

                    {/* Pull Cord Cord Line with transform */}
                    <motion.line 
                      stroke="#475569" 
                      strokeWidth="2" 
                      strokeLinecap="round"
                      x1="126" 
                      y1="110" 
                      x2="126" 
                      style={{ y2: cordLineY2 }}
                    />

                    {/* Pull Cord Trigger Group with Drag */}
                    <motion.g 
                      drag="y"
                      dragConstraints={{ top: 0, bottom: 35 }}
                      dragElastic={0.12}
                      dragMomentum={false}
                      onDragEnd={handleDragEnd}
                      style={{ y: dragY }}
                      className="cursor-pointer"
                    >
                      {/* Pull Cord Bead/Ball */}
                      <circle fill="#d4a373" cx="126" cy="180" r="6" className="stroke-slate-900 stroke-[1.5]" />
                      {/* Invisible Larger Drag Anchor Target Area */}
                      <circle cx="126" cy="180" r="20" fill="transparent" />
                    </motion.g>

                    {/* Mushroom Cap/Shade */}
                    <path 
                      className="transition-all duration-500" 
                      fill={isOn ? "#ffffff" : "#e2e8f0"}
                      style={{
                        filter: isOn 
                          ? "drop-shadow(0 0 20px rgba(255, 244, 204, 0.7))" 
                          : "none"
                      }}
                      d="M35 110 C 35 55, 165 55, 165 110 C 165 122, 35 122, 35 110 Z" 
                    />
                  </svg>
                </div>

                {/* Pull Cord Caption Instruction */}
                <div className="mt-2">
                  <span className="text-[9px] font-bold font-mono uppercase tracking-widest text-slate-500 block mb-0.5">
                    Device Status
                  </span>
                  <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border transition-all ${
                    isOn 
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                      : 'bg-slate-800/40 border-slate-700/30 text-slate-500'
                  }`}>
                    {isOn ? '● ACTIVE' : '○ PULL TO UNLOCK'}
                  </div>
                </div>

              </div>

              {/* Column 2: Login Input Form Panel */}
              <div className="sm:col-span-7">
                <AnimatePresence mode="wait">
                  {isOn ? (
                    <motion.div
                      key="active-form"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                      {/* Form Header */}
                      <div className="mb-4">
                        <span className="text-[9px] text-indigo-400 font-mono tracking-widest uppercase font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>Admin Gateway</span>
                        </span>
                        <h3 className="font-display font-extrabold text-xl text-white mt-0.5 leading-none">
                          Welcome, Administrator
                        </h3>
                        <p className="text-[11px] text-slate-450 mt-1 font-sans">
                          Publish web projects, moderate discussions, and configure developer presence stats.
                        </p>
                      </div>

                      {/* Error Messages */}
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-3 p-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-[11px] flex gap-2 items-start"
                        >
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span className="font-medium font-sans text-left leading-normal">{error}</span>
                        </motion.div>
                      )}

                      {/* Input fields */}
                      <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 font-mono mb-1 tracking-wider">
                            USERNAME / EMAIL
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                              <Mail className="w-3.5 h-3.5" />
                            </div>
                            <input
                              type="email"
                              required
                              disabled={loading}
                              placeholder="mohamadosiullah@gmail.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="block w-full pl-9 pr-3 py-2 text-[11px] bg-white/5 border border-white/10 focus:border-amber-500 rounded-lg focus:ring-2 focus:ring-amber-500/10 focus:outline-none text-white transition-all placeholder-slate-650"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 font-mono mb-1 tracking-wider">
                            PASSWORD
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                              <Lock className="w-3.5 h-3.5" />
                            </div>
                            <input
                              type="password"
                              required
                              disabled={loading}
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="block w-full pl-9 pr-3 py-2 text-[11px] bg-white/5 border border-white/10 focus:border-amber-500 rounded-lg focus:ring-2 focus:ring-amber-500/10 focus:outline-none text-white transition-all placeholder-slate-650"
                            />
                          </div>
                        </div>

                        {/* Gold Elegant Premium Styled Button */}
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-2.5 bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#aa771c] hover:opacity-90 active:scale-[0.98] text-slate-950 font-bold text-[11px] rounded-lg transition-all shadow-lg font-sans uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {loading ? 'Validating Token...' : 'Access Workspace'}
                        </button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="locked-hint"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="text-center py-8 px-4 flex flex-col items-center justify-center border border-dashed border-slate-800/60 rounded-3xl bg-slate-950/20"
                    >
                      <div className="p-4 bg-slate-900/60 rounded-full text-slate-500 mb-4 border border-slate-800/40">
                        <ShieldCheck className="w-8 h-8" />
                      </div>
                      <h4 className="font-display font-extrabold text-lg text-slate-200">
                        Authorized Space Lock
                      </h4>
                      <p className="text-xs text-slate-500 mt-1.5 max-w-sm leading-relaxed">
                        This control portal is locked. Please pull the cord on the mushroom light lamp to activate power and illuminate the access credentials panel.
                      </p>
                      
                      <div className="mt-5 flex items-center gap-1.5 text-[10px] text-indigo-400 font-mono font-bold animate-bounce bg-indigo-950/30 px-3 py-1 rounded-full border border-indigo-900/30">
                        <span>↓ Pull Cord to Ignite</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
