import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table types
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

export interface DatabaseMixData {
  id: string;
  timestamp: string;
  mixtype: 'interlock' | 'boards/tiir';
  measurements: {
    cement: number;
    aggregate: number;
    sand: number;
    water: number;
    plastizer: number;
    birta?: number;
    colorType: string;
    colorQuantity: number;
    products?: Array<{ type: string; quantity: number }>;
  };
  createdby: string;
  lastmodified: string;
  created_at: string;
}