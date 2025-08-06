import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Entry } from '../types';
import { useAuth } from './useAuth';

export function useEntries(bookId: string) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = async () => {
    if (!user || !bookId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('book_id', bookId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createEntry = async (entryData: Omit<Entry, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('entries')
        .insert([{
          ...entryData,
          user_id: user.id,
          book_id: bookId
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Add the new entry to the state immediately
      setEntries(prev => {
        // Check if entry already exists to avoid duplicates
        const exists = prev.some(entry => entry.id === data.id);
        if (exists) return prev;
        return [data, ...prev];
      });
      
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateEntry = async (id: string, updates: Partial<Entry>) => {
    try {
      const { data, error } = await supabase
        .from('entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setEntries(prev => prev.map(entry => entry.id === id ? data : entry));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const getBalance = () => {
    return entries.reduce((balance, entry) => {
      return entry.type === 'cash_in' 
        ? balance + Number(entry.amount)
        : balance - Number(entry.amount);
    }, 0);
  };

  const getCashIn = () => {
    return entries
      .filter(entry => entry.type === 'cash_in')
      .reduce((total, entry) => total + Number(entry.amount), 0);
  };

  const getCashOut = () => {
    return entries
      .filter(entry => entry.type === 'cash_out')
      .reduce((total, entry) => total + Number(entry.amount), 0);
  };

  useEffect(() => {
    fetchEntries();
  }, [user, bookId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!bookId || !user) return;

    const subscription = supabase
      .channel(`entries:${bookId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'entries',
          filter: `book_id=eq.${bookId}`
        }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setEntries(prev => {
              // Check if entry already exists to avoid duplicates
              const exists = prev.some(entry => entry.id === payload.new.id);
              if (exists) return prev;
              return [payload.new as Entry, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            setEntries(prev => prev.map(entry => 
              entry.id === payload.new.id ? payload.new as Entry : entry
            ));
          } else if (payload.eventType === 'DELETE') {
            setEntries(prev => prev.filter(entry => entry.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [bookId, user]);

  return {
    entries,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    getBalance,
    getCashIn,
    getCashOut,
    refetch: fetchEntries
  };
}