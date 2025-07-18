import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { MixData, FormData } from '../types';

// Mock data for demonstration
const mockMixData: MixData[] = [
  {
    id: '1',
    timestamp: new Date().toISOString(),
    mixType: 'interlock',
    measurements: {
      cement: 350,
      aggregate: 1200,
      sand: 800,
      water: 175,
      plastizer: 5,
      colorType: 'Red',
      colorQuantity: 25,
      products: [
        { type: 'Block Interlock', quantity: 100 },
        { type: 'Garden', quantity: 50 }
      ],
    },
    createdBy: 'demo-user',
    lastModified: new Date().toISOString(),
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    mixType: 'boards/tiir',
    measurements: {
      cement: 400,
      aggregate: 1100,
      sand: 750,
      water: 200,
      plastizer: 8,
      birta: 50,
      colorType: 'White',
      colorQuantity: 30,
      products: [
        { type: 'Tiir', quantity: 200 },
        { type: 'Boards', quantity: 150 }
      ],
    },
    createdBy: 'demo-user',
    lastModified: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Local storage key
const STORAGE_KEY = 'concrete-mix-data';

// Helper functions for local storage
const getStoredData = (): MixData[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : mockMixData;
  } catch {
    return mockMixData;
  }
};

const setStoredData = (data: MixData[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data to localStorage:', error);
  }
};

export const useMixData = (page = 1, pageSize = 25, filters?: any) => {
  return useQuery({
    queryKey: ['mixData', page, pageSize, filters],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let data = getStoredData();

      // Apply filters
      if (filters?.mixType) {
        data = data.filter(item => item.mixType === filters.mixType);
      }

      // Sort by timestamp (newest first)
      data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize;
      const paginatedData = data.slice(from, to);

      return {
        data: paginatedData,
        count: data.length,
        totalPages: Math.ceil(data.length / pageSize),
      };
    },
  });
};

export const useCreateMixData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const newMixData: MixData = {
        id: Date.now().toString(),
        mixType: formData.mixType,
        measurements: {
          cement: formData.cement,
          aggregate: formData.aggregate,
          sand: formData.sand,
          water: formData.water,
          plastizer: formData.plastizer,
          colorType: formData.colorType || 'No Color', // Default to "No Color" if empty
          colorQuantity: formData.colorQuantity,
          ...(formData.birta !== undefined && { birta: formData.birta }),
          ...(formData.products && { products: formData.products }),
        },
        createdBy: 'demo-user',
        timestamp: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      const existingData = getStoredData();
      const updatedData = [newMixData, ...existingData];
      setStoredData(updatedData);

      return newMixData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mixData'] });
    },
  });
};

export const useUpdateMixData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const existingData = getStoredData();
      const updatedData = existingData.map(item => {
        if (item.id === id) {
          return {
            ...item,
            mixType: formData.mixType,
            measurements: {
              cement: formData.cement,
              aggregate: formData.aggregate,
              sand: formData.sand,
              water: formData.water,
              plastizer: formData.plastizer,
              colorType: formData.colorType || 'No Color', // Default to "No Color" if empty
              colorQuantity: formData.colorQuantity,
              ...(formData.birta !== undefined && { birta: formData.birta }),
              ...(formData.products && { products: formData.products }),
            },
            lastModified: new Date().toISOString(),
          };
        }
        return item;
      });

      setStoredData(updatedData);
      return updatedData.find(item => item.id === id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mixData'] });
    },
  });
};

export const useDeleteMixData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const existingData = getStoredData();
      const updatedData = existingData.filter(item => item.id !== id);
      setStoredData(updatedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mixData'] });
    },
  });
};