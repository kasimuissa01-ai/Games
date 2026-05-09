import React from 'react';
import { motion } from 'motion/react';
import { Game, Platform } from '../types';
import { Monitor, Smartphone, Gamepad, Trophy } from 'lucide-react';

interface GameCardProps {
  game: Game;
  onClick: (game: Game) => void;
}

const platformIcons = {
  [Platform.PC]: <Monitor size={12} />,
  [Platform.Mobile]: <Smartphone size={12} />,
  [Platform.Xbox]: <Gamepad size={12} />,
  [Platform.PS]: <Trophy size={12} />,
};

export default function GameCard({ game, onClick }: GameCardProps) {
  return (
    <motion.div
      layout
      className="h-full"
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div 
        onClick={() => onClick(game)}
        className="group relative h-full flex flex-col cursor-pointer bg-[#0c0c14]/80 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-4 transition-all duration-500 hover:border-fuchsia-500/50 hover:bg-[#12121f]/90 hover:shadow-[0_0_40px_-10px_rgba(217,70,239,0.3)]"
      >
        {/* Image Container */}
        <div className="relative aspect-square md:aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-[#050505] mb-5 border border-white/5 group-hover:border-white/10 transition-colors shrink-0">
          <img 
            src={game.imageUrl} 
            alt={game.title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Badge */}
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-300">{platformIcons[game.platform]}</span>
              <span className="text-[9px] font-bold text-gray-200 tracking-wider">
                {game.platform}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-end px-2">
          <div className="flex justify-between items-center mb-5 shrink-0">
            <h3 className="font-semibold text-sm text-white truncate pr-2">
              {game.title}
            </h3>
            <div className="flex items-center gap-1.5 shrink-0">
               <span className="text-fuchsia-400 text-xs">♦</span>
               <span className="text-xs font-bold text-white">
                  {typeof game.price === 'number' ? (game.price === 0 ? 'FREE' : `${game.price.toLocaleString()}`) : 'N/A'}
               </span>
            </div>
          </div>
          
          <button 
            className="w-full py-3 rounded-full border border-fuchsia-500/30 text-fuchsia-400 text-xs font-bold tracking-wide transition-all duration-300 group-hover:bg-fuchsia-500/10 group-hover:border-fuchsia-500 group-hover:shadow-[0_0_20px_-5px_rgba(217,70,239,0.4)]"
          >
            View Game
          </button>
        </div>
      </div>
    </motion.div>
  );
}
