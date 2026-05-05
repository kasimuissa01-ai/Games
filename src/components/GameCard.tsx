import React from 'react';
import { motion } from 'motion/react';
import { Game, Platform } from '../types';
import { Eye, Monitor, Smartphone, Gamepad, Trophy } from 'lucide-react';

interface GameCardProps {
  game: Game;
  onClick: (game: Game) => void;
}

const platformIcons = {
  [Platform.PC]: <Monitor size={14} />,
  [Platform.Mobile]: <Smartphone size={14} />,
  [Platform.Xbox]: <Gamepad size={14} />,
  [Platform.PS]: <Trophy size={14} />,
};

export default function GameCard({ game, onClick }: GameCardProps) {
  return (
    <motion.div
      layout
      className="h-full"
      animate={{ 
        y: [0, -6, 0],
      }}
      transition={{ 
        duration: 4, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
    >
      <motion.div 
        onClick={() => onClick(game)}
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.02 }}
        className="group relative h-full flex flex-col cursor-pointer bg-white/5 border border-white/5 rounded-[3rem] overflow-hidden transition-all duration-700 hover:border-blue-500/50 hover:bg-white/10 hover:shadow-neon-blue"
      >
        {/* Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <motion.img 
            src={game.imageUrl} 
            alt={game.title}
            className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent group-hover:via-black/20 transition-all duration-700" />

          {/* Badge */}
          <div className="absolute top-6 right-6 px-4 py-2 bg-black/40 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl">
             <div className="flex items-center gap-3">
                <span className="text-blue-500 scale-110">{platformIcons[game.platform]}</span>
                <span className="text-[10px] font-black text-white tracking-[0.3em] uppercase">
                   {game.platform}
                </span>
             </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100 pointer-events-none">
             <motion.div 
               whileHover={{ scale: 1.1 }}
               className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-2xl"
             >
                <Eye size={28} />
             </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-black text-2xl text-white uppercase italic tracking-tighter leading-none group-hover:text-blue-400 transition-colors">
              {game.title}
            </h3>
          </div>
          
          <p className="text-slate-400 text-[10px] mb-8 leading-relaxed line-clamp-2 uppercase tracking-[0.3em] font-black opacity-60 group-hover:opacity-100 transition-opacity">
            {game.shortDescription || game.description}
          </p>
          
          <div className="mt-auto flex items-center justify-between">
             <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.5em] leading-none mb-2">AUTH_STATUS</span>
                <span className="text-2xl font-black text-white tracking-tighter italic">
                   {typeof game.price === 'number' ? (game.price === 0 ? 'FREE' : `Tsh ${game.price.toLocaleString()}`) : 'N/A'}
                </span>
             </div>
             
             <motion.button 
               whileHover={{ x: 5 }}
               className="bg-blue-600 px-8 py-3 rounded-2xl text-[10px] font-black tracking-widest text-white shadow-neon-blue group-hover:bg-white group-hover:text-black transition-all duration-300 uppercase"
             >
               Nunua Sasa
             </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
