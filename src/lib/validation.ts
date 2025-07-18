import { z } from 'zod';

// Define unified color options for both mix types (removed "No Color" from selectable options)
export const colorOptions = [
  'Red',
  'Pure Red',
  'White',
  'Black',
  'Yellow'
] as const;

// Define interlock types
export const interlockTypes = [
  'Block Interlock',
  'Buuor Interlock',
  'Daimond Interlock',
  'Tiiba Talyaani Interlock',
  'York Shir Interlock',
  'Garden'
] as const;

// Define boards/tiir types
export const boardsTiirTypes = [
  'Tiir',
  'Boards'
] as const;

// Product schema for both interlock and boards/tiir
const productSchema = z.object({
  type: z.string().min(1, 'Product type is required'),
  quantity: z.number().min(0, 'Quantity must be positive').max(9999, 'Quantity too large'),
});

export const mixDataSchema = z.object({
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
  return data.colorType === '' || colorOptions.includes(data.colorType as any);
}, {
  message: "Invalid color type",
  path: ['colorType']
}).refine((data) => {
  // Validate product types based on mix type
  if (data.products && data.products.length > 0) {
    if (data.mixType === 'interlock') {
      return data.products.every(product => 
        interlockTypes.includes(product.type as any)
      );
    } else if (data.mixType === 'boards/tiir') {
      return data.products.every(product => 
        boardsTiirTypes.includes(product.type as any)
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

export type MixDataFormInput = z.infer<typeof mixDataSchema>;