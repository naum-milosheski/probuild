-- Seed Product Images
-- Updates specific products with their generated image assets

-- 1. Copper Pipe
UPDATE products 
SET image_url = '/images/products/copper-pipe.png'
WHERE sku LIKE 'COP%';

-- 2. PVC Elbow
UPDATE products 
SET image_url = '/images/products/pvc-elbow.png'
WHERE sku LIKE 'PVC-ELB%';

-- 3. Pipe Cutter
UPDATE products 
SET image_url = '/images/products/pipe-cutter.png'
WHERE sku = 'TOOL-CUTTER-M';

-- 4. Thermostat
UPDATE products 
SET image_url = '/images/products/thermostat.png'
WHERE sku LIKE 'THERMO%';

-- 5. Condenser Fan
UPDATE products 
SET image_url = '/images/products/condenser-fan.png'
WHERE sku = 'MOTOR-COND-1/4';

-- 6. Digital Manifold
UPDATE products 
SET image_url = '/images/products/digital-manifold.png'
WHERE sku = 'TOOL-MANIF-DG';
