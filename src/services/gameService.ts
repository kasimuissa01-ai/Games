import { supabase } from '../lib/supabase';
import { Game, Platform, Purchase } from '../types';

const TABLE_NAME = 'games';

export const getGames = async (platformFilter?: Platform | 'ALL') => {
  try {
    let query = supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });

    if (platformFilter && platformFilter !== 'ALL') {
      query = query.eq('platform', platformFilter);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      shortDescription: item.short_description,
      price: item.price,
      imageUrl: item.image_url,
      videoUrl: item.video_url,
      downloadUrl: item.download_url,
      platform: Array.isArray(item.platform) ? item.platform[0] : (item.platform || Platform.PC),
      category: item.category,
      ram: item.ram,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    } as Game));
  } catch (error) {
    console.error("Error fetching games:", error);
    return [];
  }
};

export const uploadImage = async (file: File) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('game-assets')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('game-assets')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export const createGame = async (game: Omit<Game, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([{
        title: game.title,
        description: game.description,
        short_description: game.shortDescription,
        price: game.price,
        image_url: game.imageUrl,
        video_url: game.videoUrl,
        download_url: game.downloadUrl,
        platform: game.platform,
        category: game.category,
        ram: game.ram
      }])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error("Error creating game:", error);
    throw error;
  }
};

export const updateGame = async (id: string, game: Partial<Game>) => {
  try {
    const updateData: any = {};
    if (game.title !== undefined) updateData.title = game.title;
    if (game.description !== undefined) updateData.description = game.description;
    if (game.shortDescription !== undefined) updateData.short_description = game.shortDescription;
    if (game.price !== undefined) updateData.price = game.price;
    if (game.imageUrl !== undefined) updateData.image_url = game.imageUrl;
    if (game.videoUrl !== undefined) updateData.video_url = game.videoUrl;
    if (game.downloadUrl !== undefined) updateData.download_url = game.downloadUrl;
    if (game.platform !== undefined) updateData.platform = game.platform;
    if (game.category !== undefined) updateData.category = game.category;
    if (game.ram !== undefined) updateData.ram = game.ram;
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from(TABLE_NAME)
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating game:", error);
    throw error;
  }
};

export const deleteGame = async (id: string) => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting game:", error);
  }
};

// Purchase / Payment Operations
export const createPurchase = async (purchase: Omit<Purchase, 'id' | 'purchasedAt'>) => {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .insert([{
        user_id: purchase.userId,
        user_email: purchase.userEmail,
        game_id: purchase.gameId,
        game_title: purchase.gameTitle,
        amount: purchase.amount,
        status: purchase.status
      }])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error("Error creating purchase:", error);
  }
};

export const getPurchases = async () => {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .order('purchased_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(item => ({
      id: item.id,
      userId: item.user_id,
      userEmail: item.user_email,
      gameId: item.game_id,
      gameTitle: item.game_title,
      amount: item.amount,
      status: item.status,
      purchasedAt: item.purchased_at
    } as Purchase));
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return [];
  }
};

export const getMyPurchases = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', userId)
      .order('purchased_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(item => ({
      id: item.id,
      userId: item.user_id,
      userEmail: item.user_email,
      gameId: item.game_id,
      gameTitle: item.game_title,
      amount: item.amount,
      status: item.status,
      purchasedAt: item.purchased_at
    } as Purchase));
  } catch (error) {
    console.error("Error fetching my purchases:", error);
    return [];
  }
};

export const updatePurchaseStatus = async (id: string, status: Purchase['status']) => {
  try {
    const { error } = await supabase
      .from('purchases')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating purchase status:", error);
  }
};

export const SEED_GAMES: Omit<Game, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: "Space Wars",
    description: "Engage in intergalactic battles, explore unknown galaxies, and command mighty fleets in this epic scifi strategy RPG.",
    shortDescription: "Epic space battles and galactic exploration.",
    price: 45000,
    imageUrl: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=2000&auto=format&fit=crop",
    platform: Platform.PC,
    category: "Strategy",
    downloadUrl: "",
    ram: "16GB"
  },
  {
    title: "Return of the Cars",
    description: "Rev up your engines and race through thrilling tracks. Customize your ride and compete in high-stakes underground racing.",
    shortDescription: "High-octane underground racing simulation.",
    price: 15000,
    imageUrl: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=2000&auto=format&fit=crop",
    platform: Platform.Mobile,
    category: "Racing",
    downloadUrl: "",
    ram: "6GB"
  },
  {
    title: "The Warrior 3",
    description: "Enter a world of action and honor. Master deadly combat, unlock powerful abilities, and defeat ancient evils in this dark fantasy saga.",
    shortDescription: "Master deadly combat in a dark fantasy world.",
    price: 35000,
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop",
    platform: Platform.PC,
    category: "Action RPG",
    downloadUrl: "",
    ram: "8GB"
  }
];
