import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const images = [
  "https://i.postimg.cc/rswLLfgB/0603cfc04022f9e351ef666d9f44ef68.jpg",
  "https://i.postimg.cc/vZNT2V8Q/IMG-20260521-002440.jpg",
  "https://i.postimg.cc/XqY00sQS/b590a7810fed9b46df7e1605dd3d0e32.jpg",
  "https://i.postimg.cc/pXmhtVrs/6267e906163112870821d978e30a8437.jpg"
];

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const getCardStyle = (index: number) => {
    const diff = (index - currentIndex + images.length) % images.length;
    
    let x = '0%';
    let rotateY = 0;
    let scale = 1;
    let zIndex = 30;
    let opacity = 1;

    if (diff === 0) {
      x = '0%';
      rotateY = 0;
      scale = 1;
      zIndex = 30;
      opacity = 1;
    } else if (diff === 1) {
      x = '32%';
      rotateY = -8;
      scale = 0.85;
      zIndex = 20;
      opacity = 0.45;
    } else if (diff === images.length - 1) {
      x = '-32%';
      rotateY = 8;
      scale = 0.85;
      zIndex = 20;
      opacity = 0.45;
    } else {
      x = '0%';
      rotateY = 0;
      scale = 0.6;
      zIndex = 10;
      opacity = 0;
    }

    return { x, rotateY, scale, zIndex, opacity };
  };

  return (
    <section className="relative w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] h-[54vh] sm:h-[60vh] md:h-[68vh] overflow-hidden bg-black font-outfit pt-20 md:pt-24 pb-4">
      {/* Background blurred image for depth */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-30 blur-2xl scale-110 transition-all duration-1000"
        style={{ backgroundImage: `url(${images[currentIndex]})` }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/60 via-[#12121f]/80 to-[rgba(12,12,20,1)] pointer-events-none" />
      
      <div 
        className="relative w-full h-full max-w-7xl mx-auto flex items-center justify-center px-4"
        style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
      >
        <AnimatePresence initial={false}>
          {images.map((src, index) => {
            const styleProps = getCardStyle(index);
            return (
              <motion.div
                key={src}
                initial={false}
                animate={{
                  x: styleProps.x,
                  rotateY: styleProps.rotateY,
                  scale: styleProps.scale,
                  zIndex: styleProps.zIndex,
                  opacity: styleProps.opacity,
                }}
                transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                className="absolute w-[88%] sm:w-[72%] md:w-[62%] lg:w-[50%] xl:w-[42%] aspect-video rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden cursor-pointer"
                style={{
                  boxShadow: currentIndex === index ? '0 30px 60px -12px rgba(168, 85, 247, 0.5)' : '0 20px 40px -15px rgba(0,0,0,0.8)'
                }}
                onClick={() => setCurrentIndex(index)}
              >
                <img src={src} alt={`Slide ${index + 1}`} className="w-full h-full object-cover object-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c14]/80 via-transparent to-transparent pointer-events-none" />
                
                {currentIndex === index && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="absolute bottom-6 left-6 right-6 hidden md:flex items-center justify-center pointer-events-none"
                  >
                    <div className="w-16 h-1.5 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,1)]" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-2 md:bottom-4 z-40 w-full flex justify-center px-4 md:px-10">
        <div className="min-h-[3rem] flex items-center justify-center max-w-2xl text-center">
          <TypewriterText text="chagua games upendalo Bure au lipia kidogo tu Kwa game Bora zaidi, pata maelekezo ya jinsi ya kuset files Bure😉" />
        </div>
      </div>
    </section>
  );
}

function TypewriterText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayText("");
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 40);
    return () => clearInterval(timer);
  }, [text]);

  return (
    <p className="text-xs md:text-sm font-bold text-slate-300 drop-shadow-md tracking-wide leading-relaxed">
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="inline-block w-[2px] h-[1em] bg-purple-500 ml-1 translate-y-[0.1em]"
      />
    </p>
  );
}
