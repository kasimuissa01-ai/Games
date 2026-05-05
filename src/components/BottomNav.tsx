import React from 'react';
import { motion } from 'motion/react';
import { Home, User, ShoppingBag, LayoutDashboard } from 'lucide-react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

interface BottomNavProps {
  activeTab: 'home' | 'details' | 'admin' | 'profile';
  onNavigate: (tab: 'home' | 'admin' | 'profile') => void;
  isAdmin: boolean;
}

export default function BottomNav({ activeTab, onNavigate, isAdmin }: BottomNavProps) {
  const { user } = useSupabaseAuth();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-md">
      <div className="glass h-20 rounded-[2.5rem] border-white/10 shadow-2xl flex items-center justify-around px-4">
        
        <NavButton 
          active={activeTab === 'home' || activeTab === 'details'} 
          onClick={() => onNavigate('home')}
          icon={<Home size={22} />}
          label="Home"
        />

        <NavButton 
          active={false} 
          onClick={() => {}} // Could be search or library
          icon={<ShoppingBag size={22} />}
          label="Store"
          className="opacity-40"
        />

        {isAdmin && (
          <NavButton 
            active={activeTab === 'admin'} 
            onClick={() => onNavigate('admin')}
            icon={<LayoutDashboard size={22} />}
            label="Admin"
          />
        )}

        <NavButton 
          active={activeTab === 'profile'} 
          onClick={() => {
            onNavigate('profile'); 
          }}
          icon={user ? (
            <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20">
              <img src={user.user_metadata?.avatar_url || user.user_metadata?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          ) : <User size={22} />}
          label={user ? "Me" : "Login"}
        />
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label, className = "" }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, className?: string }) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-blue-500' : 'text-slate-500'} ${className}`}
    >
      <div className={`p-2 transition-all ${active ? 'bg-blue-500/10 rounded-2xl shadow-neon-blue' : ''}`}>
        {icon}
      </div>
      <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
    </motion.button>
  );
}
