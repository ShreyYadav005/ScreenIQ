import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import PageLayout from "@/components/shared/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Zap, Map, TrendingUp, Briefcase, Target, ChevronDown, ChevronUp, BookOpen, Wrench, Milestone } from "lucide-react";

const CAREER_SAMPLE = `Priya Sharma | priya.sharma@gmail.com | +91-9876501234\n\nSUMMARY\nB.Tech CS student with hands-on experience in React, Node.js, and REST APIs. Built 3 full-stack projects.\n\nEXPERIENCE\nFrontend Intern — WebSoft Solutions (Jun 2023 – Aug 2023)\n- Built React components for company dashboard\n- Integrated REST APIs using Axios\n\nSKILLS\nHTML5, CSS3, JavaScript, React, Node.js, MongoDB, Git, Express.js\n\nEDUCATION\nB.Tech Computer Science — Pune University, 2024 | GPA: 7.8/10`;

const CAREER_ROLES = ["Full Stack Developer","Frontend Developer","Backend Developer","Data Scientist","DevOps Engineer","Machine Learning Engineer","Cloud Architect","Mobile Developer","Cybersecurity Engineer","QA Engineer"];

const TABS = [
  { id: "skills",  label: "Skill Gap",   icon: Zap,        color: "#06b6d4" },
  { id: "roadmap", label: "Roadmap",     icon: Map,        color: "#f59e0b" },
  { id: "market",  label: "Market",      icon: Briefcase,  color: "#ec4899" },
  { id: "wins",    label: "Quick Wins",  icon: Target,     color: "#8b5cf6" },
];

function ScoreRing({ score, size = 80, color }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnimated(score), 300); return () => clearTimeout(t); }, [score]);
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (animated / 100) * circ;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={4} className="text-border/50" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)", filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-extrabold" style={{ color }}>{score}</span>
        <span className="text-[10px] text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

function CatBar({ label, score, color, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(score), delay + 400); return () => clearTimeout(t); }, [score, delay]);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono" style={{ color }}>{score}%</span>
      </div>
      <div className="h-1.5 bg-border/40 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${w}%`, background: color, boxShadow: `0 0 8px ${color}60`, transitionDelay: `${delay}ms` }} />
      </div>
    </div>
  );
}

function LvlBadge({ level }) {
  const map = { Expert: "bg-emerald-500 text-black", Advanced: "bg-cyan-500 text-black", Intermediate: "bg-amber-500 text-black", Beginner: "bg-border text-muted-foreground" };
  return <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${map[level] || map.Beginner}`}>{level}</span>;
}

function PrioBadge({ priority }) {
  const map = { Critical: "bg-red-500/15 text-red-400 border-red-500/40", Important: "bg-amber-500/15 text-amber-400 border-amber-500/40", "Nice-to-have": "bg-violet-500/15 text-violet-400 border-violet-500/40" };
  return <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${map[priority] || map["Nice-to-have"]}`}>{priority?.toUpperCase()}</span>;
}

