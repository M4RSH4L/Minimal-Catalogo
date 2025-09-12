/*
  # Add description field to products table

  1. Changes
    - Add `description` column to products table (text, optional)
    - Update existing policies to include description field
  
  2. Security
    - Maintains existing RLS policies
    - No changes to security model
*/

-- Add description column to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'description'
  ) THEN
    ALTER TABLE products ADD COLUMN description text;
  END IF;
END $$;