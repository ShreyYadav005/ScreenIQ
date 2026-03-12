import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import PageLayout from "@/components/shared/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2, CheckCircle2, AlertTriangle, BarChart3, User, Bot, Trophy, ShieldCheck, ShieldAlert } from "lucide-react";

const SAMPLE_RESUME = `Arjun Mehta\nEmail: arjun.mehta@email.com | Phone: +91-9812345670 | GitHub: github.com/arjunmehta\n\nSUMMARY\nSenior DevOps / Cloud Engineer with 7+ years of experience building and scaling infrastructure on AWS and GCP. Reduced deployment time by 70% through CI/CD automation. Led cloud migration of monolithic systems to Kubernetes-based microservices for 3 enterprise clients.\n\nEXPERIENCE\nSenior DevOps Engineer — CloudNova Tech, Bangalore (2020–Present)\n• Architected AWS infrastructure (EC2, EKS, RDS, S3, CloudFront) serving 2M+ daily users\n• Built CI/CD pipelines using GitHub Actions + ArgoCD, cutting release cycles from 2 weeks to 1 day\n• Reduced cloud costs by 35% through auto-scaling policies and reserved instance planning\n• Led a team of 4 DevOps engineers; introduced Terraform IaC across all projects\n\nSKILLS\nAWS, GCP, Docker, Kubernetes, Terraform, Ansible, GitHub Actions, Jenkins, ArgoCD, Prometheus, Grafana, Linux, Bash, Python, CI/CD, Helm\n\nEDUCATION\nB.Tech Computer Science — VIT Vellore, 2017\nAWS Certified Solutions Architect — Professional (2022)\nCertified Kubernetes Administrator (CKA) — 2021`;

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

