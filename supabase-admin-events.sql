-- Run this in your Supabase SQL Editor
-- Creates the admin_events table for platform activity tracking

CREATE TABLE IF NOT EXISTS admin_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  vendor_ref TEXT,
  vendor_name TEXT,
  actor_name TEXT,
  actor_email TEXT,
  summary TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast queries
CREATE INDEX idx_admin_events_type ON admin_events(event_type);
CREATE INDEX idx_admin_events_vendor ON admin_events(vendor_ref);
CREATE INDEX idx_admin_events_created ON admin_events(created_at DESC);

-- Event types reference:
-- 'dashboard_visit'      - vendor visited their dashboard
-- 'claude_chat'          - vendor sent a message to Claude assistant
-- 'couple_signup'        - couple registered under a vendor
-- 'shopper_signup'       - shopper registered under a vendor
-- 'lead_form'            - someone submitted a contact form on vendor page
-- 'vendor_created'       - new vendor onboarded
-- 'subscription_change'  - vendor upgraded/downgraded/cancelled
-- 'page_view'            - vendor page was viewed by a guest
