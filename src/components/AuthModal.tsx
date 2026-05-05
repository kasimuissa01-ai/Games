import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, ArrowRight, X } from 'lucide-react';
import { signIn, signUp } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log(`Attempting ${isLogin ? 'login' : 'signup'} for: ${email}`);
      if (isLogin) {
        const data = await signIn(email, password);
        console.log('Login successful', data);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        const data = await signUp(email, password, fullName);
        console.log('Signup result:', data);
        if (data.session) {
          console.log('Signup successful, session created');
          // Logged in immediately
          if (onSuccess) onSuccess();
          onClose();
        } else {
          console.log('Signup successful, but session null (likely needs email confirmation)');
          // Probably needs email confirmation
          setError("Account created! PLEASE CHECK YOUR EMAIL for a confirmation link before logging in.");
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let message = err.message || 'Authentication failed';
      
      if (message.includes('Email not confirmed')) {
        message = "EMAIL NOT CONFIRMED. Please check your inbox for a verification link from Supabase.";
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md glass border border-white/10 rounded-[2.5rem] p-10 overflow-hidden"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">
                {isLogin ? 'Access' : 'Join'} <span className="text-blue-500">Terminal</span>
              </h2>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                {isLogin ? 'Enter your credentials' : 'Create your secure profile'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-bold uppercase text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="text"
                    placeholder="FULL NAME"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-[10px] font-black tracking-widest focus:outline-none focus:border-blue-500/50 transition-all uppercase"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="email"
                  placeholder="EMAIL ADDRESS"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-[10px] font-black tracking-widest focus:outline-none focus:border-blue-500/50 transition-all uppercase"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="password"
                  placeholder="PASSWORD"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-[10px] font-black tracking-widest focus:outline-none focus:border-blue-500/50 transition-all uppercase"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs tracking-[0.2em] uppercase shadow-neon-blue transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : (
                  <>
                    {isLogin ? 'AUTHORIZE' : 'INITIALIZE'}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">
                {isLogin ? "Don't have an account?" : "Already a member?"}
              </p>
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] hover:text-blue-400 transition-colors"
              >
                {isLogin ? 'CREATE PROFILE' : 'LOGIN TO TERMINAL'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
