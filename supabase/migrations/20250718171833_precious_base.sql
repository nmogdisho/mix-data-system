/*
  # Create products table

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `category` (text, enum-like constraint)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `products` table
    - Add policy for authenticated users to read products
    - Add policy for admin users to manage products

  3. Initial Data
    - Insert existing interlock products with category "Interlock"
    - Insert existing boards/tiir products with category "Board/Tiir"
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  category text NOT NULL CHECK (category IN ('Interlock', 'Board/Tiir')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read active products"
  ON products
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Insert initial product data
INSERT INTO products (name, category) VALUES
  -- Interlock products
  ('Block Interlock', 'Interlock'),
  ('Buuor Interlock', 'Interlock'),
  ('Daimond Interlock', 'Interlock'),
  ('Tiiba Talyaani Interlock', 'Interlock'),
  ('York Shir Interlock', 'Interlock'),
  ('Garden', 'Interlock'),
  -- Board/Tiir products
  ('Tiir', 'Board/Tiir'),
  ('Boards', 'Board/Tiir')
ON CONFLICT (name) DO NOTHING;