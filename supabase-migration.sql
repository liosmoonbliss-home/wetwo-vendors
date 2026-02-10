-- Run this in your Supabase SQL editor
-- Table for vendor page change requests

CREATE TABLE IF NOT EXISTS vendor_change_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_ref TEXT NOT NULL,
  vendor_name TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'done', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_vcr_vendor_ref ON vendor_change_requests(vendor_ref);
CREATE INDEX IF NOT EXISTS idx_vcr_status ON vendor_change_requests(status);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_vcr_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vcr_updated_at ON vendor_change_requests;
CREATE TRIGGER vcr_updated_at
  BEFORE UPDATE ON vendor_change_requests
  FOR EACH ROW EXECUTE FUNCTION update_vcr_timestamp();
