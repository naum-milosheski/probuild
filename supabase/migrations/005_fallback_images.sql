-- Fallback Images
-- Maps products without specific images to the closest available existing asset
-- because we hit the image generation rate limit.

-- 1. PVC Tee & SharkBite -> PVC Elbow Image
UPDATE products 
SET image_url = '/images/products/pvc-elbow.png'
WHERE (sku LIKE 'PVC-TEE%' OR sku LIKE 'SHK-BITE%') AND image_url IS NULL;

-- 2. Water Heater, Filter, Pump, Tank -> Condenser Fan Image (Heavy Equipment)
UPDATE products 
SET image_url = '/images/products/condenser-fan.png'
WHERE (sku LIKE 'WTR-HTR%' OR sku LIKE 'HVAC-FILT%' OR sku LIKE 'COND-PUMP%' OR sku LIKE 'REF-R410A%' OR sku LIKE 'PAD-COND%') AND image_url IS NULL;

-- 3. Flex Hose, Romex -> Digital Manifold Image (Hoses/Wires)
UPDATE products 
SET image_url = '/images/products/digital-manifold.png'
WHERE (sku LIKE 'FLXHSE%' OR sku LIKE 'ROM%') AND image_url IS NULL;

-- 4. Flex Duct, Lineset -> Copper Pipe Image (Tubing)
UPDATE products 
SET image_url = '/images/products/copper-pipe.png'
WHERE (sku LIKE 'FLEX-DUCT%' OR sku LIKE 'LNSET%') AND image_url IS NULL;

-- 5. Capacitor, Wire Nuts -> Thermostat Image (Small Electronics/Parts)
UPDATE products 
SET image_url = '/images/products/thermostat.png'
WHERE (sku LIKE 'CAP-RUN%' OR sku LIKE 'WNC%') AND image_url IS NULL;

-- 6. Torch, Tape -> Pipe Cutter Image (Tools)
UPDATE products 
SET image_url = '/images/products/pipe-cutter.png'
WHERE (sku LIKE 'TOOL-TORCH%' OR sku LIKE 'TAPE%') AND image_url IS NULL;
