-- ================================================================
-- FIX CLIENT RLS POLICIES
-- Run this in Supabase SQL Editor to fix "Access Denied" for Clients
-- ================================================================

-- 1. Ensure Index exists for performance
CREATE INDEX IF NOT EXISTS clients_auth_id_idx ON clients(auth_id);

-- 2. Ensure Unique Constraint exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'clients_auth_id_key'
    ) THEN
        ALTER TABLE clients ADD CONSTRAINT clients_auth_id_key UNIQUE (auth_id);
    END IF;
END $$;

-- 3. DROP Existing Policies (to avoid conflicts if re-running)
DROP POLICY IF EXISTS "Clients can view own profile" ON clients;
DROP POLICY IF EXISTS "Clients can view own orders" ON orders;
DROP POLICY IF EXISTS "Clients can view own job sites" ON job_sites;

-- 4. CREATE Policy: Clients can view own profile
CREATE POLICY "Clients can view own profile"
  ON clients FOR SELECT
  USING (auth_id = auth.uid());

-- 5. CREATE Policy: Clients can view their own orders
-- (Checks if the order belongs to a client that is linked to the current user)
CREATE POLICY "Clients can view own orders"
  ON orders FOR SELECT
  USING (client_id IN (
    SELECT id FROM clients WHERE auth_id = auth.uid()
  ));

-- 6. CREATE Policy: Clients can view their own job sites
CREATE POLICY "Clients can view own job sites"
  ON job_sites FOR SELECT
  USING (client_id IN (
    SELECT id FROM clients WHERE auth_id = auth.uid()
  ));

-- 7. Grant permissions just in case
GRANT SELECT ON clients TO authenticated;
GRANT SELECT ON orders TO authenticated;
GRANT SELECT ON job_sites TO authenticated;
GRANT SELECT ON order_items TO authenticated;
GRANT SELECT ON products TO authenticated; -- Clients need to see products too
