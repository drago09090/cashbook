import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session without auto-fetching profile
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Fetch full user profile
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No user profile found, create one
          const { data: authUser } = await supabase.auth.getUser();
          if (authUser.user) {
            const newUser = {
              id: authUser.user.id,
              email: authUser.user.email!,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            
            const { data: createdUser, error: createError } = await supabase
              .from('users')
              .insert([newUser])
              .select()
              .single();
              
            if (createError) {
              console.error('Error creating user profile:', createError);
              return;
            }
            
            setUser(createdUser);
          }
          return;
        }
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data) {
        setUser(data);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in signIn:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: window.location.origin + '/welcome'
        }
      });
      
      if (error) {
        console.error('Sign up error:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in signUp:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in signOut:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('users')
        .update(updatedData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
      
      setUser(data);
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}