import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Smartphone, Share, PlusSquare, X, Sparkles, Monitor, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallAppPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [hasInstalled, setHasInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (installed as PWA)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                               (window.navigator as any).standalone || 
                               document.referrer.includes('android-app://');
    
    setIsStandalone(isInStandaloneMode);

    // Detect if device is iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for default PWA installation event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Auto-show prompt helper to new users if they haven't dismissed it recently
      const isDismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!isDismissed && !isInStandaloneMode) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If iOS and not running standalone, show custom helper prompt after 4 seconds
    const iosTimeout = setTimeout(() => {
      const isDismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (isIosDevice && !isInStandaloneMode && !isDismissed) {
        setIsVisible(true);
      }
    }, 4000);

    // On Android/Windows, also show it even if beforeinstallprompt is missing just to let them know
    const generalTimeout = setTimeout(() => {
      const isDismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!isDismissed && !isInStandaloneMode && !deferredPrompt && !isIosDevice) {
        // Only show if prompt didn't fire yet, can serve as a fallback
        setIsVisible(true);
      }
    }, 6000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(iosTimeout);
      clearTimeout(generalTimeout);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Direct native browser prompt
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setHasInstalled(true);
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      // Toggle custom steps visualizer card for iOS Safari users
      setShowIosGuide(true);
    } else {
      // Chrome/Edge/Samsung manual guide fallback
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Remember dismissal for 3 days to respect user UI preferences
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // If already running inside actual installed app context, do not clutter UI
  if (isStandalone || hasInstalled) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          className="fixed bottom-[90px] left-4 right-4 z-[45] md:left-auto md:right-8 md:w-[380px] select-none"
        >
          {/* Main animated glass prompt container */}
          <div className="relative overflow-hidden rounded-[1.75rem] bg-slate-950/90 border border-white/10 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            
            {/* Shimmer scanning ambient light */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/[0.04] to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
            
            {/* Top row with Micro Badge and Close actions */}
            <div className="flex justify-between items-start mb-3.5">
              <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-500/15 via-purple-500/15 to-rose-500/15 border border-purple-500/30 px-3 py-1 rounded-full text-[9px] font-black tracking-[0.2em] text-blue-300 uppercase">
                <Sparkles size={10} className="animate-pulse text-purple-400" />
                PREMIUM PWA
              </span>
              <button 
                onClick={handleDismiss}
                className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>

            {/* Middle Prompt Content */}
            {!showIosGuide ? (
              <div className="space-y-4">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-lg bg-slate-900 flex items-center justify-center p-0.5">
                    <img 
                      src="https://i.postimg.cc/mgH2J9Ly/1ced088596254ce6778c7ffe66534f37.jpg" 
                      alt="GAMES HOME Logo" 
                      className="w-full h-full object-cover rounded-[0.85rem]"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">GAMES HOME App</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-relaxed">
                      Weka Programu sasa kwa Android, iOS na PC kwa uzoefu wa haraka na uokoaji wa bando la data!
                    </p>
                  </div>
                </div>

                {/* Primary dynamic CTA Action */}
                <button
                  onClick={handleInstallClick}
                  className="w-full group flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-black text-[10px] tracking-[0.2em] py-3.5 rounded-xl transition-all duration-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.35)] cursor-pointer uppercase"
                >
                  <Download size={12} className="group-hover:bounce transition-all text-blue-300" />
                  Install App (Pakua Sasa)
                </button>
              </div>
            ) : (
              // Enhanced Custom Guide panel for iOS / Other browsers without native auto installer support
              <div className="space-y-4">
                <h5 className="text-[11px] font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5 border-b border-white/5 pb-1.5">
                  <Smartphone size={12} /> Guide to install on {isIOS ? 'iOS Device' : 'Your Device'}
                </h5>
                
                <div className="space-y-2.5">
                  {isIOS ? (
                    <>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">1</span>
                        <p className="text-[9.5px] font-bold text-slate-300 leading-normal">
                          Bofya kitufe cha <strong className="text-white flex items-center gap-1 inline-flex bg-white/5 px-1 py-0.5 rounded border border-white/10"><Share size={10} className="text-blue-400" /> "Share" (Shiriki)</strong> kilichopo chini kwenye Safari browser yako.
                        </p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">2</span>
                        <p className="text-[9.5px] font-bold text-slate-300 leading-normal">
                          Shuka chini kisha uchague <strong className="text-white flex items-center gap-1 inline-flex bg-white/5 px-1 py-0.5 rounded border border-white/10"><PlusSquare size={10} className="text-purple-400" /> "Add to Home Screen"</strong>.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">1</span>
                        <p className="text-[9.5px] font-bold text-slate-300 leading-normal">
                          Bofya alama ya nukta tatu <strong className="text-white px-1 font-black">⋮</strong> kwenye sehemu ya juu kulia mwa kivinjari chako (Chrome/Edge).
                        </p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">2</span>
                        <p className="text-[9.5px] font-bold text-slate-300 leading-normal">
                          Chagua kitufe cha <strong className="text-white flex items-center gap-1 inline-flex bg-white/5 px-1.5 py-0.5 rounded border border-white/10"><Monitor size={10} className="text-purple-400" /> "Install app" ( au Toa kwenye Skrini)</strong>.
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-2.5 pt-1.5">
                  <button 
                    onClick={() => setShowIosGuide(false)}
                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-[9px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Back (Nyuma)
                  </button>
                  <button 
                    onClick={handleDismiss}
                    className="flex-1 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 rounded-xl border border-blue-500/25 text-[9px] font-black text-blue-400 hover:text-white uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 size={10} /> Finished (Imekamilika)
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
