import { motion } from "motion/react";
import PageLayout from "@/components/shared/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Zap, Cpu, Server, Box, Terminal, Map, FileSearch, Users } from "lucide-react";

export default function AboutPage({ onBack }) {
  return (
    <PageLayout onBack={onBack} title="About ScreenIQ" subtitle="The smartest way to screen, analyze, and plan">
      <div className="max-w-4xl mx-auto px-6 py-6 pb-20">
        
        {/* 1. What is ScreenIQ? */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">What is ScreenIQ?</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed text-[15px] pl-10">
            A smart resume intelligence platform that uses Machine Learning and AI to help job seekers improve their resumes, help recruiters screen candidates faster, and help professionals plan their career path.
          </p>
        </motion.div>

        {/* 2. How It Works (3 modes) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10"
        >
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">How It Works (3 Modes)</h2>
          
          <div className="grid gap-4">
            <Card className="bg-[#0c0c14] border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.03)] hover:shadow-[0_0_40px_rgba(16,185,129,0.08)] transition-all">
              <CardContent className="p-5 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <FileSearch className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-400 mb-1">Job Seeker Mode</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Paste your resume, get ATS score, resume strength score, section-by-section feedback, before/after bullet rewrites and improvement suggestions.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0c0c14] border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.03)] hover:shadow-[0_0_40px_rgba(6,182,212,0.08)] transition-all">
              <CardContent className="p-5 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-cyan-400 mb-1">Recruiter Mode</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Paste a resume + job description, get ML-predicted role, JD match percentage, hire/no-hire verdict with reasoning.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0c0c14] border-violet-500/20 shadow-[0_0_30px_rgba(139,92,246,0.03)] hover:shadow-[0_0_40px_rgba(139,92,246,0.08)] transition-all">
              <CardContent className="p-5 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <Map className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-violet-400 mb-1">Career Guidance Mode</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Paste your resume + pick a target role, get skill gap analysis, personalized learning roadmap with topics to cover, market salary data for India and globally, and quick win actions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* 3. Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10"
        >
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">Tech Stack</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Box className="w-4 h-4 text-pink-400" />
                  <h3 className="font-bold">Frontend</h3>
                </div>
                <p className="text-sm text-muted-foreground">React + Vite, pure CSS animations, no UI libraries.</p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold">Backend</h3>
                </div>
                <p className="text-sm text-muted-foreground">FastAPI (Python).</p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold">ML Model</h3>
                </div>
                <p className="text-sm text-muted-foreground">scikit-learn — trained on 400 synthetic resumes across 8 tech roles to predict role and confidence score.</p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Terminal className="w-4 h-4 text-violet-400" />
                  <h3 className="font-bold">AI</h3>
                </div>
                <p className="text-sm text-muted-foreground">Groq API running Llama 3.3 70B — 5 parallel AI calls for Career Guidance, 1 call each for Job Seeker and Recruiter.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/80 border-border/50 sm:col-span-2">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <FileSearch className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold">File Parsing</h3>
                </div>
                <p className="text-sm text-muted-foreground">pdfplumber + python-docx for PDF and DOCX extraction.</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* 4. Why It's Fast */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-10"
        >
          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
            <h2 className="text-xl font-bold tracking-tight text-amber-400 mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5" /> Why It's Fast
            </h2>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Career Guidance runs 5 AI calls in parallel using Python asyncio — all 5 analyses happen simultaneously instead of one by one, so results load in seconds not minutes.
            </p>
          </div>
        </motion.div>

        {/* 5. Built By */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center pt-8 border-t border-border/40"
        >
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-background/50 px-4 py-2 rounded-full border border-border/50">
            <Info className="w-4 h-4" />
            Built by <strong className="text-foreground">Shrey Yadav</strong> <span className="text-border mx-1">&middot;</span> Open to feedback and contributions
          </div>
        </motion.div>

      </div>
    </PageLayout>
  );
}
