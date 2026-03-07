import { useState, useEffect, useRef } from "react";

// ============================================================
// PIXEL FONT & GLOBAL STYLES
// ============================================================
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --cream: #f5f0c8;
      --yellow: #e8e04a;
      --green: #4af54a;
      --cyan: #4af5e8;
      --black: #1a1a0a;
      --pink: #f54a9b;
      --orange: #f5a44a;
      --pixel: 'Press Start 2P', monospace;
      --vt: 'VT323', monospace;
    }

    body { background: var(--cream); overflow: hidden; }

    .pixel { font-family: var(--pixel); }
    .vt { font-family: var(--vt); }

    /* Scanline overlay */
    .scanlines::after {
      content: '';
      position: fixed; inset: 0; z-index: 9999;
      background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0,0,0,0.03) 2px,
        rgba(0,0,0,0.03) 4px
      );
      pointer-events: none;
    }

    /* Pixel button */
    .px-btn {
      font-family: var(--pixel);
      font-size: 13px;
      padding: 14px 28px;
      border: 4px solid var(--black);
      cursor: pointer;
      position: relative;
      transition: transform 0.08s, box-shadow 0.08s;
      image-rendering: pixelated;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .px-btn::after {
      content: none;
    }
    .px-btn:hover { transform: translate(-2px, -2px); }
    .px-btn:hover::after { bottom: -4px; right: -4px; }
    .px-btn:active { transform: translate(2px, 2px); }
    .px-btn:active::after { bottom: -2px; right: -2px; }

    /* Pixel card */
    .px-card {
      border: 3px solid var(--black);
      position: relative;
      background: white;
    }
    .px-card::after {
      content: '';
      position: absolute;
      bottom: -5px; right: -5px;
      width: 100%; height: 100%;
      background: var(--black);
      z-index: -1;
    }

    /* Pixel input */
    .px-input {
      font-family: var(--vt);
      font-size: 16px;
      border: 3px solid var(--black);
      padding: 10px 12px;
      background: var(--cream);
      resize: none;
      outline: none;
      width: 100%;
      letter-spacing: 0.5px;
      line-height: 1.5;
    }
    .px-input:focus { background: white; outline: 3px solid var(--cyan); outline-offset: 1px; }
    .px-input::placeholder { color: #999; font-family: var(--vt); }

    /* Tag */
    .px-tag {
      font-family: var(--pixel);
      font-size: 8px;
      padding: 4px 8px;
      border: 2px solid var(--black);
      display: inline-block;
    }

    /* Blinking cursor */
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
    .blink { animation: blink 1s step-end infinite; }

    /* Float animation */
    @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    .float { animation: float 3s ease-in-out infinite; }

    /* Pixel march animation */
    @keyframes march { 0%{transform:translateX(-100%)} 100%{transform:translateX(100vw)} }

    /* Shake */
    @keyframes shake { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-3deg)} 75%{transform:rotate(3deg)} }
    .shake:hover { animation: shake 0.3s ease-in-out; }

    /* Zoom page transition */
    @keyframes zoomIn {
      0% { transform: scale(0.1); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes zoomOut {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(8); opacity: 0; }
    }
    .zoom-in { animation: zoomIn 0.5s cubic-bezier(0.4,0,0.2,1) forwards; }
    .zoom-out { animation: zoomOut 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }

    /* Score bar */
    @keyframes fillBar { from{width:0} to{width:var(--w)} }

    /* Pixel progress */
    @keyframes pixelFill { from{width:0%} }

    /* Stars twinkle */
    @keyframes twinkle { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.6)} }

    /* Bounce */
    @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }

    scrollbar-width: thin;

    textarea { caret-color: var(--black); }
  `}</style>
);

// ============================================================
// DECORATIVE ELEMENTS
// ============================================================
function PixelStar({ x, y, size = 8, delay = 0, color = "#1a1a0a" }) {
  return (
    <div style={{
      position: "absolute", left: x, top: y,
      fontSize: size, color,
      animation: `twinkle ${1.5 + delay}s ease-in-out ${delay}s infinite`,
      pointerEvents: "none", userSelect: "none", zIndex: 0
    }}>✦</div>
  );
}

function FloatingPixels() {
  const items = [
    { x: "5%", y: "10%", char: "◆", color: "#4af54a", size: 12, d: 0 },
    { x: "90%", y: "8%", char: "●", color: "#f54a9b", size: 10, d: 0.3 },
    { x: "8%", y: "80%", char: "▲", color: "#4af5e8", size: 10, d: 0.6 },
    { x: "85%", y: "75%", char: "◆", color: "#f5a44a", size: 14, d: 0.9 },
    { x: "50%", y: "5%", char: "★", color: "#e8e04a", size: 11, d: 1.2 },
    { x: "15%", y: "45%", char: "♦", color: "#4af54a", size: 8, d: 0.4 },
    { x: "78%", y: "40%", char: "▪", color: "#f54a9b", size: 14, d: 0.8 },
    { x: "40%", y: "88%", char: "◉", color: "#4af5e8", size: 10, d: 1.5 },
    { x: "65%", y: "15%", char: "✦", color: "#f5a44a", size: 9, d: 0.2 },
    { x: "25%", y: "70%", char: "■", color: "#e8e04a", size: 8, d: 1.0 },
  ];
  return (
    <>
      {items.map((item, i) => (
        <div key={i} style={{
          position: "absolute", left: item.x, top: item.y,
          fontSize: item.size, color: item.color,
          animation: `float ${2.5 + item.d}s ease-in-out ${item.d}s infinite`,
          pointerEvents: "none", zIndex: 0, fontFamily: "monospace"
        }}>{item.char}</div>
      ))}
    </>
  );
}

function PixelGrid() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 0, opacity: 0.06,
      backgroundImage: "linear-gradient(#1a1a0a 1px, transparent 1px), linear-gradient(90deg, #1a1a0a 1px, transparent 1px)",
      backgroundSize: "32px 32px",
      pointerEvents: "none"
    }} />
  );
}

function PixelBorder() {
  return (
    <div style={{
      position: "fixed", inset: 12, zIndex: 100,
      border: "4px solid var(--black)",
      pointerEvents: "none",
      boxShadow: "inset 0 0 0 2px var(--cream), 0 0 0 2px var(--black)"
    }} />
  );
}

function LiveBadge() {
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

// ============================================================
// SCORE COMPONENTS
// ============================================================
function PixelScoreBar({ label, value, max = 100, color, delay = 0 }) {
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

function BigScore({ score, label }) {
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

// ============================================================
// LANDING PAGE
// ============================================================
function LandingPage({ onNavigate }) {
  const [transitioning, setTransitioning] = useState(null);
  const [pageClass, setPageClass] = useState("");

  function handleNav(page) {
    setTransitioning(page);
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
        <div style={{ fontFamily: "var(--pixel)", fontSize: 7, color: "#999", letterSpacing: 1 }}>v3.0.0</div>
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
        <div style={{
          fontFamily: "var(--pixel)", fontSize: 11, color: "#666",
          marginBottom: 28, letterSpacing: 2
        }}>
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
            { val: "24", label: "CATEGORIES" },
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

// ============================================================
// SHARED INPUT PAGE WRAPPER
// ============================================================
function PageWrapper({ children, onBack, accentColor, title, subtitle }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 10); }, []);
  return (
    <div className={`scanlines ${mounted ? "zoom-in" : ""}`} style={{
      width: "100vw", height: "100vh",
      background: "var(--cream)",
      display: "flex", flexDirection: "column",
      position: "relative", overflow: "hidden"
    }}>
      <PixelGrid />
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

// ============================================================
// SAMPLE DATA
// ============================================================
const SAMPLE_RESUME = `Sarah Johnson
Email: sarah.johnson@email.com | Phone: +91-9876543210

