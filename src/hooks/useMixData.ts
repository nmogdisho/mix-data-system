import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { MixData, FormData } from '../types';

// Transform database data to application format
const transformFromDatabase = (dbData: any): MixData => {
  return {
    id: dbData.id,
    timestamp: dbData.timestamp,
    mixType: dbData.mixtype,
    measurements: dbData.measurements,
    createdBy: dbData.createdby,
    lastModified: dbData.lastmodified,
  };
};

// Transform application data to database format
const transformToDatabase = (appData: FormData, userId: string) => {
  return {
    mixtype: appData.mixType,
    measurements: {
      cement: appData.cement,
      aggregate: appData.aggregate,
      sand: appData.sand,
      water: appData.water,
      plastizer: appData.plastizer,
      colorType: appData.colorType || 'No Color',
      colorQuantity: appData.colorQuantity,
      ...(appData.birta !== undefined && { birta: appData.birta }),
      ...(appData.products && { products: appData.products }),
    },
    createdby: userId,
  };
};

export const useMixData = (page = 1, pageSize = 25, filters?: any) => {
  return useQuery({
    queryKey: ['mixData', page, pageSize, filters],
    queryFn: async () => {
      let query = supabase
        .from('mix_data')
        .select('*')
        .order('timestamp', { ascending: false });

      // Apply filters
      if (filters?.mixType) {
        query = query.eq('mixtype', filters.mixType);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch mix data: ${error.message}`);
      }

      const transformedData = data?.map(transformFromDatabase) || [];

      return {
        data: transformedData,
        count: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    },
    retry: 3,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateMixData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      // Get current user (for now, use a demo user ID)
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'demo-user-id';

      const dbData = transformToDatabase(formData, userId);

      const { data, error } = await supabase
        .from('mix_data')
        .insert([dbData])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create mix data: ${error.message}`);
      }

      return transformFromDatabase(data);
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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'demo-user-id';

      const dbData = transformToDatabase(formData, userId);

      const { data, error } = await supabase
        .from('mix_data')
        .update({
          ...dbData,
          lastmodified: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update mix data: ${error.message}`);
      }

      return transformFromDatabase(data);
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
      const { error } = await supabase
        .from('mix_data')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete mix data: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mixData'] });
    },
  });
};