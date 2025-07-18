export interface MixData {
  id: string;
  timestamp: string;
  mixType: 'interlock' | 'boards/tiir';
  measurements: {
    cement: number;
    aggregate: number;
    sand: number;
    water: number;
    plastizer: number;
    birta?: number; // Optional for boards/tiir
    colorType: string;
    colorQuantity: number;
    products?: Product[];
  };
  createdBy: string;
  lastModified: string;
}

export interface Product {
  type: string;
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

export interface FormData {
  mixType: 'interlock' | 'boards/tiir';
  cement: number;
  aggregate: number;
  sand: number;
  water: number;
  plastizer: number;
  birta?: number;
  colorType: string;
  colorQuantity: number;
  products?: Product[];
}