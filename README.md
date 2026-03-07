# ⚡ ScreenIQ — AI-Powered Resume Intelligence

A full-stack resume screening system built with Machine Learning + AI. Designed for **recruiters** to screen candidates and **job seekers** to improve their resumes.

---

## 🚀 What It Does

### For Recruiters
- Screen candidate resumes against a job description
- Get ATS score, JD match %, skills found vs missing
- AI-powered verdict: **STRONG HIRE / CONSIDER / REJECT**
- Candidate overview, key achievements, section analysis

### For Job Seekers
- Check how well your resume passes ATS filters
- Get ATS score, resume strength, apply confidence meter
- 5 strengths, 3 weaknesses, actionable suggestions
- **Before/After resume line rewrites** powered by AI

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| ML Model | scikit-learn (Random Forest) |
| Feature Extraction | TF-IDF Vectorizer |
| Backend | FastAPI (Python) |
| AI Feedback | Groq API (Llama 3.3 70B) |
| Frontend | React + Vite |
| Dataset | Kaggle Resume Dataset (2,484 resumes) |

---

## 📁 Project Structure

```
resume-screener/
├── app.py                    ← FastAPI backend (all endpoints)
├── resume_model.pkl          ← Trained ML model
├── categories.pkl            ← Job categories list
├── resume_screening.ipynb    ← ML training notebook
├── Resume.csv                ← Training dataset
├── .env                      ← API keys (never commit this!)
├── venv/                     ← Python virtual environment
└── frontend/
    └── src/
        ├── App.jsx           ← Full React app (all 3 pages)
        └── main.jsx          ← Entry point
```

---

## ⚙️ API Endpoints

### Base URL
```
http://127.0.0.1:8000
```

### GET /
Health check
```json
Response: { "message": "Resume Screener API v3.0 🚀" }
```

---

### POST /analyze/recruiter
Screen a candidate resume against a job description.

**Request Body:**
```json
{
  "resume_text": "John Doe\nEmail: john@email.com\n\nEXPERIENCE...",
  "job_description": "Looking for Senior HR Manager with 5+ years..."
}
```

**Response:**
```json
{
  "ml_prediction": {
    "category": "HR",
    "confidence": 61.5,
    "top3": { "HR": 61.5, "ENGINEERING": 9.5, "PUBLIC-RELATIONS": 7.5 }
  },
  "ats_score": 79,
  "ats_breakdown": {
    "sections": { "score": 20, "found": ["experience", "education", "skills", "summary", "contact"], "missing": [] },
    "experience": { "score": 15, "years_detected": 7 },
    "achievements": { "score": 6, "count": 3 },
    "keywords": { "score": 33, "match_percent": 82.6, "missing": [], "important_missing": [] },
    "formatting": { "score": 5, "word_count": 138 }
  },
  "candidate_overview": {
    "name": "Sarah Johnson",
    "predicted_role": "HR Manager",
    "experience_level": "Senior",
    "education_level": "MBA",
    "total_experience": "7+ years"
  },
  "jd_match": {
    "overall_match_percent": 92,
    "experience_match": "EXCEEDS",
    "education_match": "MEETS",
    "skills_found": ["Recruitment", "HRIS", "Payroll"],
    "skills_missing": [],
    "summary": "Strong match. Candidate exceeds requirements."
  },
  "resume_breakdown": {
    "sections_analysis": [{ "section": "Summary", "status": "PRESENT", "quality": "STRONG", "note": "..." }],
    "key_achievements": ["Reduced turnover by 30%"],
    "extracted_skills": ["Recruitment", "HRIS", "SAP"]
  },
  "recruiter_verdict": {
    "decision": "STRONG HIRE",
    "confidence": 95,
    "reasoning": "Candidate exceeds all key requirements.",
    "reasons_to_hire": ["7+ years experience", "Quantified impact", "MBA degree"],
    "concerns": []
  }
}
```

---

### POST /analyze/jobseeker
Analyze a resume from a job seeker's perspective.

**Request Body:**
```json
{
  "resume_text": "Rahul Mehta\nEmail: rahul@gmail.com\n\nEXPERIENCE...",
  "job_description": "Looking for Senior Software Engineer..."
}
```

