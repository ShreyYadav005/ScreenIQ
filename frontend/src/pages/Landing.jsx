import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import FeatureGrid from "@/components/landing/FeatureGrid";
import DemoSection from "@/components/landing/DemoSection";
import { Zap } from "lucide-react";

import { Github, Linkedin } from "lucide-react";

function Footer({ onNavigate }) {
  return (
    <footer className="border-t border-border/40 py-16 bg-[#0c0c14]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-16">
          {/* Column 1 - Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">
                Screen<span className="text-emerald-400">IQ</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered resume intelligence for job seekers, recruiters and career planners.
            </p>
          </div>

          {/* Column 2 - Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground tracking-tight">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <button onClick={() => onNavigate("jobseeker")} className="hover:text-emerald-400 transition-colors">Job Seeker</button>
              </li>
              <li>
                <button onClick={() => onNavigate("recruiter")} className="hover:text-cyan-400 transition-colors">Recruiter</button>
              </li>
              <li>
                <button onClick={() => onNavigate("career")} className="hover:text-violet-400 transition-colors">Career Guidance</button>
              </li>
              <li>
                <button onClick={() => onNavigate("about")} className="hover:text-foreground transition-colors">About</button>
              </li>
            </ul>
          </div>

          {/* Column 3 - Resources */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground tracking-tight">Resources</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <a href="https://forms.gle/4dFjuj5quwJynk9C8" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                  Report a Bug / Feedback
                </a>
              </li>
              <li>
                <button onClick={() => onNavigate("about")} className="hover:text-foreground transition-colors">About ScreenIQ</button>
              </li>
            </ul>
          </div>

          {/* Column 4 - Connect */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground tracking-tight">Connect</h4>
            <div className="flex items-center gap-4">
              <a href="https://github.com/ShreyYadav005" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 border border-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://www.linkedin.com/in/shrey-yadav-005/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 border border-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/40 text-center">
          <p className="text-sm text-muted-foreground">
            Built by Shrey Yadav · © 2026 ScreenIQ · All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Landing({ onNavigate }) {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar onNavigate={onNavigate} />
      <Hero onNavigate={onNavigate} />
      <FeatureGrid onNavigate={onNavigate} />
      <DemoSection />
      <Footer />
    </div>
  );
}
