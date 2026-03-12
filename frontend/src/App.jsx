import { useState } from "react";
import Landing from "@/pages/Landing";
import RecruiterPage from "@/pages/Recruiter";
import JobSeekerPage from "@/pages/JobSeeker";
import CareerGuidancePage from "@/pages/CareerGuide";
import AboutPage from "@/pages/About";

export default function App() {
  const [page, setPage] = useState("landing");

  return (
    <>
      {page === "landing"   && <Landing onNavigate={setPage} />}
      {page === "recruiter" && <RecruiterPage onBack={() => setPage("landing")} />}
      {page === "jobseeker" && <JobSeekerPage onBack={() => setPage("landing")} />}
      {page === "career"    && <CareerGuidancePage onBack={() => setPage("landing")} />}
      {page === "about"     && <AboutPage onBack={() => setPage("landing")} />}
    </>
  );
}
