'use client';

import { useState } from 'react';
import type { Vendor } from '@/lib/types';

export function MenuAccordionSection({ vendor }: { vendor: Vendor }) {
  const cats = Array.isArray(vendor.menu_categories) ? vendor.menu_categories : [];
  const [openId, setOpenId] = useState<number | null>(null);

  if (cats.length === 0) return null;

  return (
    <section id="menu" className="section section-alt">
      <div className="section-header">
        <span className="section-label">Our Menu</span>
        <h2 className="section-title">Cuisine &amp; Menus</h2>
      </div>

      <div className="menu-dropdown">
        {cats.map((cat, idx) => {
          // Support both old format (category) and new format (name)
          const catName = cat.name || (cat as any).category || 'Menu';
          const catIcon = cat.icon || '🍽️';
          const catSubtitle = cat.subtitle || (cat as any).description || '';
          const catId = cat.id ?? idx;
          const isOpen = openId === catId;

          return (
            <div key={catId} style={{ marginBottom: '8px' }}>
              <button
                className={`menu-toggle${isOpen ? ' open' : ''}`}
                onClick={() => setOpenId(isOpen ? null : catId)}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="menu-toggle-icon">{catIcon}</div>
                  <div className="menu-toggle-label">
                    <strong>{catName}</strong>
                    {catSubtitle && <span>{catSubtitle}</span>}
                  </div>
                </div>
                <span className="menu-chevron">▾</span>
              </button>
              <div className={`menu-body${isOpen ? ' open' : ''}`}>
                <div className="menu-body-inner">
                  {/* Image if present */}
                  {cat.imageUrl && (
                    <img
                      src={cat.imageUrl}
                      alt={catName}
                      style={{ width: '100%', maxWidth: '700px', borderRadius: '10px', marginBottom: '16px' }}
                    />
                  )}
                  {/* Menu items */}
                  {(cat.items || []).map((item: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '12px 0',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                        {item.description && (
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {item.description}
                          </div>
                        )}
                      </div>
                      {item.price && (
                        <div style={{ color: 'var(--primary)', fontWeight: 600, flexShrink: 0, marginLeft: '16px' }}>
                          {item.price}
                        </div>
                      )}
                    </div>
                  ))}
                  {/* If no items but has image, the image is the menu */}
                  {(!cat.items || cat.items.length === 0) && !cat.imageUrl && (
                    <div style={{ padding: '16px', color: 'var(--text-muted)', textAlign: 'center' }}>
                      No items listed
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
