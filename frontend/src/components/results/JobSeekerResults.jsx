export function JobSeekerResults({ result }) {
  const sc = result.scores;
  const confColor = sc.apply_confidence >= 70 ? "#4af54a" : sc.apply_confidence >= 40 ? "#f5a44a" : "#f54a4a";
  const qualityColor = { STRONG: "#4af54a", AVERAGE: "#f5a44a", WEAK: "#f54a4a", MISSING: "#f54a4a" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>

      {/* Apply confidence banner */}
      <div className="px-card" style={{ padding: "12px 18px", background: confColor }}>
        <div style={{ fontFamily: "var(--pixel)", fontSize: 10, color: "var(--black)", marginBottom: 4 }}>
          APPLY CONFIDENCE: {sc.apply_confidence}%
        </div>
        <div style={{ fontFamily: "var(--vt)", fontSize: 17, color: "var(--black)", opacity: 0.85 }}>
          {sc.apply_confidence_text}
        </div>
      </div>

      {/* 4 score cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {[
          { label: "ATS SCORE",  val: sc.ats_score,        color: sc.ats_score >= 70 ? "#4af54a" : sc.ats_score >= 50 ? "#f5a44a" : "#f54a4a" },
          { label: "STRENGTH",   val: sc.resume_strength,  color: sc.resume_strength >= 70 ? "#4af54a" : "#f5a44a" },
          { label: "JD MATCH",   val: sc.jd_match_percent, color: sc.jd_match_percent >= 70 ? "#4af54a" : "#f5a44a" },
          { label: "CONFIDENCE", val: sc.apply_confidence, color: confColor },
        ].map(s => (
          <div key={s.label} className="px-card" style={{ padding: "10px", textAlign: "center", background: "white" }}>
            <div style={{ fontFamily: "var(--pixel)", fontSize: 20, color: s.color, textShadow: "2px 2px 0 rgba(0,0,0,0.1)" }}>{s.val}</div>
            <div style={{ fontFamily: "var(--pixel)", fontSize: 5, color: "#888", marginTop: 4, letterSpacing: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Section checker */}
      <div className="px-card" style={{ padding: 14, background: "white" }}>
        <div style={{ fontFamily: "var(--pixel)", fontSize: 7, marginBottom: 10, letterSpacing: 1 }}>SECTION CHECKER</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
          {result.section_checker.map(s => (
            <div key={s.section} className="px-card" style={{ padding: "8px 6px", textAlign: "center", background: qualityColor[s.quality] + "22", borderColor: qualityColor[s.quality] }}>
              <div style={{ fontSize: 16 }}>{s.present ? "✓" : "✗"}</div>
              <div style={{ fontFamily: "var(--pixel)", fontSize: 6, marginTop: 4 }}>{s.section.toUpperCase()}</div>
              <div style={{ fontFamily: "var(--pixel)", fontSize: 5, color: qualityColor[s.quality], marginTop: 2 }}>{s.quality}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths + Weaknesses */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="px-card" style={{ padding: 14, background: "#e8ffe8" }}>
          <div style={{ fontFamily: "var(--pixel)", fontSize: 7, color: "#1a5a1a", marginBottom: 10 }}>💪 STRENGTHS</div>
          {result.strengths.map((s, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ fontFamily: "var(--pixel)", fontSize: 6, color: "var(--black)", marginBottom: 2 }}>{s.point}</div>
              <div style={{ fontFamily: "var(--vt)", fontSize: 14, color: "#333", lineHeight: 1.3 }}>{s.detail}</div>
            </div>
          ))}
        </div>
        <div className="px-card" style={{ padding: 14, background: "#ffe8e8" }}>
          <div style={{ fontFamily: "var(--pixel)", fontSize: 7, color: "#5a1a1a", marginBottom: 10 }}>⚠ WEAKNESSES</div>
          {result.weaknesses.map((w, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ fontFamily: "var(--pixel)", fontSize: 6, color: "var(--black)", marginBottom: 2 }}>{w.point}</div>
              <div style={{ fontFamily: "var(--vt)", fontSize: 14, color: "#333", lineHeight: 1.3 }}>{w.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      <div className="px-card" style={{ padding: 14, background: "white" }}>
        <div style={{ fontFamily: "var(--pixel)", fontSize: 7, marginBottom: 10, letterSpacing: 1 }}>💡 SUGGESTIONS</div>
        {result.suggestions.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, padding: "10px", border: "2px solid var(--yellow)", background: "#fffde8" }}>
            <span style={{ fontFamily: "var(--pixel)", fontSize: 9, color: "var(--black)", flexShrink: 0, marginTop: 2 }}>0{i + 1}</span>
            <div>
              <div style={{ fontFamily: "var(--pixel)", fontSize: 7, marginBottom: 4 }}>{s.action}</div>
              <div style={{ fontFamily: "var(--vt)", fontSize: 15, color: "#555", lineHeight: 1.4 }}>{s.detail}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Before / After */}
      <div className="px-card" style={{ padding: 14, background: "white" }}>
        <div style={{ fontFamily: "var(--pixel)", fontSize: 7, marginBottom: 12, letterSpacing: 1 }}>✏ BEFORE → AFTER</div>
        {result.before_after.map((b, i) => (
          <div key={i} style={{ marginBottom: 14, padding: 12, border: "2px dashed #ccc" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
              <div style={{ padding: 10, background: "#ffe8e8", border: "2px solid #f54a4a" }}>
                <div style={{ fontFamily: "var(--pixel)", fontSize: 6, color: "#f54a4a", marginBottom: 4 }}>BEFORE</div>
                <div style={{ fontFamily: "var(--vt)", fontSize: 15, lineHeight: 1.4 }}>"{b.original}"</div>
              </div>
              <div style={{ padding: 10, background: "#e8ffe8", border: "2px solid #4af54a" }}>
                <div style={{ fontFamily: "var(--pixel)", fontSize: 6, color: "#1a5a1a", marginBottom: 4 }}>AFTER</div>
                <div style={{ fontFamily: "var(--vt)", fontSize: 15, lineHeight: 1.4 }}>"{b.improved}"</div>
              </div>
            </div>
            <div style={{ fontFamily: "var(--vt)", fontSize: 14, color: "#888", fontStyle: "italic" }}>💡 {b.why}</div>
          </div>
        ))}
      </div>

    </div>
  );
}
