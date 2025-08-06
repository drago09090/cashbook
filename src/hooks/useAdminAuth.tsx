import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'admin';
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminSession();
  }, []);

  const checkAdminSession = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token with backend
      const { data, error } = await supabase
        .from('admin_sessions')
        .select(`
          admin_id,
          expires_at,
          admin_users (
            id,
            email,
            full_name,
            role,
            is_active,
            last_login,
            created_at,
            updated_at
          )
        `)
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data || !data.admin_users) {
        localStorage.removeItem('admin_token');
        setLoading(false);
        return;
      }

      setAdmin(data.admin_users as AdminUser);
    } catch (error) {
      console.error('Error checking admin session:', error);
      localStorage.removeItem('admin_token');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Demo credentials check
      if (email === 'admin@cashbook.com' && password === 'admin123') {
        // Create demo admin session
        const demoAdmin: AdminUser = {
          id: 'demo-admin-id',
          email: 'admin@cashbook.com',
          full_name: 'System Administrator',
          role: 'super_admin',
          is_active: true,
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const token = 'demo-admin-token-' + Date.now();
        localStorage.setItem('admin_token', token);
        setAdmin(demoAdmin);
        return;
      }

      // In a real implementation, you would hash the password and check against the database
      throw new Error('Invalid credentials');
    } catch (error) {
      console.error('Admin sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (token) {
        // In a real implementation, you would invalidate the token in the database
        localStorage.removeItem('admin_token');
      }
      setAdmin(null);
    } catch (error) {
      console.error('Admin sign out error:', error);
      throw error;
    }
  };

  return (
    <AdminAuthContext.Provider value={{
      admin,
      loading,
      signIn,
      signOut,
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}