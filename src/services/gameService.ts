import { supabase } from '../lib/supabase';
import { db, storage, auth } from '../lib/firebase';
import { collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Game, Platform, Purchase } from '../types';

const GAMES_COLLECTION = 'games';
const PURCHASES_COLLECTION = 'purchases';

export const DEFAULT_SHOWCASE_GAMES: Game[] = [
  {
    id: "fc24-psp",
    title: "EA SPORTS FC 24 PSP",
    description: "The ultimate portable football experience featuring updated rosters, realistic player motions, and immersive gameplay. Optimized for PPSSPP emulator with custom textures and high-definition crowds.",
    shortDescription: "Ultra-optimized PPSSPP Edition with 2024 Kits.",
    price: 3500,
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop",
    platform: Platform.PSP,
    category: "Sports",
    ram: "1GB RAM",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "gta5-pc",
    title: "GTA V Premium Edition",
    description: "Experience Rockstar Games' critically acclaimed open world. Live the life of Michael, Franklin, and Trevor as they execute a series of daring heists. Highly optimized setup files with fast installation support.",
    shortDescription: "PC Edition with Online & Offline mode packed.",
    price: 15000,
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop",
    platform: Platform.PC,
    category: "Action",
    ram: "8GB/16GB RAM Ready",
    createdAt: "2026-01-02T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z"
  },
  {
    id: "spiderman-mobile",
    title: "Marvel's Spider-Man Mobile",
    description: "Swing through Manhattan with stunning console-level graphics on your phone. Fluid web-slinging mechanics, legendary fighting combos, and immersive street exploration optimized for Android & iOS.",
    shortDescription: "Offline fluid open world web-swinging action.",
    price: 2500,
    imageUrl: "https://images.unsplash.com/photo-1608889175123-8ec330b86f84?q=80&w=600&auto=format&fit=crop",
    platform: Platform.Mobile,
    category: "Adventure",
    ram: "4GB RAM Recommended",
    createdAt: "2026-01-03T00:00:00.000Z",
    updatedAt: "2026-01-03T00:00:00.000Z"
  },
  {
    id: "cod-warzone",
    title: "Call of Duty: Warzone Console",
    description: "Welcome to Warzone, the massive free-to-play battle royale arena. Drop in, armor up, loot for rewards, and battle your way to the top. Fully tested on Xbox and PS consoles with local installation nodes.",
    shortDescription: "Tactical Battle Royale with high frame optimization.",
    price: 18000,
    imageUrl: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=600&auto=format&fit=crop",
    platform: Platform.Xbox,
    category: "Shooter",
    ram: "Console Native",
    createdAt: "2026-01-04T00:00:00.000Z",
    updatedAt: "2026-01-04T00:00:00.000Z"
  },
  {
    id: "pes-2024-psp",
    title: "PES 2024 Cameroun Mod",
    description: "Experience African leagues, updated Champions League matchdays, and premium commentator voices on PPSSPP. Includes smooth controls, high frame rates, and authentic player models.",
    shortDescription: "PPSSPP Cameroun & African Leagues Mod.",
    price: 3000,
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop",
    platform: Platform.PSP,
    category: "Sports",
    ram: "1GB RAM",
    createdAt: "2026-01-05T00:00:00.000Z",
    updatedAt: "2026-01-05T00:00:00.000Z"
  }
];

export const getGames = async (platformFilter?: Platform | 'ALL') => {
  try {
    let q = collection(db, GAMES_COLLECTION) as any;
    
    if (platformFilter && platformFilter !== 'ALL') {
      q = query(collection(db, GAMES_COLLECTION), where('platform', '==', platformFilter));
    } else {
      q = query(collection(db, GAMES_COLLECTION));
    }

    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data
      } as Game;
    });

    // If Firestore is empty, return the elegant default games
    if (results.length === 0) {
      const fallbackList = [...DEFAULT_SHOWCASE_GAMES];
      if (platformFilter && platformFilter !== 'ALL') {
        return fallbackList.filter(g => g.platform === platformFilter);
      }
      return fallbackList;
    }

    // Sort by createdAt desc in memory
    results.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return results;
  } catch (error) {
    console.error("Error fetching games, falling back to offline preset:", error);
    const fallbackList = [...DEFAULT_SHOWCASE_GAMES];
    if (platformFilter && platformFilter !== 'ALL') {
      return fallbackList.filter(g => g.platform === platformFilter);
    }
    return fallbackList;
  }
};


export const uploadImage = async (file: File) => {
  try {
    console.log("Starting upload to Supabase storage...");
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('game-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Supabase Storage Error:", uploadError);
      throw uploadError;
    }

    console.log("Upload successful, fetching public URL...");
    const { data: { publicUrl } } = supabase.storage
      .from('game-assets')
      .getPublicUrl(filePath);

    console.log("Public URL generated:", publicUrl);
    return publicUrl;
  } catch (error: any) {
    console.error("Error in uploadImage service:", error);
    throw error;
  }
};

export const createGame = async (game: Omit<Game, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, GAMES_COLLECTION), {
      ...game,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating game:", error);
    throw error;
  }
};

export const updateGame = async (id: string, game: Partial<Game>) => {
  try {
    const docRef = doc(db, GAMES_COLLECTION, id);
    await updateDoc(docRef, {
      ...game,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating game:", error);
    throw error;
  }
};

export const deleteGame = async (id: string) => {
  try {
    await deleteDoc(doc(db, GAMES_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting game:", error);
  }
};

export const createPurchase = async (purchase: Omit<Purchase, 'id' | 'purchasedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, PURCHASES_COLLECTION), {
      ...purchase,
      purchasedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating purchase:", error);
  }
};

export const getPurchases = async () => {
  try {
    const q = query(collection(db, PURCHASES_COLLECTION), orderBy('purchasedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data
      } as Purchase;
    });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return [];
  }
};

export const getMyPurchases = async (userId: string) => {
  try {
    const q = query(collection(db, PURCHASES_COLLECTION), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data
      } as Purchase;
    });
    results.sort((a, b) => new Date(b.purchasedAt || 0).getTime() - new Date(a.purchasedAt || 0).getTime());
    return results;
  } catch (error) {
    console.error("Error fetching my purchases:", error);
    return [];
  }
};

export const updatePurchaseStatus = async (id: string, status: Purchase['status']) => {
  try {
    const docRef = doc(db, PURCHASES_COLLECTION, id);
    await updateDoc(docRef, { status });
  } catch (error) {
    console.error("Error updating purchase status:", error);
  }
};

export const SEED_GAMES: Omit<Game, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: "Space Wars",
    description: "Engage in intergalactic battles, explore unknown galaxies...",
    shortDescription: "Epic space battles.",
    price: 45000,
    imageUrl: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=2000&auto=format&fit=crop",
    platform: Platform.PC,
    category: "Strategy"
  }
];

