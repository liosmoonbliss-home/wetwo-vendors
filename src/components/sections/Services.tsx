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
          return { icon: parsed.icon || "", name: parsed.name || "", description: parsed.description || "" };
        }
      } catch {}
      return { icon: "", name: s, description: "" };
    }
    if (s && typeof s === "object") {
      return { icon: s.icon || "", name: s.name || "", description: s.description || "" };
    }
    return { icon: "", name: String(s || ""), description: "" };
  }).filter(s => s.name.trim() !== "");

  if (services.length === 0) return null;

  return (
    <section id="services_list" className="section">
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 1.5rem" }}>
        <div className="section-header">
          <span className="section-label">What We Offer</span>
          <h2 className="section-title">Our Services</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {services.map((service, i) => (
            <ServiceItem key={i} service={service} index={i} total={services.length} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceItem({ service, index, total }: { service: { icon: string; name: string; description: string }; index: number; total: number }) {
  const [expanded, setExpanded] = useState(false);
  const hasLongDesc = (service.description?.length || 0) > 150;
  const displayDesc = expanded ? service.description : (service.description || "").slice(0, 150);
  const isLast = index === total - 1;

  return (
    <div
      style={{
        padding: "2rem 0",
        borderBottom: isLast ? "none" : "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", marginBottom: service.description ? "0.75rem" : "0" }}>
        <span
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "0.85rem",
            fontWeight: 300,
            color: "var(--primary, #10b981)",
            minWidth: "1.5rem",
            letterSpacing: "0.02em",
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "1.5rem",
            fontWeight: 600,
            margin: 0,
            color: "var(--text)",
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
          }}
        >
          {service.name}
        </h3>
      </div>
      {service.description && (
        <div style={{ paddingLeft: "2.5rem" }}>
          <p
            style={{
              fontSize: "0.92rem",
              lineHeight: 1.7,
              color: "var(--text-muted, #6b7280)",
              margin: 0,
              fontWeight: 400,
            }}
          >
            {displayDesc}{hasLongDesc && !expanded && "…"}
          </p>
          {hasLongDesc && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary, #10b981)",
                cursor: "pointer",
                fontSize: "0.82rem",
                fontWeight: 600,
                padding: "0.5rem 0 0 0",
                letterSpacing: "0.03em",
                textTransform: "uppercase",
              }}
            >
              {expanded ? "← Less" : "Read more →"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
