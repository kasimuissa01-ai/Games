import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import GameDetails from './pages/GameDetails';
import AdminDashboard from './pages/AdminDashboard';
import Chat from './pages/Chat';
import BottomNav from './components/BottomNav';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import { Game } from './types';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import { supabase, checkSupabaseConfig } from './lib/supabase';
import { logout } from './lib/firebase';
import { Github, Twitter, Instagram, Youtube, Mail, AlertTriangle, Settings } from 'lucide-react';
import { trackPlatformOpen } from './services/analyticsService';
import { initGoogleAnalytics, trackGAPageView } from './services/googleAnalytics';

import AuthModal from './components/AuthModal';

export default function App() {
  const { user, loading: loadingAuth, isAdmin } = useFirebaseAuth();
  const [currentPage, setCurrentPage] = useState<'home' | 'details' | 'admin' | 'profile' | 'chat'>('home');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const isConfigured = checkSupabaseConfig();

  useEffect(() => {
    initGoogleAnalytics();
    trackPlatformOpen();
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (currentPage === 'details' && selectedGame) {
      trackGAPageView('details', `Game Details: ${selectedGame.title}`);
    } else {
      trackGAPageView(currentPage);
    }
  }, [currentPage, selectedGame]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const currentHash = window.location.hash.replace('#', '');
      if (currentHash.startsWith('join-')) {
        const kijiweId = currentHash.replace('join-', '');
        setCurrentPage('chat');
        window.history.replaceState({ tab: 'chat', game: null }, '', `#chat?kijiweId=${kijiweId}`);
        return;
      }

      if (event.state && event.state.tab) {
        setCurrentPage(event.state.tab);
        if (event.state.game !== undefined) {
          setSelectedGame(event.state.game);
        }
      } else {
        const hashWithQuery = window.location.hash.replace('#', '');
        const hash = hashWithQuery.split('?')[0];
        if (['home', 'admin', 'profile', 'chat'].includes(hash)) {
          setCurrentPage(hash as any);
        } else {
          setCurrentPage('home');
        }
        setSelectedGame(null);
      }
    };

    window.addEventListener('popstate', handlePopState);

    const initialHash = window.location.hash.replace('#', '');
    if (initialHash.startsWith('join-')) {
      const kijiweId = initialHash.replace('join-', '');
      setCurrentPage('chat');
      window.history.replaceState({ tab: 'chat', game: null }, '', `#chat?kijiweId=${kijiweId}`);
    } else if (!window.history.state) {
      const hashWithQuery = window.location.hash.replace('#', '');
      const hash = hashWithQuery.split('?')[0];
      const initialTab = ['home', 'admin', 'profile', 'chat'].includes(hash) ? hash : 'home';
      setCurrentPage(initialTab as any);
      window.history.replaceState({ tab: initialTab, game: null }, '', window.location.hash || '#' + initialTab);
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

  const navigateToTab = (tab: 'home' | 'admin' | 'profile' | 'details' | 'chat', gameParams?: Game | null) => {
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

  return (
    <div className="relative min-h-screen bg-[#020617] selection:bg-blue-500/30 overflow-x-hidden">
      {/* Premium Cinematic Splash Screen Overlay */}
      <AnimatePresence>
        {(showSplash || loadingAuth) && (
          <motion.div 
            key="pwa-splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center z-[9999]"
          >
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full" />
              <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-rose-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 flex flex-col items-center px-6 text-center">
              {/* Outer Glow Ring spinner */}
              <div className="relative w-28 h-28 mb-8">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2.8, ease: "linear" }}
                  className="absolute inset-[-10px] rounded-full border-2 border-transparent border-t-blue-500 border-b-rose-500 opacity-80"
                />
                
                {/* User's specified custom logo rendering beautifully */}
                <motion.img 
                  initial={{ scale: 0.95 }}
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
                  src="https://i.postimg.cc/mgH2J9Ly/1ced088596254ce6778c7ffe66534f37.jpg"
                  alt="Gamers Hub Logo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full border-[3px] border-slate-900 shadow-[0_0_40px_rgba(59,130,246,0.35)]"
                />
              </div>

              {/* Title & Slogan matching PWA settings */}
              <motion.h1 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="font-anton text-3xl sm:text-4xl tracking-[0.35em] text-white uppercase mb-2 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
              >
                Gamers Hub
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="text-slate-500 text-xs uppercase tracking-[0.25em] font-black mb-8"
              >
                Premium Game Hub
              </motion.p>

              {/* Smooth endless progress corridor */}
              <div className="w-36 h-[3px] bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                <motion.div 
                  initial={{ left: "-100%" }}
                  animate={{ left: "100%" }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                  className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-blue-500 via-purple-500 to-rose-500 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Floating Demo Mode Badge */}
      {!isConfigured && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[9px] font-black tracking-widest uppercase px-3.5 py-1.5 rounded-full select-none backdrop-blur-md shadow-lg">
          <AlertTriangle size={10} className="animate-pulse" /> Local Mode
        </div>
      )}

      {/* Background Atmosphere */}
      <div className="bg-atmosphere">
        <div className="blur-blue"></div>
        <div className="blur-red"></div>
      </div>

      <Navbar 
        onAdminClick={() => navigateToTab('admin')} 
        onLoginClick={() => setShowAuthModal(true)}
        isAdmin={isAdmin} 
        user={user}
      />

      <main className={`relative z-10 ${currentPage === "chat" ? "" : "pb-32"}`}>
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

          {currentPage === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              <Chat user={user} />
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

      {currentPage !== 'chat' && <FloatingWhatsApp />}

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
