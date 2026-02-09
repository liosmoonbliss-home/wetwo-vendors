import { trackEvent } from '@/lib/admin-track';
// =================================================================
// WETWO SIGNUP ROUTE - WITH MLM PARENT ASSIGNMENT FIX
// Deploy to: app/api/couples/signup/route.ts
// =================================================================
//
// FIX APPLIED:
// After creating GoAffPro affiliate, if couple was referred by a vendor,
// assign them to the vendor's MLM network using /admin/mlm/move endpoint
//
// Search for "// MLM FIX:" to find all changes
// =================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!
const SHOPIFY_ADMIN_API_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN!

// 🎁 Starter collection to pre-populate new registries
const STARTER_COLLECTION_HANDLE = 'best-registry-batch'

// 📧 Initialize Resend for verification emails
const resend = new Resend(process.env.RESEND_API_KEY)

// ============================================
// PREPOPULATE REGISTRY FUNCTION (ORDER-PRESERVING)
// ============================================
async function prepopulateRegistry(newCollectionId: string): Promise<void> {
  console.log('🎁 Pre-populating registry with starter products (order-preserving)...')
  
  try {
    const starterCollectionRes = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/custom_collections.json?handle=${STARTER_COLLECTION_HANDLE}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_ACCESS_TOKEN
        }
      }
    )

    const starterCollectionData = await starterCollectionRes.json()
    
    if (!starterCollectionData.custom_collections?.length) {
      console.warn('⚠️ Starter collection not found:', STARTER_COLLECTION_HANDLE)
      return
    }

    const starterCollectionId = starterCollectionData.custom_collections[0].id
    console.log('📦 Found starter collection:', starterCollectionId)

    const collectsRes = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/collects.json?collection_id=${starterCollectionId}&limit=250`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_ACCESS_TOKEN
        }
      }
    )

    const collectsData = await collectsRes.json()
    const sourceCollects = collectsData.collects || []

    if (sourceCollects.length === 0) {
      console.warn('⚠️ No products found in starter collection')
      return
    }

    sourceCollects.sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
    console.log(`📦 Found ${sourceCollects.length} products to add to registry (sorted by position)`)

    await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/custom_collections/${newCollectionId}.json`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_ACCESS_TOKEN
        },
        body: JSON.stringify({
          custom_collection: {
            id: newCollectionId,
            sort_order: 'manual'
          }
        })
      }
    )

    let addedCount = 0
    for (let i = 0; i < sourceCollects.length; i++) {
      const sourceCollect = sourceCollects[i]
      const position = i + 1

      try {
        const addProductRes = await fetch(
          `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/collects.json`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_ACCESS_TOKEN
            },
            body: JSON.stringify({
              collect: {
                product_id: sourceCollect.product_id,
                collection_id: newCollectionId,
                position: position
              }
            })
          }
        )

        if (addProductRes.ok) {
          addedCount++
        }
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (productError) {
        console.warn(`⚠️ Error adding product ${sourceCollect.product_id}:`, productError)
      }
    }

    console.log(`✅ Pre-populated registry with ${addedCount} products`)
  } catch (error) {
    console.error('❌ Failed to pre-populate registry:', error)
  }
}

