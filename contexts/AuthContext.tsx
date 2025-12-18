import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface Profile {
  id: string;
  email: string;
  role: 'gym_owner' | 'member' | 'admin' | 'super_admin';
  full_name?: string;
}

interface Gym {
  id: string;
  name: string;
  owner_id: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  gym: Gym | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshGym: () => Promise<void>;
  hasValidRole: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [gym, setGym] = useState<Gym | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (userId: string) => {
    if (!isSupabaseConfigured()) {
      setError('Supabase is not configured. Please check your environment variables.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If profile doesn't exist, that's okay - user might be new
        if (error.code === 'PGRST116') {
          console.log('Profile not found, user may be new');
          setProfile(null);
          setGym(null);
        } else {
          throw error;
        }
      } else {
        const profileData = data as Profile;
        setProfile(profileData);
        
        // Fetch gym only if user has valid role
        const validRoles = ['admin', 'super_admin', 'gym_owner'];
        if (validRoles.includes(profileData.role)) {
          await fetchGym(userId);
        } else {
          setGym(null);
        }
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setProfile(null);
      setGym(null);
      // Don't set error state for profile fetch failures - allow user to continue
    }
  };

  const fetchGym = async (userId: string) => {
    if (!isSupabaseConfigured()) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('gyms')
        .select('*')
        .eq('owner_id', userId)
        .maybeSingle();

      if (error) {
        // If no gym found, that's okay
        if (error.code === 'PGRST116') {
          setGym(null);
        } else {
          console.error('Error fetching gym:', error);
          setGym(null);
        }
      } else {
        setGym(data as Gym | null);
      }
    } catch (error: any) {
      console.error('Error fetching gym:', error);
      setGym(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const refreshGym = async () => {
    if (user) {
      await fetchGym(user.id);
    }
  };

  const hasValidRole = (): boolean => {
    if (!profile) return false;
    return profile.role === 'admin' || profile.role === 'super_admin' || profile.role === 'gym_owner';
  };

  useEffect(() => {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      setError('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
      setLoading(false);
      return;
    }

    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    // Set a timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.error('Auth initialization timeout');
        setError('Authentication is taking too long. Please check your Supabase configuration and network connection.');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    // Get initial session with timeout
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        clearTimeout(timeoutId);
        
        if (!mounted) return;

        if (error) {
          console.error('Error getting session:', error);
          setError(`Failed to initialize authentication: ${error.message}`);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
          // Fetch gym only if user has valid role (check profile state after fetch)
          // This will be handled by checking profile state, but we need to wait for it
          // So we'll fetch gym after profile is set
        }
        
        setLoading(false);
      } catch (err: any) {
        clearTimeout(timeoutId);
        console.error('Auth initialization error:', err);
        if (mounted) {
          setError(`Failed to initialize authentication: ${err.message || 'Unknown error'}`);
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      
      clearTimeout(timeoutId);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setGym(null);
      }
      
      setLoading(false);
    });

    return () => {
      clearTimeout(timeoutId);
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setGym(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        gym,
        loading,
        error,
        signIn,
        signOut,
        refreshProfile,
        refreshGym,
        hasValidRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
