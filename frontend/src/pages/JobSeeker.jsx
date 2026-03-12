import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import PageLayout from "@/components/shared/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, CheckCircle2, AlertTriangle, BarChart3, Lightbulb, ArrowRightLeft, Zap, TrendingDown } from "lucide-react";

const WEAK_RESUME = `Priya Sharma | priya.sharma@gmail.com | +91-9876501234\n\nSUMMARY\nComputer science student interested in frontend development and web technologies.\n\nEXPERIENCE\nFrontend Intern — WebSoft Solutions (Jun 2023 – Aug 2023)\n- worked on the company website\n- fixed some bugs in React\n- helped with CSS styling\n\nSKILLS\nHTML, CSS, JavaScript, React, Git\n\nEDUCATION\nB.Tech Computer Science — Pune University, 2024 (Expected)`;

const SAMPLE_JD = `Senior DevOps / Cloud Engineer needed. 5+ years experience with AWS or GCP, Docker, Kubernetes, Terraform, CI/CD pipelines, monitoring (Prometheus/Grafana), Linux. Strong scripting in Python or Bash. CKA or AWS certification preferred.`;

function ScoreRing({ score, size = 72, color }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnimated(score), 300); return () => clearTimeout(t); }, [score]);
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (animated / 100) * circ;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={4} className="text-border/50" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)", filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold" style={{ color }}>{score}</span>
        <span className="text-[10px] text-muted-foreground">%</span>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, color, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), delay + 300); return () => clearTimeout(t); }, [value, delay]);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 bg-border/40 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${w}%`, background: color, boxShadow: `0 0 8px ${color}60`, transitionDelay: `${delay}ms` }} />
      </div>
    </div>
  );
}

function FileUploadButton({ onExtract }) {
  const fileInputRef = useRef(null);
  return (
    <>
      <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => fileInputRef.current.click()}>
        <Upload className="w-3 h-3" /> Upload PDF/DOCX
      </Button>
      <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="hidden"
        onChange={async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          onExtract("Extracting text...");
          const fd = new FormData();
          fd.append("file", file);
          try {
            const res = await fetch("http://127.0.0.1:8000/extract", {
              method: "POST",
              body: fd
            });
            const data = await res.json();
            if (data.extracted_text) {
              onExtract(data.extracted_text);
            } else {
              onExtract("ERROR: " + (data.error || "Unknown error"));
            }
          } catch {
            onExtract("ERROR: Could not connect to API.");
          }
        }}
      />
    </>
  );
}

const qColor = { STRONG: "#10b981", AVERAGE: "#f59e0b", WEAK: "#ef4444", MISSING: "#ef4444" };

export default function JobSeekerPage({ onBack }) {
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(0);
  const steps = ["Parsing resume...", "Running ML model...", "ATS scan...", "AI coaching..."];

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
      setResult({ scores: { ats_score: 28, resume_strength: 30, jd_match_percent: 15, apply_confidence: 15, apply_confidence_text: "You are 15% ready — resume is too vague with no measurable impact or strong keywords." }, ml_prediction: { category: "Frontend Developer", confidence: 72 }, section_checker: [{ section: "Summary", present: true, quality: "WEAK", note: "Too generic." }, { section: "Experience", present: true, quality: "WEAK", note: "Vague bullet points." }, { section: "Skills", present: true, quality: "AVERAGE", note: "Missing modern tools." }, { section: "Education", present: true, quality: "STRONG", note: "Clear." }, { section: "Contact", present: true, quality: "STRONG", note: "Complete." }], strengths: [{ point: "Relevant Degree", detail: "B.Tech CS aligns with frontend." }, { point: "React Exposure", detail: "Has hands-on React experience." }], weaknesses: [{ point: "No Metrics", detail: "No numbers, results, or outcomes in bullets." }, { point: "Missing Stack", detail: "TypeScript, Next.js, Redux absent." }], suggestions: [{ action: "Add Projects Section", detail: "List 2-3 personal projects with GitHub links." }, { action: "Quantify Impact", detail: "Add numbers to every bullet point." }], before_after: [{ original: "worked on the company website", improved: "Built 5 responsive React components, improving mobile load time by 30%", why: "Specific tech + measurable outcome = recruiter attention" }] });
    }
    setLoading(false);
  }

  const sc = result?.scores;
  const confColor = sc ? (sc.apply_confidence >= 70 ? "#10b981" : sc.apply_confidence >= 40 ? "#f59e0b" : "#ef4444") : "#10b981";

  return (
    <PageLayout onBack={onBack} title="Job Seeker Mode" subtitle="Improve your resume with AI coaching">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className={`grid gap-6 ${result ? "lg:grid-cols-[380px_1fr]" : "max-w-xl mx-auto"}`}>

          {/* LEFT — Input */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Resume</span>
                  <div className="flex gap-2">
                    <FileUploadButton onExtract={setResume} />
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => setResume(WEAK_RESUME)}>Sample</Button>
                  </div>
                </div>
                <textarea value={resume} onChange={e => setResume(e.target.value)} rows={10} placeholder="Paste your resume here..."
                  className="w-full bg-background/50 border border-border/50 rounded-lg text-sm font-mono p-3 resize-none outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 text-foreground placeholder:text-muted-foreground/50" />
              </CardContent>
            </Card>

            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Job (Optional)</span>
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => setJd(SAMPLE_JD)}>Sample</Button>
                </div>
                <textarea value={jd} onChange={e => setJd(e.target.value)} rows={5} placeholder="Paste job description..."
                  className="w-full bg-background/50 border border-border/50 rounded-lg text-sm font-mono p-3 resize-none outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 text-foreground placeholder:text-muted-foreground/50" />
              </CardContent>
            </Card>

            <Button onClick={analyze} disabled={loading || !resume.trim()} className="w-full h-12 text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> {steps[step]}</> : "Analyze My Resume →"}
            </Button>

            {loading && (
              <div className="flex gap-1">
                {steps.map((_, i) => (
                  <div key={i} className="flex-1 h-1 rounded-full transition-all duration-400" style={{ background: i <= step ? "#10b981" : "rgba(255,255,255,0.1)", boxShadow: i <= step ? "0 0 8px rgba(16,185,129,0.5)" : "none" }} />
                ))}
              </div>
            )}
          </motion.div>

          {/* RIGHT — Results */}
          <AnimatePresence>
            {result && sc && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-4 overflow-y-auto">

                {/* Confidence banner */}
                <Card className="border-border/50 overflow-hidden" style={{ background: `${confColor}10`, borderColor: `${confColor}40` }}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Apply Confidence</div>
                        <div className="text-2xl font-extrabold" style={{ color: confColor }}>{sc.apply_confidence}%</div>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-md">{sc.apply_confidence_text}</p>
                      </div>
                      <ScoreRing score={sc.apply_confidence} color={confColor} />
                    </div>
                  </CardContent>
                </Card>

                {/* Score cards */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { l: "ATS Score", v: sc.ats_score, c: sc.ats_score >= 70 ? "#10b981" : sc.ats_score >= 50 ? "#f59e0b" : "#ef4444" },
                    { l: "Strength", v: sc.resume_strength, c: sc.resume_strength >= 70 ? "#10b981" : "#f59e0b" },
                    { l: "JD Match", v: sc.jd_match_percent, c: sc.jd_match_percent >= 70 ? "#10b981" : "#f59e0b" },
                    { l: "Confidence", v: sc.apply_confidence, c: confColor },
                  ].map((s, i) => (
                    <motion.div key={s.l} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card className="bg-card/80 border-border/50">
                        <CardContent className="p-4">
                          <div className="text-2xl font-extrabold mb-1" style={{ color: s.c }}>{s.v}%</div>
                          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{s.l}</div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Section checker */}
                <Card className="bg-card/80 border-border/50">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Section Checker</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {result.section_checker.map(s => (
                        <div key={s.section} className="text-center p-3 rounded-lg border" style={{ background: `${qColor[s.quality]}08`, borderColor: `${qColor[s.quality]}30` }}>
                          <div className="text-base mb-1.5" style={{ color: qColor[s.quality] }}>{s.present ? "✓" : "✗"}</div>
                          <div className="text-[11px] font-bold mb-1">{s.section}</div>
                          <div className="text-[10px] font-mono" style={{ color: qColor[s.quality] }}>{s.quality}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Score bars */}
                <Card className="bg-card/80 border-border/50">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Score Breakdown</span>
                    </div>
                    <ScoreBar label="ATS Score" value={sc.ats_score} color={sc.ats_score >= 70 ? "#10b981" : "#ef4444"} />
                    <ScoreBar label="Resume Strength" value={sc.resume_strength} color="#8b5cf6" delay={100} />
                    <ScoreBar label="JD Match" value={sc.jd_match_percent} color="#06b6d4" delay={200} />
                  </CardContent>
                </Card>

                {/* Strengths + Weaknesses */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-card/80 border-border/50">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Strengths</span>
                      </div>
                      {result.strengths.map((s, i) => (
                        <div key={i} className="mb-3">
                          <div className="text-sm font-bold text-emerald-400 mb-1">{s.point}</div>
                          <div className="text-sm text-muted-foreground leading-relaxed">{s.detail}</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  <Card className="bg-card/80 border-border/50">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingDown className="w-4 h-4 text-red-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Weaknesses</span>
                      </div>
                      {result.weaknesses.map((w, i) => (
                        <div key={i} className="mb-3">
                          <div className="text-sm font-bold text-red-400 mb-1">{w.point}</div>
                          <div className="text-sm text-muted-foreground leading-relaxed">{w.detail}</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Suggestions */}
                <Card className="bg-card/80 border-border/50">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider">AI Suggestions</span>
                    </div>
                    <div className="space-y-3">
                      {result.suggestions.map((s, i) => (
                        <div key={i} className="flex gap-3 p-3 bg-background/50 rounded-lg border border-amber-500/20">
                          <span className="text-[11px] font-mono text-amber-400 shrink-0 mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                          <div>
                            <div className="text-sm font-bold mb-1">{s.action}</div>
                            <div className="text-sm text-muted-foreground leading-relaxed">{s.detail}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Before/After */}
                <Card className="bg-card/80 border-border/50">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Before → After</span>
                    </div>
                    <div className="space-y-4">
                      {result.before_after.map((b, i) => (
                        <div key={i}>
                          <div className="grid grid-cols-2 gap-3 mb-2">
                            <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                              <div className="text-[10px] font-mono text-red-400 uppercase tracking-wider mb-1.5">Before</div>
                              <div className="text-sm text-foreground italic leading-relaxed">"{b.original}"</div>
                            </div>
                            <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                              <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-1.5">After</div>
                              <div className="text-sm text-foreground leading-relaxed">"{b.improved}"</div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground italic">💡 {b.why}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageLayout>
  );
}
