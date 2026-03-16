import { BigScore } from "../ui/PixelScoreBar";
import { PixelScoreBar } from "../ui/PixelScoreBar";

export function RecruiterResults({ result }) {
  const verdictColor =
    result.recruiter_verdict?.decision === "STRONG HIRE" ? "#4af54a"
    : result.recruiter_verdict?.decision === "CONSIDER" ? "#f5a44a"
    : "#f54a4a";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>

      {/* Verdict banner */}
      <div className="px-card" style={{ padding: "14px 18px", background: verdictColor }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "var(--pixel)", fontSize: 18, color: "var(--black)", textShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}>
              {result.recruiter_verdict.decision}
            </div>
            <div style={{ fontFamily: "var(--vt)", fontSize: 16, color: "var(--black)", marginTop: 4, opacity: 0.8 }}>
              {result.recruiter_verdict.reasoning}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--pixel)", fontSize: 28, color: "var(--black)" }}>{result.recruiter_verdict.confidence}%</div>
            <div style={{ fontFamily: "var(--pixel)", fontSize: 6, color: "var(--black)", opacity: 0.7 }}>CONFIDENCE</div>
          </div>
        </div>
      </div>

      {/* Candidate overview + ATS score */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="px-card" style={{ padding: 14, background: "white" }}>
          <div style={{ fontFamily: "var(--pixel)", fontSize: 7, marginBottom: 10, letterSpacing: 1 }}>CANDIDATE</div>
          {Object.entries(result.candidate_overview).map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, borderBottom: "1px dashed #eee", paddingBottom: 4 }}>
              <span style={{ fontFamily: "var(--pixel)", fontSize: 6, color: "#888", textTransform: "uppercase" }}>{k.replace(/_/g, " ")}</span>
              <span style={{ fontFamily: "var(--vt)", fontSize: 15, color: "var(--black)", fontWeight: 700 }}>{v}</span>
            </div>
          ))}
        </div>

        <BigScore score={result.ats_score} label="ATS SCORE" />
      </div>

      {/* JD Match */}
      <div className="px-card" style={{ padding: 14, background: "white" }}>
        <div style={{ fontFamily: "var(--pixel)", fontSize: 7, marginBottom: 10, letterSpacing: 1 }}>
          JD MATCH — {result.jd_match.overall_match_percent}%
        </div>
        <PixelScoreBar label="OVERALL MATCH" value={result.jd_match.overall_match_percent} color="var(--cyan)" delay={0} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
          <div>
            <div style={{ fontFamily: "var(--pixel)", fontSize: 6, color: "#4af54a", marginBottom: 6 }}>SKILLS FOUND</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {result.jd_match.skills_found.map(s => (
                <span key={s} className="px-tag" style={{ background: "#e8ffe8", fontSize: 6 }}>{s}</span>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "var(--pixel)", fontSize: 6, color: "#f54a4a", marginBottom: 6 }}>SKILLS MISSING</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {result.jd_match.skills_missing.length > 0
                ? result.jd_match.skills_missing.map(s => (
                    <span key={s} className="px-tag" style={{ background: "#ffe8e8", fontSize: 6 }}>{s}</span>
                  ))
                : <span style={{ fontFamily: "var(--vt)", fontSize: 16, color: "#4af54a" }}>NONE ✓</span>
              }
            </div>
          </div>
        </div>
      </div>

      {/* Key achievements */}
      <div className="px-card" style={{ padding: 14, background: "white" }}>
        <div style={{ fontFamily: "var(--pixel)", fontSize: 7, marginBottom: 10, letterSpacing: 1 }}>KEY ACHIEVEMENTS</div>
        {result.resume_breakdown.key_achievements.map((a, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
            <span style={{ fontFamily: "var(--pixel)", fontSize: 8, color: "var(--cyan)", flexShrink: 0 }}>▶</span>
            <span style={{ fontFamily: "var(--vt)", fontSize: 16, lineHeight: 1.3 }}>{a}</span>
          </div>
        ))}
      </div>

      {/* Reasons to hire + Concerns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="px-card" style={{ padding: 14, background: "#e8ffe8" }}>
          <div style={{ fontFamily: "var(--pixel)", fontSize: 7, color: "#1a5a1a", marginBottom: 10 }}>REASONS TO HIRE</div>
          {result.recruiter_verdict.reasons_to_hire.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              <span style={{ color: "#4af54a", fontFamily: "var(--pixel)", fontSize: 8 }}>✓</span>
              <span style={{ fontFamily: "var(--vt)", fontSize: 15, lineHeight: 1.3 }}>{r}</span>
            </div>
          ))}
        </div>
        <div className="px-card" style={{ padding: 14, background: result.recruiter_verdict.concerns.length === 0 ? "#e8ffe8" : "#ffe8e8" }}>
          <div style={{ fontFamily: "var(--pixel)", fontSize: 7, color: "#5a1a1a", marginBottom: 10 }}>CONCERNS</div>
          {result.recruiter_verdict.concerns.length === 0
            ? <span style={{ fontFamily: "var(--vt)", fontSize: 18, color: "#4af54a" }}>NO CONCERNS ✓</span>
            : result.recruiter_verdict.concerns.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                  <span style={{ color: "#f54a4a", fontFamily: "var(--pixel)", fontSize: 8 }}>!</span>
                  <span style={{ fontFamily: "var(--vt)", fontSize: 15, lineHeight: 1.3 }}>{c}</span>
                </div>
              ))
          }
        </div>
      </div>

    </div>
  );
}
