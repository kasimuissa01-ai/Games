import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check active sessions and sets the user
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Initial session fetch error:", error);
          if (error.message.includes("refresh_token_not_found") || error.message.includes("Refresh Token Not Found")) {
            console.warn("Stale session detected, signing out...");
            await supabase.auth.signOut();
            setUser(null);
            setLoading(false);
            return;
          }
          throw error;
        }

        setUser(session?.user ?? null);
        if (session?.user) {
          await checkAdminStatus(session.user.id, session.user.email);
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth State Changed:", event);
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      } else if (session?.user) {
        setUser(session.user);
        setLoading(true);
        await checkAdminStatus(session.user.id, session.user.email);
        setLoading(false);
      } else {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string, email?: string) => {
    try {
      console.log(`Checking clearance for: ${email}`);
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .maybeSingle(); 
      
      if (data?.is_admin) {
        console.log("Admin access confirmed via database metadata.");
        setIsAdmin(true);
        return;
      }

      // Security List Override
      const hardcodedAdmins = ['grapherkidd0@gmail.com', 'Andrewseba474@gmail.com', 'tzngondi1699@gmail.com'];
      if (email && hardcodedAdmins.some(admin => admin.toLowerCase() === email.toLowerCase())) {
        console.warn("Security override applied: Admin status granted via internal list.");
        setIsAdmin(true);

        // AUTO-PROMOTER: If the DB doesn't know they are admin yet, try to tell the DB.
        // This ensures the 'profiles' table stays in sync.
        if (!data?.is_admin) {
          console.log("Synchronizing admin status with database...");
          await supabase
            .from('profiles')
            .update({ is_admin: true })
            .eq('id', userId);
        }
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error("Admin check encountered an error, falling back to priority list:", err);
      const hardcodedAdmins = ['grapherkidd0@gmail.com', 'Andrewseba474@gmail.com', 'tzngondi1699@gmail.com'];
      if (email && hardcodedAdmins.some(admin => admin.toLowerCase() === email.toLowerCase())) {
        setIsAdmin(true);
      }
    }
  };

  return { user, loading, isAdmin };
}
