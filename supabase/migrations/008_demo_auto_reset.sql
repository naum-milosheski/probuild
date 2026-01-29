-- ================================================================
-- DEMO AUTO-RESET SYSTEM
-- Resets all demo data to "Golden State" every 30 minutes
-- Requires pg_cron extension to be enabled in Supabase Dashboard
-- ================================================================

-- 1. Create Reset Log Table
CREATE TABLE IF NOT EXISTS demo_reset_log (
  id          SERIAL PRIMARY KEY,
  reset_at    TIMESTAMPTZ DEFAULT now(),
  status      TEXT NOT NULL,
  duration_ms INTEGER,
  error       TEXT
);

-- 2. Create the Reset Function
CREATE OR REPLACE FUNCTION reset_demo_data()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_time TIMESTAMPTZ := clock_timestamp();
  duration INTEGER;
BEGIN
  -- ========================================
  -- STEP 1: Truncate all tables (order matters for FK constraints)
  -- ========================================
  TRUNCATE TABLE 
    magic_import_logs,
    order_items,
    orders,
    job_sites,
    clients,
    products,
    categories,
    users,
    organizations
  CASCADE;

  -- ========================================
  -- STEP 2: Re-insert Golden State Data
  -- ========================================
  
  -- 2.1 Organization
  INSERT INTO organizations (id, name, slug, settings) VALUES 
    ('00000000-0000-0000-0000-000000000001', 'ProBuild Supply Co.', 'probuild', '{"tax_rate": 0.0825, "currency": "USD"}');

  -- 2.2 Admin User
  INSERT INTO users (id, organization_id, email, full_name, role) VALUES 
    ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'admin@test.com', 'ProBuild Admin', 'owner');

  -- 2.3 Categories
  INSERT INTO categories (id, organization_id, name, slug) VALUES 
    ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000001', 'Plumbing', 'plumbing'),
    ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'HVAC', 'hvac'),
    ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'Electrical', 'electrical'),
    ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', 'Tools & Equipment', 'tools');

  -- 2.4 Products (30 products)
  INSERT INTO products (id, organization_id, sku, name, description, category_id, unit, unit_price, cost_price, stock_qty, min_stock_qty, aliases, is_active, image_url) VALUES
    -- PLUMBING (10)
    ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'COP-050-L', '1/2" Copper Pipe Type L', 'Half inch copper pipe, Type L for water supply lines', '00000000-0000-0000-0000-000000000100', 'ft', 4.50, 2.80, 500, 100, ARRAY['half inch copper pipe', '1/2 copper', 'half-inch copper', '1/2" copper pipe'], true, '/images/products/copper-pipe.png'),
    ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'COP-075-L', '3/4" Copper Pipe Type L', 'Three quarter inch copper pipe, Type L', '00000000-0000-0000-0000-000000000100', 'ft', 6.75, 4.20, 400, 80, ARRAY['3/4 copper pipe', 'three quarter copper', '3/4" copper'], true, '/images/products/copper-pipe.png'),
    ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001', 'COP-100-L', '1" Copper Pipe Type L', 'One inch copper pipe, Type L for main lines', '00000000-0000-0000-0000-000000000100', 'ft', 12.50, 8.00, 200, 50, ARRAY['1 inch copper', 'one inch copper pipe', '1" copper'], true, '/images/products/copper-pipe.png'),
    ('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000001', 'PVC-ELB-050', '1/2" PVC 90° Elbow Sch40', 'Schedule 40 PVC 90 degree elbow, 1/2 inch', '00000000-0000-0000-0000-000000000100', 'each', 0.85, 0.35, 500, 100, ARRAY['half inch PVC elbow', 'PVC 90', '1/2 elbow', 'PVC elbow 90 deg'], true, '/images/products/pvc-elbow.png'),
    ('00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000001', 'PVC-ELB-075', '3/4" PVC 90° Elbow Sch40', 'Schedule 40 PVC 90 degree elbow, 3/4 inch', '00000000-0000-0000-0000-000000000100', 'each', 1.25, 0.55, 400, 75, ARRAY['3/4 PVC elbow', '3/4" elbow', 'PVC elbow'], true, '/images/products/pvc-elbow.png'),
    ('00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0000-000000000001', 'PVC-TEE-075', '3/4" PVC Tee Sch40', 'Schedule 40 PVC tee fitting, 3/4 inch', '00000000-0000-0000-0000-000000000100', 'each', 1.75, 0.80, 300, 60, ARRAY['3/4 PVC tee', 'PVC T fitting', '3/4" tee'], true, '/images/products/pvc-elbow.png'),
    ('00000000-0000-0000-0001-000000000007', '00000000-0000-0000-0000-000000000001', 'SHK-BITE-050', '1/2" SharkBite Coupling', 'Push-to-connect coupling, works with copper/PEX/CPVC', '00000000-0000-0000-0000-000000000100', 'each', 8.99, 5.50, 150, 30, ARRAY['sharkbite', 'push fit coupling', 'shark bite 1/2'], true, '/images/products/pvc-elbow.png'),
    ('00000000-0000-0000-0001-000000000008', '00000000-0000-0000-0000-000000000001', 'SHK-BITE-075', '3/4" SharkBite Coupling', 'Push-to-connect coupling, 3/4 inch', '00000000-0000-0000-0000-000000000100', 'each', 12.99, 8.00, 120, 25, ARRAY['3/4 sharkbite', 'shark bite coupling'], true, '/images/products/pvc-elbow.png'),
    ('00000000-0000-0000-0001-000000000009', '00000000-0000-0000-0000-000000000001', 'WTR-HTR-50G', 'Rheem 50 Gallon Water Heater', 'Rheem Performance 50 gal electric water heater', '00000000-0000-0000-0000-000000000100', 'each', 549.00, 380.00, 8, 3, ARRAY['water heater', 'hot water heater', '50 gallon', 'rheem water heater'], true, '/images/products/condenser-fan.png'),
    ('00000000-0000-0000-0001-000000000010', '00000000-0000-0000-0000-000000000001', 'FLXHSE-SS-24', '24" Stainless Steel Flex Hose', 'Braided stainless steel water supply line, 24 inch', '00000000-0000-0000-0000-000000000100', 'each', 12.99, 7.00, 75, 20, ARRAY['flex hose', 'water supply line', 'braided hose', 'stainless flex'], true, '/images/products/digital-manifold.png'),
    -- HVAC (12)
    ('00000000-0000-0000-0001-000000000011', '00000000-0000-0000-0000-000000000001', 'HVAC-FILT-20x20', '20x20x1 HVAC Air Filter MERV 8', 'Pleated air filter, 20x20x1 inch, MERV 8 rating', '00000000-0000-0000-0000-000000000101', 'each', 8.99, 4.50, 200, 50, ARRAY['20x20 filter', 'HVAC filter', 'air filter 20x20', 'furnace filter'], true, '/images/products/condenser-fan.png'),
    ('00000000-0000-0000-0001-000000000012', '00000000-0000-0000-0000-000000000001', 'HVAC-FILT-16x25', '16x25x1 HVAC Air Filter MERV 8', 'Pleated air filter, 16x25x1 inch, MERV 8 rating', '00000000-0000-0000-0000-000000000101', 'each', 9.99, 5.00, 175, 40, ARRAY['16x25 filter', 'air filter', '16x25x1'], true, '/images/products/condenser-fan.png'),
    ('00000000-0000-0000-0001-000000000013', '00000000-0000-0000-0000-000000000001', 'FLEX-DUCT-6', '6" Insulated Flexible Duct (25ft)', 'R-6 insulated flexible aluminum duct, 6 inch diameter', '00000000-0000-0000-0000-000000000101', 'roll', 45.99, 28.00, 35, 10, ARRAY['6 inch flex duct', 'flexible duct', '6" duct', 'flex duct'], true, '/images/products/copper-pipe.png'),
    ('00000000-0000-0000-0001-000000000014', '00000000-0000-0000-0000-000000000001', 'FLEX-DUCT-8', '8" Insulated Flexible Duct (25ft)', 'R-6 insulated flexible aluminum duct, 8 inch diameter', '00000000-0000-0000-0000-000000000101', 'roll', 59.99, 38.00, 25, 8, ARRAY['8 inch flex duct', '8" duct'], true, '/images/products/copper-pipe.png'),
    ('00000000-0000-0000-0001-000000000015', '00000000-0000-0000-0000-000000000001', 'THERMO-HW-T6', 'Honeywell T6 Pro Thermostat', 'Programmable thermostat with WiFi capability', '00000000-0000-0000-0000-000000000101', 'each', 129.99, 85.00, 24, 6, ARRAY['honeywell thermostat', 't6 thermostat', 'smart thermostat', 'wifi thermostat'], true, '/images/products/thermostat.png'),
    ('00000000-0000-0000-0001-000000000016', '00000000-0000-0000-0000-000000000001', 'THERMO-NEST-3', 'Nest Learning Thermostat 3rd Gen', 'Smart thermostat with auto-schedule and WiFi', '00000000-0000-0000-0000-000000000101', 'each', 249.99, 180.00, 12, 4, ARRAY['nest thermostat', 'nest 3rd gen', 'smart thermostat'], true, '/images/products/thermostat.png'),
    ('00000000-0000-0000-0001-000000000017', '00000000-0000-0000-0000-000000000001', 'REF-R410A-25', 'R-410A Refrigerant (25lb)', 'R-410A refrigerant, 25 pound cylinder', '00000000-0000-0000-0000-000000000101', 'tank', 189.99, 140.00, 18, 5, ARRAY['R410A', 'refrigerant', 'puron', '410A freon'], true, '/images/products/condenser-fan.png'),
    ('00000000-0000-0000-0001-000000000018', '00000000-0000-0000-0000-000000000001', 'COND-PUMP-LT', 'Little Giant Condensate Pump', 'Automatic condensate removal pump, 1/30 HP', '00000000-0000-0000-0000-000000000101', 'each', 79.99, 52.00, 20, 5, ARRAY['condensate pump', 'little giant', 'AC pump', 'drain pump'], true, '/images/products/condenser-fan.png'),
    ('00000000-0000-0000-0001-000000000019', '00000000-0000-0000-0000-000000000001', 'CAP-RUN-45', '45/5 MFD Run Capacitor', 'Dual run capacitor 45/5 MFD 440V for AC units', '00000000-0000-0000-0000-000000000101', 'each', 24.99, 14.00, 45, 10, ARRAY['run capacitor', '45/5 capacitor', 'AC capacitor', 'dual cap'], true, '/images/products/thermostat.png'),
    ('00000000-0000-0000-0001-000000000020', '00000000-0000-0000-0000-000000000001', 'MOTOR-COND-1/4', '1/4 HP Condenser Fan Motor', 'Universal replacement condenser fan motor', '00000000-0000-0000-0000-000000000101', 'each', 89.99, 55.00, 15, 4, ARRAY['condenser motor', 'fan motor', '1/4 HP motor', 'AC motor'], true, '/images/products/condenser-fan.png'),
    ('00000000-0000-0000-0001-000000000021', '00000000-0000-0000-0000-000000000001', 'LNSET-3/8-50', '3/8" x 3/4" Lineset 50ft', 'Pre-charged insulated copper lineset for mini splits', '00000000-0000-0000-0000-000000000101', 'set', 149.99, 95.00, 12, 3, ARRAY['lineset', 'mini split line', 'copper lineset', 'AC line set'], true, '/images/products/copper-pipe.png'),
    ('00000000-0000-0000-0001-000000000022', '00000000-0000-0000-0000-000000000001', 'PAD-COND-24x24', '24x24 Condenser Pad', 'Plastic condenser mounting pad, 24x24 inch', '00000000-0000-0000-0000-000000000101', 'each', 34.99, 20.00, 25, 8, ARRAY['condenser pad', 'AC pad', 'equipment pad', 'unit pad'], true, '/images/products/condenser-fan.png'),
    -- ELECTRICAL (5)
    ('00000000-0000-0000-0001-000000000023', '00000000-0000-0000-0000-000000000001', 'WNC-RED-100', 'Red Wire Nuts (100 pack)', 'Red wire connectors for 10-14 AWG wire, box of 100', '00000000-0000-0000-0000-000000000102', 'box', 12.99, 7.50, 85, 20, ARRAY['red wire nuts', 'wire connectors', 'red caps', '3M red wire nuts'], true, '/images/products/thermostat.png'),
    ('00000000-0000-0000-0001-000000000024', '00000000-0000-0000-0000-000000000001', 'WNC-YEL-100', 'Yellow Wire Nuts (100 pack)', 'Yellow wire connectors for 12-18 AWG wire, box of 100', '00000000-0000-0000-0000-000000000102', 'box', 11.99, 6.50, 90, 20, ARRAY['yellow wire nuts', 'yellow caps', 'wire nuts'], true, '/images/products/thermostat.png'),
    ('00000000-0000-0000-0001-000000000025', '00000000-0000-0000-0000-000000000001', 'ROM-12-2-250', 'Romex 12/2 NM-B Wire (250ft)', '12/2 Non-metallic sheathed cable with ground', '00000000-0000-0000-0000-000000000102', 'roll', 189.99, 145.00, 18, 5, ARRAY['romex 12/2', '12-2 romex', '12/2 wire', '12/2 NM-B', 'electric wire'], true, '/images/products/digital-manifold.png'),
    ('00000000-0000-0000-0001-000000000026', '00000000-0000-0000-0000-000000000001', 'ROM-14-2-250', 'Romex 14/2 NM-B Wire (250ft)', '14/2 Non-metallic sheathed cable with ground', '00000000-0000-0000-0000-000000000102', 'roll', 149.99, 110.00, 22, 6, ARRAY['romex 14/2', '14-2 romex', '14/2 wire'], true, '/images/products/digital-manifold.png'),
    ('00000000-0000-0000-0001-000000000027', '00000000-0000-0000-0000-000000000001', 'TAPE-ELEC-BLK', 'Black Electrical Tape (10 pack)', '3/4" x 60ft vinyl electrical tape, 10 roll pack', '00000000-0000-0000-0000-000000000102', 'pack', 14.99, 8.00, 60, 15, ARRAY['electrical tape', 'black tape', 'vinyl tape', 'e-tape'], true, '/images/products/pipe-cutter.png'),
    -- TOOLS (3)
    ('00000000-0000-0000-0001-000000000028', '00000000-0000-0000-0000-000000000001', 'TOOL-CUTTER-M', 'Ridgid Copper Tube Cutter', 'Heavy duty copper and brass tube cutter, 1/8" to 1"', '00000000-0000-0000-0000-000000000103', 'each', 34.99, 22.00, 15, 4, ARRAY['tube cutter', 'pipe cutter', 'copper cutter', 'ridgid cutter'], true, '/images/products/pipe-cutter.png'),
    ('00000000-0000-0000-0001-000000000029', '00000000-0000-0000-0000-000000000001', 'TOOL-TORCH-KT', 'Bernzomatic Torch Kit', 'Self-igniting propane torch with trigger start', '00000000-0000-0000-0000-000000000103', 'each', 44.99, 28.00, 12, 3, ARRAY['torch', 'propane torch', 'bernzomatic', 'soldering torch'], true, '/images/products/pipe-cutter.png'),
    ('00000000-0000-0000-0001-000000000030', '00000000-0000-0000-0000-000000000001', 'TOOL-MANIF-DG', 'Digital Manifold Gauge Set', '4-port digital manifold with vacuum gauge and hoses', '00000000-0000-0000-0000-000000000103', 'each', 289.99, 195.00, 6, 2, ARRAY['manifold gauges', 'HVAC gauges', 'digital manifold', 'gauge set'], true, '/images/products/digital-manifold.png');

  -- 2.5 Clients (3 companies)
  INSERT INTO clients (id, organization_id, company_name, contact_name, email, phone, credit_limit, payment_terms, notes, auth_id) VALUES
    ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001', 'BuildRight Construction', 'Mike Rodriguez', 'mike@buildright.com', '(555) 234-5678', 25000.00, 30, 'Large general contractor, always pays on time', NULL),
    ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001', 'City Plumbers Inc', 'Sarah Chen', 'sarah@cityplumbers.com', '(555) 345-6789', 50000.00, 45, 'Established plumbing company, high volume customer', 'c0000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0000-000000000001', 'Comfort Zone HVAC', 'James Wilson', 'james@comfortzonehvac.com', '(555) 456-7890', 35000.00, 30, 'HVAC specialists, mostly AC installs and repairs', NULL);

  -- 2.6 Job Sites (6 sites)
  INSERT INTO job_sites (id, client_id, name, address, city, state, zip, is_active) VALUES
    ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0002-000000000001', 'Downtown Office Tower', '123 Main St', 'Austin', 'TX', '78701', true),
    ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0002-000000000001', 'Riverside Apartments', '456 River Rd', 'Austin', 'TX', '78702', true),
    ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0002-000000000002', 'Central Mall Renovation', '789 Commerce Blvd', 'Austin', 'TX', '78703', true),
    ('00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0002-000000000002', 'Medical Center Phase 2', '321 Hospital Dr', 'Austin', 'TX', '78704', true),
    ('00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0002-000000000003', 'Smith Residence', '555 Oak Lane', 'Austin', 'TX', '78705', true),
    ('00000000-0000-0000-0003-000000000006', '00000000-0000-0000-0002-000000000003', 'Tech Campus Building C', '777 Innovation Way', 'Austin', 'TX', '78758', true);

  -- 2.7 Orders (5 orders with dynamic timestamps)
  INSERT INTO orders (id, organization_id, client_id, job_site_id, order_number, status, subtotal, tax_amount, total, notes, source, created_by, created_at) VALUES
    ('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0003-000000000001', 'ORD-2024-001', 'delivered', 1247.50, 102.92, 1350.42, 'Rush order for downtown project', 'manual', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '3 days'),
    ('00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0003-000000000003', 'ORD-2024-002', 'ready', 3456.75, 285.18, 3741.93, 'Mall renovation plumbing supplies', 'magic_import', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '2 days'),
    ('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0003-000000000005', 'ORD-2024-003', 'in_progress', 892.45, 73.63, 966.08, 'Residential AC repair parts', 'magic_import', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 day'),
    ('00000000-0000-0000-0004-000000000004', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0003-000000000002', 'ORD-2024-004', 'pending', 2150.00, 177.38, 2327.38, 'Apartment complex rough-in materials', 'manual', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '6 hours'),
    ('00000000-0000-0000-0004-000000000005', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0003-000000000004', 'ORD-2024-005', 'confirmed', 5678.90, 468.51, 6147.41, 'Hospital expansion - Phase 2 plumbing', 'magic_import', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '4 hours');

  -- 2.8 Order Items (15 line items)
  INSERT INTO order_items (order_id, product_id, sku, name, quantity, unit, unit_price, line_total, ai_confidence) VALUES
    -- Order 1
    ('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0001-000000000002', 'COP-075-L', '3/4" Copper Pipe Type L', 100, 'ft', 6.75, 675.00, NULL),
    ('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0001-000000000005', 'PVC-ELB-075', '3/4" PVC 90° Elbow Sch40', 50, 'each', 1.25, 62.50, NULL),
    ('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0001-000000000008', 'SHK-BITE-075', '3/4" SharkBite Coupling', 20, 'each', 12.99, 259.80, NULL),
    ('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0001-000000000010', 'FLXHSE-SS-24', '24" Stainless Steel Flex Hose', 10, 'each', 12.99, 129.90, NULL),
    -- Order 2
    ('00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0001-000000000001', 'COP-050-L', '1/2" Copper Pipe Type L', 300, 'ft', 4.50, 1350.00, 0.95),
    ('00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0001-000000000003', 'COP-100-L', '1" Copper Pipe Type L', 75, 'ft', 12.50, 937.50, 0.92),
    ('00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0001-000000000009', 'WTR-HTR-50G', 'Rheem 50 Gallon Water Heater', 2, 'each', 549.00, 1098.00, 0.88),
    -- Order 3
    ('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0001-000000000019', 'CAP-RUN-45', '45/5 MFD Run Capacitor', 2, 'each', 24.99, 49.98, 0.97),
    ('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0001-000000000020', 'MOTOR-COND-1/4', '1/4 HP Condenser Fan Motor', 1, 'each', 89.99, 89.99, 0.91),
    ('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0001-000000000017', 'REF-R410A-25', 'R-410A Refrigerant (25lb)', 2, 'tank', 189.99, 379.98, 0.94),
    ('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0001-000000000011', 'HVAC-FILT-20x20', '20x20x1 HVAC Air Filter MERV 8', 6, 'each', 8.99, 53.94, 0.99),
    -- Order 4
    ('00000000-0000-0000-0004-000000000004', '00000000-0000-0000-0001-000000000025', 'ROM-12-2-250', 'Romex 12/2 NM-B Wire (250ft)', 4, 'roll', 189.99, 759.96, NULL),
    ('00000000-0000-0000-0004-000000000004', '00000000-0000-0000-0001-000000000026', 'ROM-14-2-250', 'Romex 14/2 NM-B Wire (250ft)', 6, 'roll', 149.99, 899.94, NULL),
    ('00000000-0000-0000-0004-000000000004', '00000000-0000-0000-0001-000000000023', 'WNC-RED-100', 'Red Wire Nuts (100 pack)', 10, 'box', 12.99, 129.90, NULL),
    ('00000000-0000-0000-0004-000000000004', '00000000-0000-0000-0001-000000000024', 'WNC-YEL-100', 'Yellow Wire Nuts (100 pack)', 10, 'box', 11.99, 119.90, NULL),
    -- Order 5
    ('00000000-0000-0000-0004-000000000005', '00000000-0000-0000-0001-000000000002', 'COP-075-L', '3/4" Copper Pipe Type L', 500, 'ft', 6.75, 3375.00, 0.96),
    ('00000000-0000-0000-0004-000000000005', '00000000-0000-0000-0001-000000000007', 'SHK-BITE-050', '1/2" SharkBite Coupling', 100, 'each', 8.99, 899.00, 0.93),
    ('00000000-0000-0000-0004-000000000005', '00000000-0000-0000-0001-000000000009', 'WTR-HTR-50G', 'Rheem 50 Gallon Water Heater', 2, 'each', 549.00, 1098.00, 0.90);

  -- ========================================
  -- STEP 3: Log the reset
  -- ========================================
  duration := EXTRACT(MILLISECONDS FROM clock_timestamp() - start_time)::INTEGER;
  
  INSERT INTO demo_reset_log (status, duration_ms)
  VALUES ('success', duration);

  RETURN 'Demo data reset successfully in ' || duration || 'ms';

EXCEPTION WHEN OTHERS THEN
  INSERT INTO demo_reset_log (status, error)
  VALUES ('failed', SQLERRM);
  RAISE;
END;
$$;

-- 3. Schedule the Cron Job (runs every 30 minutes)
-- First, clean up any existing job with the same name
SELECT cron.unschedule('reset-demo-data') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'reset-demo-data'
);

SELECT cron.schedule(
  'reset-demo-data',           -- Job name
  '*/30 * * * *',              -- Every 30 minutes
  $$SELECT reset_demo_data()$$  -- SQL to execute
);

-- 4. Verify Setup
SELECT 'Demo auto-reset system installed!' AS status,
       (SELECT COUNT(*) FROM cron.job WHERE jobname = 'reset-demo-data') AS cron_job_created;
