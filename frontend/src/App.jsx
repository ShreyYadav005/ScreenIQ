import { useState } from "react";
import { LandingPage } from "./pages/LandingPage";
import { RecruiterPage } from "./pages/RecruiterPage";
import { JobSeekerPage } from "./pages/JobSeekerPage";

export default function App() {
  const [page, setPage] = useState("landing");

  return (
    <>
      {page === "landing"   && <LandingPage onNavigate={setPage} />}
      {page === "recruiter" && <RecruiterPage onBack={() => setPage("landing")} />}
      {page === "jobseeker" && <JobSeekerPage onBack={() => setPage("landing")} />}
    </>
  );
}
