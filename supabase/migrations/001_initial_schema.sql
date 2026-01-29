-- ProBuild Supply Database Schema
-- Run these migrations in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- Organizations (Multi-tenant root)
-- ============================================
CREATE TABLE organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  settings      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Users (Admin staff)
-- ============================================
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  auth_id         UUID UNIQUE, -- Links to Supabase Auth
  email           TEXT UNIQUE NOT NULL,
  full_name       TEXT NOT NULL,
  role            TEXT CHECK (role IN ('owner', 'admin', 'staff')) DEFAULT 'staff',
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX users_organization_idx ON users(organization_id);
CREATE INDEX users_auth_idx ON users(auth_id);

-- ============================================
-- Clients (Contractor companies)
-- ============================================
CREATE TABLE clients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  company_name    TEXT NOT NULL,
  contact_name    TEXT,
  email           TEXT,
  phone           TEXT,
  credit_limit    NUMERIC(12,2) DEFAULT 0,
  payment_terms   INTEGER DEFAULT 30, -- NET days
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX clients_organization_idx ON clients(organization_id);

-- ============================================
-- Job Sites (Delivery locations)
-- ============================================
CREATE TABLE job_sites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID REFERENCES clients(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  address     TEXT NOT NULL,
  city        TEXT,
  state       TEXT,
  zip         TEXT,
  notes       TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX job_sites_client_idx ON job_sites(client_id);

-- ============================================
-- Categories (Product categories)
-- ============================================
CREATE TABLE categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL,
  parent_id       UUID REFERENCES categories(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, slug)
);

CREATE INDEX categories_organization_idx ON categories(organization_id);

-- ============================================
-- Products (SKU inventory)
-- ============================================
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  sku             TEXT NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  category_id     UUID REFERENCES categories(id),
  unit            TEXT NOT NULL, -- 'ft', 'box', 'each', 'roll'
  unit_price      NUMERIC(12,2) NOT NULL,
  cost_price      NUMERIC(12,2),
  stock_qty       NUMERIC(12,2) DEFAULT 0,
  min_stock_qty   NUMERIC(12,2) DEFAULT 0,
  aliases         TEXT[] DEFAULT '{}',
  search_vector   TSVECTOR,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, sku)
);

CREATE INDEX products_organization_idx ON products(organization_id);
CREATE INDEX products_category_idx ON products(category_id);
CREATE INDEX products_search_idx ON products USING GIN(search_vector);
CREATE INDEX products_name_trgm_idx ON products USING GIN(name gin_trgm_ops);

-- Trigger to auto-update search_vector
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.sku, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(COALESCE(NEW.aliases, '{}'), ' ')), 'A');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_search_update
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();

-- ============================================
-- Orders
-- ============================================
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  client_id       UUID REFERENCES clients(id),
  job_site_id     UUID REFERENCES job_sites(id),
  order_number    TEXT NOT NULL,
  status          TEXT CHECK (status IN (
    'draft', 'pending', 'confirmed', 'in_progress', 
    'ready', 'delivered', 'invoiced', 'paid', 'cancelled'
  )) DEFAULT 'draft',
  subtotal        NUMERIC(12,2) DEFAULT 0,
  tax_amount      NUMERIC(12,2) DEFAULT 0,
  total           NUMERIC(12,2) DEFAULT 0,
  notes           TEXT,
  source          TEXT CHECK (source IN ('manual', 'magic_import', 'client_portal')) DEFAULT 'manual',
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, order_number)
);

CREATE INDEX orders_organization_idx ON orders(organization_id);
CREATE INDEX orders_client_idx ON orders(client_id);
CREATE INDEX orders_status_idx ON orders(status);
CREATE INDEX orders_created_idx ON orders(created_at DESC);

-- ============================================
-- Order Items (Line items)
-- ============================================
CREATE TABLE order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id    UUID REFERENCES products(id),
  sku           TEXT NOT NULL,
  name          TEXT NOT NULL,
  quantity      NUMERIC(12,2) NOT NULL,
  unit          TEXT NOT NULL,
  unit_price    NUMERIC(12,2) NOT NULL,
  line_total    NUMERIC(12,2) NOT NULL,
  notes         TEXT,
  ai_confidence NUMERIC(3,2),
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX order_items_order_idx ON order_items(order_id);

-- ============================================
-- Magic Import Logs (AI audit trail)
-- ============================================
CREATE TABLE magic_import_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  order_id        UUID REFERENCES orders(id),
  raw_input       TEXT NOT NULL,
  parsed_result   JSONB NOT NULL,
  matched_items   JSONB NOT NULL,
  unmatched_items JSONB DEFAULT '[]',
  model_used      TEXT,
  processing_ms   INTEGER,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX magic_import_logs_organization_idx ON magic_import_logs(organization_id);
CREATE INDEX magic_import_logs_order_idx ON magic_import_logs(order_id);

-- ============================================
-- Trigram Search Function
-- ============================================
CREATE OR REPLACE FUNCTION search_products_trigram(
  search_term TEXT,
  org_id UUID,
  threshold NUMERIC DEFAULT 0.3
)
RETURNS TABLE (
  id UUID,
  sku TEXT,
  name TEXT,
  unit TEXT,
  unit_price NUMERIC,
  similarity NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.sku,
    p.name,
    p.unit,
    p.unit_price,
    GREATEST(
      similarity(p.name, search_term),
      similarity(p.sku, search_term),
      (SELECT MAX(similarity(a, search_term)) FROM unnest(p.aliases) a)
    ) AS similarity
  FROM products p
  WHERE p.organization_id = org_id
    AND p.is_active = true
    AND (
      similarity(p.name, search_term) > threshold
      OR similarity(p.sku, search_term) > threshold
      OR EXISTS (
        SELECT 1 FROM unnest(p.aliases) a 
        WHERE similarity(a, search_term) > threshold
      )
    )
  ORDER BY similarity DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Row Level Security Policies
-- ============================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE magic_import_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see data from their organization
CREATE POLICY "Users can view own organization"
  ON organizations FOR SELECT
  USING (id IN (
    SELECT organization_id FROM users WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Users can view organization users"
  ON users FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Users can view organization clients"
  ON clients FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Users can manage organization clients"
  ON clients FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Users can view organization products"
  ON products FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Users can manage organization products"
  ON products FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Users can view organization orders"
  ON orders FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Users can manage organization orders"
  ON orders FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE auth_id = auth.uid()
  ));

-- ============================================
-- Updated At Triggers
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
