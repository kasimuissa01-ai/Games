import React from 'react';
import { motion } from 'motion/react';
import { Game, Platform } from '../types';
import { Heart, Download, ShoppingBag } from 'lucide-react';

interface GameCardProps {
  key?: React.Key;
  game: Game;
  onClick: (game: Game) => void;
  likes?: number;
  downloads?: number;
  hasLiked?: boolean;
  onLike?: (e: React.MouseEvent) => void;
}

const getAgeRating = (title: string, category: string) => {
  const t = (title + ' ' + category).toLowerCase();
  if (
    t.includes('doom') || 
    t.includes('combat') || 
    t.includes('mortal') || 
    t.includes('resident') || 
    t.includes('grand') || 
    t.includes('gta') || 
    t.includes('kill') || 
    t.includes('dead') || 
    t.includes('blood') || 
    t.includes('horror') ||
    t.includes('control') ||
    t.includes('beyond')
  ) {
    return { age: '18', color: 'bg-red-600/95 text-white' };
  }
  if (t.includes('fifa') || t.includes('sport') || t.includes('drive') || t.includes('race') || t.includes('speed') || t.includes('drift')) {
    return { age: '3', color: 'bg-green-600/90 text-white' };
  }
  return { age: '16', color: 'bg-amber-600/90 text-white' };
};

