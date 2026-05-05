import React from 'react';
import { motion } from 'motion/react';
import { Gamepad2, ShoppingCart, User, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { logout } from '../lib/supabase';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

interface NavbarProps {
  onAdminClick: () => void;
  onLoginClick: () => void;
  isAdmin: boolean;
}

export default function Navbar({ onAdminClick, onLoginClick, isAdmin }: NavbarProps) {
  const { user } = useSupabaseAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass h-20 px-10 flex items-center justify-between">
      <div className="flex items-center gap-12">
        <motion.div 
          className="flex items-center gap-2 cursor-pointer group"
          whileHover={{ scale: 1.02 }}
          onClick={() => window.location.href = '/'}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-neon-blue">
            <div className="w-4 h-4 bg-white rounded-sm rotate-45"></div>
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic text-white leading-none">
            Nexus<span className="text-blue-500">Core</span>
          </span>
        </motion.div>

        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#" className="text-white border-b-2 border-blue-500 pb-1">STORE</a>
          <a href="#" className="hover:text-white transition-colors">LIBRARY</a>
          <a href="#" className="hover:text-white transition-colors">COMMUNITY</a>
          <a href="#" className="hover:text-white transition-colors">SUPPORT</a>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAdminClick}
            className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
            title="Admin Dashboard"
          >
            <LayoutDashboard size={20} />
          </motion.button>
        )}

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">{user.user_metadata?.full_name || user.user_metadata?.name || 'User'}</span>
                <button 
                  onClick={logout}
                  className="text-[9px] text-blue-400 hover:text-blue-300 uppercase tracking-widest font-black"
                >
                  Disconnect
                </button>
              </div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 rounded-full border-2 border-blue-500 p-0.5"
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-800">
                  <img src={user.user_metadata?.avatar_url || user.user_metadata?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              </motion.div>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLoginClick}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-xs font-black tracking-widest transition-all shadow-neon-blue uppercase"
            >
              <LogIn size={14} />
              Login
            </motion.button>
          )}
        </div>
      </div>
    </nav>
  );
}