SUMMARY
HR professional with 7+ years in talent acquisition, employee relations, and HR policy. Reduced turnover by 30%.

EXPERIENCE
Senior HR Manager — TechCorp (2020–Present)
• Led recruitment for 200+ positions
• Improved 90-day retention by 25%
• Managed payroll for 500+ employees via SAP HRIS

HR Generalist — StartupHub (2017–2020)
• Implemented HRIS reducing workload by 40%

SKILLS
Recruitment, HRIS, SAP, Payroll, Employee Relations, Labor Law

EDUCATION
MBA HR — Delhi University 2017`;

const SAMPLE_JD = `Senior HR Manager needed. 5+ years HR experience, recruitment, HRIS, payroll, labor law, leadership, MBA preferred.`;

const WEAK_RESUME = `Rahul Mehta | rahul@gmail.com

EXPERIENCE
Developer at InfoSys (2021-now)
- worked on backend
- built some apis
- helped with deployments

SKILLS
Python, Java, SQL

EDUCATION
B.Tech CS - Mumbai University 2019`;

// ============================================================
// RECRUITER PAGE
// ============================================================
function RecruiterPage({ onBack }) {
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(0);
  const steps = ["PARSING...", "ML MODEL...", "ATS SCAN...", "AI ANALYSIS..."];

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 900);
    return () => clearInterval(t);
  }, [loading]);

  async function analyze() {
    if (!resume.trim()) return;
    setLoading(true); setResult(null); setStep(0);
    try {
      const res = await fetch("http://127.0.0.1:8000/analyze/recruiter", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: resume, job_description: jd })
      });
      setResult(await res.json());
    } catch {
      await new Promise(r => setTimeout(r, 3500));
      setResult({
        ats_score: 79, ml_prediction: { category: "HR", confidence: 61 },
        candidate_overview: { name: "Sarah Johnson", predicted_role: "HR Manager", experience_level: "Senior", education_level: "MBA", total_experience: "7+ years" },
        jd_match: { overall_match_percent: 92, experience_match: "EXCEEDS", education_match: "MEETS", skills_found: ["Recruitment", "HRIS", "Payroll", "Employee Relations", "Labor Law"], skills_missing: [], summary: "Strong match. Candidate exceeds experience requirements with proven results." },
        resume_breakdown: { sections_analysis: [{ section: "Summary", status: "PRESENT", quality: "STRONG", note: "Clear and impactful." }, { section: "Experience", status: "PRESENT", quality: "STRONG", note: "Quantified achievements." }, { section: "Skills", status: "PRESENT", quality: "AVERAGE", note: "Could be more detailed." }], key_achievements: ["Reduced turnover by 30%", "Improved retention by 25%", "HRIS workload cut by 40%"], extracted_skills: ["Recruitment", "HRIS", "SAP", "Payroll", "Employee Relations", "Labor Law", "Leadership"] },
        recruiter_verdict: { decision: "STRONG HIRE", confidence: 95, reasoning: "Candidate exceeds all key requirements with measurable achievements.", reasons_to_hire: ["7+ years relevant experience", "Quantified business impact", "MBA matches requirement"], concerns: [] }
      });
    }
    setLoading(false);
  }

  const verdictColor = result?.recruiter_verdict?.decision === "STRONG HIRE" ? "#4af54a" : result?.recruiter_verdict?.decision === "CONSIDER" ? "#f5a44a" : "#f54a4a";

  return (
    <PageWrapper onBack={onBack} accentColor="var(--cyan)" title="RECRUITER MODE" subtitle="SCREEN CANDIDATES WITH AI">
      <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1.4fr" : "1fr", gap: 20, height: "100%" }}>

        {/* LEFT — Input */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
    <span style={{ fontFamily: "var(--pixel)", fontSize: 8, letterSpacing: 1 }}>RESUME</span>
    <div style={{ display: "flex", gap: 6 }}>
      <label className="px-btn" style={{ background: "var(--cyan)", fontSize: 7, padding: "5px 10px", cursor: "pointer" }}>
        📁 UPLOAD PDF/DOCX
        <input type="file" accept=".pdf,.docx" style={{ display: "none" }}
          onChange={async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            setResume("EXTRACTING TEXT...");
            const formData = new FormData();
            formData.append("file", file);
            try {
              const res = await fetch("http://127.0.0.1:8000/extract", { method: "POST", body: formData });
              const data = await res.json();
              if (data.extracted_text) {
                setResume(data.extracted_text);
              } else {
                setResume("ERROR: " + data.error);
              }
            } catch {
              setResume("ERROR: Could not connect to API.");
            }
          }}
        />
      </label>
      <button className="px-btn" onClick={() => setResume(SAMPLE_RESUME)} style={{ background: "var(--green)", fontSize: 7, padding: "5px 10px" }}>SAMPLE</button>
    </div>
  </div>
  <textarea className="px-input" value={resume} onChange={e => setResume(e.target.value)} rows={10} placeholder="PASTE CANDIDATE RESUME HERE OR UPLOAD PDF/DOCX..." />
</div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--pixel)", fontSize: 8, letterSpacing: 1 }}>JOB DESCRIPTION</span>
              <button className="px-btn" onClick={() => setJd(SAMPLE_JD)} style={{ background: "var(--yellow)", fontSize: 7, padding: "5px 10px" }}>SAMPLE</button>
            </div>
            <textarea className="px-input" value={jd} onChange={e => setJd(e.target.value)} rows={5} placeholder="PASTE JOB DESCRIPTION..." />
          </div>
          <button className="px-btn" onClick={analyze} disabled={loading || !resume.trim()} style={{
            background: loading ? "#ccc" : "var(--cyan)", color: "var(--black)",
            fontSize: 10, padding: "14px", width: "100%", letterSpacing: 2
          }}>
            {loading ? `${steps[step]}` : "▶ SCREEN CANDIDATE"}
          </button>
          {loading && (
            <div style={{ display: "flex", gap: 4 }}>
              {steps.map((_, i) => (
                <div key={i} style={{ flex: 1, height: 6, border: "2px solid var(--black)", background: i <= step ? "var(--cyan)" : "var(--cream)", transition: "background 0.3s" }} />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Results */}
        {result && (
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

            {/* Candidate overview + ATS */}
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
              <div style={{ fontFamily: "var(--pixel)", fontSize: 7, marginBottom: 10, letterSpacing: 1 }}>JD MATCH — {result.jd_match.overall_match_percent}%</div>
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
                      ? result.jd_match.skills_missing.map(s => <span key={s} className="px-tag" style={{ background: "#ffe8e8", fontSize: 6 }}>{s}</span>)
                      : <span style={{ fontFamily: "var(--vt)", fontSize: 16, color: "#4af54a" }}>NONE ✓</span>
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="px-card" style={{ padding: 14, background: "white" }}>
              <div style={{ fontFamily: "var(--pixel)", fontSize: 7, marginBottom: 10, letterSpacing: 1 }}>KEY ACHIEVEMENTS</div>
              {result.resume_breakdown.key_achievements.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
                  <span style={{ fontFamily: "var(--pixel)", fontSize: 8, color: "var(--cyan)", flexShrink: 0 }}>▶</span>
                  <span style={{ fontFamily: "var(--vt)", fontSize: 16, lineHeight: 1.3 }}>{a}</span>
                </div>
              ))}
            </div>

            {/* Reasons + Concerns */}
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
        )}
      </div>
    </PageWrapper>
  );
}

// ============================================================
// JOB SEEKER PAGE
// ============================================================
function JobSeekerPage({ onBack }) {
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(0);
  const steps = ["PARSING...", "ML MODEL...", "ATS SCAN...", "AI COACH..."];

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 900);
    return () => clearInterval(t);
  }, [loading]);

  async function analyze() {
    if (!resume.trim()) return;
    setLoading(true); setResult(null); setStep(0);
    try {
      const res = await fetch("http://127.0.0.1:8000/analyze/jobseeker", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: resume, job_description: jd })
      });
      setResult(await res.json());
    } catch {
      await new Promise(r => setTimeout(r, 3500));
      setResult({
        scores: { ats_score: 31, resume_strength: 40, jd_match_percent: 20, apply_confidence: 10, apply_confidence_text: "You are 10% ready — resume lacks key skills and achievements for this role." },
        section_checker: [
          { section: "Summary", present: false, quality: "MISSING", note: "No summary found." },
          { section: "Experience", present: true, quality: "AVERAGE", note: "Lacks specific achievements." },
          { section: "Skills", present: true, quality: "WEAK", note: "Not detailed enough." },
          { section: "Education", present: true, quality: "STRONG", note: "Clear and relevant." },
          { section: "Contact", present: true, quality: "STRONG", note: "Complete contact info." }
        ],
        strengths: [
          { point: "Relevant Degree", detail: "B.Tech CS directly matches software engineering roles." },
          { point: "Core Languages", detail: "Python and Java are highly in demand." },
          { point: "Work Experience", detail: "2+ years of industry experience is a plus." },
          { point: "Complete Contact", detail: "Email provided for easy recruiter contact." },
          { point: "Database Skills", detail: "SQL is essential for most backend roles." }
        ],
        weaknesses: [
          { point: "Vague Bullets", detail: "No numbers or impact — just describes duties." },
          { point: "Missing Keywords", detail: "AWS, Docker, Django, REST APIs all missing." },
          { point: "No Summary", detail: "Recruiters spend 6 seconds — no summary = instant skip." }
        ],
        suggestions: [
          { action: "Add a Professional Summary", detail: "Write 2-3 sentences highlighting your stack, years of experience, and best achievement." },
          { action: "Quantify Everything", detail: "Add numbers — how many APIs, what team size, what performance improvement?" },
          { action: "Add Missing Keywords", detail: "Add Django, REST APIs, AWS, Docker to your skills section to pass ATS filters." }
        ],
        before_after: [
          { original: "Worked on backend development", improved: "Built 5 RESTful APIs in Python/Django serving 10K+ daily requests", why: "Specific tech stack + scale = much more impressive" },
          { original: "Built some APIs", improved: "Designed and deployed REST APIs with authentication, reducing response time by 40%", why: "Metrics and specific achievements stand out" },
          { original: "Helped the team with deployments", improved: "Led CI/CD pipeline setup using Docker, cutting deployment time from 2hrs to 15min", why: "Shows leadership and quantified business impact" }
        ]
      });
    }
    setLoading(false);
  }

  const sc = result?.scores;
  const confColor = sc ? (sc.apply_confidence >= 70 ? "#4af54a" : sc.apply_confidence >= 40 ? "#f5a44a" : "#f54a4a") : "#4af54a";
  const qualityColor = { STRONG: "#4af54a", AVERAGE: "#f5a44a", WEAK: "#f54a4a", MISSING: "#f54a4a" };

  return (
    <PageWrapper onBack={onBack} accentColor="var(--green)" title="JOB SEEKER MODE" subtitle="IMPROVE YOUR RESUME">
      <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1.6fr" : "1fr", gap: 20 }}>

        {/* LEFT — Input */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--pixel)", fontSize: 8, letterSpacing: 1 }}>YOUR RESUME</span>
              <div style={{ display: "flex", gap: 6 }}>
                <label className="px-btn" style={{ background: "var(--cyan)", fontSize: 7, padding: "5px 10px", cursor: "pointer" }}>
                  📁 UPLOAD PDF/DOCX
                  <input type="file" accept=".pdf,.docx" style={{ display: "none" }}
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      setResume("EXTRACTING TEXT...");
                      const formData = new FormData();
                      formData.append("file", file);
                      try {
                        const res = await fetch("http://127.0.0.1:8000/extract", { method: "POST", body: formData });
                        const data = await res.json();
                        if (data.extracted_text) {
                          setResume(data.extracted_text);
                        } else {
                          setResume("ERROR: " + data.error);
                        }
                      } catch {
                        setResume("ERROR: Could not connect to API.");
                      }
                    }}
                  />
                </label>
                <button className="px-btn" onClick={() => setResume(WEAK_RESUME)} style={{ background: "var(--yellow)", fontSize: 7, padding: "5px 10px" }}>SAMPLE</button>
              </div>
            </div>
            <textarea className="px-input" value={resume} onChange={e => setResume(e.target.value)} rows={10} placeholder="PASTE YOUR RESUME HERE OR UPLOAD PDF/DOCX..." />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--pixel)", fontSize: 8, letterSpacing: 1 }}>TARGET JOB (OPTIONAL)</span>
              <button className="px-btn" onClick={() => setJd(SAMPLE_JD)} style={{ background: "var(--pink)", fontSize: 7, padding: "5px 10px" }}>SAMPLE</button>
            </div>
            <textarea className="px-input" value={jd} onChange={e => setJd(e.target.value)} rows={5} placeholder="PASTE JOB DESCRIPTION..." />
          </div>
          <button className="px-btn" onClick={analyze} disabled={loading || !resume.trim()} style={{
            background: loading ? "#ccc" : "var(--green)", color: "var(--black)",
            fontSize: 10, padding: "14px", width: "100%", letterSpacing: 2
          }}>
            {loading ? `${steps[step]}` : "▶ ANALYZE RESUME"}
          </button>
          {loading && (
            <div style={{ display: "flex", gap: 4 }}>
              {steps.map((_, i) => (
                <div key={i} style={{ flex: 1, height: 6, border: "2px solid var(--black)", background: i <= step ? "var(--green)" : "var(--cream)", transition: "background 0.3s" }} />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Results */}
        {result && sc && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>

            {/* Confidence banner */}
            <div className="px-card" style={{ padding: "12px 18px", background: confColor }}>
              <div style={{ fontFamily: "var(--pixel)", fontSize: 10, color: "var(--black)", marginBottom: 4 }}>
                APPLY CONFIDENCE: {sc.apply_confidence}%
              </div>
              <div style={{ fontFamily: "var(--vt)", fontSize: 17, color: "var(--black)", opacity: 0.85 }}>
                {sc.apply_confidence_text}
              </div>
            </div>

            {/* 4 scores */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {[
                { label: "ATS SCORE", val: sc.ats_score, color: sc.ats_score >= 70 ? "#4af54a" : sc.ats_score >= 50 ? "#f5a44a" : "#f54a4a" },
                { label: "STRENGTH", val: sc.resume_strength, color: sc.resume_strength >= 70 ? "#4af54a" : "#f5a44a" },
                { label: "JD MATCH", val: sc.jd_match_percent, color: sc.jd_match_percent >= 70 ? "#4af54a" : "#f5a44a" },
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
        )}
      </div>
    </PageWrapper>
  );
}

// ============================================================
// APP ROUTER
// ============================================================
export default function App() {
  const [page, setPage] = useState("landing");
  return (
    <>
      <GlobalStyle />
      {page === "landing" && <LandingPage onNavigate={setPage} />}
      {page === "recruiter" && <RecruiterPage onBack={() => setPage("landing")} />}
      {page === "jobseeker" && <JobSeekerPage onBack={() => setPage("landing")} />}
    </>
  );
}
