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
        className="group relative h-full flex flex-col cursor-pointer bg-gradient-to-b from-[#1c1c2a] to-[#0f0f1b] border border-white/5 rounded-[1.5rem] p-3 shadow-lg transition-all duration-500 hover:border-purple-500/40 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]"
      >
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-[#050505] mb-4 border border-white/5 group-hover:border-white/10 transition-colors shrink-0">
          <img 
            src={game.imageUrl} 
            alt={game.title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c14] via-transparent to-transparent opacity-50" />
          
          {/* Badge */}
          <div className="absolute top-2 right-2 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
            <div className="flex items-center gap-1">
              <span className="text-gray-300">{platformIcons[game.platform]}</span>
              <span className="text-[8px] font-bold text-gray-200 tracking-wider">
                {game.platform}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-end px-1">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h3 className="font-medium text-xs sm:text-sm text-gray-100 truncate pr-2">
              {game.title}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
               <span className="text-purple-500 text-[10px]">ETH</span>
               <span className="text-xs font-bold text-white">
                  {typeof game.price === 'number' ? (game.price === 0 ? '0' : `${(game.price / 10000).toLocaleString()}`) : 'N/A'}
               </span>
            </div>
          </div>
          
          <button 
            className="w-full py-2.5 rounded-full border border-purple-500/50 text-purple-400 text-[10px] sm:text-xs font-bold tracking-wide transition-all duration-300 group-hover:bg-purple-500/10 group-hover:border-purple-500 shadow-[0_0_15px_-5px_rgba(168,85,247,0.3)]"
          >
            Buy Now
          </button>
        </div>
      </div>
    </motion.div>
  );
}
