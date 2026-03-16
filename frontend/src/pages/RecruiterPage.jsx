import { useState, useEffect } from "react";
import { PageWrapper } from "../components/ui/PageWrapper";
import { RecruiterResults } from "../components/results/RecruiterResults";
import { SAMPLE_RESUME, SAMPLE_JD } from "../constants/sampleData";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const STEPS = ["PARSING...", "ML MODEL...", "ATS SCAN...", "AI ANALYSIS..."];

export function RecruiterPage({ onBack }) {
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setStep(s => Math.min(s + 1, STEPS.length - 1)), 900);
    return () => clearInterval(t);
  }, [loading]);

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setResume("EXTRACTING TEXT...");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${API_URL}/extract`, { method: "POST", body: formData });
      const data = await res.json();
      setResume(data.extracted_text || "ERROR: " + data.error);
    } catch {
      setResume("ERROR: Could not connect to API.");
    }
  }

  async function analyze() {
    if (!resume.trim() || !jd.trim()) {
      setError("Both resume and job description are required to screen a candidate.");
      return;
    }
    setLoading(true);
    setResult(null);
    setError(null);
    setStep(0);
    try {
      const res = await fetch(`${API_URL}/analyze/recruiter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: resume, job_description: jd })
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      setResult(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageWrapper onBack={onBack} accentColor="var(--cyan)" title="RECRUITER MODE" subtitle="SCREEN CANDIDATES WITH AI">
      <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1.4fr" : "1fr", gap: 20 }}>

        {/* LEFT — Input panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Resume input */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--pixel)", fontSize: 8, letterSpacing: 1 }}>RESUME</span>
              <div style={{ display: "flex", gap: 6 }}>
                <label className="px-btn" style={{ background: "var(--cyan)", fontSize: 7, padding: "5px 10px", cursor: "pointer" }}>
                  📁 UPLOAD PDF/DOCX
                  <input type="file" accept=".pdf,.docx" style={{ display: "none" }} onChange={handleFileUpload} />
                </label>
                <button className="px-btn" onClick={() => setResume(SAMPLE_RESUME)} style={{ background: "var(--green)", fontSize: 7, padding: "5px 10px" }}>
                  SAMPLE
                </button>
              </div>
            </div>
            <textarea
              className="px-input"
              value={resume}
              onChange={e => setResume(e.target.value)}
              rows={10}
              placeholder="PASTE CANDIDATE RESUME HERE OR UPLOAD PDF/DOCX..."
            />
          </div>

          {/* JD input */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--pixel)", fontSize: 8, letterSpacing: 1 }}>JOB DESCRIPTION</span>
              <button className="px-btn" onClick={() => setJd(SAMPLE_JD)} style={{ background: "var(--yellow)", fontSize: 7, padding: "5px 10px" }}>
                SAMPLE
              </button>
            </div>
            <textarea
              className="px-input"
              value={jd}
              onChange={e => setJd(e.target.value)}
              rows={5}
              placeholder="PASTE JOB DESCRIPTION..."
            />
          </div>

          {/* Analyze button */}
          <button
            className="px-btn"
            onClick={analyze}
            disabled={loading || !resume.trim() || !jd.trim()}
            style={{ background: loading ? "#ccc" : "var(--cyan)", color: "var(--black)", fontSize: 10, padding: "14px", width: "100%", letterSpacing: 2 }}
          >
            {loading ? STEPS[step] : "▶ SCREEN CANDIDATE"}
          </button>

          {/* Progress bar */}
          {loading && (
            <div style={{ display: "flex", gap: 4 }}>
              {STEPS.map((_, i) => (
                <div key={i} style={{ flex: 1, height: 6, border: "2px solid var(--black)", background: i <= step ? "var(--cyan)" : "var(--cream)", transition: "background 0.3s" }} />
              ))}
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="px-card" style={{ padding: 12, background: "#ffe8e8" }}>
              <div style={{ fontFamily: "var(--pixel)", fontSize: 7, color: "#f54a4a" }}>ERROR: {error}</div>
            </div>
          )}
        </div>

        {/* RIGHT — Results panel */}
        {result && <RecruiterResults result={result} />}
      </div>
    </PageWrapper>
  );
}
