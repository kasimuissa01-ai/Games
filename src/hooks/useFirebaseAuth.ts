import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!mounted) return;

      if (currentUser) {
        setUser(currentUser);
        await checkAdminStatus(currentUser.uid, currentUser.email || undefined);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const checkAdminStatus = async (userId: string, email?: string) => {
    try {
      console.log(`Checking clearance for: ${email}`);
      const userDocRef = doc(db, 'profiles', userId);
      const userDoc = await getDoc(userDocRef);
      
      const hardcodedAdmins = ['grapherkidd0@gmail.com', 'andrewseba474@gmail.com', 'tzngondi1699@gmail.com'];
      const isHardcodedAdmin = email && hardcodedAdmins.includes(email.toLowerCase());

      if (userDoc.exists() && userDoc.data().is_admin) {
        console.log("Admin access confirmed via database metadata.");
        setIsAdmin(true);
        return;
      }

      if (isHardcodedAdmin) {
        console.warn("Security override applied: Admin status granted via internal list.");
        setIsAdmin(true);

        // AUTO-PROMOTER: Sync with Firestore Profile
        console.log("Synchronizing admin status with database...");
        await setDoc(userDocRef, { is_admin: true }, { merge: true });
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error("Admin check encountered an error:", err);
      const hardcodedAdmins = ['grapherkidd0@gmail.com', 'andrewseba474@gmail.com', 'tzngondi1699@gmail.com'];
      if (email && hardcodedAdmins.includes(email.toLowerCase())) {
        setIsAdmin(true);
      }
    }
  };

  return { user, loading, isAdmin };
}
