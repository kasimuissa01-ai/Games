import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import glassControllerImg from '../assets/images/glass_controller_1782288071094.jpg';

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0); // 0 = Glass Controller Image, 1 = Video
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true); // Default to muted like Instagram for guaranteed silent autoplay
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-slide: When on Slide 0 (Image), auto-switch to Slide 1 (Video) after 10 seconds
  useEffect(() => {
    if (currentSlide === 0) {
      const timer = setTimeout(() => {
        setCurrentSlide(1);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [currentSlide]);

  // Handle video playback, reset-time, and preloading states
  useEffect(() => {
    if (videoRef.current) {
      if (currentSlide === 1) {
        videoRef.current.currentTime = 0;
        videoRef.current.volume = 0.25; // Keep low volume as requested
        videoRef.current.muted = isMuted;
        if (isVideoPlaying) {
          videoRef.current.play().catch((err) => {
            console.log("Autoplay play() blocked:", err);
            // Fallback: make sure it is muted and keep playing
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play().catch(() => {});
            }
          });
        }
      } else {
        videoRef.current.pause();
      }
    }
  }, [currentSlide, isVideoPlaying]);

  // Handle dynamic volume / muted changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.volume = 0.25; // Low background audio level
    }
  }, [isMuted]);

  const toggleVideoPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextPlayState = !isVideoPlaying;
    setIsVideoPlaying(nextPlayState);
    if (videoRef.current) {
      if (nextPlayState) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuteState = !isMuted;
    
    // Direct, synchronous change to video element to satisfy browser security gesture checks
    if (videoRef.current) {
      videoRef.current.muted = nextMuteState;
      videoRef.current.volume = 0.25;
      if (!nextMuteState && isVideoPlaying) {
        videoRef.current.play().catch(() => {});
      }
    }
    
    setIsMuted(nextMuteState);
  };

  const handleVideoEnded = () => {
    // When the video ends naturally, slide back to the image
    setCurrentSlide(0);
  };

  return (
    <div className="w-full relative select-none overflow-hidden">
      {/* Cinematic Edge-to-Edge Hero Carousel Container */}
      <div className="relative w-full bg-slate-950 aspect-[4/3] sm:aspect-video lg:aspect-[21/9] min-h-[340px] sm:min-h-[420px] lg:min-h-[460px] flex items-center">
        
        {/* Slide 1: Premium Glass Controller Image (Always mounted for instant load) */}
        <div
          className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${
            currentSlide === 0 ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <img
            src={glassControllerImg}
            alt="Glass Controller Hero Banner"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center saturate-[1.15] brightness-[0.85]"
          />
        </div>

        {/* Slide 2: Immersive Gameplay/Trailer Video (Always mounted and preloaded in background) */}
        <div
          className={`absolute inset-0 z-0 bg-black transition-opacity duration-1000 ease-in-out ${
            currentSlide === 1 ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <video
            ref={videoRef}
            preload="auto"
            muted={isMuted}
            playsInline
            onEnded={handleVideoEnded}
            className="w-full h-full object-cover object-center brightness-[0.7]"
          >
            {/* Custom gameplay loop video hosted on Supabase Storage */}
            <source src="https://rdkflxijwyahmppifaht.supabase.co/storage/v1/object/public/game-assets/VID_20260624_033325_479_bsl.mp4" type="video/mp4" />
          </video>
          
          {/* Play/Pause & Audio control overlays specifically for video slide, positioned like Instagram */}
          <div className="absolute right-6 bottom-6 z-20 flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleVideoPlay}
              className="w-10 h-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white hover:bg-cyan-500 hover:text-slate-950 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer shadow-lg"
              title={isVideoPlaying ? "Pause Video" : "Play Video"}
            >
              {isVideoPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className="w-10 h-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white hover:bg-cyan-500 hover:text-slate-950 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer shadow-lg"
              title={isMuted ? "Unmute Sound" : "Mute Sound"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        </div>

        {/* Global Cinematic overlay gradients for text readability & styling */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/10 lg:bg-gradient-to-r lg:from-slate-950 lg:via-slate-950/45 lg:to-transparent z-1 pointer-events-none" />
        <div className="absolute -left-1/4 top-1/4 w-[400px] sm:w-[550px] h-[250px] sm:h-[350px] bg-cyan-500/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none z-1" />

        {/* Streamlined Swipe/Indicator dots inside the Hero area */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          <button
            type="button"
            onClick={() => setCurrentSlide(0)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              currentSlide === 0 ? 'bg-cyan-400 w-8' : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label="View Image Slide"
          />
          <button
            type="button"
            onClick={() => setCurrentSlide(1)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              currentSlide === 1 ? 'bg-cyan-400 w-8' : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label="View Video Slide"
          />
        </div>

        {/* Slick, Minimalist Slide Navigation buttons */}
        <div className="absolute inset-x-4 sm:inset-x-8 z-20 flex justify-between pointer-events-none">
          <button
            type="button"
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? 1 : 0))}
            className="w-10 h-10 rounded-xl bg-slate-950/60 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-cyan-500 hover:text-slate-950 hover:border-cyan-400/30 hover:scale-105 active:scale-95 pointer-events-auto transition-all duration-300 cursor-pointer shadow-lg"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={18} className="stroke-[2.5]" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? 1 : 0))}
            className="w-10 h-10 rounded-xl bg-slate-950/60 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-cyan-500 hover:text-slate-950 hover:border-cyan-400/30 hover:scale-105 active:scale-95 pointer-events-auto transition-all duration-300 cursor-pointer shadow-lg"
            aria-label="Next Slide"
          >
            <ChevronRight size={18} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Hero Conversion Button Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end lg:justify-center p-6 sm:p-12 md:p-16 max-w-xl text-left pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="pb-6 lg:pb-0 pointer-events-auto"
          >
            {/* Elegant Clean BUY GAME Action */}
            <button
              type="button"
              className="px-7 py-3.5 sm:px-9 sm:py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs sm:text-sm tracking-widest uppercase flex items-center justify-center gap-2.5 shadow-lg shadow-cyan-500/30 border border-cyan-300/30 active:scale-95 transition-all cursor-pointer"
            >
              <ShoppingCart size={16} className="stroke-[2.5]" />
              BUY GAME
            </button>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
