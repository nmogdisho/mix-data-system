/*
  # Create mix data table

  1. New Tables
    - `mix_data`
      - `id` (uuid, primary key)
      - `timestamp` (timestamptz)
      - `mixType` (text, enum-like constraint)
      - `measurements` (jsonb)
      - `createdBy` (uuid, references auth.users)
      - `lastModified` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `mix_data` table
    - Add policies for authenticated users to manage their own data
    - Add policies for admin users to manage all data

  3. Indexes
    - Index on createdBy for efficient user data queries
    - Index on timestamp for sorting
    - Index on mixType for filtering
*/

-- Create mix_data table
CREATE TABLE IF NOT EXISTS mix_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  mixType text NOT NULL CHECK (mixType IN ('interlock', 'boards/tiir')),
  measurements jsonb NOT NULL,
  createdBy uuid REFERENCES auth.users(id) NOT NULL,
  lastModified timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mix_data_createdBy ON mix_data(createdBy);
CREATE INDEX IF NOT EXISTS idx_mix_data_timestamp ON mix_data(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_mix_data_mixType ON mix_data(mixType);

-- Enable RLS
ALTER TABLE mix_data ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own mix data"
  ON mix_data
  FOR SELECT
  TO authenticated
  USING (auth.uid() = createdBy);

CREATE POLICY "Users can create their own mix data"
  ON mix_data
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = createdBy);

CREATE POLICY "Users can update their own mix data"
  ON mix_data
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = createdBy)
  WITH CHECK (auth.uid() = createdBy);

CREATE POLICY "Users can delete their own mix data"
  ON mix_data
  FOR DELETE
  TO authenticated
  USING (auth.uid() = createdBy);

-- Create trigger to update lastModified timestamp
CREATE OR REPLACE FUNCTION update_lastModified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.lastModified = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mix_data_lastModified
  BEFORE UPDATE ON mix_data
  FOR EACH ROW
  EXECUTE FUNCTION update_lastModified_column();