-- ProBuild Supply - DEVELOPMENT ONLY: Bypass RLS
-- Run this in Supabase SQL Editor to disable RLS for demo purposes
-- WARNING: Do NOT use in production! Re-enable RLS before deploying.

-- Disable RLS on all tables for demo mode
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_sites DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE magic_import_logs DISABLE ROW LEVEL SECURITY;

SELECT 'RLS disabled for demo mode. Remember to re-enable before production!' AS status;
