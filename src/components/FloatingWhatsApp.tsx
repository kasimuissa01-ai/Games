import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle } from 'lucide-react';

export default function FloatingWhatsApp() {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Periodically expand and collapse to grab attention
    const interval = setInterval(() => {
      setIsExpanded(true);
      setTimeout(() => setIsExpanded(false), 5000);
    }, 15000);
    
    // Initial expansion
    const timeout = setTimeout(() => setIsExpanded(true), 3000);
    const initialCollapse = setTimeout(() => setIsExpanded(false), 8000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      clearTimeout(initialCollapse);
    };
  }, []);

  const handleClick = () => {
    window.open('https://wa.me/255616581136', '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 1 }}
      className="fixed bottom-24 right-4 md:right-8 lg:bottom-10 z-[70] flex items-end justify-end drop-shadow-[0_10px_20px_rgba(37,211,102,0.4)]"
    >
      <button 
        onClick={handleClick}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className="flex items-center justify-center bg-[#25D366] text-white overflow-hidden transition-all duration-500 ease-in-out hover:bg-[#20bd5a]"
        style={{
          borderRadius: '9999px',
          height: '56px',
          width: isExpanded ? '260px' : '56px',
        }}
      >
        <div className="flex items-center justify-start w-full px-4 h-full overflow-hidden">
            <MessageCircle size={28} fill="currentColor" strokeWidth={1.5} className="shrink-0" />
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="whitespace-nowrap font-bold text-xs pl-3 tracking-wide"
                >
                  Niulize chochote kuhusu game
                </motion.span>
              )}
            </AnimatePresence>
        </div>
      </button>
    </motion.div>
  );
}
