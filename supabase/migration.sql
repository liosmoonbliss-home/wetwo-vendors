-- WeTwo Vendors Platform Migration
-- Safe to run multiple times (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)

-- Add new columns to existing vendors table
DO $$ BEGIN
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS theme_preset TEXT DEFAULT 'light-elegant';
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS brand_color TEXT;
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS brand_color_secondary TEXT;
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS active_sections JSONB DEFAULT '[]';
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS section_order JSONB DEFAULT '[]';
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS hero_config JSONB DEFAULT '{}';
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS services_included JSONB DEFAULT '[]';
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS event_types JSONB DEFAULT '[]';
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS testimonials JSONB DEFAULT '[]';
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS video_urls JSONB DEFAULT '[]';
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]';
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS team_members JSONB DEFAULT '[]';
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS venue_info JSONB DEFAULT '{}';
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS menu_categories JSONB DEFAULT '[]';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  event_date TEXT,
  interest TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_leads_vendor ON leads(vendor_id);

-- Shoppers table
CREATE TABLE IF NOT EXISTS shoppers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_shoppers_vendor ON shoppers(vendor_id);

-- Couples table
CREATE TABLE IF NOT EXISTS couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  partner_name TEXT,
  wedding_date TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_couples_vendor ON couples(vendor_id);

-- RLS policies
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE shoppers ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can submit leads" ON leads FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Leads readable with service key" ON leads FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Shoppers readable" ON shoppers FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Couples readable" ON couples FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
