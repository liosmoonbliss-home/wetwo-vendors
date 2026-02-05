import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vendor_id, name, email, phone, event_date, interest, message } = body;
    if (!vendor_id || !name || !email) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    const supabase = getServiceClient();
    const { data, error } = await supabase.from('leads').insert({ vendor_id, name, email, phone: phone||null, event_date: event_date||null, interest: interest||null, message: message||null }).select().single();
    if (error) return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
    return NextResponse.json({ success: true, lead: data });
  } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
