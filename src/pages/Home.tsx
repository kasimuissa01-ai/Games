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
      <div className="space-y-12 px-4 md:px-12">
        {[1, 2, 3].map((rowIndex) => (
          <div key={rowIndex} className="space-y-4">
            <div className="h-6 w-48 bg-white/5 rounded-md animate-pulse" />
            <div className="flex gap-4 md:gap-6 overflow-x-hidden pb-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="flex-none w-[calc(50%-8px)] sm:w-[calc(33.33%-12px)] md:w-[calc(25%-18px)] lg:w-[calc(20%-20px)] xl:w-[calc(16.66%-20px)] aspect-[4/5] rounded-[1.5rem] bg-white/5 animate-pulse border border-white/10"
                />
              ))}
            </div>
          </div>
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

  // Segment games across 4 distinct independent horizontal scroll lists
  const rowConfigurations = [
    { title: "🔥 POPULAR NOW", games: [] as Game[] },
    { title: "⚡ NEW ARRIVALS", games: [] as Game[] },
    { title: "🏆 TOP RATED", games: [] as Game[] },
    { title: "🌟 SPECIAL SELECTIONS", games: [] as Game[] },
  ];

  // Distribute games cleanly across the rows
  games.forEach((game, index) => {
    const targetRow = index % 4;
    rowConfigurations[targetRow].games.push(game);
  });

  // Filter out any row configurations that ended up with 0 games to keep layout compact
  const activeRows = rowConfigurations.filter(row => row.games.length > 0);

  return (
    <div className="space-y-12">
      {activeRows.map((rowConfig, index) => (
        <CarouselRow
          key={index}
          title={rowConfig.title}
          games={rowConfig.games}
          stats={stats}
          user={user}
          onLike={onLike}
          onGameSelect={onGameSelect}
        />
      ))}
    </div>
  );
}

function CarouselRow({
  title,
  games,
  stats,
  user,
  onLike,
  onGameSelect,
}: {
  title: string;
  games: Game[];
  stats: { [gameId: string]: GameStats };
  user: any;
  onLike: (gameId: string) => void;
  onGameSelect: (game: Game) => void;
  key?: any;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -scrollRef.current.offsetWidth * 0.75, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollRef.current.offsetWidth * 0.75, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative px-4 md:px-12 group">
      {/* Row Sleek Header Title */}
      <div className="flex items-center gap-3 mb-4 pl-1">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
        <h2 className="text-slate-200 text-[10px] md:text-xs font-black tracking-[0.35em] uppercase">
          {title}
        </h2>
        <span className="text-slate-600 font-mono text-[9px] font-black">
          ({games.length})
        </span>
      </div>

      {/* Row Independent Navigation Controls to slide horizontally */}
      {games.length > 1 && (
        <>
          <button
            onClick={scrollLeft}
            className="absolute left-6 top-[calc(50%+14px)] -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-950/90 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:scale-105 hover:border-blue-400 focus:outline-none transition-all duration-300 opacity-100 md:opacity-0 md:group-hover:opacity-100 shadow-[0_4px_20px_rgba(0,0,0,0.6)] cursor-pointer"
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={scrollRight}
            className="absolute right-6 top-[calc(50%+14px)] -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-950/90 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:scale-105 hover:border-blue-400 focus:outline-none transition-all duration-300 opacity-100 md:opacity-0 md:group-hover:opacity-100 shadow-[0_4px_20px_rgba(0,0,0,0.6)] cursor-pointer"
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Carousel Core view track (Horizontal scrolling for this row ONLY) */}
      <div
        ref={scrollRef}
        className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-4 w-full"
      >
        {games.map((game) => {
          const gameStat = stats[game.id] || { likes: 0, downloads: 0, likedByUserIds: [] };
          const hasLiked = user ? gameStat.likedByUserIds.includes(user.uid) : false;
          return (
            <div
              key={game.id}
              className="flex-none w-[calc(50%-8px)] sm:w-[calc(33.33%-12px)] md:w-[calc(25%-18px)] lg:w-[calc(20%-20px)] xl:w-[calc(16.66%-20px)] snap-start h-full"
            >
              <GameCard
                game={game}
                onClick={onGameSelect}
                likes={gameStat.likes}
                downloads={gameStat.downloads}
                hasLiked={hasLiked}
                onLike={() => onLike(game.id)}
              />
            </div>
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
