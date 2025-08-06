import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Invoice, InvoiceItem } from '../types';
import { useAuth } from './useAuth';

export function useInvoices(bookId?: string) {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('invoices')
        .select(`
          *,
          items:invoice_items(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (bookId) {
        query = query.eq('book_id', bookId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setInvoices(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceNumber = async () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Get the count of invoices for this user this month
    const { count } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id)
      .gte('created_at', `${year}-${month}-01`)
      .lt('created_at', `${year}-${month === '12' ? year + 1 : year}-${month === '12' ? '01' : String(parseInt(month) + 1).padStart(2, '0')}-01`);

    const invoiceNumber = `INV-${year}${month}-${String((count || 0) + 1).padStart(4, '0')}`;
    return invoiceNumber;
  };

  const createInvoice = async (invoiceData: Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'invoice_number'>, items: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>[]) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const invoice_number = await generateInvoiceNumber();
      
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
          ...invoiceData,
          invoice_number,
          user_id: user.id
        }])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Insert invoice items
      if (items.length > 0) {
        const itemsWithInvoiceId = items.map(item => ({
          ...item,
          invoice_id: invoice.id
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsWithInvoiceId);

        if (itemsError) throw itemsError;
      }

      // Immediately update local state with the new invoice and items
      const newInvoice = { ...invoice, items };
      setInvoices(prev => [newInvoice, ...prev]);
      
      return invoice;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>, items?: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>[]) => {
    try {
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('invoices')
        .update(updatedData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update items if provided
      if (items) {
        // Delete existing items
        await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', id);

        // Insert new items
        if (items.length > 0) {
          const itemsWithInvoiceId = items.map(item => ({
            ...item,
            invoice_id: id
          }));

          const { error: itemsError } = await supabase
            .from('invoice_items')
            .insert(itemsWithInvoiceId);

          if (itemsError) throw itemsError;
        }
      }

      // Immediately update local state
      const updatedInvoice = { ...data, items: items || [] };
      setInvoices(prev => prev.map(invoice => 
        invoice.id === id ? updatedInvoice : invoice
      ));
      
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Immediately update local state
      setInvoices(prev => prev.filter(invoice => invoice.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const sendInvoice = async (id: string, email: string) => {
    try {
      // Update invoice status to sent
      await updateInvoice(id, { status: 'sent' });
      
      // Here you would integrate with an email service
      // For now, we'll just simulate sending
      console.log(`Invoice ${id} sent to ${email}`);
      
      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [user, bookId]);

  // Set up real-time subscription for invoices
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel(`invoices:${user.id}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'invoices',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newInvoice = payload.new as Invoice;
            // Only add if it matches the current book filter
            if (!bookId || newInvoice.book_id === bookId) {
              setInvoices(prev => {
                // Check if invoice already exists to avoid duplicates
                const exists = prev.some(invoice => invoice.id === newInvoice.id);
                if (exists) return prev;
                return [newInvoice, ...prev];
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedInvoice = payload.new as Invoice;
            setInvoices(prev => prev.map(invoice => 
              invoice.id === updatedInvoice.id ? updatedInvoice : invoice
            ));
          } else if (payload.eventType === 'DELETE') {
            setInvoices(prev => prev.filter(invoice => invoice.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, bookId]);
  return {
    invoices,
    loading,
    error,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    sendInvoice,
    refetch: fetchInvoices
  };
}