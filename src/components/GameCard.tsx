import React from 'react';
import { motion } from 'motion/react';
import { Game, Platform } from '../types';
import { Monitor, Smartphone, Gamepad, Trophy, Disc, Heart, Download } from 'lucide-react';

interface GameCardProps {
  game: Game;
  onClick: (game: Game) => void;
  likes?: number;
  downloads?: number;
  hasLiked?: boolean;
  onLike?: (e: React.MouseEvent) => void;
}

const platformIcons = {
  [Platform.PC]: <Monitor size={12} />,
  [Platform.Mobile]: <Smartphone size={12} />,
  [Platform.Xbox]: <Gamepad size={12} />,
  [Platform.PS]: <Trophy size={12} />,
  [Platform.PSP]: <Disc size={12} />,
};

export default function GameCard({ game, onClick, likes = 0, downloads = 0, hasLiked = false, onLike }: GameCardProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);

  return (
    <motion.div
      layout
      className="h-full"
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div 
        onClick={() => onClick(game)}
        className="group relative h-full flex flex-col cursor-pointer bg-gradient-to-b from-[#161625] to-[#0a0a14] border border-white/5 rounded-2xl p-2 sm:p-3 shadow-lg transition-all duration-500 hover:border-purple-500/30 hover:shadow-[0_0_25px_-5px_rgba(168,85,247,0.25)]"
      >
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1rem] bg-[#07070d] mb-2.5 sm:mb-3.5 border border-white/5 group-hover:border-white/10 transition-colors shrink-0">
          
          {/* High-tech custom shimmering skeleton loader while image is loading */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -translate-x-full animate-[shimmer_1.6s_infinite] pointer-events-none" />
              <div className="w-6 h-6 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
            </div>
          )}

          <img 
            src={game.imageUrl} 
            alt={game.title}
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
              isLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-95 blur-md"
            }`}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080f] via-transparent to-transparent opacity-65" />
          
          {/* Like Toggle Floating Badge */}
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onLike) onLike(e);
            }}
            className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-20 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-black/75 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/20 transition-all hover:border-rose-500/50 flex items-center gap-1 sm:gap-1.5 group/like"
          >
            <Heart 
              size={11} 
              className={`transition-colors duration-300 ${hasLiked ? 'text-rose-500 fill-rose-500 scale-110' : 'text-gray-400 group-hover/like:text-rose-400'}`} 
            />
            <span className="text-[8px] sm:text-[9px] font-black tracking-wide text-gray-200">
              {likes}
            </span>
          </button>
 
          {/* Downloads Floating Badge */}
          <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 z-20 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-black/75 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-1">
            <Download size={9} className="text-blue-400" />
            <span className="text-[7.5px] sm:text-[8px] font-black text-gray-200 tracking-wider">
              {downloads} DL
            </span>
          </div>
 
          {/* Platform Badge */}
          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-black/75 backdrop-blur-md rounded-full border border-white/10">
            <div className="flex items-center gap-1">
              <span className="text-gray-300 scale-90 sm:scale-100">{platformIcons[game.platform]}</span>
              <span className="text-[7.5px] sm:text-[8px] font-bold text-gray-200 tracking-wider">
                {game.platform}
              </span>
            </div>
          </div>
        </div>
 
        {/* Content */}
        <div className="flex-1 flex flex-col justify-between px-0.5">
          <div className="flex flex-col gap-1 mb-2.5">
            <h3 className="font-extrabold text-[11px] sm:text-xs md:text-sm text-gray-100 truncate tracking-wide">
              {game.title}
            </h3>
            <div className="flex items-center">
               {game.price === 0 ? (
                 <span className="text-[8px] sm:text-[9.5px] font-black text-emerald-400 tracking-widest uppercase">FREE TRIAL</span>
               ) : (
                 <span className="text-[10px] sm:text-xs font-black text-purple-400 font-mono tracking-wide">
                    Tsh {typeof game.price === 'number' ? game.price.toLocaleString() : 'N/A'}
                 </span>
               )}
            </div>
          </div>
          
          <button 
            type="button"
            className="w-full py-1.5 sm:py-2 rounded-xl border border-purple-500/30 text-purple-400 text-[8.5px] sm:text-[10px] font-black tracking-widest transition-all duration-300 group-hover:bg-purple-500/10 group-hover:border-purple-500 group-hover:text-purple-300 uppercase shadow-[0_0_15px_-5px_rgba(168,85,247,0.3)]"
          >
            {game.price === 0 ? 'GET FILE' : 'BUY ASSET'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