**Response:**
```json
{
  "ml_prediction": {
    "category": "INFORMATION-TECHNOLOGY",
    "confidence": 45.0,
    "top3": { "INFORMATION-TECHNOLOGY": 45.0, "ENGINEERING": 20.0, "BUSINESS-DEVELOPMENT": 10.0 }
  },
  "ats_breakdown": {
    "sections": { "found": ["experience", "skills", "education"], "missing": ["summary", "contact"] },
    "keywords": { "match_percent": 20.0, "missing": ["aws", "docker", "django"], "important_missing": ["aws", "docker"] },
    "formatting": { "word_count": 59 }
  },
  "scores": {
    "ats_score": 31,
    "resume_strength": 40,
    "jd_match_percent": 20,
    "apply_confidence": 10,
    "apply_confidence_text": "You are 10% ready — resume lacks key skills for this role."
  },
  "section_checker": [
    { "section": "Summary", "present": false, "quality": "MISSING", "note": "No summary found." },
    { "section": "Experience", "present": true, "quality": "AVERAGE", "note": "Lacks achievements." }
  ],
  "strengths": [{ "point": "Relevant Degree", "detail": "B.Tech CS matches software roles." }],
  "weaknesses": [{ "point": "Vague Bullets", "detail": "No numbers or impact shown." }],
  "suggestions": [{ "action": "Add Summary", "detail": "Write 2-3 sentences highlighting your stack." }],
  "before_after": [
    {
      "original": "Worked on backend development",
      "improved": "Built 5 RESTful APIs in Python/Django serving 10K+ daily requests",
      "why": "Specific tech + scale = much more impressive"
    }
  ]
}
```

---

### GET /categories
Returns all 22 job categories the ML model can predict.

```json
{
  "categories": ["ACCOUNTANT", "ADVOCATE", "ARTS", "AVIATION", "BANKING", "BUSINESS-DEVELOPMENT", "CHEF", "CONSULTANT", "DESIGNER", "DIGITAL-MEDIA", "ENGINEERING", "FITNESS", "FINANCE", "HEALTHCARE", "HR", "INFORMATION-TECHNOLOGY", "PUBLIC-RELATIONS", "SALES", "TEACHER", "...]
}
```

---

## 🔧 ML Model Details

| Property | Value |
|----------|-------|
| Algorithm | Random Forest (200 trees) |
| Feature Extraction | TF-IDF (5000 features, bigrams) |
| Training Data | 2,484 resumes, 22 categories |
| Accuracy | 79.84% |
| Train/Test Split | 80/20 |

### ATS Scoring Breakdown
| Component | Max Points |
|-----------|-----------|
| Sections Check | 20 |
| Experience Years | 15 |
| Measurable Achievements | 15 |
| Keyword Match with JD | 40 |
| Formatting | 10 |
| **Total** | **100** |

---

## 📦 Setup & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm

---

### Step 1 — Clone the repo
```bash
git clone https://github.com/yourusername/resume-screener.git
cd resume-screener
```

### Step 2 — Set up Python virtual environment
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### Step 3 — Install Python dependencies
```bash
pip install fastapi uvicorn python-multipart joblib scikit-learn numpy pandas groq python-dotenv httpx
```

### Step 4 — Set up API keys
Create a `.env` file in the root folder:
```
GROQ_API_KEY=gsk_your_groq_api_key_here
```

Get your free Groq API key at: https://console.groq.com/

### Step 5 — Start the backend
```bash
uvicorn app:app --reload
```
Backend runs at: `http://127.0.0.1:8000`

---

### Step 6 — Set up the frontend
```bash
cd frontend
npm install
```

### Step 7 — Start the frontend
```bash
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## 🎮 Usage

1. Open `http://localhost:5173` in your browser
2. Choose **"I AM A... JOB SEEKER"** or **"RECRUITER"**
3. Paste a resume and optionally a job description
4. Click **Analyze** and get instant AI-powered results

---

## 🔑 Environment Variables

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `GROQ_API_KEY` | Groq AI API key for LLM feedback | https://console.groq.com/ |

---

## ⚠️ Important Notes

- Never commit your `.env` file to GitHub — add it to `.gitignore`
- The `resume_model.pkl` file must be present in the root folder for the API to work
- Keep the backend running (`uvicorn`) while using the frontend
- The Groq API is free but has rate limits on the free tier

---

## 📊 Supported Job Categories

The ML model can predict 22 job categories:

`ACCOUNTANT` `ADVOCATE` `ARTS` `AVIATION` `BANKING` `BUSINESS-DEVELOPMENT` `CHEF` `CONSULTANT` `DESIGNER` `DIGITAL-MEDIA` `ENGINEERING` `FITNESS` `FINANCE` `HEALTHCARE` `HR` `INFORMATION-TECHNOLOGY` `PUBLIC-RELATIONS` `SALES` `TEACHER` `CONSTRUCTION` `AGRICULTURE` `FITNESS`

---

## 🏗 Built With

- [FastAPI](https://fastapi.tiangolo.com/) — Python backend framework
- [scikit-learn](https://scikit-learn.org/) — ML model training
- [Groq](https://groq.com/) — Free LLM API (Llama 3.3 70B)
- [React](https://react.dev/) — Frontend framework
- [Vite](https://vitejs.dev/) — Frontend build tool
- [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) — Pixel font

---

*Built with ❤️ — ScreenIQ v3.0*
