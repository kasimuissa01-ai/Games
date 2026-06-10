import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Hero from "../components/Hero";
import GameCard from "../components/GameCard";
import { getGames } from "../services/gameService";
import { Game, Platform } from "../types";
import { getAllGameStats, toggleLike, GameStats } from "../services/analyticsService";
import {
  Monitor,
  Smartphone,
  Gamepad,
  Trophy,
  LayoutGrid,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Home({
  onGameSelect,
  user,
  onAuthRequired,
}: {
  onGameSelect: (game: Game) => void;
  user: any;
  onAuthRequired: () => void;
}) {
  const [games, setGames] = useState<Game[]>([]);
  const [gameStats, setGameStats] = useState<{ [gameId: string]: GameStats }>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Platform | "ALL">("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadGamesAndStats();
  }, [filter]);

  const loadGamesAndStats = async () => {
    setLoading(true);
    try {
      const fetchedGames = await getGames(filter);
      setGames(fetchedGames);
      const fetchedStats = await getAllGameStats();
      setGameStats(fetchedStats);
    } catch (error) {
      console.error("Failed to load games or stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async (gameId: string) => {
    if (!user) {
      onAuthRequired();
      return;
    }

    const currentStats = gameStats[gameId] || { likes: 0, downloads: 0, likedByUserIds: [] };
    const isCurrentlyLiked = currentStats.likedByUserIds.includes(user.uid);

    // Optimistic UI updates
    const updatedLikedUsers = isCurrentlyLiked
      ? currentStats.likedByUserIds.filter(id => id !== user.uid)
      : [...currentStats.likedByUserIds, user.uid];

    const updatedLikesCount = isCurrentlyLiked
      ? Math.max(0, currentStats.likes - 1)
      : currentStats.likes + 1;

    setGameStats(prev => ({
      ...prev,
      [gameId]: {
        ...currentStats,
        likes: updatedLikesCount,
        likedByUserIds: updatedLikedUsers
      }
    }));

    try {
      const likedNow = await toggleLike(gameId, user.uid);
      // Refetch actual stats in the background to ensure parity
      const latestStats = await getAllGameStats();
      setGameStats(latestStats);
    } catch (err) {
      console.error("Failed to toggle like on db:", err);
    }
  };

  const filteredGames = games.filter(
    (g) =>
      (g.title?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (g.category?.toLowerCase() || "").includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Hero />

      {/* Filter and Search Bar */}
      <section id="explore-section" className="scroll-mt-6 px-4 md:px-10 pt-4 pb-2">
        <div className="flex flex-col gap-4">
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
            <FilterItem
              active={filter === "ALL"}
              onClick={() => setFilter("ALL")}
              label="ALL ASSETS"
            />
            <FilterItem
              active={filter === Platform.PC}
              onClick={() => setFilter(Platform.PC)}
              label="PC NODE"
            />
            <FilterItem
              active={filter === Platform.Mobile}
              onClick={() => setFilter(Platform.Mobile)}
              label="MOBILE"
            />
            <FilterItem
              active={filter === Platform.Xbox}
              onClick={() => setFilter(Platform.Xbox)}
              label="CONSOLE"
            />
            <FilterItem
              active={filter === Platform.PSP}
              onClick={() => setFilter(Platform.PSP)}
              label="PSP"
            />
          </div>
        </div>
      </section>

      {/* Horizontal Carousels */}
      <section className="pb-20">
        <GameSection
          games={filteredGames}
          stats={gameStats}
          loading={loading}
          user={user}
          onLike={handleLikeToggle}
          onGameSelect={onGameSelect}
        />
      </section>
    </div>
  );
}

function GameSection({
  games,
  stats,
  loading,
  user,
  onLike,
  onGameSelect,
}: {
  games: Game[];
  stats: { [gameId: string]: GameStats };
  loading: boolean;
  user: any;
  onLike: (gameId: string) => void;
  onGameSelect: (game: Game) => void;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 px-4 md:px-12">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="w-full aspect-[4/5] rounded-[1.5rem] bg-white/5 animate-pulse border border-white/10"
          />
        ))}
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="px-4 md:px-12 py-24 text-center">
        <div className="max-w-md mx-auto bg-white/5 border border-white/5 rounded-[2.5rem] py-12 px-6">
          <p className="text-slate-600 text-xs font-black uppercase tracking-[0.5em] italic">
            No Active Signal Detected
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-12">
      {/* Sleek Central Header Title */}
      <div className="flex items-center gap-3 mb-6 pl-1">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
        <h2 className="text-slate-200 text-[10px] md:text-xs font-black tracking-[0.35em] uppercase">
          🔥 KATAALOGI YA MAGEMU
        </h2>
        <span className="text-slate-600 font-mono text-[9px] font-black">
          ({games.length})
        </span>
      </div>

      {/* Flat grid view replacing horizontal carousel list */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {games.map((game) => {
          const gameStat = stats[game.id] || { likes: 0, downloads: 0, likedByUserIds: [] };
          const hasLiked = user ? gameStat.likedByUserIds.includes(user.uid) : false;
          return (
            <GameCard
              key={game.id}
              game={game}
              onClick={onGameSelect}
              likes={gameStat.likes}
              downloads={gameStat.downloads}
              hasLiked={hasLiked}
              onLike={(e?: any) => onLike(game.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

function FilterItem({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black tracking-[0.2em] transition-all border ${
        active
          ? "bg-blue-600/10 border-blue-500/50 text-blue-400 shadow-neon-blue"
          : "bg-white/5 border-transparent text-slate-400 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
