'use client';

import { useState } from 'react';
import type { Vendor } from '@/lib/types';

export function MenuAccordionSection({ vendor }: { vendor: Vendor }) {
  const cats = Array.isArray(vendor.menu_categories) ? vendor.menu_categories : [];
  const [openId, setOpenId] = useState<number | null>(cats[0]?.id ?? null);

  if (cats.length === 0) return null;

  return (
    <section id="menu" className="section section-alt">
      <div className="section-header">
        <span className="section-label">Our Menu</span>
        <h2 className="section-title">Cuisine &amp; Menus</h2>
      </div>

      <div className="menu-dropdown">
        {cats.map(cat => {
          const isOpen = openId === cat.id;
          return (
            <div key={cat.id} style={{ marginBottom: '8px' }}>
              <button
                className={`menu-toggle${isOpen ? ' open' : ''}`}
                onClick={() => setOpenId(isOpen ? null : cat.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="menu-toggle-icon">{cat.icon}</div>
                  <div className="menu-toggle-label">
                    <strong>{cat.name}</strong>
                    {cat.subtitle && <span>{cat.subtitle}</span>}
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
                      alt={cat.name}
                      style={{ width: '100%', maxWidth: '700px', borderRadius: '10px', marginBottom: '16px' }}
                    />
                  )}
                  {/* Menu items */}
                  {(cat.items || []).map((item, i) => (
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
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
