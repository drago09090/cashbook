import { createClient } from '@supabase/supabase-js';

// These will be populated when Supabase is connected
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const businessCategories = [
  { id: 'agriculture', name: 'Agriculture', icon: '🚜', color: 'bg-green-100 text-green-600' },
  { id: 'construction', name: 'Construction', icon: '🏗️', color: 'bg-blue-100 text-blue-600' },
  { id: 'education', name: 'Education', icon: '📚', color: 'bg-indigo-100 text-indigo-600' },
  { id: 'electronics', name: 'Electronics', icon: '🔌', color: 'bg-purple-100 text-purple-600' },
  { id: 'financial', name: 'Financial Services', icon: '💰', color: 'bg-emerald-100 text-emerald-600' },
  { id: 'food', name: 'Food/Restaurant', icon: '🍽️', color: 'bg-orange-100 text-orange-600' },
  { id: 'fashion', name: 'Clothes/Fashion', icon: '👕', color: 'bg-pink-100 text-pink-600' },
  { id: 'hardware', name: 'Hardware', icon: '🔧', color: 'bg-gray-100 text-gray-600' },
  { id: 'jewellery', name: 'Jewellery', icon: '💎', color: 'bg-cyan-100 text-cyan-600' },
  { id: 'healthcare', name: 'Healthcare & Fitness', icon: '🏥', color: 'bg-red-100 text-red-600' },
  { id: 'grocery', name: 'Kirana/Grocery', icon: '🛒', color: 'bg-yellow-100 text-yellow-600' },
  { id: 'transport', name: 'Transport', icon: '🚛', color: 'bg-blue-100 text-blue-600' },
  { id: 'other', name: 'Other', icon: '📦', color: 'bg-gray-100 text-gray-600' },
];

export const businessTypes = [
  { id: 'retailer', name: 'Retailer', icon: '🏪', color: 'bg-blue-100 text-blue-600' },
  { id: 'distributor', name: 'Distributor', icon: '🚚', color: 'bg-green-100 text-green-600' },
  { id: 'manufacturer', name: 'Manufacturer', icon: '🏭', color: 'bg-purple-100 text-purple-600' },
  { id: 'service', name: 'Service Provider', icon: '🔧', color: 'bg-orange-100 text-orange-600' },
  { id: 'trader', name: 'Trader', icon: '📈', color: 'bg-emerald-100 text-emerald-600' },
  { id: 'other', name: 'Other', icon: '📦', color: 'bg-gray-100 text-gray-600' },
];