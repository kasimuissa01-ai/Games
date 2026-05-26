import { supabase } from '../lib/supabase';

export interface GameStats {
  likes: number;
  downloads: number;
  likedByUserIds: string[];
}

export interface DailyView {
  view_date: string;
  opens_count: number;
}

/**
 * Normalizes date to string (YYYY-MM-DD)
 */
function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Logs a platform open event once per calendar day (per session to avoid spamming).
 */
export async function trackPlatformOpen(): Promise<void> {
  try {
    const today = getTodayString();
    const sessionKey = `hog_open_tracked_${today}`;
    if (sessionStorage.getItem(sessionKey)) {
      return; // Already tracked this session today
    }

    const { data: existing, error: fetchError } = await supabase
      .from('platform_views')
      .select('opens_count, id')
      .eq('view_date', today)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from('platform_views')
        .update({ opens_count: (existing.opens_count || 0) + 1 })
        .eq('id', existing.id);
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('platform_views')
        .insert({ view_date: today, opens_count: 1 });
      if (insertError) throw insertError;
    }

    sessionStorage.setItem(sessionKey, 'true');
  } catch (err: any) {
    console.warn('analyticsService: Failed to track platform open on Supabase:', err.message);
  }
}

/**
 * Inserts a download tracking record.
 */
export async function trackDownload(gameId: string, userId?: string): Promise<void> {
  if (!gameId) return;
  try {
    const { error } = await supabase
      .from('game_downloads')
      .insert({
        game_id: gameId,
        user_id: userId || null
      });

    if (error) throw error;
  } catch (err: any) {
    console.warn(`analyticsService: Failed to track download for game ${gameId}:`, err.message);
  }
}

/**
 * Toggles a user's like status on a game
 * @returns boolean true if now liked, false if unliked
 */
export async function toggleLike(gameId: string, userId: string): Promise<boolean> {
  if (!gameId || !userId) return false;
  try {
    // Check if liked
    const { data: existing, error: fetchError } = await supabase
      .from('game_likes')
      .select('id')
      .eq('game_id', gameId)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existing) {
      // Unlike
      const { error: deleteError } = await supabase
        .from('game_likes')
        .delete()
        .eq('id', existing.id);
      if (deleteError) throw deleteError;
      return false;
    } else {
      // Like
      const { error: insertError } = await supabase
        .from('game_likes')
        .insert({
          game_id: gameId,
          user_id: userId
        });
      if (insertError) throw insertError;
      return true;
    }
  } catch (err: any) {
    console.error(`analyticsService: Failed to toggle like for game ${gameId}:`, err.message);
    throw err;
  }
}

/**
 * Fetches likes and downloads counts for all games
 */
export async function getAllGameStats(): Promise<{ [gameId: string]: GameStats }> {
  const stats: { [gameId: string]: GameStats } = {};

  try {
    // Fetch game likes
    const { data: likesData, error: likesError } = await supabase
      .from('game_likes')
      .select('game_id, user_id');

    // Fetch game downloads
    const { data: downloadsData, error: downloadsError } = await supabase
      .from('game_downloads')
      .select('game_id');

    if (likesError) throw likesError;
    if (downloadsError) throw downloadsError;

    // Process likes
    if (likesData) {
      likesData.forEach((row: any) => {
        const gid = row.game_id;
        if (!stats[gid]) {
          stats[gid] = { likes: 0, downloads: 0, likedByUserIds: [] };
        }
        stats[gid].likes += 1;
        if (row.user_id && !stats[gid].likedByUserIds.includes(row.user_id)) {
          stats[gid].likedByUserIds.push(row.user_id);
        }
      });
    }

    // Process downloads
    if (downloadsData) {
      downloadsData.forEach((row: any) => {
        const gid = row.game_id;
        if (!stats[gid]) {
          stats[gid] = { likes: 0, downloads: 0, likedByUserIds: [] };
        }
        stats[gid].downloads += 1;
      });
    }

  } catch (err: any) {
    console.error('analyticsService: Error loading game stats from Supabase:', err.message);
  }

  return stats;
}

/**
 * Fetches daily platform opens (views) for admin analytics
 */
export async function getDailyPlatformViews(): Promise<DailyView[]> {
  try {
    const { data, error } = await supabase
      .from('platform_views')
      .select('view_date, opens_count')
      .order('view_date', { ascending: false })
      .limit(30);

    if (error) throw error;
    return data || [];
  } catch (err: any) {
    console.error('analyticsService: Error loading daily opens from Supabase:', err.message);
    return [];
  }
}