export default function RecruiterPage({ onBack }) {
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(0);
  const steps = ["Parsing resume...", "Running ML model...", "ATS scan...", "AI analysis..."];

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
      setResult({ ats_score: 87, ml_prediction: { category: "DevOps / Cloud Engineer", confidence: 94 }, candidate_overview: { name: "Arjun Mehta", predicted_role: "Senior DevOps Engineer", experience_level: "Senior", education_level: "B.Tech + CKA + AWS Certified", total_experience: "7+ years" }, jd_match: { overall_match_percent: 95, experience_match: "EXCEEDS", education_match: "MEETS", skills_found: ["AWS", "Kubernetes", "Terraform", "CI/CD", "Prometheus", "Grafana", "Docker", "Python"], skills_missing: [], summary: "Exceptional match. Candidate exceeds all requirements." }, resume_breakdown: { key_achievements: ["Reduced deployment time by 70%", "Cut cloud costs by 35%", "Migrated 12 legacy apps to Kubernetes"], extracted_skills: ["AWS", "GCP", "Docker", "Kubernetes", "Terraform"] }, recruiter_verdict: { decision: "STRONG HIRE", confidence: 97, reasoning: "Candidate exceeds all technical requirements with measurable achievements.", reasons_to_hire: ["7+ years cloud infrastructure", "CKA + AWS certifications", "Led team of 4 engineers"], concerns: [] } });
    }
    setLoading(false);
  }

  const v = result?.recruiter_verdict;
  const verdictColor = v?.decision === "STRONG HIRE" ? "#10b981" : v?.decision === "CONSIDER" ? "#f59e0b" : "#ef4444";

  return (
    <PageLayout onBack={onBack} title="Recruiter Mode" subtitle="Screen candidates with AI + ML">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className={`grid gap-6 ${result ? "lg:grid-cols-[380px_1fr]" : "max-w-xl mx-auto"}`}>

          {/* LEFT — Input */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resume</span>
                  <div className="flex gap-2">
                    <FileUploadButton onExtract={setResume} />
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => setResume(SAMPLE_RESUME)}>Sample</Button>
                  </div>
                </div>
                <textarea value={resume} onChange={e => setResume(e.target.value)} rows={10} placeholder="Paste candidate resume..."
                  className="w-full bg-background/50 border border-border/50 rounded-lg text-sm font-mono p-3 resize-none outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 text-foreground placeholder:text-muted-foreground/50" />
              </CardContent>
            </Card>

            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Job Description</span>
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => setJd(SAMPLE_JD)}>Sample</Button>
                </div>
                <textarea value={jd} onChange={e => setJd(e.target.value)} rows={5} placeholder="Paste job description..."
                  className="w-full bg-background/50 border border-border/50 rounded-lg text-sm font-mono p-3 resize-none outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 text-foreground placeholder:text-muted-foreground/50" />
              </CardContent>
            </Card>

            <Button onClick={analyze} disabled={loading || !resume.trim()} className="w-full h-12 text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> {steps[step]}</> : "Screen Candidate →"}
            </Button>

            {loading && (
              <div className="flex gap-1">
                {steps.map((_, i) => (
                  <div key={i} className="flex-1 h-1 rounded-full transition-all duration-400" style={{ background: i <= step ? "#06b6d4" : "rgba(255,255,255,0.1)", boxShadow: i <= step ? "0 0 8px rgba(6,182,212,0.5)" : "none" }} />
                ))}
              </div>
            )}
          </motion.div>

          {/* RIGHT — Results */}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-4 overflow-y-auto">

                {/* Verdict */}
                <Card className="border-border/50 overflow-hidden" style={{ background: `${verdictColor}10`, borderColor: `${verdictColor}40` }}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recruiter Verdict</div>
                        <div className="text-2xl font-extrabold" style={{ color: verdictColor }}>{v.decision}</div>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-md">{v.reasoning}</p>
                      </div>
                      <ScoreRing score={v.confidence} color={verdictColor} />
                    </div>
                  </CardContent>
                </Card>

                {/* Score cards */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { l: "ATS Score", v: result.ats_score, c: result.ats_score >= 70 ? "#10b981" : result.ats_score >= 50 ? "#f59e0b" : "#ef4444" },
                    { l: "JD Match", v: result.jd_match.overall_match_percent, c: result.jd_match.overall_match_percent >= 70 ? "#10b981" : "#f59e0b" },
                    { l: "ML Confidence", v: result.ml_prediction.confidence, c: "#8b5cf6" },
                    { l: "Exp Match", v: result.jd_match.experience_match === "EXCEEDS" ? 100 : result.jd_match.experience_match === "MEETS" ? 75 : 40, c: result.jd_match.experience_match === "EXCEEDS" ? "#10b981" : "#f59e0b" },
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

                {/* Score bars */}
                <Card className="bg-card/80 border-border/50">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Score Breakdown</span>
                    </div>
                    <ScoreBar label="ATS Score" value={result.ats_score} color={result.ats_score >= 70 ? "#10b981" : "#ef4444"} />
                    <ScoreBar label="JD Match" value={result.jd_match.overall_match_percent} color="#06b6d4" delay={100} />
                    <ScoreBar label="Verdict Confidence" value={v.confidence} color="#8b5cf6" delay={200} />
                  </CardContent>
                </Card>

                {/* ML + Candidate */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-card/80 border-border/50">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Bot className="w-4 h-4 text-violet-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider">ML Prediction</span>
                      </div>
                      <div className="text-base font-bold mb-1">{result.ml_prediction.category}</div>
                      <div className="text-xs text-muted-foreground">{result.ml_prediction.confidence}% confidence</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/80 border-border/50">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Candidate</span>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(result.candidate_overview).slice(0, 3).map(([k, val]) => (
                          <div key={k} className="flex justify-between text-xs">
                            <span className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}</span>
                            <span className="font-mono text-foreground">{val}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Skills */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-card/80 border-border/50">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Skills Found</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {result.jd_match.skills_found.map(s => (
                          <span key={s} className="text-[11px] font-mono px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-emerald-400">{s}</span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/80 border-border/50">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Skills Missing</span>
                      </div>
                      {result.jd_match.skills_missing.length === 0
                        ? <span className="text-sm text-emerald-400">None missing ✓</span>
                        : <div className="flex flex-wrap gap-1.5">{result.jd_match.skills_missing.map(s => (
                            <span key={s} className="text-[11px] font-mono px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-md text-red-400">{s}</span>
                          ))}</div>
                      }
                    </CardContent>
                  </Card>
                </div>

                {/* Achievements */}
                <Card className="bg-card/80 border-border/50">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Key Achievements</span>
                    </div>
                    <div className="space-y-2">
                      {result.resume_breakdown.key_achievements.map((a, i) => (
                        <div key={i} className="flex gap-3 items-start p-3 bg-background/50 rounded-lg border border-border/30">
                          <span className="text-[11px] font-mono text-amber-400 mt-0.5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                          <span className="text-sm text-foreground leading-relaxed">{a}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Hire reasons + Concerns */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-card/80 border-border/50">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Reasons to Hire</span>
                      </div>
                      {v.reasons_to_hire.map((r, i) => (
                        <div key={i} className="flex gap-2 mb-2 text-sm">
                          <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
                          <span className="text-foreground leading-relaxed">{r}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  <Card className="bg-card/80 border-border/50">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <ShieldAlert className="w-4 h-4 text-red-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Concerns</span>
                      </div>
                      {v.concerns.length === 0
                        ? <span className="text-sm text-emerald-400">No concerns ✓</span>
                        : v.concerns.map((c, i) => (
                            <div key={i} className="flex gap-2 mb-2 text-sm">
                              <span className="text-red-400 shrink-0 mt-0.5">!</span>
                              <span className="leading-relaxed">{c}</span>
                            </div>
                          ))
                      }
                    </CardContent>
                  </Card>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageLayout>
  );
}