export default function GameCard({ game, onClick, likes = 0, downloads = 0, hasLiked = false, onLike }: GameCardProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);

  // Platform Case cover tape banner
  const renderCoverTape = () => {
    switch (game.platform) {
      case Platform.PS:
        return (
          <div className="w-full h-8 sm:h-9 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 text-white font-outfit text-[8px] sm:text-[9px] font-black tracking-[0.2em] px-3 py-1 flex items-center justify-between border-b border-white/10 select-none shrink-0">
            <span className="flex items-center gap-1">
              <span className="font-sans font-black italic tracking-tighter text-[10px] sm:text-[11px]">P S</span>
              <span className="bg-white/20 px-1 py-0.2 rounded-[3px] text-[7px] font-bold">4</span>
            </span>
            <span className="text-[7px] sm:text-[7.5px] opacity-75 font-mono">PLAYSTATION 4</span>
          </div>
        );
      case Platform.Xbox:
        return (
          <div className="w-full h-8 sm:h-9 bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-800 text-white font-outfit text-[8px] sm:text-[9px] font-black tracking-[0.2em] px-3 py-1 flex items-center justify-between border-b border-white/10 select-none shrink-0">
            <span className="flex items-center gap-1">
              <span className="font-sans font-black italic tracking-tighter text-[10px] sm:text-[11px]">XBOX</span>
              <span className="bg-white/20 px-1 py-0.2 rounded-[3px] text-[7px] font-bold">ONE</span>
            </span>
            <span className="text-[7px] sm:text-[7.5px] opacity-75 font-mono">COMPATIBLE</span>
          </div>
        );
      case Platform.PC:
        return (
          <div className="w-full h-8 sm:h-9 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-900 text-slate-100 font-outfit text-[8px] sm:text-[9px] font-black tracking-[0.2em] px-3 py-1 flex items-center justify-between border-b border-white/10 select-none shrink-0">
            <span className="flex items-center gap-1">
              <span className="font-mono font-black italic tracking-tighter text-[10px] sm:text-[11px]">PC</span>
              <span className="bg-white/20 px-1 py-0.2 rounded-[3px] text-[7px] font-bold">DVD</span>
            </span>
            <span className="text-[7px] sm:text-[7.5px] opacity-75 font-mono">STEAM ENGINE</span>
          </div>
        );
      case Platform.PSP:
        return (
          <div className="w-full h-8 sm:h-9 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 text-slate-800 font-outfit text-[8px] sm:text-[9px] font-black tracking-[0.2em] px-3 py-1 flex items-center justify-between border-b border-slate-400/20 select-none shrink-0">
            <span className="flex items-center gap-1">
              <span className="font-sans font-black tracking-widest text-[10px] sm:text-[11px]">PSP</span>
            </span>
            <span className="text-[6.5px] sm:text-[7px] text-slate-600 font-bold uppercase tracking-widest font-mono">PlayStation®</span>
          </div>
        );
      default:
        return (
          <div className="w-full h-8 sm:h-9 bg-gradient-to-r from-purple-700 via-purple-600 to-purple-800 text-white font-outfit text-[8px] sm:text-[9px] font-black tracking-[0.2em] px-3 py-1 flex items-center justify-between border-b border-white/10 select-none shrink-0">
            <span className="font-sans font-black text-[9px] sm:text-[10px] tracking-wider uppercase">MOBILE</span>
            <span className="text-[7px] sm:text-[7.5px] opacity-75 font-mono">SMART ENGINE</span>
          </div>
        );
    }
  };

  const ageInfo = getAgeRating(game.title, game.category || '');

  // Cross pricing mock calculation
  const originalPrice = game.price === 0 ? 45000 : Math.ceil(game.price * 1.35 / 1000) * 1000;
  const discountPercent = game.price === 0 ? "100%" : `-${Math.round((1 - game.price / originalPrice) * 100)}%`;

  return (
    <motion.div
      layout
      className="h-full"
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
    >
      <div 
        onClick={() => onClick(game)}
        className="group relative h-full flex flex-col cursor-pointer bg-slate-950 border border-white/5 rounded-2xl overflow-hidden shadow-lg hover:border-cyan-500/30 hover:shadow-[0_0_25px_-5px_rgba(6,182,212,0.35)] transition-all duration-500 aspect-[4/5] min-h-[300px]"
      >
        {/* 1. Header Cover Tape based on Platform */}
        {renderCoverTape()}

        {/* 2. Custom shimmering skeleton loader while image is loading */}
        {!isLoaded && (
          <div className="absolute inset-x-0 bottom-0 top-8 bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -translate-x-full animate-[shimmer_1.6s_infinite] pointer-events-none" />
            <div className="w-6 h-6 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
          </div>
        )}

        {/* 3. Main Art Cover taking full remaining space */}
        <div className="relative w-full flex-1 overflow-hidden bg-slate-950">
          <img 
            src={game.imageUrl} 
            alt={game.title}
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
              isLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-95 blur-md"
            }`}
            referrerPolicy="no-referrer"
          />
          
          {/* Enhanced Dark elegant vignette on top of image for pristine contrast of overlay information */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/25 opacity-95 pointer-events-none" />

          {/* Floating Badges at the top edge */}
          <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between">
            {/* Like Toggle Badge */}
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onLike) onLike(e);
              }}
              className="px-2 py-0.5 bg-slate-950/80 backdrop-blur-md rounded-lg border border-white/10 hover:bg-white/20 transition-all hover:border-rose-500/50 flex items-center gap-1 group/like"
            >
              <Heart 
                size={11} 
                className={`transition-all duration-300 ${hasLiked ? 'text-rose-500 fill-rose-500 scale-110' : 'text-gray-400 group-hover/like:text-rose-400'}`} 
              />
              <span className="text-[8px] sm:text-[9px] font-black tracking-wide text-gray-200">
                {likes}
              </span>
            </button>

            {/* PEGI Age Rating Badge */}
            <div className={`w-6 h-6 flex items-center justify-center rounded-md border border-black/30 font-outfit text-[10px] font-black tracking-tighter ${ageInfo.color} select-none`}>
              {ageInfo.age}
            </div>
          </div>

          {/* Floating interactive metrics at the center-bottom */}
          <div className="absolute bottom-16 sm:bottom-18 left-2.5 z-20 flex items-center gap-2">
            {/* Downloads count overlay */}
            <div className="px-1.5 py-0.5 bg-slate-950/80 backdrop-blur-md rounded-md border border-white/10 flex items-center gap-1">
              <Download size={8} className="text-cyan-400" />
              <span className="text-[7.5px] sm:text-[8px] font-black text-slate-300 tracking-wider font-mono">
                {downloads} DL
              </span>
            </div>
          </div>

          {/* Elegant HUD-like overlay containing pricing and cleaner Download buttons at the card bottom */}
          <div className="absolute inset-x-0 bottom-0 z-10 p-2.5 sm:p-3 bg-gradient-to-t from-slate-950 to-slate-950/80 backdrop-blur-xs flex flex-col gap-2">
            
            {/* Pricing Row */}
            <div className="flex items-center gap-2 select-none">
              {game.price === 0 ? (
                <>
                  <span className="text-[9px] text-slate-500 line-through font-mono">
                    Tsh {originalPrice.toLocaleString()}
                  </span>
                  <span className="text-[10px] sm:text-xs font-black text-emerald-400 tracking-widest font-mono uppercase">
                    FREE
                  </span>
                  <span className="text-[7.5px] sm:text-[8px] px-1 py-0.2 rounded-md bg-emerald-950/50 text-emerald-400 border border-emerald-500/20 font-bold tracking-widest font-mono">
                    {discountPercent}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[9px] text-slate-500 line-through font-mono">
                    Tsh {originalPrice.toLocaleString()}
                  </span>
                  <span className="text-[10px] sm:text-xs font-black text-cyan-400 font-mono tracking-wide">
                    Tsh {game.price.toLocaleString()}
                  </span>
                  <span className="text-[7.5px] sm:text-[8px] px-1 py-0.2 rounded-md bg-cyan-950/50 text-cyan-400 border border-cyan-500/20 font-bold tracking-widest font-mono">
                    {discountPercent}
                  </span>
                </>
              )}
            </div>

            {/* Streamlined E-Commerce Action Button */}
            <button 
              type="button"
              className="w-full py-2 rounded-xl bg-slate-900 border border-white/5 text-slate-100 text-[8.5px] sm:text-[9.5px] font-bold tracking-widest transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-cyan-500 group-hover:via-blue-600 group-hover:to-indigo-600 group-hover:text-white group-hover:border-cyan-400/20 uppercase shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-center gap-1.5"
            >
              <ShoppingBag size={10} className="stroke-[2.5]" />
              Download
            </button>

          </div>

        </div>
      </div>
    </motion.div>
  );
}
