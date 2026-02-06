import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(req: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceKey || supabaseServiceKey.includes('placeholder')) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const ref = req.nextUrl.searchParams.get('ref');

    if (!ref) {
      return NextResponse.json({ error: 'ref parameter is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('ref', ref)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: `No vendor found with ref: ${ref}` }, { status: 404 });
    }

    return NextResponse.json({ vendor: data });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : JSON.stringify(err) }, { status: 500 });
  }
}
