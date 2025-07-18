import { useQuery } from '@tanstack/react-query';
import { supabase, type Product, type Color } from '../lib/supabase';

// Fallback data for when database is not available
const fallbackProducts: Product[] = [
  { id: '1', name: 'Block Interlock', category: 'Interlock', is_active: true, created_at: new Date().toISOString() },
  { id: '2', name: 'Buuor Interlock', category: 'Interlock', is_active: true, created_at: new Date().toISOString() },
  { id: '3', name: 'Daimond Interlock', category: 'Interlock', is_active: true, created_at: new Date().toISOString() },
  { id: '4', name: 'Tiiba Talyaani Interlock', category: 'Interlock', is_active: true, created_at: new Date().toISOString() },
  { id: '5', name: 'York Shir Interlock', category: 'Interlock', is_active: true, created_at: new Date().toISOString() },
  { id: '6', name: 'Garden', category: 'Interlock', is_active: true, created_at: new Date().toISOString() },
  { id: '7', name: 'Tiir', category: 'Board/Tiir', is_active: true, created_at: new Date().toISOString() },
  { id: '8', name: 'Boards', category: 'Board/Tiir', is_active: true, created_at: new Date().toISOString() },
];

const fallbackColors: Color[] = [
  { id: '1', name: 'Red', hex_code: '#ef4444', is_active: true, created_at: new Date().toISOString() },
  { id: '2', name: 'Pure Red', hex_code: '#dc2626', is_active: true, created_at: new Date().toISOString() },
  { id: '3', name: 'White', hex_code: '#f8fafc', is_active: true, created_at: new Date().toISOString() },
  { id: '4', name: 'Black', hex_code: '#1f2937', is_active: true, created_at: new Date().toISOString() },
  { id: '5', name: 'Yellow', hex_code: '#eab308', is_active: true, created_at: new Date().toISOString() },
];

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<Product[]> => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) {
          console.warn('Failed to fetch products from database, using fallback data:', error);
          return fallbackProducts;
        }

        return data || fallbackProducts;
      } catch (error) {
        console.warn('Database connection failed, using fallback products:', error);
        return fallbackProducts;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1, // Only retry once for database calls
  });
};

export const useColors = () => {
  return useQuery({
    queryKey: ['colors'],
    queryFn: async (): Promise<Color[]> => {
      try {
        const { data, error } = await supabase
          .from('colors')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) {
          console.warn('Failed to fetch colors from database, using fallback data:', error);
          return fallbackColors;
        }

        return data || fallbackColors;
      } catch (error) {
        console.warn('Database connection failed, using fallback colors:', error);
        return fallbackColors;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1, // Only retry once for database calls
  });
};

// Helper functions to get categorized products
export const useInterlockProducts = () => {
  const { data: products, ...rest } = useProducts();
  return {
    ...rest,
    data: products?.filter(product => product.category === 'Interlock') || [],
  };
};

export const useBoardsTiirProducts = () => {
  const { data: products, ...rest } = useProducts();
  return {
    ...rest,
    data: products?.filter(product => product.category === 'Board/Tiir') || [],
  };
};