function FileUploadButton({ onExtract }) {
  const fileInputRef = useRef(null);
  return (
    <>
      <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => fileInputRef.current.click()}>
        <Upload className="w-3 h-3" /> Upload
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

function PhaseCard({ phase, open, onToggle }) {
  const colors = ["#06b6d4", "#f59e0b", "#ec4899", "#10b981"];
  const c = colors[(phase.phase - 1) % 4];
  return (
    <Card className="bg-card/80 border-border/50 overflow-hidden">
      <div className="p-4 cursor-pointer flex justify-between items-start" onClick={onToggle}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono tracking-wider" style={{ color: c }}>PHASE {phase.phase}</span>
            <span className="text-[10px] font-mono text-muted-foreground bg-border/30 px-2 py-0.5 rounded">{phase.duration}</span>
          </div>
          <div className="text-sm font-bold mb-1.5">{phase.title}</div>
          <div className="text-sm text-muted-foreground leading-relaxed">{phase.focus}</div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {(phase.skills_to_learn || []).map((sk, i) => (
              <span key={i} className="text-[11px] font-mono px-2 py-0.5 bg-border/30 border border-border/50 rounded">{sk}</span>
            ))}
          </div>
        </div>
        <div className="ml-3 text-muted-foreground shrink-0">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
            <div className="border-t border-border/50 p-4 space-y-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Topics to Cover</div>
              <ol className="space-y-1.5 list-decimal list-inside text-sm text-foreground ml-1">
                {(phase.topics_to_cover || []).map((topic, i) => (
                  <li key={i} className="leading-relaxed">{topic}</li>
                ))}
              </ol>
              {phase.project_to_build && (
                <div className="p-3 bg-violet-500/5 border border-violet-500/20 rounded-lg">
                  <span className="text-[11px] font-mono text-violet-400">🔨 Build: </span>
                  <span className="text-sm text-foreground">{phase.project_to_build}</span>
                </div>
              )}
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                <span className="text-[11px] font-mono text-emerald-400">🏁 Milestone: </span>
                <span className="text-sm text-foreground">{phase.milestone}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function CareerGuidancePage({ onBack }) {
  const [resume, setResume] = useState("");
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [customRole, setCustomRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [activeTab, setActiveTab] = useState("skills");
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [market, setMarket] = useState(null);
  const [wins, setWins] = useState(null);
  const [openPhase, setOpenPhase] = useState(0);
  const loadSteps = ["Profiling resume...", "Analyzing skill gaps...", "Building roadmap...", "Fetching market data...", "Finding quick wins..."];
  const finalRole = targetRole === "Other" ? customRole : targetRole;

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setLoadStep(s => Math.min(s + 1, loadSteps.length - 1)), 2200);
    return () => clearInterval(t);
  }, [loading]);

  function normalizeSkills(raw) {
    if (!raw) return null;
    return { ...raw, skills_you_have: (raw.skills_you_have || []).map(sk => ({ ...sk, name: sk.name || sk.skill || "" })), skills_you_need: (raw.skills_you_need || []).map(sk => ({ ...sk, name: sk.name || sk.skill || "", reason: sk.reason || sk.why || "" })), transferable_skills: (raw.transferable_skills || []).map(s => typeof s === "string" ? s : (s.skill || s.name || JSON.stringify(s))) };
  }

  function normalizeRoadmap(raw) {
    if (!raw) return null;
    return { ...raw, total_duration: raw.total_duration || raw.estimated_time || "" };
  }

  async function analyze() {
    if (!resume.trim() || !finalRole) return;
    setLoading(true); setLoadStep(0);
    setProfile(null); setSkills(null); setRoadmap(null); setMarket(null); setWins(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/analyze/career", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: resume, target_role: finalRole })
      });
      const data = await res.json();
      console.log("Raw Roadmap API Response:", data.learning_roadmap);
      setProfile(data.career_profile || data.profile_analysis || {});
      setSkills(normalizeSkills(data.skill_analysis || null));
      setRoadmap(normalizeRoadmap(data.learning_roadmap || null));
      setMarket(data.market_insights || null);
      setWins(data.quick_wins || null);
    } catch {
      setProfile({ name: "Shrey Yadav", current_role: "Student", experience_level: "Fresher", total_years: 0, strongest_domain: "Web Development", gap_to_target: "Significant" });
      setSkills(normalizeSkills({ skill_gap_score: 60, honest_summary: "Solid foundation in programming and web fundamentals. Needs frontend frameworks and cloud skills to be competitive.", category_scores: { languages: 80, frameworks_tools: 40, concepts_theory: 20, practical_experience: 60 }, skills_you_have: [{ name: "JavaScript", level: "Intermediate", evidence: "Languages: Java, JavaScript, Python" }, { name: "HTML", level: "Beginner" }], skills_you_need: [{ name: "React", priority: "Critical", reason: "Core frontend framework" }, { name: "TypeScript", priority: "Important", reason: "Industry standard" }], transferable_skills: ["Problem solving", "Git workflow", "API integration"] }));
      setRoadmap(normalizeRoadmap({ total_duration: "6-8 months", phases: [{ phase: 1, title: "JavaScript Mastery", duration: "4 weeks", focus: "Deep dive into modern JS", skills_to_learn: ["ES6+", "Async/Await", "DOM"], resources: [{ title: "JavaScript.info", type: "Course", platform: "javascript.info", free: true }], project_to_build: "Interactive quiz app", milestone: "Can build vanilla JS apps" }] }));
      setMarket({ demand_level: "High", demand_reason: "Consistent demand across all sectors.", market_reality: "The Full Stack market is competitive for freshers. Companies expect portfolio projects and real deployments, not just coursework.", salary: { india_fresher: "3-5 LPA", india_junior: "6-12 LPA", india_mid: "15-28 LPA", india_senior: "30-55 LPA", global_junior: "$55k-$80k", global_mid: "$85k-$120k", global_senior: "$120k-$160k", candidate_realistic: "3-4 LPA" }, top_companies_india: [{ name: "Razorpay", type: "Product", why: "Hires full stack devs heavily, 8-18 LPA" }, { name: "Swiggy", type: "Product", why: "Large engineering team, good pay" }, { name: "Infosys", type: "Service", why: "Entry level, 3-5 LPA" }], hot_skills_2025: ["TypeScript", "Next.js", "Docker", "AWS", "System Design"], industry_trend: "AI integration skills are now expected. Full stack devs who understand LLM APIs get 20-30% salary premium.", job_titles_now: ["Junior Web Developer", "Frontend Intern", "Associate Software Engineer"], job_titles_after_roadmap: ["Full Stack Developer", "React Developer", "Node.js Developer"], interview_topics: ["React hooks", "REST vs GraphQL", "SQL joins", "System design basics", "DSA fundamentals"] });
      setWins([{ action: "Build a deployed project", impact: "High", time: "This week", detail: "Deploy a React + Node.js app on Vercel + Render. This is the #1 thing freshers are missing.", why: "Employers filter for 'deployed projects' — a GitHub URL is not enough" }, { action: "Add TypeScript to existing project", impact: "High", time: "Today", detail: "Migrate your strongest JS project to TypeScript. Takes 2-3 hours, dramatically upgrades your resume.", why: "TypeScript is now mandatory at most product companies" }]);
    }
    setLoading(false);
  }

  const palettes = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"];
  const stepPalette = [
    { accent: "#f59e0b", label: "START" },
    { accent: "#06b6d4", label: "STEP 1" },
    { accent: "#8b5cf6", label: "STEP 2" },
    { accent: "#10b981", label: "STEP 3" },
    { accent: "#ec4899", label: "END GOAL" },
  ];

  const hasData = profile;

  return (
    <PageLayout onBack={onBack} title="Career Guidance" subtitle="AI skill gap analysis · roadmaps · market intelligence">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-[320px_1fr] gap-6 min-h-[calc(100vh-120px)]">

          {/* LEFT PANEL */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 overflow-y-auto">

            {/* Target role */}
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3">Target Role</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {CAREER_ROLES.map(r => (
                    <button key={r} onClick={() => setTargetRole(r)}
                      className={`text-left text-xs px-3 py-2 rounded-lg border transition-all ${targetRole === r ? "bg-violet-500/15 border-violet-500/40 text-violet-400 font-semibold" : "bg-background/50 border-border/50 text-muted-foreground hover:border-border"}`}>
                      {r}
                    </button>
                  ))}
                  <button onClick={() => setTargetRole("Other")}
                    className={`col-span-2 text-xs px-3 py-2 rounded-lg border transition-all text-left ${targetRole === "Other" ? "bg-violet-500/15 border-violet-500/40 text-violet-400 font-semibold" : "bg-background/50 border-border/50 text-muted-foreground hover:border-border"}`}>
                    Other (type below)
                  </button>
                </div>
                {targetRole === "Other" && (
                  <input value={customRole} onChange={e => setCustomRole(e.target.value)} placeholder="e.g. Blockchain Developer"
                    className="w-full mt-2 bg-background/50 border border-border/50 rounded-lg text-sm p-2 outline-none focus:border-violet-500/50 text-foreground placeholder:text-muted-foreground/50" />
                )}
              </CardContent>
            </Card>

            {/* Resume */}
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Resume</span>
                  <div className="flex gap-1.5">
                    <FileUploadButton onExtract={setResume} />
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => setResume(CAREER_SAMPLE)}>Sample</Button>
                  </div>
                </div>
                <textarea value={resume} onChange={e => setResume(e.target.value)} rows={8} placeholder="Paste your resume here..."
                  className="w-full bg-background/50 border border-border/50 rounded-lg text-sm font-mono p-3 resize-none outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 text-foreground placeholder:text-muted-foreground/50" />
              </CardContent>
            </Card>

            {/* Analyze */}
            <Button onClick={analyze} disabled={loading || !resume.trim() || !finalRole} className="w-full h-12 text-sm font-semibold bg-pink-500 hover:bg-pink-400 text-white shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> {loadSteps[loadStep]}</> : "Analyze Career Path →"}
            </Button>
            {loading && (
              <div className="flex gap-1">
                {loadSteps.map((_, i) => (
                  <div key={i} className="flex-1 h-1 rounded-full transition-all" style={{ background: i <= loadStep ? "#ec4899" : "rgba(255,255,255,0.1)", boxShadow: i <= loadStep ? "0 0 8px rgba(236,72,153,0.5)" : "none" }} />
                ))}
              </div>
            )}

            {/* Profile detected */}
            {profile && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="bg-card/80 border-violet-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-sm font-extrabold text-white">
                        {(profile.name || "?")[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold">{profile.name || "Candidate"}</div>
                        <div className="text-xs text-muted-foreground">{profile.current_role} · {profile.experience_level}</div>
                      </div>
                    </div>
                    <div className="space-y-0">
                      {[["Domain", profile.strongest_domain], ["Experience", `${profile.total_years} years`], ["Gap to Target", profile.gap_to_target]].map(([k, v]) => (
                        <div key={k} className="flex justify-between items-center py-1.5 border-b border-border/30 last:border-0 gap-4">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{k}</span>
                          <span className="text-xs font-mono text-foreground text-right">{v}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>

          {/* RIGHT PANEL */}
          <div className="flex flex-col min-h-0">
            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-card/60 rounded-xl p-1 border border-border/40">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[11px] font-bold tracking-wide transition-all ${activeTab === tab.id ? "bg-background shadow-lg text-foreground" : "text-muted-foreground hover:text-foreground/70"}`}>
                  <tab.icon className="w-3.5 h-3.5" style={activeTab === tab.id ? { color: tab.color } : {}} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>

                  {/* SKILL GAP TAB */}
                  {activeTab === "skills" && (skills ? (
                    <div className="space-y-4">
                      <Card className="bg-card/80 border-violet-500/20">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-6 mb-5">
                            <div className="flex-1">
                              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Overall Readiness for {finalRole}</div>
                              <p className="text-sm text-muted-foreground leading-relaxed">{skills.honest_summary}</p>
                            </div>
                            <ScoreRing score={skills.skill_gap_score} color={skills.skill_gap_score >= 70 ? "#10b981" : skills.skill_gap_score >= 40 ? "#f59e0b" : "#ef4444"} />
                          </div>
                          <div className="space-y-3">
                            {skills.category_scores && Object.entries(skills.category_scores).map(([k, v], i) => (
                              <CatBar key={k} label={k.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())} score={v}
                                color={v >= 70 ? "#10b981" : v >= 40 ? "#f59e0b" : "#ef4444"} delay={i * 80} />
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-card/80 border-border/50">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-1.5 mb-3">
                              <div className="w-1 h-4 bg-emerald-400 rounded" />
                              <span className="text-xs font-semibold uppercase tracking-wider">You Have ({skills.skills_you_have?.length || 0})</span>
                            </div>
                            <div className="space-y-2">
                              {skills.skills_you_have?.map((sk, i) => (
                                <div key={i} className="p-2.5 bg-background/50 rounded-lg border border-emerald-500/10">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-semibold">{sk.name}</span>
                                    <LvlBadge level={sk.level} />
                                  </div>
                                  {sk.evidence && <div className="text-[11px] font-mono text-muted-foreground italic">"{sk.evidence}"</div>}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="bg-card/80 border-border/50">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-1.5 mb-3">
                              <div className="w-1 h-4 bg-red-400 rounded" />
                              <span className="text-xs font-semibold uppercase tracking-wider">You Need ({skills.skills_you_need?.length || 0})</span>
                            </div>
                            <div className="space-y-2">
                              {skills.skills_you_need?.map((sk, i) => (
                                <div key={i} className="p-2.5 bg-background/50 rounded-lg border border-border/30">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-semibold">{sk.name}</span>
                                    <PrioBadge priority={sk.priority} />
                                  </div>
                                  {sk.reason && <div className="text-xs text-muted-foreground">{sk.reason}</div>}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {skills.transferable_skills?.length > 0 && (
                        <Card className="bg-card/80 border-border/50">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-1.5 mb-3">
                              <div className="w-1 h-4 bg-cyan-400 rounded" />
                              <span className="text-xs font-semibold uppercase tracking-wider">Transferable Skills</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {skills.transferable_skills.map((s, i) => (
                                <span key={i} className="text-xs font-mono px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-md text-cyan-400">{s}</span>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ) : hasData ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/50 gap-3">
                      <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
                      <span className="text-sm">Analyzing skill gap...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/40 gap-3">
                      <Zap className="w-8 h-8" />
                      <span className="text-sm">Analyze your resume to see skill gap analysis</span>
                    </div>
                  ))}

                  {/* ROADMAP TAB */}
                  {activeTab === "roadmap" && (roadmap ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Estimated Duration</span>
                        <Badge variant="secondary" className="font-mono text-xs text-amber-400 bg-amber-500/10 border-amber-500/20">{roadmap.total_duration}</Badge>
                      </div>
                      {roadmap.phases?.map((phase, i) => (
                        <PhaseCard key={i} phase={phase} open={openPhase === i} onToggle={() => setOpenPhase(openPhase === i ? -1 : i)} />
                      ))}
                    </div>
                  ) : hasData ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/50 gap-3">
                      <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                      <span className="text-sm">Building roadmap...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/40 gap-3">
                      <Map className="w-8 h-8" />
                      <span className="text-sm">Analyze your resume to see your learning roadmap</span>
                    </div>
                  ))}


                  {/* MARKET TAB */}
                  {activeTab === "market" && (market ? (
                    <div className="space-y-4">
                      {/* Reality check */}
                      {market.market_reality && (
                        <Card className="bg-amber-500/5 border-amber-500/20">
                          <CardContent className="p-5">
                            <div className="flex items-center gap-1.5 mb-3">
                              <div className="w-1 h-4 bg-amber-400 rounded" />
                              <span className="text-xs font-semibold uppercase tracking-wider">Market Reality Check</span>
                            </div>
                            <p className="text-sm text-foreground leading-relaxed">{market.market_reality}</p>
                          </CardContent>
                        </Card>
                      )}

                      {/* Salary */}
                      <div className="grid grid-cols-1 gap-4">
                        <Card className="bg-card/80 border-border/50">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-1.5 mb-3">
                              <div className="w-1 h-4 bg-violet-400 rounded" />
                              <span className="text-xs font-semibold uppercase tracking-wider">Salary Ranges — {finalRole}</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2 mb-3">
                              {[
                                { l: "🇮🇳 Fresher", v: market.salary?.india_fresher, c: "#8b5cf6" },
                                { l: "🇮🇳 Junior", v: market.salary?.india_junior, c: "#06b6d4" },
                                { l: "🇮🇳 Mid", v: market.salary?.india_mid, c: "#10b981" },
                                { l: "🇮🇳 Senior", v: market.salary?.india_senior, c: "#f59e0b" },
                                { l: "🌐 Junior", v: market.salary?.global_junior, c: "#8b5cf6" },
                                { l: "🌐 Mid", v: market.salary?.global_mid, c: "#06b6d4" },
                                { l: "🌐 Senior", v: market.salary?.global_senior, c: "#10b981" },
                              ].filter(s => s.v).map(({ l, v, c }) => (
                                <div key={l} className="p-2.5 bg-background/50 rounded-lg border border-border/30">
                                  <div className="text-[11px] text-muted-foreground mb-1">{l}</div>
                                  <div className="text-xs font-mono font-semibold" style={{ color: c }}>{v}</div>
                                </div>
                              ))}
                            </div>
                            {market.salary?.candidate_realistic && (
                              <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg flex justify-between items-center">
                                <div>
                                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Your Realistic Salary Now</div>
                                  <div className="text-xs text-muted-foreground">Based on current experience level</div>
                                </div>
                                <div className="text-lg font-extrabold text-amber-400">{market.salary.candidate_realistic}</div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      {/* Trend + Hot Skills */}
                      <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-card/80 border-border/50">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-1.5 mb-3">
                              <div className="w-1 h-4 bg-cyan-400 rounded" />
                              <span className="text-xs font-semibold uppercase tracking-wider">2025 Industry Trend</span>
                            </div>
                            <p className="text-sm text-foreground leading-relaxed">{market.industry_trend}</p>
                          </CardContent>
                        </Card>
                        {market.hot_skills_2025?.length > 0 && (
                          <Card className="bg-card/80 border-border/50">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-1.5 mb-3">
                                <div className="w-1 h-4 bg-pink-400 rounded" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Hot Skills 2025</span>
                              </div>
                              <div className="space-y-2">
                                {market.hot_skills_2025.map((sk, i) => (
                                  <div key={i} className="flex items-center gap-3 p-2 bg-background/50 rounded-lg">
                                    <span className="text-[11px] font-mono font-semibold" style={{ color: palettes[i] }}>{String(i + 1).padStart(2, "0")}</span>
                                    <span className="text-sm">{sk}</span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>

                      {/* Companies */}
                      <Card className="bg-card/80 border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-1.5 mb-3">
                            <div className="w-1 h-4 bg-violet-400 rounded" />
                            <span className="text-xs font-semibold uppercase tracking-wider">Top Hiring Companies in India</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {market.top_companies_india?.map((co, i) => (
                              <div key={i} className="p-3 bg-background/50 rounded-lg border-l-2" style={{ borderColor: palettes[i % 5] }}>
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="text-sm font-bold">{co.name || co}</span>
                                  {co.type && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${palettes[i % 5]}20`, color: palettes[i % 5] }}>{co.type}</span>}
                                </div>
                                {co.why && <div className="text-xs text-muted-foreground leading-relaxed">{co.why}</div>}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Job titles + Interview */}
                      <div className="grid grid-cols-3 gap-4">
                        {market.job_titles_now?.length > 0 && (
                          <Card className="bg-card/80 border-border/50">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-1.5 mb-3"><div className="w-1 h-4 bg-emerald-400 rounded" /><span className="text-xs font-semibold uppercase tracking-wider">Apply Now</span></div>
                              {market.job_titles_now.map((t, i) => <div key={i} className="text-sm mb-2 pl-3 border-l-2 border-emerald-500/40">{t}</div>)}
                            </CardContent>
                          </Card>
                        )}
                        {market.job_titles_after_roadmap?.length > 0 && (
                          <Card className="bg-card/80 border-border/50">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-1.5 mb-3"><div className="w-1 h-4 bg-amber-400 rounded" /><span className="text-xs font-semibold uppercase tracking-wider">After Roadmap</span></div>
                              {market.job_titles_after_roadmap.map((t, i) => <div key={i} className="text-sm mb-2 pl-3 border-l-2 border-amber-500/40">{t}</div>)}
                            </CardContent>
                          </Card>
                        )}
                        {market.interview_topics?.length > 0 && (
                          <Card className="bg-card/80 border-border/50">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-1.5 mb-3"><div className="w-1 h-4 bg-violet-400 rounded" /><span className="text-xs font-semibold uppercase tracking-wider">Interview Topics</span></div>
                              {market.interview_topics.map((t, i) => <div key={i} className="text-sm mb-2 pl-3 border-l-2 border-violet-500/40">{t}</div>)}
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  ) : hasData ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/50 gap-3">
                      <Loader2 className="w-6 h-6 animate-spin text-pink-400" />
                      <span className="text-sm">Fetching market data...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/40 gap-3">
                      <Briefcase className="w-8 h-8" />
                      <span className="text-sm">Analyze your resume to see market insights</span>
                    </div>
                  ))}

                  {/* QUICK WINS TAB */}
                  {activeTab === "wins" && (wins ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground mb-2">
                        Actions you can start <strong className="text-foreground">today</strong> — ordered by impact ↓
                      </p>
                      {wins.map((win, i) => {
                        const impactColor = { High: "#10b981", Medium: "#f59e0b", Low: "#9ca3af" }[win.impact] || "#9ca3af";
                        const timeColor = { Today: "#ef4444", "This week": "#f59e0b", "2 weeks": "#06b6d4", "1 month": "#10b981" }[win.time] || "#9ca3af";
                        return (
                          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                            <Card className="bg-card/80 border-border/50">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                  <div className="w-8 h-8 rounded-full bg-background border-2 flex items-center justify-center shrink-0" style={{ borderColor: `${impactColor}50` }}>
                                    <span className="text-xs font-extrabold" style={{ color: impactColor }}>{i + 1}</span>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                      <span className="text-sm font-bold">{win.action}</span>
                                      <span className="text-[10px] font-mono px-2 py-0.5 rounded border" style={{ background: `${impactColor}12`, color: impactColor, borderColor: `${impactColor}40` }}>{win.impact} Impact</span>
                                      <span className="text-[10px] font-mono px-2 py-0.5 rounded border" style={{ background: `${timeColor}12`, color: timeColor, borderColor: `${timeColor}40` }}>{win.time}</span>
                                    </div>
                                    <p className="text-sm text-foreground leading-relaxed mb-2">{win.detail}</p>
                                    <p className="text-sm text-muted-foreground italic leading-relaxed">💡 {win.why}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : hasData ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/50 gap-3">
                      <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
                      <span className="text-sm">Finding quick wins...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/40 gap-3">
                      <Target className="w-8 h-8" />
                      <span className="text-sm">Analyze your resume to see quick wins</span>
                    </div>
                  ))}

                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
