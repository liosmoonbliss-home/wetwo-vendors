import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceKey || supabaseServiceKey.includes('placeholder')) {
      return NextResponse.json({ error: 'Supabase not configured. Set SUPABASE_SERVICE_ROLE_KEY in .env.local' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { vendor } = await req.json();

    if (!vendor || !vendor.business_name) {
      return NextResponse.json({ error: 'vendor.business_name is required' }, { status: 400 });
    }

    // Check if vendor already exists by business_name
    const { data: existing } = await supabase
      .from('vendors')
      .select('id, ref')
      .eq('business_name', vendor.business_name)
      .maybeSingle();

    let result;
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('vendors')
        .update({ ...vendor, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('vendors')
        .insert({ ...vendor, created_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    return NextResponse.json({
      success: true,
      ref: result.ref,
      url: `https://wetwo-vendors.vercel.app/vendor/${result.ref}`,
      isUpdate: !!existing,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
