import { useState, useEffect } from "react";

export function LiveBadge() {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      border: "2px solid var(--black)", padding: "4px 10px",
      background: "#4af54a",
      fontFamily: "var(--pixel)", fontSize: 7, letterSpacing: 1
    }}>
      <span className="blink" style={{ fontSize: 10 }}>●</span>
      API LIVE
    </div>
  );
}

export function PixelBorder() {
  return (
    <div style={{
      position: "fixed", inset: 12, zIndex: 100,
      border: "4px solid var(--black)",
      pointerEvents: "none",
      boxShadow: "inset 0 0 0 2px var(--cream), 0 0 0 2px var(--black)"
    }} />
  );
}

export function PageWrapper({ children, onBack, accentColor, title, subtitle }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 10); }, []);

  return (
    <div className={`scanlines ${mounted ? "zoom-in" : ""}`} style={{
      width: "100vw", minHeight: "100vh",
      background: "var(--cream)",
      display: "flex", flexDirection: "column",
      position: "relative", overflow: "auto"
    }}>
      <PixelBorder />

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 28px 16px",
        borderBottom: "3px solid var(--black)",
        background: accentColor, zIndex: 10, flexShrink: 0
      }}>
        <button onClick={onBack} className="px-btn" style={{
          background: "var(--cream)", color: "var(--black)",
          fontSize: 8, padding: "8px 14px"
        }}>← BACK</button>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--pixel)", fontSize: 14, color: "var(--black)", textShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}>{title}</div>
          <div style={{ fontFamily: "var(--vt)", fontSize: 16, color: "var(--black)", opacity: 0.7, marginTop: 2 }}>{subtitle}</div>
        </div>

        <LiveBadge />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: "20px 28px" }}>
        {children}
      </div>
    </div>
  );
}
