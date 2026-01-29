-- Add auth_id column to clients table to link Supabase Auth users
ALTER TABLE clients 
ADD COLUMN auth_id UUID REFERENCES auth.users(id);

-- Create index for fast lookups during login
CREATE INDEX clients_auth_id_idx ON clients(auth_id);

-- Add unique constraint to ensure one client profile per auth user
ALTER TABLE clients
ADD CONSTRAINT clients_auth_id_key UNIQUE (auth_id);

-- Update RLS policies to allow clients to view their own data
-- (These will be enabled in Phase 3, but defining them now is good practice)

-- Policy: Clients can view own profile
CREATE POLICY "Clients can view own profile"
  ON clients FOR SELECT
  USING (auth_id = auth.uid());

-- Policy: Clients can view own orders
CREATE POLICY "Clients can view own orders"
  ON orders FOR SELECT
  USING (client_id IN (
    SELECT id FROM clients WHERE auth_id = auth.uid()
  ));
