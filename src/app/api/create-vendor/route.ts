import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Only these columns exist in the vendors table — anything else gets stripped
const ALLOWED_COLUMNS = new Set([
  'business_name','category','service_area','service_radius','email','phone',
  'instagram_handle','website','years_in_business','price_range','bio',
  'portfolio_images','contact_name','service_states','service_type','city','state',
  'photo_url','pricing_packages','services_included','page_active',
  'theme_preset','brand_color','brand_color_secondary','active_sections',
  'section_order','hero_config','event_types','testimonials','video_urls',
  'faqs','team_members','venue_info','trust_badges','menu_categories','page_html','page_password',
  
  'ref','first_name','account_status','profile_completed',
  'goaffpro_affiliate_id','goaffpro_referral_code','affiliate_link',
  'magic_token','boost_percentage',
  'referral_slug','white_label_name','white_label_tagline',
]);

// Generate a readable initial password: e.g., "WeTwo-Gladys-7k3m"
function generatePassword(contactName: string): string {
  const firstName = (contactName || 'Vendor').split(' ')[0];
  const suffix = crypto.randomBytes(2).toString('hex'); // 4 chars
  return `WeTwo-${firstName}-${suffix}`;
}

// Hash password for storage
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

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

    // Extract ref before stripping (ref is used for matching, not for writing)
    const vendorRef = vendor.ref;

    // Strip any fields not in the table
    const cleanVendor: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(vendor)) {
      if (ALLOWED_COLUMNS.has(key)) cleanVendor[key] = value;
    }

    // Find existing vendor — prefer ref, fall back to business_name
    let existing: { id: string; ref: string; goaffpro_affiliate_id: string | null } | null = null;
    if (vendorRef) {
      const { data } = await supabase
        .from('vendors')
        .select('id, ref, goaffpro_affiliate_id')
        .eq('ref', vendorRef)
        .maybeSingle();
      existing = data;
    }
    if (!existing) {
      const { data } = await supabase
        .from('vendors')
        .select('id, ref, goaffpro_affiliate_id')
        .eq('business_name', vendor.business_name)
        .maybeSingle();
      existing = data;
    }

    let result;
    let isNew = false;
    let initialPassword: string | null = null;
    let affiliateLink: string | null = null;

    if (existing) {
      // ============================================================
      // UPDATE EXISTING VENDOR — just update page data
      // ============================================================
      const { data, error } = await supabase
        .from('vendors')
        .update({ ...cleanVendor, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      // ============================================================
      // NEW VENDOR — full onboarding pipeline
      // ============================================================
      isNew = true;

      // 1. Generate ref
      const slugBase = ((cleanVendor.business_name as string) || 'vendor')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
      const slugRand = Math.random().toString(36).slice(2, 6);
      const newRef = `${slugBase}-${slugRand}`;
      cleanVendor.ref = newRef;

      // Set referral_slug and white_label_name for incentive system
      cleanVendor.referral_slug = newRef;
      cleanVendor.white_label_name = ((cleanVendor.business_name as string) || 'Vendor').slice(0, 40);
      cleanVendor.white_label_tagline = (cleanVendor.category as string) || 'Wedding Professional';

      // 2. Generate magic token for legacy dashboard access
      cleanVendor.magic_token = crypto.randomBytes(16).toString('hex');

      // 3. Set defaults
      cleanVendor.account_status = cleanVendor.account_status || 'vendor';
      cleanVendor.boost_percentage = cleanVendor.boost_percentage || 0.25;
      cleanVendor.profile_completed = false;

      // 4. Generate initial password
      initialPassword = generatePassword((cleanVendor.contact_name as string) || '');
      cleanVendor.page_password = hashPassword(initialPassword);

      // 5. Insert vendor
      const { data, error } = await supabase
        .from('vendors')
        .insert({ ...cleanVendor, created_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      result = data;

      // 6. Create GoAffPro affiliate
      const goaffproRefCode = `vendor-${newRef}`;
      try {
        const goaffproResponse = await fetch('https://api.goaffpro.com/v1/admin/affiliates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goaffpro-access-token': process.env.GOAFFPRO_ACCESS_TOKEN!,
          },
          body: JSON.stringify({
            email: ((cleanVendor.email as string) || '').toLowerCase().trim(),
            name: ((cleanVendor.business_name as string) || '').trim()
              .replace(/&/g, 'and').replace(/[^\w\s-]/g, '').trim(),
            ref_code: goaffproRefCode,
          }),
        });

        const goaffproData = await goaffproResponse.json();
        console.log('🎯 GoAffPro response:', JSON.stringify(goaffproData));

        if (goaffproResponse.ok && goaffproData?.affiliate_id) {
          const affiliateId = String(goaffproData.affiliate_id);
          const referralCode = goaffproData.ref_code || goaffproRefCode;
          affiliateLink = `https://wetwo.love?ref=${referralCode}`;

          // Update vendor with GoAffPro data
          await supabase
            .from('vendors')
            .update({
              goaffpro_affiliate_id: affiliateId,
              goaffpro_referral_code: referralCode,
              affiliate_link: affiliateLink,
            })
            .eq('id', result.id);

          console.log('✅ GoAffPro affiliate created:', affiliateId, 'ref:', referralCode);

          // Auto-generate Shopify discount codes for vendor incentives
          // (Supabase trigger already generated incentive records when goaffpro_referral_code was set)
          try {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://wetwo-vendors.vercel.app';
            const discountRes = await fetch(`${baseUrl}/api/create-shopify-discounts`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ vendor_id: result.id }),
            });
            const discountData = await discountRes.json();
            console.log('🎟️ Shopify discounts created:', JSON.stringify(discountData));
          } catch (discountError) {
            console.error('⚠️ Shopify discount creation failed (non-blocking):', discountError);
          }

        } else if (goaffproData?.message?.includes('already') || goaffproData?.error?.includes('exists')) {
          console.log('ℹ️ GoAffPro affiliate already exists');
          affiliateLink = `https://wetwo.love?ref=${goaffproRefCode}`;

          await supabase
            .from('vendors')
            .update({
              goaffpro_referral_code: goaffproRefCode,
              affiliate_link: affiliateLink,
            })
            .eq('id', result.id);
        } else {
          console.error('⚠️ GoAffPro creation returned unexpected:', goaffproData);
        }
      } catch (goaffproError) {
        console.error('⚠️ GoAffPro affiliate creation failed (non-blocking):', goaffproError);
      }

      // 7. Create vendor_accounts row
      try {
        await supabase
          .from('vendor_accounts')
          .upsert({
            vendor_id: result.id,
            email: ((cleanVendor.email as string) || '').toLowerCase().trim(),
            password_hash: hashPassword(initialPassword),
            plan: 'free',
            commission_rate: 0,
            created_at: new Date().toISOString(),
          }, { onConflict: 'vendor_id' });
        console.log('✅ Vendor account created');
      } catch (accountError) {
        console.error('⚠️ vendor_accounts creation failed (non-blocking):', accountError);
      }

      // 8. Send welcome email
      const vendorEmail = ((cleanVendor.email as string) || '').toLowerCase().trim();
      const contactName = (cleanVendor.contact_name as string) || 'there';
      const firstName = contactName.split(' ')[0];
      const dashboardUrl = `https://wetwo-vendors.vercel.app/dashboard`;

      if (vendorEmail && process.env.RESEND_API_KEY) {
        try {
          const { Resend } = await import('resend');
          const resend = new Resend(process.env.RESEND_API_KEY);

          await resend.emails.send({
            from: 'Dave from WeTwo <hello@noreply.wetwo.love>',
            replyTo: 'david@wetwo.love',
            to: vendorEmail,
            subject: `Welcome to the WeTwo Wedding Buying Group, ${firstName}!`,
            html: `
              <!DOCTYPE html>
              <html>
              <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #faf8f5; margin: 0; padding: 20px;">
                <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
                  
                  <div style="background: linear-gradient(135deg, #2c2420 0%, #1a1612 100%); padding: 32px; text-align: center;">
                    <h1 style="color: #c9944a; margin: 0; font-size: 28px; font-family: 'Playfair Display', Georgia, serif;">WeTwo</h1>
                    <p style="color: rgba(255,255,255,0.5); margin: 8px 0 0 0; font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">Wedding Buying Group</p>
                  </div>
                  
                  <div style="padding: 36px 28px;">
                    <p style="color: #2c2420; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">
                      Hey ${firstName}! 👋
                    </p>
                    
                    <p style="color: #6b5e52; margin: 0 0 24px 0; font-size: 15px; line-height: 1.7;">
                      Welcome to the WeTwo Wedding Buying Group. We just built you a custom landing page, 
                      an AI assistant, exclusive member links, and an entire marketing system — all live 
                      and ready to go.
                    </p>
                    
                    <div style="background: #faf8f5; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e4ddd4;">
                      <p style="color: #2c2420; font-weight: 700; margin: 0 0 12px 0; font-size: 14px;">Your login:</p>
                      <p style="color: #6b5e52; font-size: 14px; margin: 0 0 6px 0;">
                        <strong>Email:</strong> ${vendorEmail}
                      </p>
                      <p style="color: #6b5e52; font-size: 14px; margin: 0;">
                        <strong>Password:</strong> ${initialPassword}
                      </p>
                    </div>
                    
                    <a href="${dashboardUrl}" style="display: block; background: #c9944a; color: #fff; text-decoration: none; padding: 16px 24px; border-radius: 10px; text-align: center; font-weight: 700; font-size: 15px; margin-bottom: 24px;">
                      Open Your Dashboard →
                    </a>
                    
                    <p style="color: #9a8d80; font-size: 13px; line-height: 1.6; margin: 0;">
                      Questions? Just reply to this email — I read every one.
                    </p>
                  </div>
                  
                  <div style="background: #faf8f5; padding: 20px 28px; text-align: center; border-top: 1px solid #e4ddd4;">
                    <p style="color: #9a8d80; font-size: 11px; margin: 0; letter-spacing: 1px;">
                      WeTwo Wedding Buying Group — Member Vendor
                    </p>
                  </div>
                </div>
              </body>
              </html>
            `,
          });
          console.log('📧 Welcome email sent to:', vendorEmail);
        } catch (emailError) {
          console.error('⚠️ Welcome email failed (non-blocking):', emailError);
        }

        // 9. Send admin notification
        try {
          const { Resend } = await import('resend');
          const resend = new Resend(process.env.RESEND_API_KEY);

          await resend.emails.send({
            from: 'WeTwo <notify@noreply.wetwo.love>',
            to: 'david@wetwo.love',
            subject: `🏢 New Vendor Published: ${cleanVendor.business_name} (${cleanVendor.category || 'uncategorized'})`,
            html: `
              <div style="font-family: -apple-system, sans-serif; padding: 20px; max-width: 500px;">
                <h2 style="color: #2c2420; margin: 0 0 16px;">New Vendor Published from Builder</h2>
                <p><strong>Business:</strong> ${cleanVendor.business_name}</p>
                <p><strong>Contact:</strong> ${cleanVendor.contact_name || 'N/A'}</p>
                <p><strong>Email:</strong> ${vendorEmail}</p>
                <p><strong>Phone:</strong> ${cleanVendor.phone || 'N/A'}</p>
                <p><strong>Category:</strong> ${cleanVendor.category || 'N/A'}</p>
                <p><strong>Location:</strong> ${cleanVendor.city || ''}, ${cleanVendor.state || ''}</p>
                <p><strong>Initial Password:</strong> ${initialPassword}</p>
                <p><strong>GoAffPro Ref:</strong> vendor-${newRef}</p>
                <p><strong>Affiliate Link:</strong> ${affiliateLink || 'pending'}</p>
                <hr style="border: none; border-top: 1px solid #e4ddd4; margin: 20px 0;">
                <p>
                  <a href="https://wetwo-vendors.vercel.app/vendor/${newRef}" style="background: #c9944a; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 700;">View Their Page</a>
                  &nbsp;
                  <a href="https://wetwo-vendors.vercel.app/builder?ref=${newRef}" style="background: #2c2420; color: #c9944a; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 700;">Edit in Builder</a>
                </p>
              </div>
            `,
          });
          console.log('📧 Admin notification sent');
        } catch (notifyError) {
          console.error('⚠️ Admin notification failed (non-blocking):', notifyError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      ref: result.ref,
      url: `https://wetwo-vendors.vercel.app/vendor/${result.ref}`,
      isUpdate: !!existing,
      isNew,
      ...(initialPassword ? { initialPassword } : {}),
      ...(affiliateLink ? { affiliateLink } : {}),
    });
  } catch (err) {
    console.error('💥 create-vendor error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : JSON.stringify(err) }, { status: 500 });
  }
}
