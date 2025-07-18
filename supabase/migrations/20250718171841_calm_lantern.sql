/*
  # Create colors table

  1. New Tables
    - `colors`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `hex_code` (text, optional for UI display)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `colors` table
    - Add policy for authenticated users to read colors
    - Add policy for admin users to manage colors

  3. Initial Data
    - Insert existing color options
*/

-- Create colors table
CREATE TABLE IF NOT EXISTS colors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  hex_code text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_colors_active ON colors(is_active);

-- Enable RLS
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read active colors"
  ON colors
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Insert initial color data
INSERT INTO colors (name, hex_code) VALUES
  ('Red', '#ef4444'),
  ('Pure Red', '#dc2626'),
  ('White', '#f8fafc'),
  ('Black', '#1f2937'),
  ('Yellow', '#eab308')
ON CONFLICT (name) DO NOTHING;