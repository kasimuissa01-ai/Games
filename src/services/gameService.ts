import { db, storage, auth } from '../lib/firebase';
import { collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Game, Platform, Purchase } from '../types';

const GAMES_COLLECTION = 'games';
const PURCHASES_COLLECTION = 'purchases';

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

    // Sort by createdAt desc in memory
    results.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return results;
  } catch (error) {
    console.error("Error fetching games:", error);
    return [];
  }
};

export const uploadImage = async (file: File) => {
  try {
    console.log("Starting upload to Firebase storage...");
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    // Using a user-specific or global folder. Let's use game-assets/
    const storageRef = ref(storage, `game-assets/${fileName}`);

    await uploadBytes(storageRef, file);
    console.log("Upload successful, fetching public URL...");
    
    const publicUrl = await getDownloadURL(storageRef);
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

