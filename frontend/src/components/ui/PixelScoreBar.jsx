import { useState, useEffect } from "react";

export function PixelScoreBar({ label, value, max = 100, color, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value), delay + 200);
    return () => clearTimeout(t);
  }, [value]);
  const pct = Math.round((value / max) * 100);

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontFamily: "var(--pixel)", fontSize: 7, letterSpacing: 0.5 }}>{label}</span>
        <span style={{ fontFamily: "var(--pixel)", fontSize: 7, color }}>{pct}%</span>
      </div>
      <div style={{ height: 14, border: "2px solid var(--black)", background: "var(--cream)", position: "relative", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${w}%`,
          background: color,
          transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
          backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(0,0,0,0.1) 6px, rgba(0,0,0,0.1) 8px)"
        }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(0,0,0,0.08) 6px, rgba(0,0,0,0.08) 8px)" }} />
      </div>
    </div>
  );
}

export function BigScore({ score, label }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let x = 0;
    const t = setInterval(() => {
      x = Math.min(x + 1.5, score);
      setN(Math.round(x));
      if (x >= score) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [score]);
  const color = score >= 75 ? "#4af54a" : score >= 50 ? "#f5a44a" : "#f54a4a";

  return (
    <div className="px-card" style={{ padding: "20px 24px", textAlign: "center", background: "var(--cream)" }}>
      <div style={{ fontFamily: "var(--pixel)", fontSize: 8, marginBottom: 8, letterSpacing: 1 }}>{label}</div>
      <div style={{ fontFamily: "var(--pixel)", fontSize: 40, color, lineHeight: 1, textShadow: `3px 3px 0 var(--black)` }}>{n}</div>
      <div style={{ fontFamily: "var(--pixel)", fontSize: 8, color: "#666", marginTop: 4 }}>/100</div>
    </div>
  );
}
