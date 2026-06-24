import React from 'react';
import { motion } from 'motion/react';
import { User, LogIn, LayoutDashboard, LogOut } from 'lucide-react';
import { logout } from '../lib/firebase';

interface NavbarProps {
  onAdminClick: () => void;
  onLoginClick: () => void;
  isAdmin: boolean;
  user: any;
}

export default function Navbar({ onAdminClick, onLoginClick, isAdmin, user }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-24 px-6 md:px-12 flex items-center justify-between bg-transparent pointer-events-none border-b-0 shadow-none">
      {/* Top Left: Clean Empty Space */}
      <div className="pointer-events-none" />

      {/* Top Right: Floating Admin icon and Profile/Login Icon Side-by-Side (No Card/Background) */}
      <div className="pointer-events-auto flex items-center gap-4">
        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={onAdminClick}
            className="w-10 h-10 flex items-center justify-center text-slate-100 hover:text-cyan-400 transition-colors bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl backdrop-blur-md"
            title="Admin Dashboard"
          >
            <LayoutDashboard size={18} className="stroke-[2.5]" />
          </motion.button>
        )}

        {user ? (
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-[10px] font-black tracking-widest text-slate-950 uppercase bg-white px-2.5 py-1 rounded-md select-none">
              {user.displayName || 'GAMES HOME'}
            </span>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => logout()}
              className="w-9 h-9 rounded-full cursor-pointer overflow-hidden transition-all shadow-md hover:shadow-cyan-500/20 border border-white/10 hover:border-cyan-500/40"
              title="Click to Disconnect System"
            >
              <img 
                src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                alt="Avatar" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        ) : (
          <motion.div
            whileHover={{ scale: 1.1, y: -1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onLoginClick}
            className="flex items-center justify-center w-10 h-10 cursor-pointer text-slate-100 hover:text-cyan-400 transition-all bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl backdrop-blur-md"
            title="Sajili / Ingia"
          >
            <User size={20} className="stroke-[2.5]" />
          </motion.div>
        )}
      </div>
    </nav>
  );
}
