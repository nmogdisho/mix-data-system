import { useQuery } from '@tanstack/react-query';
import { supabase, type Product, type Color } from '../lib/supabase';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw new Error(`Failed to fetch products: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
  });
};

export const useColors = () => {
  return useQuery({
    queryKey: ['colors'],
    queryFn: async (): Promise<Color[]> => {
      const { data, error } = await supabase
        .from('colors')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw new Error(`Failed to fetch colors: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
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