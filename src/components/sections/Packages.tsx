'use client';

import type { Vendor, SectionId, PricingPackage } from '@/lib/types';

interface Props {
  vendor: Vendor;
  variant?: SectionId;
}

export function PackagesSection({ vendor, variant }: Props) {
  const packages: PricingPackage[] = Array.isArray(vendor.pricing_packages) ? vendor.pricing_packages : [];
  if (packages.length === 0) return null;

  const sectionTitle = variant === 'fleet_showcase' ? 'Our Fleet'
    : variant === 'inventory_grid' ? 'Our Collection'
    : 'Planning Made Simple';

  // For grid layout: if 4+ packages, show first 3 in a row, rest below
  const mainPackages = packages.slice(0, 3);
  const extraPackages = packages.slice(3);

  const colsClass = mainPackages.length === 1 ? 'cols-1'
    : mainPackages.length === 2 ? 'cols-2'
    : '';

  return (
    <section id="packages" className="section">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="section-header">
          <span className="section-label">Our Packages</span>
          <h2 className="section-title">{sectionTitle}</h2>
          <p className="section-subtitle">
            From day-of coordination to complete event planning — choose the level of support that&apos;s right for you.
          </p>
        </div>

        {/* Main packages grid (up to 3) */}
        <div className={`packages-grid ${colsClass}`}>
          {mainPackages.map((pkg, i) => (
            <PackageCard key={pkg.id || i} pkg={pkg} />
          ))}
        </div>

        {/* Extra packages (4th+) shown in a narrower grid below */}
        {extraPackages.length > 0 && (
          <div
            className={`packages-grid ${extraPackages.length === 1 ? 'cols-1' : 'cols-2'}`}
            style={{ marginTop: '24px' }}
          >
            {extraPackages.map((pkg, i) => (
              <PackageCard key={pkg.id || (i + 3)} pkg={pkg} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function PackageCard({ pkg }: { pkg: PricingPackage }) {
  const isFeatured = pkg.featured === true;

  // Extract features: prefer pkg.features array, fallback to parsing bullets from description
  let features: string[] = [];
  if (Array.isArray(pkg.features) && pkg.features.length > 0) {
    features = pkg.features;
  } else if (pkg.description) {
    features = extractBulletPoints(pkg.description);
  }

  // Get a clean short description (first sentence before bullet points)
  const shortDesc = getShortDescription(pkg.description || '', features.length > 0);

  // Parse price for display
  const { mainPrice, priceNote } = parsePrice(pkg.price, pkg.priceNote);

  return (
    <div className={`package-card${isFeatured ? ' featured' : ''}`}>
      {/* Icon */}
      {pkg.icon && (
        <div style={{
          width: '48px', height: '48px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--primary-dim)', borderRadius: '12px',
          fontSize: '22px', marginBottom: '16px',
        }}>
          {pkg.icon}
        </div>
      )}

      <h3 className="package-name">{pkg.name}</h3>
      <div className="package-price">{mainPrice}</div>
      {priceNote && (
        <div className="package-price-note">{priceNote}</div>
      )}

      {shortDesc && (
        <p className="package-desc">{shortDesc}</p>
      )}

      {features.length > 0 && (
        <ul className="package-features">
          {features.map((feat, fi) => (
            <li key={fi}>{feat}</li>
          ))}
        </ul>
      )}

      <a
        href="#contact"
        className="btn"
        style={{
          background: isFeatured ? 'var(--primary)' : 'transparent',
          color: isFeatured ? '#fff' : 'var(--text)',
          border: isFeatured ? 'none' : '1.5px solid var(--border)',
          width: '100%',
          justifyContent: 'center',
          borderRadius: '10px',
          padding: '14px',
          fontWeight: 600,
          marginTop: 'auto',
          textDecoration: 'none',
        }}
      >
        {isFeatured ? 'Inquire Now' : 'Book Now'}
      </a>
    </div>
  );
}

/**
 * Extract bullet points from a description string.
 * Handles •, -, * prefixed lines and numbered lists.
 */
function extractBulletPoints(text: string): string[] {
  const lines = text.split('\n');
  const bullets: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Match lines starting with •, -, *, or numbered (1., 2., etc.)
    const match = trimmed.match(/^[•\-\*]\s*(.+)/) || trimmed.match(/^\d+[.)]\s*(.+)/);
    if (match) {
      const clean = match[1].trim();
      if (clean.length > 5) { // Skip very short fragments
        bullets.push(clean);
      }
    }
  }

  return bullets;
}

/**
 * Get the first sentence/paragraph before bullet points start.
 */
function getShortDescription(text: string, hasBullets: boolean): string {
  if (!text) return '';

  // Split at first bullet indicator
  const bulletStart = text.search(/\n\s*[•\-\*]\s/);
  let desc = bulletStart > 0 ? text.slice(0, bulletStart).trim() : text.trim();

  // If we extracted bullets, keep description short
  if (hasBullets && desc.length > 200) {
    const lastPeriod = desc.lastIndexOf('.', 200);
    if (lastPeriod > 50) {
      desc = desc.slice(0, lastPeriod + 1);
    } else {
      const lastSpace = desc.lastIndexOf(' ', 200);
      desc = desc.slice(0, lastSpace > 0 ? lastSpace : 200) + '…';
    }
  }

  // If no bullets were found and desc is the full text, truncate more aggressively
  if (!hasBullets && desc.length > 180) {
    const lastPeriod = desc.lastIndexOf('.', 180);
    if (lastPeriod > 50) {
      desc = desc.slice(0, lastPeriod + 1);
    } else {
      const lastSpace = desc.lastIndexOf(' ', 180);
      desc = desc.slice(0, lastSpace > 0 ? lastSpace : 180) + '…';
    }
  }

  return desc;
}

/**
 * Parse price string for cleaner display.
 * "$1400 - $2000" → mainPrice: "$1,400", priceNote: "– $2,000"
 */
function parsePrice(price: string, existingNote?: string): { mainPrice: string; priceNote: string } {
  if (existingNote) {
    return { mainPrice: formatPrice(price), priceNote: existingNote };
  }

  // Handle range: "$1400 - $2000"
  const rangeMatch = price.match(/^\$?([\d,]+)\s*[-–]\s*\$?([\d,]+)$/);
  if (rangeMatch) {
    return {
      mainPrice: '$' + addCommas(rangeMatch[1]),
      priceNote: '– $' + addCommas(rangeMatch[2]),
    };
  }

  // Handle "plus" prices: "$4000+"
  const plusMatch = price.match(/^\$?([\d,]+)\+$/);
  if (plusMatch) {
    return {
      mainPrice: '$' + addCommas(plusMatch[1]) + '+',
      priceNote: '',
    };
  }

  // Handle prices with notes: "$1400 / up to 5 hrs"
  const slashMatch = price.match(/^\$?([\d,]+)\s*\/\s*(.+)$/);
  if (slashMatch) {
    return {
      mainPrice: '$' + addCommas(slashMatch[1]),
      priceNote: '/ ' + slashMatch[2],
    };
  }

  return { mainPrice: formatPrice(price), priceNote: '' };
}

function formatPrice(price: string): string {
  // Add commas to numbers in the price string
  return price.replace(/\$?(\d+)/g, (match, num) => {
    return '$' + addCommas(num);
  }).replace(/\$\$/g, '$'); // Fix double dollar signs
}

function addCommas(numStr: string): string {
  const num = numStr.replace(/,/g, '');
  return parseInt(num, 10).toLocaleString();
}
