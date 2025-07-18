import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface Product {
  id: string;
  name: string;
  category: 'Interlock' | 'Board/Tiir';
  is_active: boolean;
  created_at: string;
}

export interface Color {
  id: string;
  name: string;
  hex_code: string | null;
  is_active: boolean;
  created_at: string;
}