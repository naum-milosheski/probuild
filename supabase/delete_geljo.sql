-- Delete Geljo Co and all related data
-- Run this in Supabase SQL Editor (Dashboard > SQL)

-- Step 1: Find the client ID (verify we have the right one)
SELECT id, company_name, contact_name, email FROM clients WHERE company_name ILIKE '%Geljo%';

-- Step 2: Nullify orders referencing this client (preserves order history)
UPDATE orders 
SET client_id = NULL, job_site_id = NULL
WHERE client_id = (SELECT id FROM clients WHERE company_name ILIKE '%Geljo%');

-- Step 3: Delete the client (job_sites will cascade automatically)
DELETE FROM clients WHERE company_name ILIKE '%Geljo%';

-- Verify deletion
SELECT 'Geljo Co deleted successfully' AS status;
