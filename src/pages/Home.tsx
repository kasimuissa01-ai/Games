import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Hero from '../components/Hero';
import GameCard from '../components/GameCard';
import { getGames } from '../services/gameService';
import { Game, Platform } from '../types';
import { Monitor, Smartphone, Gamepad, Trophy, LayoutGrid, Search, Filter } from 'lucide-react';

export default function Home({ onGameSelect }: { onGameSelect: (game: Game) => void }) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Platform | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadGames();
  }, [filter]);

  const loadGames = async () => {
    setLoading(true);
    try {
      const fetchedGames = await getGames(filter);
      setGames(fetchedGames);
    } catch (error) {
      console.error("Failed to load games:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGames = games.filter(g => 
    (g.title?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (g.category?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Hero />

      {/* Filter and Search Bar */}
      <section className="px-4 md:px-10 py-8">
        <div className="flex flex-col gap-6">
          <div className="relative group w-full">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="SEARCH ASSET DATABASE..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border border-white/5 rounded-3xl py-6 pl-16 pr-8 text-xs text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all w-full uppercase tracking-[0.2em] font-black placeholder:text-slate-700 shadow-2xl backdrop-blur-md"
            />
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
            <FilterItem active={filter === 'ALL'} onClick={() => setFilter('ALL')} label="ALL ASSETS" />
            <FilterItem active={filter === Platform.PC} onClick={() => setFilter(Platform.PC)} label="PC NODE" />
            <FilterItem active={filter === Platform.Mobile} onClick={() => setFilter(Platform.Mobile)} label="MOBILE" />
            <FilterItem active={filter === Platform.Xbox} onClick={() => setFilter(Platform.Xbox)} label="CONSOLE" />
          </div>
        </div>
      </section>

      {/* Horizontal Carousels */}
      <section className="space-y-16 pb-32">
        <GameSection 
          title="Available Games" 
          subtitle="Top performing streams" 
          games={filteredGames} 
          loading={loading} 
          onGameSelect={onGameSelect} 
        />
      </section>
    </div>
  );
}

function GameSection({ title, subtitle, games, loading, onGameSelect }: { title: string, subtitle: string, games: Game[], loading: boolean, onGameSelect: (game: Game) => void }) {
  return (
    <div className="space-y-8">
      <div className="px-6 md:px-12 flex items-end justify-between">
        <div>
          <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">{title}</h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-4">{subtitle}</p>
        </div>
        <button className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] hover:text-white transition-all bg-white/5 px-6 py-3 rounded-full border border-white/5">View Archive</button>
      </div>

      <div className="relative">
        <div className="flex items-stretch gap-8 overflow-x-auto px-6 md:px-12 pb-12 no-scrollbar scroll-smooth">
          {loading ? (
            [1, 2, 3, 4, 5].map(i => (
              <div key={i} className="min-w-[340px] md:min-w-[440px] aspect-[16/10] rounded-[3rem] bg-white/5 animate-pulse border border-white/10" />
            ))
          ) : games.length > 0 ? (
            games.map((game) => (
              <div key={game.id} className="min-w-[340px] md:min-w-[440px]">
                <GameCard game={game} onClick={onGameSelect} />
              </div>
            ))
          ) : (
            <div className="w-full py-32 text-center glass rounded-[3rem] mx-6 md:mx-12">
              <p className="text-slate-600 text-xs font-black uppercase tracking-[0.5em] italic">No Active Signal Detected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterItem({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black tracking-[0.2em] transition-all border ${
        active 
          ? 'bg-blue-600/10 border-blue-500/50 text-blue-400 shadow-neon-blue' 
          : 'bg-white/5 border-transparent text-slate-400 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}
