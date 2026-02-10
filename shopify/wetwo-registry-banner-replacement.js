  // ═══════════════════════════════════════════════════════
  // STORE/HOMEPAGE - Show appropriate banner
  // ═══════════════════════════════════════════════════════
  if (refSlug && !isRegistryPage && !isProductPage) {
    setTimeout(async () => {
      if (document.querySelector('.wetwo-shopping-badge')) return;
      
      const badge = document.createElement('div');
      badge.className = 'wetwo-shopping-badge';
      
      let usePillStyle = false;
      
      // Different message for couple vs guest
      if (isEditMode) {
        badge.innerHTML = '🛍️ <strong>Shopping Mode</strong> — Browse products and click "Add to My Registry" to add items';
        console.log('[WeTwo] Couple shopping mode - showing add button');
      } else if (isVendorRef) {
        // VENDOR REF: Shopper came through vendor's link
        // Show clean "Referred by" pill matching registry style — no cashback language
        usePillStyle = true;
        console.log('[WeTwo] Vendor ref detected, looking up business name...');
        
        try {
          const res = await fetch(
            `${SUPABASE_URL}/rest/v1/vendors?ref=eq.${encodeURIComponent(vendorSlug)}&select=business_name,ref,photo_url`,
            {
              headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
              }
            }
          );
          const vendors = await res.json();
          
          if (vendors && vendors.length > 0 && vendors[0].business_name) {
            const vendorName = vendors[0].business_name;
            const vendorPhoto = vendors[0].photo_url || '';
            const vendorPageUrl = `https://wetwo-vendors.vercel.app/vendor/${vendorSlug}`;
            
            const logoHtml = vendorPhoto 
              ? `<img src="${vendorPhoto}" style="width:22px;height:22px;border-radius:50%;object-fit:cover;border:1px solid rgba(255,255,255,0.15);" />`
              : `<span style="width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,0.12);display:inline-flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.7);font-size:10px;font-weight:700;">${vendorName.charAt(0)}</span>`;
            
            badge.innerHTML = `<a href="${vendorPageUrl}" target="_blank" style="display:inline-flex;align-items:center;gap:8px;padding:8px 18px 8px 10px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:24px;font-size:14px;color:rgba(255,255,255,0.7);text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;transition:all 0.2s;"
              onmouseover="this.style.background='rgba(255,255,255,0.12)';this.style.borderColor='rgba(255,255,255,0.25)'"
              onmouseout="this.style.background='rgba(255,255,255,0.08)';this.style.borderColor='rgba(255,255,255,0.15)'"
            >${logoHtml} Referred by <strong style="color:rgba(255,255,255,0.9);">${vendorName}</strong> <span style="font-size:12px;opacity:0.5;">↗</span></a>`;
            console.log('[WeTwo] Vendor name found:', vendorName);
          } else {
            const parsedName = vendorSlug.replace(/-[a-z0-9]{3,5}$/, '').split('-').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
            const vendorPageUrl = `https://wetwo-vendors.vercel.app/vendor/${vendorSlug}`;
            badge.innerHTML = `<a href="${vendorPageUrl}" target="_blank" style="display:inline-flex;align-items:center;gap:8px;padding:8px 18px 8px 14px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:24px;font-size:14px;color:rgba(255,255,255,0.7);text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Referred by <strong style="color:rgba(255,255,255,0.9);">${parsedName}</strong> <span style="font-size:12px;opacity:0.5;">↗</span></a>`;
            console.log('[WeTwo] Vendor lookup failed, using parsed name:', parsedName);
          }
        } catch (err) {
          console.error('[WeTwo] Vendor lookup error:', err);
          const parsedName = vendorSlug.replace(/-[a-z0-9]{3,5}$/, '').split('-').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
          const vendorPageUrl = `https://wetwo-vendors.vercel.app/vendor/${vendorSlug}`;
          badge.innerHTML = `<a href="${vendorPageUrl}" target="_blank" style="display:inline-flex;align-items:center;gap:8px;padding:8px 18px 8px 14px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:24px;font-size:14px;color:rgba(255,255,255,0.7);text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Referred by <strong style="color:rgba(255,255,255,0.9);">${parsedName}</strong> <span style="font-size:12px;opacity:0.5;">↗</span></a>`;
        }
        
        console.log('[WeTwo] Shopper mode (via vendor) - pill style');
      } else {
        // COUPLE REF: Parse names from slug (e.g., "fran-frank-o16e" -> "Fran & Frank")
        const coupleNames = refSlug.split('-').slice(0, 2).map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' & ');
        badge.innerHTML = `🎁 <strong>Shopping for ${coupleNames}</strong> — Your purchases earn them 25% cashback!`;
        console.log('[WeTwo] Guest shopping mode (couple) - no add button');
      }
      
      if (usePillStyle) {
        // Clean centered pill for vendor attribution
        badge.style.cssText = `
          text-align: center;
          margin: 16px auto;
          max-width: 600px;
          position: relative;
          z-index: 100;
        `;
      } else {
        // Gold banner for couple shopping / edit mode
        badge.style.cssText = `
          background: linear-gradient(135deg, #d4af74 0%, #c9a663 100%);
          color: #0a0a15;
          padding: 14px 24px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          display: block;
          text-align: center;
          margin: 20px auto;
          max-width: 600px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          box-shadow: 0 4px 12px rgba(212, 175, 116, 0.3);
          position: relative;
          z-index: 100;
        `;
      }
      
      // Find insertion point - after hero/slideshow
      const insertPoints = [
        document.querySelector('.slideshow-wrapper'),
        document.querySelector('.hero'),
        document.querySelector('.index-sections > div:first-child'),
        document.querySelector('.shopify-section:first-of-type'),
        document.querySelector('#MainContent > div:first-child'),
        document.querySelector('main > div:first-child'),
        document.querySelector('#MainContent'),
        document.querySelector('main')
      ];
      
      for (const point of insertPoints) {
        if (point) {
          // For container elements, prepend; for section elements, insert after
          if (point.id === 'MainContent' || point.tagName === 'MAIN') {
            point.insertBefore(badge, point.firstChild);
          } else {
            point.insertAdjacentElement('afterend', badge);
          }
          console.log('[WeTwo] Banner inserted near:', point.className || point.id || point.tagName);
          break;
        }
      }
    }, 800); // Slightly longer delay for homepage to load
  }