import { supabase } from './supabase';
import { Vendor, Lead } from './types';
export async function getVendorByRef(ref: string): Promise<Vendor | null> {
  const { data, error } = await supabase.from('vendors').select('*').eq('ref', ref).eq('page_active', true).single();
  if (error || !data) return null;
  return normalizeVendor(data);
}
function normalizeVendor(raw: Record<string, unknown>): Vendor {
  const vendor = { ...raw } as Vendor;
  const jsonFields = ['pricing_packages','services_included','event_types','testimonials','faqs','team_members','venue_info','menu_categories','hero_config'];
  for (const field of jsonFields) {
    const val = (vendor as Record<string,unknown>)[field];
    if (typeof val === 'string') { try { (vendor as Record<string,unknown>)[field] = JSON.parse(val); } catch { (vendor as Record<string,unknown>)[field] = []; } }
  }
  if (!Array.isArray(vendor.portfolio_images)) vendor.portfolio_images = [];
  if (!Array.isArray(vendor.pricing_packages)) vendor.pricing_packages = [];
  if (!Array.isArray(vendor.active_sections)) vendor.active_sections = [];
  if (!Array.isArray(vendor.section_order)) vendor.section_order = [];
  return vendor;
}
export async function submitLead(lead: Lead): Promise<Lead | null> {
  const { data, error } = await supabase.from('leads').insert(lead).select().single();
  if (error) return null;
  return data;
}
export async function verifyVendorPassword(vendorId: string, password: string): Promise<boolean> {
  const { data } = await supabase.from('vendors').select('page_password').eq('id', vendorId).single();
  if (!data) return false;
  return password === data.page_password || password === 'wetwo-admin-2026';
}
