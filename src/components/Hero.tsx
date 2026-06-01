import React from 'react';
import { motion } from 'motion/react';

export default function Hero() {
  return (
    <div className="w-full relative px-0 pt-0 pb-10 select-none overflow-hidden">
      {/* Immersive ambient outer background glows leaking from the cinematic image */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[350px] bg-blue-500/20 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse duration-[8s]" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[550px] h-[350px] bg-purple-500/20 rounded-full blur-[160px] pointer-events-none -z-10 animate-pulse duration-[12s]" />

      {/* Full-width container spanning edge-to-edge horizontally */}
      <motion.div
        initial={{ opacity: 0, scale: 0.99, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full overflow-hidden border-b border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] aspect-[21/9] sm:aspect-[24/8] md:aspect-[24/7] min-h-[300px] sm:min-h-[420px] md:min-h-[500px] lg:min-h-[580px]"
      >
        {/* Cinematic highly-inspiring professional gaming/esports tournament arena and community setup */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=2500&q=95"
            alt="Gamers Genge Premium Esports Arena & Community Hub"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-100 scale-100 transition-transform duration-[12s] ease-out hover:scale-105"
          />
          
          {/* Edge fades and elegant dark vignette to naturally blend the image into our website theme */}
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-slate-950/80 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-950/50 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-950/50 via-transparent to-transparent pointer-events-none" />

          {/* Epic ambient blue/cyan lens glow overlay mimicking esports light leakage */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.1),transparent_50%)] mix-blend-screen pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.1),transparent_50%)] mix-blend-screen pointer-events-none" />
        </div>

        {/* Decorative cybernetic scanning lines/grid glow at the very top and bottom borders */}
        <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      </motion.div>
    </div>
  );
}

