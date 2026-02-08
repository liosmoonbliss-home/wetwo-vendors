-- ============================================
-- WeTwo Vendors Dashboard Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Vendor Accounts (links auth users to vendor records)
CREATE TABLE IF NOT EXISTS vendor_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_ref TEXT NOT NULL REFERENCES vendors(ref) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'growth', 'pro')),
  commission_rate NUMERIC(4,2) NOT NULL DEFAULT 0,
  password_hash TEXT, -- for simple password auth (phase 1)
  magic_link_token TEXT,
  magic_link_expires TIMESTAMPTZ,
  onboarded_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_accounts_ref ON vendor_accounts(vendor_ref);
CREATE INDEX idx_vendor_accounts_email ON vendor_accounts(email);

-- 2. Leads / Inquiries (from contact forms on vendor pages)
CREATE TABLE IF NOT EXISTS vendor_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_ref TEXT NOT NULL REFERENCES vendors(ref) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  event_date DATE,
  interest TEXT,
  message TEXT,
  source TEXT DEFAULT 'contact_form', -- contact_form, referral, manual
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'booked', 'lost')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_leads_ref ON vendor_leads(vendor_ref);
CREATE INDEX idx_vendor_leads_status ON vendor_leads(status);

-- 3. Client Links (tracking who vendors share links with)
CREATE TABLE IF NOT EXISTS vendor_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_ref TEXT NOT NULL REFERENCES vendors(ref) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('couple', 'shopper')),
  name TEXT,
  email TEXT,
  phone TEXT,
  link_clicked BOOLEAN DEFAULT FALSE,
  registered BOOLEAN DEFAULT FALSE,
  total_purchases NUMERIC(10,2) DEFAULT 0,
  commission_earned NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_clients_ref ON vendor_clients(vendor_ref);
CREATE INDEX idx_vendor_clients_type ON vendor_clients(type);

-- 4. Activity Log
CREATE TABLE IF NOT EXISTS vendor_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_ref TEXT NOT NULL REFERENCES vendors(ref) ON DELETE CASCADE,
  type TEXT NOT NULL, -- page_view, link_click, form_submit, registration, purchase
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_activity_ref ON vendor_activity(vendor_ref);
CREATE INDEX idx_vendor_activity_type ON vendor_activity(type);
CREATE INDEX idx_vendor_activity_created ON vendor_activity(created_at DESC);

-- 5. AI Chat History (for vendor assistant)
CREATE TABLE IF NOT EXISTS vendor_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_ref TEXT NOT NULL REFERENCES vendors(ref) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_chats_ref ON vendor_chats(vendor_ref);

-- 6. Enable RLS
ALTER TABLE vendor_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_chats ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies (service role bypasses, anon can submit leads)
CREATE POLICY "Service role full access" ON vendor_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON vendor_leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON vendor_clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON vendor_activity FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON vendor_chats FOR ALL USING (true) WITH CHECK (true);

-- Allow anonymous lead submission via contact forms
CREATE POLICY "Anyone can submit leads" ON vendor_leads FOR INSERT WITH CHECK (true);

