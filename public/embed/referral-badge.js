// ============================================
// WETWO REFERRAL BADGE - SELF-HOSTED VERSION
// Host at: public/embed/referral-badge.js
// ============================================

(function() {
  'use strict';
  
  // Only run on registry collection pages
  var path = window.location.pathname;
  var match = path.match(/\/collections\/registry-([a-z0-9-]+)/i);
  if (!match) return;
  
  var slug = match[1];
  
  // Find or create container
  var container = document.getElementById('wetwo-referral-badge');
  if (!container) {
    var collectionContent = document.querySelector('.collection, [data-section-type="collection"], main');
    if (collectionContent) {
      container = document.createElement('div');
      container.id = 'wetwo-referral-badge';
      collectionContent.insertBefore(container, collectionContent.firstChild);
    } else {
      return;
    }
  }

  // Fetch referral info from Next.js app
  fetch('https://wetwo-vendors.vercel.app/api/couples/referral?slug=' + encodeURIComponent(slug))
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (!data.referral) return;
      
      var vendor = data.referral.vendor;
      
      var photoHtml = vendor.photo_url 
        ? '<img src="' + vendor.photo_url + '" alt="" style="width:22px;height:22px;border-radius:50%;object-fit:cover;" />'
        : '';
      
      container.innerHTML = '<div style="text-align:center;margin-bottom:20px;">' +
        '<a href="https://wetwo-vendors.vercel.app/vendor/' + vendor.ref + '" ' +
           'target="_blank" ' +
           'rel="noopener noreferrer" ' +
           'style="' +
             'display:inline-flex;' +
             'align-items:center;' +
             'gap:8px;' +
             'padding:8px 16px;' +
             'background:rgba(255,255,255,0.95);' +
             'border-radius:20px;' +
             'text-decoration:none;' +
             'font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;' +
             'font-size:13px;' +
             'color:#666;' +
             'box-shadow:0 2px 8px rgba(0,0,0,0.08);' +
             'transition:all 0.2s ease;' +
           '" ' +
           'onmouseover="this.style.background=\'#fff\';this.style.boxShadow=\'0 4px 12px rgba(0,0,0,0.12)\';" ' +
           'onmouseout="this.style.background=\'rgba(255,255,255,0.95)\';this.style.boxShadow=\'0 2px 8px rgba(0,0,0,0.08)\';"' +
        '>' +
          photoHtml +
          '<span>Referred by <strong style="color:#1a1a2e;">' + vendor.business_name + '</strong></span>' +
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2">' +
            '<path d="M7 17L17 7M17 7H7M17 7V17"/>' +
          '</svg>' +
        '</a>' +
      '</div>';
    })
    .catch(function(err) {
      console.error('WeTwo referral badge error:', err);
    });
})();
