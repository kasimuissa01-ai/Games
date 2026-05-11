import React from 'react';
import { motion } from 'motion/react';

export default function Hero() {
  const title = "DOWNLOAD GAMES";
  const subTitle = "ZENYE UBORA ZAIDI";
  const description = [
    "GAMES ZOTE ZA PS2 KWENYE SIMU YAKO.",
    "EXPERIENCE HIGH-QUALITY GAMING WITH",
    "SEAMLESS PERFORMANCE AND STUNNING",
    "VISUALS ON YOUR MOBILE DEVICE."
  ];

  return (
    <section className="relative w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] h-[75vh] md:h-[85vh] overflow-hidden bg-black font-outfit">
      <motion.div 
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative w-full h-full"
      >
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-10000"
          style={{ 
            backgroundImage: 'url("https://i.postimg.cc/pXmhtVrs/6267e906163112870821d978e30a8437.jpg")',
          }}
        >
          {/* Precise overlays to mimic the reference image depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/60 via-transparent to-transparent z-10" />
        </div>

        {/* Hero Content Overlay - Tightly organized left-bottom alignment */}
        <div className="absolute inset-0 z-30 flex flex-col justify-center px-8 md:px-24">
          <div className="max-w-xl">
            {/* Headline Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase">
                {title}<br />
                <span className="text-white opacity-90">{subTitle}</span>
              </h1>
            </motion.div>

            {/* Description Section - Small, organized, high-density */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="mt-8 space-y-1"
            >
              {description.map((line, idx) => (
                <p key={idx} className="text-[9px] md:text-[11px] font-bold text-white/70 tracking-[0.15em] uppercase leading-tight">
                  {line}
                </p>
              ))}
            </motion.div>

            {/* Removed Platform Buttons per user request */}
          </div>
        </div>

        {/* Minimal scroll indicator to keep it balanced */}
        <div className="absolute bottom-10 right-10 md:right-24 z-20 hidden md:flex items-center gap-4">
          <span className="text-[7px] font-black tracking-[0.5em] text-white/30 uppercase italic">Scroll to decrypt_</span>
          <motion.div 
            animate={{ width: [40, 60, 40] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-px bg-white/20"
          />
        </div>
      </motion.div>
    </section>
  );
}
