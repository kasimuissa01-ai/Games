import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);
export const storage = getStorage(app);

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  if (result.user) {
    // Create or update the profile document in Firestore
    await setDoc(doc(db, 'profiles', result.user.uid), {
      email: result.user.email,
      last_login: new Date().toISOString()
    }, { merge: true });
  }
  return { user: result.user, session: true };
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Error signing out:', error.message);
  }
};
