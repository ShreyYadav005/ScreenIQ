import { useState } from "react";
import { PixelGrid, FloatingPixels } from "../components/ui/Decorations";
import { PixelBorder, LiveBadge } from "../components/ui/PageWrapper";

export function LandingPage({ onNavigate }) {
  const [pageClass, setPageClass] = useState("");

  function handleNav(page) {
    setPageClass("zoom-out");
    setTimeout(() => onNavigate(page), 380);
  }

  return (
    <div className={`scanlines ${pageClass}`} style={{
      width: "100vw", height: "100vh",
      background: "var(--cream)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden"
    }}>
      <PixelGrid />
      <PixelBorder />
      <FloatingPixels />

      {/* Top bar */}
      <div style={{
        position: "absolute", top: 24, left: 24, right: 24,
        display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10
      }}>
        <div style={{ fontFamily: "var(--pixel)", fontSize: 7, color: "#999", letterSpacing: 1 }}>v1.0.0</div>
        <LiveBadge />
        <div style={{ fontFamily: "var(--pixel)", fontSize: 7, color: "#999", letterSpacing: 1 }}>ML + AI</div>
      </div>

      {/* Main content */}
      <div style={{ textAlign: "center", zIndex: 10, position: "relative" }}>

        {/* Logo */}
        <div className="float" style={{ marginBottom: 8 }}>
          <div style={{
            fontFamily: "var(--pixel)", fontSize: "clamp(28px,5vw,52px)",
            color: "var(--black)", letterSpacing: 2,
            textShadow: "4px 4px 0 #4af54a, 8px 8px 0 rgba(0,0,0,0.15)"
          }}>
            SCREEN IQ
          </div>
        </div>

        {/* Tagline */}
        <div style={{ fontFamily: "var(--vt)", fontSize: 22, color: "#555", marginBottom: 50, letterSpacing: 2 }}>
          AI-POWERED RESUME INTELLIGENCE
          <span className="blink" style={{ marginLeft: 4 }}>_</span>
        </div>

        {/* I am a... */}
        <div style={{ fontFamily: "var(--pixel)", fontSize: 11, color: "#666", marginBottom: 28, letterSpacing: 2 }}>
          I AM A...
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 32, justifyContent: "center", alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <button
              className="px-btn shake"
              onClick={() => handleNav("jobseeker")}
              style={{ background: "var(--green)", color: "var(--black)", fontSize: 12, borderRadius: 40 }}
            >
              JOB SEEKER
            </button>
            <div style={{ fontFamily: "var(--pixel)", fontSize: 7, color: "#888", marginTop: 12, letterSpacing: 1 }}>
              FIX YOUR RESUME
            </div>
          </div>

          <div style={{ fontFamily: "var(--pixel)", fontSize: 14, color: "#ccc" }}>VS</div>

          <div style={{ textAlign: "center" }}>
            <button
              className="px-btn shake"
              onClick={() => handleNav("recruiter")}
              style={{ background: "var(--cyan)", color: "var(--black)", fontSize: 12, borderRadius: 40 }}
            >
              RECRUITER
            </button>
            <div style={{ fontFamily: "var(--pixel)", fontSize: 7, color: "#888", marginTop: 12, letterSpacing: 1 }}>
              SCREEN CANDIDATES
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 52 }}>
          {[
            { val: "2,484", label: "RESUMES TRAINED" },
            { val: "24",    label: "CATEGORIES" },
            { val: "79.84%", label: "ACCURACY" },
          ].map(s => (
            <div key={s.label} className="px-card" style={{ padding: "10px 16px", background: "white" }}>
              <div style={{ fontFamily: "var(--pixel)", fontSize: 13, color: "var(--black)", textShadow: "2px 2px 0 #4af54a" }}>{s.val}</div>
              <div style={{ fontFamily: "var(--pixel)", fontSize: 6, color: "#888", marginTop: 4, letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom ticker */}
      <div style={{
        position: "absolute", bottom: 24, left: 24, right: 24,
        overflow: "hidden", borderTop: "2px solid var(--black)", paddingTop: 8
      }}>
        <div style={{
          fontFamily: "var(--pixel)", fontSize: 7, color: "#aaa", letterSpacing: 2,
          whiteSpace: "nowrap",
          animation: "march 18s linear infinite"
        }}>
          ◆ SCREEN IQ — RESUME INTELLIGENCE ◆ ML + AI POWERED ◆ RECRUITER & JOB SEEKER MODES ◆ ATS SCORING ◆ GROQ AI FEEDBACK ◆ BUILT WITH FASTAPI + REACT ◆
        </div>
      </div>
    </div>
  );
}
