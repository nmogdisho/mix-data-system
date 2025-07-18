import { z } from 'zod';
import type { Product, Color } from './supabase';

// Fallback data for when database is not available
const fallbackColorOptions = [
  'Red',
  'Pure Red',
  'White',
  'Black',
  'Yellow'
] as const;

const fallbackInterlockTypes = [
  'Block Interlock',
  'Buuor Interlock',
  'Daimond Interlock',
  'Tiiba Talyaani Interlock',
  'York Shir Interlock',
  'Garden'
] as const;

const fallbackBoardsTiirTypes = [
  'Tiir',
  'Boards'
] as const;

// Helper functions to extract options from database data
export const getColorOptions = (colors: Color[]): string[] => {
  if (!colors || colors.length === 0) {
    return [...fallbackColorOptions];
  }
  return colors.map(color => color.name);
};

export const getInterlockTypes = (products: Product[]): string[] => {
  if (!products || products.length === 0) {
    return [...fallbackInterlockTypes];
  }
  return products
    .filter(product => product.category === 'Interlock')
    .map(product => product.name);
};

export const getBoardsTiirTypes = (products: Product[]): string[] => {
  if (!products || products.length === 0) {
    return [...fallbackBoardsTiirTypes];
  }
  return products
    .filter(product => product.category === 'Board/Tiir')
    .map(product => product.name);
};

// Product schema for both interlock and boards/tiir
const productSchema = z.object({
  type: z.string().min(1, 'Product type is required'),
  quantity: z.number().min(0, 'Quantity must be positive').max(9999, 'Quantity too large'),
});

// Form input type
export interface MixDataFormInput {
  mixType: 'interlock' | 'boards/tiir';
  cement: number;
  aggregate: number;
  sand: number;
  water: number;
  plastizer: number;
  birta?: number;
  colorType: string;
  colorQuantity: number;
  products: Array<{ type: string; quantity: number }>;
}

// Factory function to create schema with dynamic data
export const createMixDataSchema = (products: Product[] = [], colors: Color[] = []) => {
  const colorOptions = getColorOptions(colors);
  const interlockTypes = getInterlockTypes(products);
  const boardsTiirTypes = getBoardsTiirTypes(products);

  return z.object({
    mixType: z.enum(['interlock', 'boards/tiir']),
    cement: z.number().min(0).max(9999.99),
    aggregate: z.number().min(0).max(9999.99),
    sand: z.number().min(0).max(9999.99),
    water: z.number().min(0).max(9999.99),
    plastizer: z.number().min(0).max(9999.99),
    birta: z.number().min(0).max(9999).optional(),
    colorType: z.string(), // Allow empty string, will be transformed to "No Color"
    colorQuantity: z.number().min(0).max(9999.99),
    products: z.array(productSchema).min(1, 'At least one product is required'),
  }).refine((data) => {
    if (data.mixType === 'boards/tiir' && (data.birta === undefined || data.birta === null)) {
      return false;
    }
    return true;
  }, {
    message: "Birta is required for boards/tiir mix type",
    path: ['birta']
  }).refine((data) => {
    // Validate color type - allow empty string (will default to "No Color")
    return data.colorType === '' || colorOptions.includes(data.colorType);
  }, {
    message: "Invalid color type",
    path: ['colorType']
  }).refine((data) => {
    // Validate product types based on mix type
    if (data.products && data.products.length > 0) {
      if (data.mixType === 'interlock') {
        return data.products.every(product => 
          interlockTypes.includes(product.type)
        );
      } else if (data.mixType === 'boards/tiir') {
        return data.products.every(product => 
          boardsTiirTypes.includes(product.type)
        );
      }
    }
    return true;
  }, {
    message: "Invalid product type for selected mix type",
    path: ['products']
  }).refine((data) => {
    // Validate no duplicate interlock types
    if (data.mixType === 'interlock' && data.products && data.products.length > 0) {
      const types = data.products.map(p => p.type).filter(Boolean);
      const uniqueTypes = new Set(types);
      return types.length === uniqueTypes.size;
    }
    return true;
  }, {
    message: "Cannot select the same interlock type twice",
    path: ['products']
  }).refine((data) => {
    // Validate no duplicate boards/tiir types
    if (data.mixType === 'boards/tiir' && data.products && data.products.length > 0) {
      const types = data.products.map(p => p.type).filter(Boolean);
      const uniqueTypes = new Set(types);
      return types.length === uniqueTypes.size;
    }
    return true;
  }, {
    message: "Cannot select the same product type twice",
    path: ['products']
  });
};

// Default schema using fallback data for backward compatibility
export const mixDataSchema = createMixDataSchema();