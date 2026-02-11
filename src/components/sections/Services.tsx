"use client";

import type { Vendor } from "@/lib/types";

interface Props {
  vendor: Vendor;
}

export function ServicesSection({ vendor }: Props) {
  const raw = Array.isArray(vendor.services_included) ? vendor.services_included : [];
  if (raw.length === 0) return null;

  const services = raw.map((s: any) => {
    if (typeof s === "string") {
      try {
        const parsed = JSON.parse(s);
        if (parsed && typeof parsed === "object") {
          return { icon: parsed.icon || "✦", name: parsed.name || "", description: parsed.description || "" };
        }
      } catch {}
      return { icon: "✦", name: s, description: "" };
    }
    if (s && typeof s === "object") {
      return { icon: s.icon || "✦", name: s.name || "", description: s.description || "" };
    }
    return { icon: "✦", name: String(s || ""), description: "" };
  }).filter(s => s.name.trim() !== "");

  if (services.length === 0) return null;

  // Determine grid columns based on count
  const count = services.length;
  const columns = count <= 2 ? count : count === 4 ? 2 : 3;

  return (
    <section id="services_list" className="section">
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 1.5rem" }}>
        <div className="section-header">
          <span className="section-label">What We Offer</span>
          <h2 className="section-title">
            {(vendor as any).services_heading || "Our Services"}
          </h2>
          {(vendor as any).services_subtitle && (
            <p style={{
              fontSize: "1rem",
              color: "var(--text-muted, #6b7280)",
              maxWidth: "550px",
              margin: "0.5rem auto 0",
              lineHeight: 1.6,
            }}>
              {(vendor as any).services_subtitle}
            </p>
          )}
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: "1rem",
        }}>
          {services.map((service, i) => (
            <div
              key={i}
              style={{
                background: "var(--bg-card, #fff)",
                border: "1px solid var(--border, #e5e1dc)",
                borderRadius: "14px",
                padding: "1.5rem 1.25rem",
                textAlign: "center",
                transition: "box-shadow 0.2s ease, transform 0.2s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{
                fontSize: "1.75rem",
                marginBottom: "0.75rem",
                lineHeight: 1,
              }}>
                {service.icon}
              </div>
              <h3 style={{
                margin: "0 0 0.5rem",
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "var(--text, #1a1a1a)",
                lineHeight: 1.3,
              }}>
                {service.name}
              </h3>
              {service.description && (
                <p style={{
                  margin: 0,
                  fontSize: "0.85rem",
                  lineHeight: 1.6,
                  color: "var(--text-muted, #6b7280)",
                }}>
                  {service.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #services_list > div > div:last-of-type {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          #services_list > div > div:last-of-type {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}
