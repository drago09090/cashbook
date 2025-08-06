import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Business } from '../types';
import { useAuth } from './useAuth';

export function useBusinesses() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinesses = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setBusinesses(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  const createBusiness = async (businessData: {
    name: string;
    category: string[];
    type: string;
  }) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('businesses')
        .insert([{
          name: businessData.name,
          category: businessData.category,
          type: businessData.type,
          owner_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Immediately update local state
      setBusinesses(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateBusiness = async (id: string, updates: Partial<Business>) => {
    try {
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('businesses')
        .update(updatedData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Immediately update local state
      setBusinesses(prev => prev.map(business => 
        business.id === id ? data : business
      ));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteBusiness = async (id: string) => {
    try {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Immediately update local state
      setBusinesses(prev => prev.filter(business => business.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [user]);

  // Set up real-time subscription for businesses
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel(`businesses:${user.id}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'businesses',
          filter: `owner_id=eq.${user.id}`
        }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newBusiness = payload.new as Business;
            setBusinesses(prev => {
              // Check if business already exists to avoid duplicates
              const exists = prev.some(business => business.id === newBusiness.id);
              if (exists) return prev;
              return [newBusiness, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedBusiness = payload.new as Business;
            setBusinesses(prev => prev.map(business => 
              business.id === updatedBusiness.id ? updatedBusiness : business
            ));
          } else if (payload.eventType === 'DELETE') {
            setBusinesses(prev => prev.filter(business => business.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);
  return {
    businesses,
    loading,
    error,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    refetch: fetchBusinesses
  };
}