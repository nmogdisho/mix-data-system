import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { InventoryProduct } from '../types';

// Local storage key for inventory products
const INVENTORY_STORAGE_KEY = 'inventory-products';

// Helper functions for local storage
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const data = getStoredInventoryProducts();
      
      // Sort by timestamp (newest first)
      data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      return data;
    },
  });
};

export const useCreateInventoryProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData: { productType: string; color: string; quantity: number }) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));

      const existingData = getStoredInventoryProducts();
      const updatedData = existingData.filter(item => item.id !== id);
      setStoredInventoryProducts(updatedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryProducts'] });
    },
  });
};