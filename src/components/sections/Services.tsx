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

  return (
    <section id="services_list" className="section" >
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 1.5rem" }}>
        <div className="section-header">
          <span className="section-label">What We Offer</span>
          <h2 className="section-title">Our Services</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {services.map((service, i) => (
            <ServiceRow key={i} service={service} index={i} isLast={i === services.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceRow({ service, index, isLast }: { service: { icon: string; name: string; description: string }; index: number; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const hasLongDesc = (service.description?.length || 0) > 120;
  const displayDesc = expanded ? service.description : (service.description || "").slice(0, 120);
  const even = index % 2 === 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: even ? "row" : "row-reverse",
        alignItems: "center",
        gap: "2rem",
        padding: "2rem 0",
        borderBottom: isLast ? "none" : "1px solid var(--border, #e5e1dc)",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "var(--accent, #10b981)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          flexShrink: 0,
          color: "#fff",
          opacity: 0.9,
        }}
      >
        {service.icon}
      </div>
      <div style={{ flex: 1, textAlign: even ? "left" : "right" }}>
        <h3
          style={{
            fontSize: "1.25rem",
            fontWeight: 600,
            margin: "0 0 0.35rem 0",
            color: "var(--text)",
          }}
        >
          {service.name}
        </h3>
        {service.description && (
          <p
            style={{
              fontSize: "0.95rem",
              lineHeight: 1.6,
              color: "var(--text-muted, #6b7280)",
              margin: 0,
            }}
          >
            {displayDesc}{hasLongDesc && !expanded && "…"}
          </p>
        )}
        {hasLongDesc && (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: "none",
              border: "none",
              color: "var(--accent, #10b981)",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 600,
              padding: "0.35rem 0 0 0",
              textAlign: even ? "left" : "right",
              display: "block",
              marginLeft: even ? "0" : "auto",
            }}
          >
            {expanded ? "← Show less" : "Read more →"}
          </button>
        )}
      </div>
    </div>
  );
}
