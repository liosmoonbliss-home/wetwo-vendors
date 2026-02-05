import { Vendor } from './types';
export function getVendorLinks(vendor: Vendor) {
  const ref = vendor.ref;
  const code = vendor.goaffpro_referral_code || `vendor-${ref}`;
  return {
    page: `/vendor/${ref}`, pageAbsolute: `https://wetwo.love/vendor/${ref}`,
    affiliateLink: vendor.affiliate_link || `https://wetwo.love?ref=${code}`,
    shopLink: `https://wetwo.love?ref=${code}`, gateLink: `https://loopapp.love/wetwo/shop?ref=${code}`,
    coupleSignup: `https://loopapp.love/wetwo/couple/signup?ref=${code}`,
    tierStarter: 'https://wetwo.love/products/wetwo-vendor-subscription-starter-tier',
    tierGrowth: 'https://wetwo.love/products/wetwo-vendor-subscription-growth-tier',
    tierPro: 'https://wetwo.love/products/wetwo-vendor-subscription-pro-tier',
    goaffproDashboard: 'https://goaffpro.com/login',
    instagram: vendor.instagram_handle ? `https://instagram.com/${vendor.instagram_handle.replace('@','')}` : null,
    website: vendor.website || null,
  };
}
