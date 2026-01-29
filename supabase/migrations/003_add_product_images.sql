-- Add image_url to products table
ALTER TABLE products 
ADD COLUMN image_url TEXT;

-- Update existing demo products with placeholder logic (will be overwritten by specific updates later)
-- For now just leave them null
