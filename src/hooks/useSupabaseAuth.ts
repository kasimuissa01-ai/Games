import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id).finally(() => {
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    }).catch(() => {
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setLoading(true);
        checkAdminStatus(session.user.id).finally(() => {
          setLoading(false);
        });
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle to avoid errors if not found
      
      if (error) throw error;

      if (data) {
        setIsAdmin(data.is_admin || false);
      } else {
        // Fallback for bootstrap
        const hardcodedAdmins = ['grapherkidd0@gmail.com', 'Andrewseba474@gmail.com'];
        const session = await supabase.auth.getSession();
        const email = session.data.session?.user?.email;
        if (email && hardcodedAdmins.includes(email)) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }
    } catch (err) {
      console.warn("Admin check failed - check if 'profiles' table exists", err);
      // Even if check fails, try hardcoded check
      const hardcodedAdmins = ['grapherkidd0@gmail.com', 'Andrewseba474@gmail.com'];
      const { data: { session } } = await supabase.auth.getSession();
      const email = session?.user?.email;
      if (email && hardcodedAdmins.includes(email)) {
        setIsAdmin(true);
      }
    }
  };

  return { user, loading, isAdmin };
}
