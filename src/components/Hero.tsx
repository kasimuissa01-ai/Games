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

            {/* Platform Buttons - Mimicking the App/Play store aesthetic */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="flex items-center gap-3 mt-10 md:mt-12"
            >
              {/* Google Play Style */}
              <button className="flex items-center gap-3 bg-black border border-white/20 hover:border-white/50 px-4 md:px-6 py-2 md:py-2.5 rounded-xl transition-all group pointer-events-auto">
                <div className="text-white group-hover:scale-110 transition-transform">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L18.66,16.27C19.13,16.55 19.3,17.17 19.02,17.64C18.89,17.86 18.67,18 18.45,18C18.27,18 18.09,17.93 17.94,17.83L15.12,16.12L13.69,14.69M15.12,7.88L17.94,6.17C18.41,5.89 19.03,6.05 19.31,6.53C19.59,7 19.43,7.63 18.95,7.91L16.81,9.22L14.69,7.12M14.03,12L4.69,2.66C4.85,2.59 5.03,2.55 5.22,2.55C5.57,2.55 5.91,2.69 6.16,2.94L16.03,12.81L14.03,14.81L4.69,21.34C4.85,21.41 5.03,21.45 5.22,21.45C5.57,21.45 5.91,21.31 6.16,21.06L16.03,11.19" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-[7px] font-bold text-white/50 leading-none">GET IT ON</p>
                  <p className="text-xs md:text-sm font-black text-white leading-tight">Google Play</p>
                </div>
              </button>

              {/* App Store Style */}
              <button className="flex items-center gap-3 bg-black border border-white/20 hover:border-white/50 px-4 md:px-6 py-2 md:py-2.5 rounded-xl transition-all group pointer-events-auto">
                <div className="text-white group-hover:scale-110 transition-transform">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-[7px] font-bold text-white/50 leading-none">Download on the</p>
                  <p className="text-xs md:text-sm font-black text-white leading-tight">App Store</p>
                </div>
              </button>
            </motion.div>
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
