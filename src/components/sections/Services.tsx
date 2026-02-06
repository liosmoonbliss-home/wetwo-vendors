"use client";

import { useState } from "react";
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
          return { name: parsed.name || "", description: parsed.description || "" };
        }
      } catch {}
      return { name: s, description: "" };
    }
    if (s && typeof s === "object") {
      return { name: s.name || "", description: s.description || "" };
    }
    return { name: String(s || ""), description: "" };
  }).filter(s => s.name.trim() !== "");

  if (services.length === 0) return null;

  return (
    <section id="services_list" className="section">
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 1.5rem" }}>
        <div className="section-header">
          <span className="section-label">What We Offer</span>
          <h2 className="section-title">Our Services</h2>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", justifyContent: "center" }}>
          {services.map((service, i) => (
            <ServicePill key={i} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicePill({ service }: { service: { name: string; description: string } }) {
  const [open, setOpen] = useState(false);
  const hasDesc = service.description && service.description.trim().length > 0;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => hasDesc && setOpen(!open)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          padding: "0.55rem 1.2rem",
          borderRadius: "100px",
          border: open ? "1.5px solid var(--primary, #10b981)" : "1.5px solid var(--border, #e5e1dc)",
          background: open ? "var(--primary-dim, rgba(16,185,129,0.08))" : "transparent",
          color: open ? "var(--primary, #10b981)" : "var(--text, #1a1a1a)",
          cursor: hasDesc ? "pointer" : "default",
          fontSize: "0.9rem",
          fontWeight: 500,
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          letterSpacing: "0.01em",
          transition: "all 0.2s ease",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={e => {
          if (hasDesc) {
            e.currentTarget.style.borderColor = "var(--primary, #10b981)";
            e.currentTarget.style.color = "var(--primary, #10b981)";
          }
        }}
        onMouseLeave={e => {
          if (!open) {
            e.currentTarget.style.borderColor = "var(--border, #e5e1dc)";
            e.currentTarget.style.color = "var(--text, #1a1a1a)";
          }
        }}
      >
        {service.name}
        {hasDesc && (
          <span style={{
            fontSize: "0.65rem",
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            opacity: 0.5,
          }}>
            ▼
          </span>
        )}
      </button>

      {open && hasDesc && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 0.5rem)",
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(360px, 90vw)",
            padding: "1.25rem",
            background: "var(--bg-card, #fff)",
            border: "1px solid var(--border, #e5e1dc)",
            borderRadius: "12px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
            zIndex: 20,
            animation: "fadeIn 0.15s ease",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
            <h4 style={{
              margin: 0,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "1.15rem",
              fontWeight: 600,
              color: "var(--text)",
            }}>
              {service.name}
            </h4>
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false); }}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: "1rem",
                padding: "0.2rem",
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
          <p style={{
            margin: 0,
            fontSize: "0.88rem",
            lineHeight: 1.7,
            color: "var(--text-muted, #6b7280)",
          }}>
            {service.description}
          </p>
        </div>
      )}
    </div>
  );
}
