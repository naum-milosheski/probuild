-- ================================================================
-- CREATE TEST USERS (Admin & Client) - v4 (Constraint Safe)
-- Run this in the Supabase SQL Editor
-- ================================================================

-- 0. FIX SCHEMA (In case Migration 002 was missed)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'auth_id') THEN 
        ALTER TABLE public.clients ADD COLUMN auth_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Enable pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ================================================================
-- 1. ADMIN USER PREP
-- ================================================================

-- 1a. Create ADMIN in auth.users
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated', 'admin@test.com',
    crypt('admin', gen_salt('bf')),
    now(), '{"provider": "email", "providers": ["email"]}', '{}', now(), now(), '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

-- 1b. Create Identity
INSERT INTO auth.identities (
    id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    format('{"sub": "%s", "email": "admin@test.com"}', 'a0000000-0000-0000-0000-000000000001')::jsonb,
    'email', now(), now(), now()
) ON CONFLICT (id) DO NOTHING;

-- 1c. Create NEW Public User for Admin (Avoids PK update error)
INSERT INTO public.users (id, organization_id, email, full_name, role)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001', -- ProBuild Org
    'admin@test.com',
    'ProBuild Admin',
    'owner'
) ON CONFLICT (id) DO UPDATE 
SET email = 'admin@test.com';

-- 1d. REASSIGN ORDERS (Fixes Foreign Key Constraint)
UPDATE public.orders 
SET created_by = 'a0000000-0000-0000-0000-000000000001'
WHERE created_by = '00000000-0000-0000-0000-000000000010';

-- 1e. Cleanup Old Admin (Optional, safe now that orders are moved)
DELETE FROM public.users WHERE id = '00000000-0000-0000-0000-000000000010';


-- ================================================================
-- 2. CLIENT USER PREP
-- ================================================================

-- 2a. Create CLIENT in auth.users
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'c0000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated', 'client@test.com',
    crypt('client', gen_salt('bf')),
    now(), '{"provider": "email", "providers": ["email"]}', '{}', now(), now(), '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

-- 2b. Create Identity
INSERT INTO auth.identities (
    id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    format('{"sub": "%s", "email": "client@test.com"}', 'c0000000-0000-0000-0000-000000000001')::jsonb,
    'email', now(), now(), now()
) ON CONFLICT (id) DO NOTHING;

-- 2c. Link Client Demo Data
UPDATE public.clients 
SET auth_id = 'c0000000-0000-0000-0000-000000000001'
WHERE company_name = 'City Plumbers Inc';
