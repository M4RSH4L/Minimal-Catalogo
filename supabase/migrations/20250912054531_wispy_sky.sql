/*
  # Add admin profiles and enhanced product management

  1. New Tables
    - `admin_profiles`
      - `user_id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `avatar_url` (text, optional)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Enhanced Products Table
    - Add `created_by` column to track which admin created the product
    - Add `updated_by` column to track last admin who modified it

  3. Security
    - Enable RLS on admin_profiles table
    - Add policies for profile management
    - Update product policies to include creator tracking
*/

-- Create admin_profiles table
CREATE TABLE IF NOT EXISTS admin_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add columns to products table for tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE products ADD COLUMN created_by uuid REFERENCES auth.users(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'updated_by'
  ) THEN
    ALTER TABLE products ADD COLUMN updated_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Enable RLS on admin_profiles
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage their own profile" ON admin_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON admin_profiles;

-- Admin profiles policies
CREATE POLICY "Admins can manage their own profile"
  ON admin_profiles
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    user_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can read all profiles"
  ON admin_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for admin_profiles updated_at
DROP TRIGGER IF EXISTS update_admin_profiles_updated_at ON admin_profiles;
CREATE TRIGGER update_admin_profiles_updated_at
  BEFORE UPDATE ON admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();