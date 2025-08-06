import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Book, Business } from '../types';
import { useAuth } from './useAuth';

export function useBooks(businessId?: string | null) {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      // If businessId is provided, filter by it
      if (businessId) {
        query = query.eq('business_id', businessId);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      setBooks(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  const createBook = async (name: string, business?: Business | null) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('books')
        .insert([{
          name,
          user_id: user.id,
          business_id: business?.id || null,
          business_name: business?.name || 'Business'
        }])
        .select()
        .single();

      if (error) throw error;
      setBooks(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateBook = async (id: string, updates: Partial<Book>) => {
    try {
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('books')
        .update(updatedData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Immediately update local state
      setBooks(prev => prev.map(book => book.id === id ? data : book));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const duplicateBook = async (id: string) => {
    const originalBook = books.find(book => book.id === id);
    if (!originalBook) throw new Error('Book not found');

    try {
      const { data, error } = await supabase
        .from('books')
        .insert([{
          name: `${originalBook.name} (Copy)`,
          user_id: originalBook.user_id,
          business_id: originalBook.business_id,
          business_name: originalBook.business_name
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Immediately update local state
      setBooks(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteBook = async (id: string) => {
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Immediately update local state
      setBooks(prev => prev.filter(book => book.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [user, businessId]);

  // Set up real-time subscription for books
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel(`books:${user.id}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'books',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newBook = payload.new as Book;
            // Only add if it matches the current business filter
            if (!businessId || newBook.business_id === businessId) {
              setBooks(prev => {
                // Check if book already exists to avoid duplicates
                const exists = prev.some(book => book.id === newBook.id);
                if (exists) return prev;
                return [newBook, ...prev];
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedBook = payload.new as Book;
            setBooks(prev => prev.map(book => 
              book.id === updatedBook.id ? updatedBook : book
            ));
          } else if (payload.eventType === 'DELETE') {
            setBooks(prev => prev.filter(book => book.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, businessId]);
  return {
    books,
    loading,
    error,
    createBook,
    updateBook,
    duplicateBook,
    deleteBook,
    refetch: fetchBooks
  };
}