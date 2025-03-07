
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface ProfileType {
  id: string;
  username?: string;
  full_name?: string;
  description?: string;
  location?: string;
  website_url?: string;
  avatar_url?: string;
  hide_avatar?: boolean;
  updated_at?: string;
  created_at?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User & { profile?: ProfileType } | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User & { profile?: ProfileType } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getInitialSession() {
      setIsLoading(true);
      
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
      }
      
      setSession(session);
      
      if (session?.user) {
        const userWithProfile = { ...session.user };
        await fetchProfile(session.user.id, userWithProfile);
        setUser(userWithProfile);
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    }

    getInitialSession();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          const userWithProfile = { ...session.user };
          await fetchProfile(session.user.id, userWithProfile);
          setUser(userWithProfile);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function fetchProfile(userId: string, userObj: User & { profile?: ProfileType }) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      userObj.profile = data;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user);
      // Force a re-render by creating a new user object
      setUser({ ...user });
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    isLoading,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
