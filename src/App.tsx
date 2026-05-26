import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import GameDetails from './pages/GameDetails';
import AdminDashboard from './pages/AdminDashboard';
import BottomNav from './components/BottomNav';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import { Game } from './types';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import { supabase, checkSupabaseConfig } from './lib/supabase';
import { logout } from './lib/firebase';
import { Github, Twitter, Instagram, Youtube, Mail, AlertTriangle, Settings } from 'lucide-react';
import { trackPlatformOpen } from './services/analyticsService';

import AuthModal from './components/AuthModal';

export default function App() {
  const { user, loading: loadingAuth, isAdmin } = useFirebaseAuth();
  const [currentPage, setCurrentPage] = useState<'home' | 'details' | 'admin' | 'profile'>('home');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const isConfigured = checkSupabaseConfig();

  useEffect(() => {
    trackPlatformOpen();
  }, []);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.tab) {
        setCurrentPage(event.state.tab);
        if (event.state.game !== undefined) {
          setSelectedGame(event.state.game);
        }
      } else {
        const hash = window.location.hash.replace('#', '');
        if (['home', 'admin', 'profile'].includes(hash)) {
          setCurrentPage(hash as any);
        } else {
          setCurrentPage('home');
        }
        setSelectedGame(null);
      }
    };

    window.addEventListener('popstate', handlePopState);

    if (!window.history.state) {
      const hash = window.location.hash.replace('#', '');
      const initialTab = ['home', 'admin', 'profile'].includes(hash) ? hash : 'home';
      setCurrentPage(initialTab as any);
      window.history.replaceState({ tab: initialTab, game: null }, '', '#' + initialTab);
    } else if (window.history.state.tab) {
      setCurrentPage(window.history.state.tab);
      if (window.history.state.game) {
        setSelectedGame(window.history.state.game);
      }
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!loadingAuth) {
      if (currentPage === 'admin' && (!user || !isAdmin)) {
        setCurrentPage('home');
        window.history.replaceState({ tab: 'home', game: null }, '', '#home');
      }
      if (currentPage === 'profile' && !user) {
        setCurrentPage('home');
        window.history.replaceState({ tab: 'home', game: null }, '', '#home');
      }
    }
  }, [loadingAuth, user, isAdmin, currentPage]);

  const navigateToTab = (tab: 'home' | 'admin' | 'profile' | 'details', gameParams?: Game | null) => {
    if (tab === 'admin') {
      if (!user) {
        setShowAuthModal(true);
        return;
      }
      if (!isAdmin) return;
    }
    if (tab === 'profile' && !user) {
      setShowAuthModal(true);
      return;
    }
    
    setCurrentPage(tab as any);
    let stateGame = selectedGame;
    
    if (gameParams !== undefined) {
      setSelectedGame(gameParams);
      stateGame = gameParams;
    } else if (tab === 'home') {
      setSelectedGame(null);
      stateGame = null;
    }
    
    window.scrollTo(0, 0);

    if (!window.history.state || window.history.state.tab !== tab || (tab === 'details' && window.history.state.game?.id !== stateGame?.id)) {
      window.history.pushState({ tab, game: stateGame }, '', '#' + tab);
    }
  };

  if (loadingAuth && currentPage === 'home') {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-center">
        <div className="glass max-w-md p-10 rounded-[3rem] border-white/10">
          <div className="w-20 h-20 bg-yellow-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-yellow-500">
            <AlertTriangle size={40} />
          </div>
          <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">
            Connection <span className="text-yellow-500">Offline</span>
          </h1>
          <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-10 leading-relaxed">
            Please configure your <span className="text-blue-500">Supabase</span> credentials in the environment variables to initialize the system.
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-left">
              <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase tracking-widest">Required Keys:</p>
              <code className="text-[10px] text-blue-400 block break-all font-mono">VITE_SUPABASE_URL</code>
              <code className="text-[10px] text-blue-400 block break-all font-mono">VITE_SUPABASE_ANON_KEY</code>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#020617] selection:bg-blue-500/30 overflow-x-hidden">
      {/* Background Atmosphere */}
      <div className="bg-atmosphere">
        <div className="blur-blue"></div>
        <div className="blur-red"></div>
      </div>

      {/* Minimal Logo */}
      <div className="fixed top-8 left-10 z-[60]">
        <motion.div 
          className="flex items-center gap-2 cursor-pointer group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigateToTab('home')}
        >
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-neon-blue">
            <div className="w-4 h-4 bg-white rounded-sm rotate-45"></div>
          </div>
          <span className="text-xl md:text-2xl font-black tracking-tighter uppercase italic text-white leading-none hidden sm:block">
            Nexus<span className="text-blue-500">Core</span>
          </span>
        </motion.div>
      </div>

      <Navbar 
        onAdminClick={() => navigateToTab('admin')} 
        onLoginClick={() => setShowAuthModal(true)}
        isAdmin={isAdmin} 
        user={user}
      />

      <main className="relative z-10 pb-32">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Home 
                onGameSelect={(game) => {
                  navigateToTab('details', game);
                }} 
                user={user}
                onAuthRequired={() => setShowAuthModal(true)}
              />
            </motion.div>
          )}

          {currentPage === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="pt-32 px-10 max-w-2xl mx-auto"
            >
              <div className="glass p-12 rounded-[3.5rem] border-white/5 text-center">
                 <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500 mx-auto mb-6 p-1">
                    <img src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                 </div>
                 <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">{user?.displayName || 'Ghost User'}</h2>
                 <p className="text-slate-500 text-[10px] font-black tracking-[0.3em] uppercase mb-8">{user?.email}</p>
                 
                 <div className="grid grid-cols-1 gap-4">
                    {isAdmin && (
                      <button 
                        onClick={() => navigateToTab('admin')}
                        className="py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs tracking-widest transition-all uppercase shadow-neon-blue"
                      >
                        Enter Admin Node
                      </button>
                    )}
                    <button 
                      onClick={() => logout()}
                      className="py-4 bg-white/5 hover:bg-white/10 text-slate-400 font-black rounded-2xl text-xs tracking-widest transition-all uppercase"
                    >
                      Disconnect System
                    </button>
                 </div>
              </div>
            </motion.div>
          )}

          {currentPage === 'details' && selectedGame && (
            <motion.div
              key="details"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              <GameDetails game={selectedGame} user={user} onBack={() => navigateToTab('home')} />
            </motion.div>
          )}

          {currentPage === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <AdminDashboard onBack={() => navigateToTab('home')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav 
        activeTab={currentPage} 
        onNavigate={navigateToTab} 
        isAdmin={isAdmin} 
        user={user}
      />

      <FloatingWhatsApp />

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
    </div>
  );
}

function SocialIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <a href="#" className="w-10 h-10 rounded-xl glass border-slate-800 flex items-center justify-center text-slate-400 hover:text-sky-400 hover:border-sky-500/30 transition-all">
      {icon}
    </a>
  );
}

function FooterSection({ title, links }: { title: string, links: string[] }) {
  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase">{title}</h4>
      <div className="flex flex-col gap-2">
        {links.map(l => (
          <a key={l} href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">{l}</a>
        ))}
      </div>
    </div>
  );
}