// ============================================
// 📧 SEND WELCOME EMAIL WITH VERIFY LINK
// ============================================
async function sendWelcomeEmail(couple: any, registryUrl: string, dashboardUrl: string): Promise<void> {
  console.log('📧 ATTEMPTING to send welcome email to:', couple.email)
  
  try {
    // Generate verify token
    const verifyToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    
    // Store verify token in database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    await supabase
      .from('couples')
      .update({
        email_verify_token: verifyToken,
        email_verification_sent_at: new Date().toISOString()
      })
      .eq('id', couple.id)
    
    const { error: emailError } = await resend.emails.send({
      from: 'Dave from WeTwo <hello@noreply.wetwo.love>',
      replyTo: 'david@wetwo.love',
      to: couple.email,
      subject: `${couple.partner_a}, your 25% cashback registry is ready`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9f9f9; margin: 0; padding: 20px;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #0a0a15 100%); padding: 24px; text-align: center;">
              <h1 style="color: #d4af74; margin: 0; font-size: 24px; font-weight: 600;">WeTwo</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="color: #1a1a2e; margin: 0 0 8px 0; font-size: 20px; font-weight: 600; text-align: center;">
                Hey ${couple.partner_a}! 👋
              </p>
              
              <!-- THE CASH HOOK -->
              <div style="background: linear-gradient(135deg, #d4af74 0%, #c9a663 100%); border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
                <p style="color: #0a0a15; font-size: 28px; font-weight: 700; margin: 0;">
                  $10,000 in gifts
                </p>
                <p style="color: #0a0a15; font-size: 16px; margin: 8px 0 0 0;">
                  = gifts + <strong>$2,500 cash back</strong>
                </p>
              </div>
              
              <p style="color: #666; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; text-align: center;">
                Your cashback registry is set up and ready. When guests buy gifts, you earn 25% back in real cash.
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #1a1a2e 0%, #0a0a15 100%); color: #d4af74; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                  Open My Dashboard →
                </a>
              </div>
              
              <p style="color: #999; margin: 24px 0 0 0; font-size: 13px; text-align: center; line-height: 1.5;">
                Questions? Just reply to this email.<br>
                We're here to help!
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #999; margin: 0; font-size: 12px;">
                © 2026 WeTwo • The 25% Cashback Wedding Registry
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    if (emailError) {
      console.error('❌ Resend email error:', emailError)
    } else {
      console.log('✅ Welcome email sent successfully')
    }
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error)
  }
}

// ============================================
// 🔗 MAIN SIGNUP HANDLER
// ============================================
export async function POST(request: NextRequest) {
  console.log('🚀 Starting couple signup...')
  
  try {
    const body = await request.json()
    console.log('📝 Received signup data:', { ...body, email: body.email ? '***' : undefined })

    const {
      partner_a,
      partner_b,
      email,
      state,
      address_state,  // Form might send this instead of 'state'
      source,
      referred_by_vendor,
      referred_by_vendor_id,
      referral_bonus_percent,
      referred_by_partner_id,
      budget_range,
      guest_count,
      wedding_date,
      wedding_location,
      phone
    } = body

    // Accept either 'state' or 'address_state' from form
    const stateValue = state || address_state

    // Validation
    if (!partner_a || !email || !stateValue) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Clean up partner_b
    const hasPartner = partner_b && partner_b.trim() !== '' && partner_b.trim().toLowerCase() !== 'partner'
    const partnerB = hasPartner ? partner_b.trim() : ''

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase credentials')
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: existingCouple } = await supabase
      .from('couples')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single()

    // If couple exists AND this request has survey data, UPDATE their record
    if (existingCouple) {
      console.log('📝 Existing lead found, checking for survey data...')
      
      if (budget_range || guest_count || wedding_date || wedding_location || partner_b) {
        console.log('📝 Updating existing lead with survey data...')
        
        const updateData: any = {}
        if (budget_range) updateData.budget_range = budget_range
        if (guest_count) updateData.guest_count = guest_count
        if (wedding_date) updateData.wedding_date = wedding_date
        if (wedding_location) updateData.wedding_location = wedding_location
        if (hasPartner) updateData.partner_b = partnerB
        if (source) updateData.source = source
        updateData.profile_completed = true
        updateData.last_visited_at = new Date().toISOString()
        
        const { data: updatedCouple, error: updateError } = await supabase
          .from('couples')
          .update(updateData)
          .eq('id', existingCouple.id)
          .select()
          .single()
        
        if (updateError) {
          console.error('❌ Update error:', updateError)
          return NextResponse.json(
            { success: false, message: 'Failed to update profile' },
            { status: 500 }
          )
        }

        // Send notification to Dave about survey completion
        try {
          await resend.emails.send({
            from: 'WeTwo <notify@noreply.wetwo.love>',
            to: 'david@wetwo.love',
            subject: `📝 Survey completed: ${partner_a}${hasPartner ? ` & ${partnerB}` : ''} (${budget_range || 'no budget'})`,
            html: `
              <div style="font-family: -apple-system, sans-serif; padding: 20px;">
                <h2 style="color: #1a1a2e;">Lead Updated with Survey Data!</h2>
                <p><strong>Couple:</strong> ${partner_a}${hasPartner ? ` & ${partnerB}` : ''}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Budget:</strong> ${budget_range || 'Not specified'}</p>
                <p><strong>Guests:</strong> ${guest_count || 'Not specified'}</p>
                <p><strong>Date:</strong> ${wedding_date || 'Not specified'}</p>
                <p><strong>Location:</strong> ${wedding_location || 'Not specified'}</p>
              </div>
            `
          })
        } catch (notifyErr) {
          console.error('⚠️ Notification error (non-blocking):', notifyErr)
        }

        console.log('✅ Existing lead updated with survey data')
        return NextResponse.json({
          success: true,
          message: 'Profile updated successfully!',
          couple: updatedCouple,
          updated: true
        })
      }
      
      // No survey data, just a duplicate signup attempt
      console.log('⚠️ Email already registered, no new data to add')
      return NextResponse.json(
        { 
          success: false, 
          message: 'An account with this email already exists' 
        },
        { status: 409 }
      )
    }

    // Generate slug
    let baseSlug: string
    if (hasPartner) {
      baseSlug = `${partner_a.toLowerCase()}-${partnerB.toLowerCase()}`
    } else {
      baseSlug = `${partner_a.toLowerCase()}-registry`
    }
    
    baseSlug = baseSlug
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    
    const randomSuffix = Math.random().toString(36).substring(2, 6)
    const slug = `${baseSlug}-${randomSuffix}`

    console.log('🏷️ Generated slug:', slug)

    const magicToken = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15)

    const magicTokenExpires = new Date()
    magicTokenExpires.setFullYear(magicTokenExpires.getFullYear() + 10)

    console.log('📝 Creating couple in database...')

    if (referred_by_vendor) {
      console.log('🤝 Referred by vendor:', referred_by_vendor)
    }
    
    if (referred_by_vendor_id) {
      console.log('🤝 Referred by vendor ID:', referred_by_vendor_id, '| Bonus:', referral_bonus_percent)
    }
    
    if (referred_by_partner_id) {
      console.log('🤝 Referred by partner:', referred_by_partner_id)
    }

    const { data: newCouple, error: insertError } = await supabase
      .from('couples')
      .insert({
        partner_a: partner_a.trim(),
        partner_b: hasPartner ? partnerB : '',
        original_email: email.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        address_state: stateValue.trim(),
        slug,
        magic_token: magicToken,
        magic_token_expires: magicTokenExpires.toISOString(),
        profile_completed: false,
        source: source || 'direct',
        last_visited_at: new Date().toISOString(),
        visit_count: 1,
        referred_by_vendor: referred_by_vendor || null,
        referred_by_vendor_id: referred_by_vendor_id || null,
        referral_bonus_percent: referral_bonus_percent || 0,
        referred_by_partner_id: referred_by_partner_id || null,
        email_verified: false,
        lead_status: 'unverified',
        budget_range: budget_range || null,
        guest_count: guest_count || null,
        wedding_date: wedding_date || null,
        wedding_location: wedding_location || null,
        phone: phone || null,
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Supabase insert error:', insertError)
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to create account: ' + insertError.message 
        },
        { status: 500 }
      )
    }

    if (!newCouple) {
      console.error('❌ No couple data returned after insert')
      return NextResponse.json(
        { success: false, message: 'Failed to create account' },
        { status: 500 }
      )
    }

    console.log('✅ Couple created successfully:', newCouple.slug)

    // 🎯 Update vendor referral count if referred by vendor
    if (referred_by_vendor_id) {
      try {
        await supabase.rpc('increment_vendor_referral_count', { vendor_id: referred_by_vendor_id })
        console.log('✅ Vendor referral count incremented')
      } catch (err) {
        console.error('⚠️ Failed to increment vendor referral count:', err)
      }
    }

    const sanitizedName = hasPartner
      ? `${partner_a.trim()} and ${partnerB}`
      : partner_a.trim()

    // 🎯 Create GoAffPro affiliate account
    let coupleAffiliateId: string | null = null
    
    try {
      const goaffproResponse = await fetch('https://api.goaffpro.com/v1/admin/affiliates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goaffpro-access-token': process.env.GOAFFPRO_ACCESS_TOKEN!
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          name: sanitizedName,
          ref_code: slug
        })
      })

      const affiliateData = await goaffproResponse.json()
      console.log('🎯 GoAffPro response:', affiliateData)

      if (goaffproResponse.ok && affiliateData?.affiliate_id) {
        coupleAffiliateId = String(affiliateData.affiliate_id)
        const referralCode = slug
        const affiliateLink = `https://wetwo.love?ref=${referralCode}`

        await supabase
          .from('couples')
          .update({
            goaffpro_affiliate_id: coupleAffiliateId,
            goaffpro_referral_code: referralCode,
            affiliate_link: affiliateLink
          })
          .eq('slug', slug)

        console.log('✅ GoAffPro affiliate linked:', coupleAffiliateId)

        // ============================================
        // MLM FIX: Assign couple to vendor's MLM network
        // ============================================
        if (referred_by_vendor_id && coupleAffiliateId) {
          console.log('🔗 MLM FIX: Assigning couple to vendor MLM network...')
          
          try {
            // Look up the vendor's GoAffPro affiliate ID
            const { data: vendorData, error: vendorError } = await supabase
              .from('vendors')
              .select('goaffpro_affiliate_id, business_name')
              .eq('id', referred_by_vendor_id)
              .single()
            
            console.log('🔍 Vendor lookup result:', vendorData, 'Error:', vendorError)
            
            if (vendorData?.goaffpro_affiliate_id) {
              console.log(`🔗 Found vendor GoAffPro ID: ${vendorData.goaffpro_affiliate_id} (${vendorData.business_name})`)
              
              // Assign couple as downline of vendor using MLM move endpoint
              const mlmResponse = await fetch(
                `https://api.goaffpro.com/v1/admin/mlm/move/${coupleAffiliateId}`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'x-goaffpro-access-token': process.env.GOAFFPRO_ACCESS_TOKEN!
                  },
                  body: `new_parent=${encodeURIComponent(vendorData.goaffpro_affiliate_id)}`
                }
              )
              
              const mlmResponseText = await mlmResponse.text()
              console.log('🔗 MLM response:', mlmResponse.status, mlmResponseText)
              
              if (mlmResponse.ok) {
                console.log(`✅ MLM FIX: Couple ${slug} assigned under vendor ${vendorData.business_name}`)
              } else {
                const mlmError = await mlmResponse.text()
                console.error('⚠️ MLM assignment failed:', mlmResponse.status, mlmError)
              }
            } else {
              console.warn('⚠️ Vendor has no GoAffPro affiliate ID, skipping MLM assignment')
            }
          } catch (mlmError) {
            console.error('⚠️ MLM assignment error (non-blocking):', mlmError)
          }
        }
        // ============================================
        // END MLM FIX
        // ============================================
      }
    } catch (goaffproError) {
      console.error('⚠️ GoAffPro affiliate creation failed (non-blocking):', goaffproError)
    }

    // 📊 Add to vendor dashboard if referred by vendor
    if (referred_by_vendor_id) {
      try {
        const { data: refVendor } = await supabase
          .from('vendors')
          .select('ref, business_name')
          .eq('id', referred_by_vendor_id)
          .single()

        if (refVendor) {
          // Insert into vendor_clients (vendor dashboard)
          await supabase.from('vendor_clients').insert({
            vendor_ref: refVendor.ref,
            type: 'couple',
            name: sanitizedName,
            email: email.toLowerCase().trim(),
            phone: phone || null,
            link_clicked: true,
            registered: true,
            total_purchases: 0,
            commission_earned: 0,
          })

          // Log to vendor_activity
          await supabase.from('vendor_activity').insert({
            vendor_ref: refVendor.ref,
            type: 'couple',
            description: `New couple: ${sanitizedName} created registry`,
            metadata: {
              couple_slug: slug,
              email: email.toLowerCase().trim(),
              goaffpro_affiliate_id: coupleAffiliateId,
            },
          })
          // Also store vendor business name for display
          await supabase
            .from('couples')
            .update({ referred_by_vendor: refVendor.business_name })
            .eq('slug', slug)

          console.log('✅ Couple added to vendor dashboard:', refVendor.business_name)
        }
      } catch (dashErr) {
        console.error('⚠️ Vendor dashboard insert error (non-blocking):', dashErr)
      }
    }

    // 🛍️ Create Shopify collection for registry
    let newCollectionId: string | null = null
    let shopifyCollectionHandle: string | null = null
    
    try {
      const collectionHandle = `registry-${slug}`
      const collectionTitle = hasPartner
        ? `${partner_a.trim()} and ${partnerB}'s Wedding Registry`
        : `${partner_a.trim()}'s Wedding Registry`

      console.log('🛍️ Creating Shopify collection:', collectionTitle)

      const shopifyResponse = await fetch(
        `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/custom_collections.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_ACCESS_TOKEN
          },
          body: JSON.stringify({
            custom_collection: {
              title: collectionTitle,
              handle: collectionHandle,
              published: true,
              body_html: `<p>Wedding registry for ${sanitizedName}. Browse their wishlist and find the perfect gift!</p>`,
              sort_order: 'manual'
            }
          })
        }
      )

      const shopifyData = await shopifyResponse.json()
      console.log('🛍️ Shopify response:', JSON.stringify(shopifyData, null, 2))

      if (shopifyResponse.ok && shopifyData.custom_collection) {
        const collection = shopifyData.custom_collection
        newCollectionId = String(collection.id)
        shopifyCollectionHandle = collection.handle

        await supabase
          .from('couples')
          .update({
            shopify_collection_id: newCollectionId,
            shopify_collection_handle: shopifyCollectionHandle
          })
          .eq('slug', slug)

        console.log('✅ Shopify collection linked:', newCollectionId)
        
        if (newCollectionId) {
          await prepopulateRegistry(newCollectionId)
        }
      }
    } catch (shopifyError) {
      console.error('⚠️ Shopify collection creation failed (non-blocking):', shopifyError)
    }

    // Build URLs
    const origin = request.headers.get('origin') || 
                   request.headers.get('referer')?.split('/').slice(0, 3).join('/') ||
                   'https://wetwo-vendors.vercel.app'
    
    const magicLink = `${origin}/sanctuary/celebrate/couple/${slug}/dashboard?token=${magicToken}`
    
    // Registry URL on Shopify
    const registryUrl = shopifyCollectionHandle 
      ? `https://wetwo.love/collections/${shopifyCollectionHandle}?ref=${slug}`
      : `https://wetwo.love/collections/registry-${slug}?ref=${slug}`
    
    // Dashboard URL
    const dashboardUrl = `https://wetwo-vendors.vercel.app/sanctuary/celebrate/couple/${slug}/dashboard?token=${magicToken}`

    console.log('🔗 Registry URL:', registryUrl)
    console.log('🔗 Dashboard URL:', dashboardUrl)

    // 📧 SEND WELCOME EMAIL
    await sendWelcomeEmail(newCouple, registryUrl, dashboardUrl)

    // Look up vendor name for admin email
    let referringVendorName = ''
    if (referred_by_vendor_id) {
      try {
        const { data: vn } = await supabase
          .from('vendors')
          .select('business_name')
          .eq('id', referred_by_vendor_id)
          .single()
        referringVendorName = vn?.business_name || referred_by_vendor_id
      } catch {}
    }

    // 📧 SEND ADMIN NOTIFICATION
    try {
      const budgetInfo = budget_range ? `<p><strong>Budget:</strong> ${budget_range}</p>` : ''
      const guestInfo = guest_count ? `<p><strong>Guests:</strong> ${guest_count}</p>` : ''
      const dateInfo = wedding_date ? `<p><strong>Date:</strong> ${wedding_date}</p>` : ''
      const locationInfo = wedding_location ? `<p><strong>Location:</strong> ${wedding_location}</p>` : ''
      const phoneInfo = phone ? `<p><strong>📱 Phone:</strong> <a href="tel:${phone}">${phone}</a></p>` : ''
      
      await resend.emails.send({
        from: 'WeTwo <notify@noreply.wetwo.love>',
        to: 'david@wetwo.love',
        subject: `🎉 New signup: ${partner_a}${hasPartner ? ` & ${partnerB}` : ''}${referringVendorName ? ` via ${referringVendorName}` : ''}${budget_range ? ` (${budget_range})` : ''}${phone ? ' 📱' : ''}`,
        html: `
          <div style="font-family: -apple-system, sans-serif; padding: 20px;">
            <h2 style="color: #1a1a2e;">New Registry Signup!</h2>
            <p><strong>Couple:</strong> ${partner_a}${hasPartner ? ` & ${partnerB}` : ''}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phoneInfo}
            <p><strong>State:</strong> ${stateValue}</p>
            ${budgetInfo}
            ${guestInfo}
            ${dateInfo}
            ${locationInfo}
            <p><strong>Source:</strong> ${source || 'Direct signup'}</p>
            ${referringVendorName ? `<p><strong>🤝 Referred by:</strong> <span style="color: #22c55e; font-weight: 700;">${referringVendorName}</span></p>` : ''}
            <p><strong>📊 GoAffPro:</strong> ${coupleAffiliateId ? `✅ Affiliate ${coupleAffiliateId}` : '❌ Not created'}</p>
            <p><strong>Status:</strong> ⏳ Pending email verification</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p>
              <a href="https://wetwo-vendors.vercel.app/api/admin?key=wetwo-admin-2026&view=overview" style="background: #1a1a2e; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none;">Open Admin</a>
              &nbsp;&nbsp;
              <a href="${dashboardUrl}" style="background: #d4af74; color: #0a0a15; padding: 10px 20px; border-radius: 6px; text-decoration: none;">View Their Dashboard</a>
            </p>
          </div>
        `
      })
      console.log('📧 Admin notification sent to david@wetwo.love')
    } catch (notifyError) {
      console.error('⚠️ Admin notification failed (non-blocking):', notifyError)
    }

    // Track couple signup event
    trackEvent({
      event_type: 'couple_signup',
      vendor_ref: newCouple?.referred_by_vendor_id || undefined,
      actor_name: newCouple?.partner_a && newCouple?.partner_b ? `${newCouple.partner_a} & ${newCouple.partner_b}` : undefined,
      actor_email: newCouple?.email || undefined,
      summary: `New couple signup: ${newCouple?.partner_a || ''} & ${newCouple?.partner_b || ''} under ${newCouple?.referred_by_vendor || 'direct'}`,
      metadata: { slug: newCouple?.slug },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Registry created successfully!',
      magicLink,
      registryUrl,
      dashboardUrl,
      couple: newCouple
    })
  } catch (error: any) {

    return NextResponse.json(
      { 
        success: false, 
        message: 'Server error: ' + (error.message || 'Unknown error')
      },
      { status: 500 }
    )
  }
}