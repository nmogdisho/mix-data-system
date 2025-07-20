import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { InventoryProduct } from '../types';

// For now, we'll continue using localStorage for inventory products
// since they're not part of the main database schema
// This can be moved to database later if needed

const INVENTORY_STORAGE_KEY = 'inventory-products';

const getStoredInventoryProducts = (): InventoryProduct[] => {
  try {
    const stored = localStorage.getItem(INVENTORY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const setStoredInventoryProducts = (data: InventoryProduct[]) => {
  try {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save inventory products to localStorage:', error);
  }
};

export const useInventoryProducts = () => {
  return useQuery({
    queryKey: ['inventoryProducts'],
    queryFn: async () => {
      const data = getStoredInventoryProducts();
      data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return data;
    },
  });
};

export const useCreateInventoryProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData: { productType: string; color: string; quantity: number }) => {
      const newProduct: InventoryProduct = {
        id: Date.now().toString(),
        productType: productData.productType,
        color: productData.color,
        quantity: productData.quantity,
        timestamp: new Date().toISOString(),
        createdBy: 'demo-user',
      };

      const existingData = getStoredInventoryProducts();
      const updatedData = [newProduct, ...existingData];
      setStoredInventoryProducts(updatedData);

      return newProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryProducts'] });
    },
  });
};

export const useDeleteInventoryProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const existingData = getStoredInventoryProducts();
      const updatedData = existingData.filter(item => item.id !== id);
      setStoredInventoryProducts(updatedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryProducts'] });
    },
  });
};