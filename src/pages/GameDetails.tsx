import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Game, Purchase } from '../types';
import { ChevronLeft, Download, ShieldCheck, Zap, Globe, Clock, Star, Share2, CreditCard, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { createPurchase } from '../services/gameService';

import AuthModal from '../components/AuthModal';

interface GameDetailsProps {
  game: Game;
  onBack: () => void;
}

const PAYMENT_PHONE = "0716 123 283"; // Updated payment number
const PAYMENT_NAME = "ARON ANDREW"; // Updated payment name

export default function GameDetails({ game, onBack }: GameDetailsProps) {
  const { user } = useSupabaseAuth();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState<'none' | 'pending' | 'confirmed'>('none');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Check for existing purchase status
  useEffect(() => {
    if (!user) {
      setPurchaseStatus('none');
      return;
    }

    const findPurchase = async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('game_id', game.id)
        .order('purchased_at', { ascending: false });

      if (data && data.length > 0) {
        const purchase = data[0];
        if (purchase.status === 'confirmed' || purchase.status === 'completed') {
          setPurchaseStatus('confirmed');
        } else if (purchase.status === 'pending') {
          setPurchaseStatus('pending');
        }
      } else {
        setPurchaseStatus('none');
      }
    };

    findPurchase();

    // Real-time listener for status changes
    const channel = supabase
      .channel(`purchase-updates-${user.id}-${game.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'purchases',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new.game_id === game.id) {
            if (payload.new.status === 'confirmed' || payload.new.status === 'completed') {
              setPurchaseStatus('confirmed');
            } else if (payload.new.status === 'pending') {
              setPurchaseStatus('pending');
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, game.id]);

  const handleBuyInitiate = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (game.price === 0) {
      // Free games claim directly
      await handleConfirmSale();
      return;
    }

    setShowPaymentModal(true);
  };

  const handleConfirmSale = async () => {
    if (!user) return;
    setIsPurchasing(true);
    
    try {
      await createPurchase({
        userId: user.id,
        userEmail: user.email || 'anonymous',
        gameId: game.id,
        gameTitle: game.title,
        amount: game.price,
        status: game.price === 0 ? 'confirmed' : 'pending'
      });
      
      if (game.price > 0) {
        setShowPaymentModal(false);
        setPurchaseStatus('pending');
      }
    } catch (error) {
      console.error("Purchase error", error);
      alert("Failed to initiate purchase.");
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-24 pb-20 px-6"
    >
      <div className="max-w-7xl mx-auto">
        <motion.button 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={onBack}
          className="flex items-center gap-4 text-white/50 hover:text-white transition-all mb-12 group glass px-6 py-3 rounded-2xl border-white/5 w-fit"
        >
          <ChevronLeft className="group-hover:-translate-x-2 transition-transform text-blue-500" size={24} />
          <span className="text-xs font-black tracking-[0.3em] uppercase">Back to Terminal</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2">
            {game.videoUrl ? (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative aspect-video rounded-3xl overflow-hidden mb-10 group bg-slate-950 border border-white/10"
              >
                {game.videoUrl.includes('youtube.com') || game.videoUrl.includes('youtu.be') ? (
                  <iframe 
                    className="w-full h-full"
                    src={game.videoUrl.includes('watch?v=') ? game.videoUrl.replace('watch?v=', 'embed/') : game.videoUrl}
                    title="Video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video 
                    controls 
                    className="w-full h-full object-cover"
                    src={game.videoUrl}
                  />
                )}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative aspect-video rounded-3xl overflow-hidden mb-10 group shadow-2xl"
              >
                <img src={game.imageUrl} className="w-full h-full object-cover" alt={game.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              </motion.div>
            )}

            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 uppercase italic tracking-tighter leading-none">
              {game.title}
            </h1>

            <div className="flex flex-wrap gap-6 mb-10">
               <MetaItem icon={<Globe size={16} />} label="Developer" value="Nexus Studios" />
               <MetaItem icon={<Clock size={16} />} label="Released" value="April 2026" />
               <MetaItem icon={<Star size={16} />} label="Rating" value="4.9/5.0" />
            </div>

            <div className="prose prose-invert max-w-none mb-12">
              <h3 className="text-sm font-black text-white mb-4 uppercase tracking-[0.2em] border-l-4 border-blue-500 pl-4">Mission Briefing</h3>
              <p className="text-slate-300 text-base leading-relaxed whitespace-pre-wrap font-medium uppercase tracking-wide">
                {game.description}
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-white/5">
               <SpecItem label="OS" value={game.platform === 'PC' ? 'Windows 10/11' : 'Android 14 / iOS 17'} />
               <SpecItem label="Storage" value="Secure Archive" />
               <SpecItem label="Memory" value={game.ram || '6GB RAM'} />
               <SpecItem label="Graphics" value="Neural Core / Vulkan" />
            </div>
          </div>

          {/* Checkout Area */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="glass rounded-3xl p-8 border-white/10"
              >
                <div className="flex items-center justify-between mb-8">
                   <span className="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase">Archive Status</span>
                   <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded uppercase tracking-widest">Nexus Verification</span>
                </div>

                <div className="mb-10">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Acquisition Cost</p>
                  <p className="text-5xl font-black text-white">
                    {typeof game.price === 'number' ? (game.price === 0 ? 'FREE' : `Tsh ${game.price.toLocaleString()}`) : 'PRICE_TBD'}
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  {purchaseStatus === 'confirmed' ? (
                    <motion.div 
                      key="confirmed"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
                        <ShieldCheck size={20} />
                        <span className="font-black text-[10px] uppercase tracking-widest leading-none mt-1">Payment Confirmed</span>
                      </div>
                      
                      <motion.button
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="w-full py-4 bg-white text-black rounded-xl font-black text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:translate-y-[-2px] transition-all shadow-xl uppercase shadow-green-900/10"
                        onClick={() => {
                          if (game.downloadUrl && game.downloadUrl.startsWith('http')) {
                            window.open(game.downloadUrl, '_blank');
                          } else {
                            alert("Download link is being prepared. It will be available here soon.");
                          }
                        }}
                      >
                        <Download size={18} />
                        Secure Download
                      </motion.button>
                    </motion.div>
                  ) : purchaseStatus === 'pending' ? (
                    <motion.div 
                      key="pending"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <div className="p-5 border border-yellow-500/20 bg-yellow-500/5 rounded-2xl">
                        <div className="flex items-center gap-3 text-yellow-500 mb-3">
                           <Clock className="animate-pulse" size={20} />
                           <span className="text-[10px] font-black uppercase tracking-[0.2em]">Pending Confirmation</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed tracking-wide">
                          Subiri admin athibitishe malipo yako. Utapata download link hapa hapa muda mfupi.
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="buy-btn"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isPurchasing}
                      onClick={handleBuyInitiate}
                      className={`w-full py-4 rounded-xl font-black text-xs tracking-[0.2em] flex items-center justify-center gap-3 transition-all uppercase ${
                        game.price === 0 
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-neon-blue' 
                          : 'bg-white text-black hover:bg-slate-100'
                      }`}
                    >
                      {isPurchasing ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent animate-spin rounded-full" />
                      ) : (
                        <>
                          <Zap size={18} className={game.price === 0 ? 'text-white' : 'text-blue-600'} />
                          {game.price === 0 ? 'CLAIM ACCESS' : 'NUNUA SASA'}
                        </>
                      )}
                    </motion.button>
                  )}
                </AnimatePresence>

                <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between text-slate-500">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                    <Share2 size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Share Terminal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-neon-blue" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Live Node</span>
                  </div>
                </div>
              </motion.div>
              
              <div className="mt-6 flex flex-col gap-4">
                 <div className="p-4 glass rounded-2xl border-slate-800 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 font-bold">
                       XP
                    </div>
                    <div>
                       <p className="text-xs font-black text-white uppercase tracking-widest">+450 Points</p>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Nexus Reward Points</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Instruction Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowPaymentModal(false)}
               className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="relative w-full max-w-md glass border border-white/10 rounded-[2.5rem] p-10 overflow-hidden"
            >
               <div className="absolute top-0 right-0 p-4">
                  <button onClick={() => setShowPaymentModal(false)} className="text-slate-500 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
               </div>

               <div className="text-center mb-10">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-500">
                    <CreditCard size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">Maelekezo ya <span className="text-blue-500">Malipo</span></h2>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Secure Node Transaction</p>
               </div>

               <div className="space-y-6">
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5 text-center">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">Lipia kwenda namba hii:</p>
                    <p className="text-3xl font-black text-white tracking-widest">{PAYMENT_PHONE}</p>
                    <p className="text-slate-400 text-[10px] font-bold mt-2 uppercase">JINA: {PAYMENT_NAME}</p>
                    <p className="text-slate-500 text-[8px] mt-1 uppercase tracking-widest">M-PESA / TIGO PESA / HALOPESA</p>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                    <Info className="text-blue-500 shrink-0" size={20} />
                    <p className="text-[10px] text-slate-300 font-bold uppercase leading-relaxed tracking-wide">
                      Baada ya kumaliza malipo, bonyeza kitufe hapo chini. Admin atapokea taarifa yako na kumpa ruhusa mara moja.
                    </p>
                  </div>

                  <button 
                    onClick={handleConfirmSale}
                    disabled={isPurchasing}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs tracking-[0.2em] uppercase shadow-neon-blue transition-all disabled:opacity-50"
                  >
                    {isPurchasing ? "Processing Node..." : "NIMESHALIPIA"}
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          // Trigger buy again or just let user click again
          setShowAuthModal(false);
        }}
      />
    </motion.div>
  );
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-sky-500">{icon}</div>
      <div>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-white uppercase">{value}</p>
      </div>
    </div>
  );
}

function SpecItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="p-4 glass border-white/5 rounded-2xl">
      <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-[10px] font-black text-white uppercase tracking-wider">{value}</p>
    </div>
  );
}

function X({ size }: { size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
