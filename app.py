from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import joblib
import re
import os
import json
import io
from groq import AsyncGroq
import fitz  # pymupdf
from docx import Document as DocxDocument

# ================================
# Load saved ML model
# ================================
pipeline = joblib.load('resume_model.pkl')
categories = joblib.load('categories.pkl')

# ================================
# Create FastAPI app
# ================================
app = FastAPI(
    title="Resume Screener API",
    description="AI-powered resume screening for recruiters and job seekers",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# ================================
# Input structure
# ================================
class ResumeInput(BaseModel):
    resume_text: str
    job_description: Optional[str] = None

# ================================
# Clean resume text
# ================================
def clean_resume(text):
    text = re.sub(r'http\S+\s*', ' ', text)
    text = re.sub(r'\S+@\S+', ' ', text)
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    text = text.lower().strip()
    return text

# ================================
# ATS Scoring Logic (Rule Based)
# ================================
def calculate_ats_score(resume_text, job_description=None):
    resume_lower = resume_text.lower()
    score = 0
    details = {}

    # 1. SECTIONS CHECK (20 points)
    sections = {
        "experience": ["experience", "work history", "employment"],
        "education": ["education", "degree", "university", "college", "bachelor", "master"],
        "skills": ["skills", "technologies", "tools", "expertise"],
        "summary": ["summary", "objective", "profile", "about"],
        "contact": ["email", "phone", "linkedin", "github"]
    }

    sections_found = []
    sections_missing = []
    for section, keywords in sections.items():
        if any(kw in resume_lower for kw in keywords):
            sections_found.append(section)
            score += 4
        else:
            sections_missing.append(section)

    details["sections_found"] = sections_found
    details["sections_missing"] = sections_missing
    details["sections_score"] = len(sections_found) * 4

    # 2. EXPERIENCE YEARS (15 points)
    year_patterns = re.findall(r'(\d+)\+?\s*years?', resume_lower)
    total_years = sum(int(y) for y in year_patterns) if year_patterns else 0
    if total_years >= 5:
        exp_score = 15
    elif total_years >= 3:
        exp_score = 10
    elif total_years >= 1:
        exp_score = 5
    else:
        exp_score = 0

    details["experience_years"] = total_years
    details["experience_score"] = exp_score
    score += exp_score

    # 3. MEASURABLE ACHIEVEMENTS (15 points)
    achievement_patterns = [
        r'\d+%', r'\$\d+', r'increased', r'decreased', r'improved',
        r'reduced', r'achieved', r'delivered', r'launched', r'led',
        r'managed \d+', r'built', r'developed', r'designed'
    ]
    achievements_found = sum(
        1 for p in achievement_patterns
        if re.search(p, resume_lower)
    )
    achievement_score = min(achievements_found * 2, 15)
    details["achievements_found"] = achievements_found
    details["achievement_score"] = achievement_score
    score += achievement_score

    # 4. KEYWORD MATCH with Job Description (40 points)
    if job_description:
        jd_lower = job_description.lower()
        jd_words = set(re.findall(r'\b[a-zA-Z]{3,}\b', jd_lower))
        resume_words = set(re.findall(r'\b[a-zA-Z]{3,}\b', resume_lower))

        stop_words = {"the", "and", "for", "with", "that", "this",
                     "have", "will", "from", "are", "was", "were",
                     "you", "your", "our", "their", "they", "what"}
        jd_words -= stop_words
        resume_words -= stop_words

        matched = jd_words.intersection(resume_words)
        missing = jd_words - resume_words

        match_percent = len(matched) / len(jd_words) * 100 if jd_words else 0
        keyword_score = min(int(match_percent * 0.4), 40)

        common_tech = {"python", "java", "javascript", "react", "node",
                      "sql", "aws", "docker", "kubernetes", "machine",
                      "learning", "api", "agile", "scrum", "management",
                      "communication", "leadership", "analytics", "excel"}
        important_missing = [w for w in missing if w in common_tech][:10]

        details["keyword_match_percent"] = round(match_percent, 1)
        details["keywords_matched"] = len(matched)
        details["keywords_missing"] = list(missing)[:15]
        details["important_missing"] = important_missing
        details["keyword_score"] = keyword_score
        score += keyword_score
    else:
        general_keywords = ["experience", "skills", "project", "team",
                           "development", "management", "analysis",
                           "design", "communication", "leadership"]
        found = sum(1 for kw in general_keywords if kw in resume_lower)
        keyword_score = found * 4
        details["keyword_score"] = keyword_score
        details["keyword_match_percent"] = None
        details["keywords_missing"] = []
        details["important_missing"] = []
        score += keyword_score

    # 5. FORMATTING CHECK (10 points)
    formatting_score = 0
    word_count = len(resume_text.split())
    if 300 <= word_count <= 1000:
        formatting_score += 5
    elif word_count > 1000:
        formatting_score += 3

    has_bullets = "•" in resume_text or "-" in resume_text
    if has_bullets:
        formatting_score += 3

    has_dates = bool(re.search(r'\d{4}', resume_text))
    if has_dates:
        formatting_score += 2

    details["word_count"] = word_count
    details["formatting_score"] = formatting_score
    score += formatting_score

    details["total_score"] = min(score, 100)
    return details


# ================================
# Groq AI — Recruiter Analysis
# ================================
async def get_recruiter_analysis(resume_text, job_description, ats_score, predicted_category):
    prompt = f"""You are a senior recruiter at a top recruitment firm. Analyze this candidate's resume against the job description and provide a detailed recruiter report.

RESUME:
{resume_text}

PREDICTED ROLE: {predicted_category}
{f"JOB DESCRIPTION:{job_description}" if job_description else "No job description provided — analyze resume quality only."}
ATS SCORE: {ats_score}/100

You are writing this report FOR A RECRUITER, not for the candidate.
Do NOT give advice on how to improve the resume.
Instead, give the recruiter an honest assessment of this candidate.

Respond ONLY in this exact JSON format, no explanation, no markdown:
{{
  "candidate_overview": {{
    "name": "detected name or Unknown",
    "predicted_role": "best matching role based on resume",
    "experience_level": "Junior / Mid-level / Senior / Lead",
    "education_level": "detected highest degree or Not specified",
    "total_experience": "X years or Not specified"
  }},
  "jd_match": {{
    "overall_match_percent": <0-100>,
    "experience_match": "<MEETS / EXCEEDS / BELOW> requirement",
    "education_match": "<MEETS / EXCEEDS / BELOW / NOT SPECIFIED> requirement",
    "skills_found": ["skill1", "skill2", "skill3"],
    "skills_missing": ["skill1", "skill2", "skill3"],
    "summary": "2 sentence summary of how well candidate matches JD"
  }},
  "resume_breakdown": {{
    "sections_analysis": [
      {{"section": "section name", "status": "PRESENT/MISSING", "quality": "STRONG/AVERAGE/WEAK", "note": "1 sentence observation"}}
    ],
    "key_achievements": ["achievement1", "achievement2", "achievement3"],
    "extracted_skills": ["skill1", "skill2", "skill3", "skill4", "skill5"]
  }},
  "recruiter_verdict": {{
    "decision": "STRONG HIRE / CONSIDER / REJECT",
    "confidence": <0-100>,
    "reasoning": "2 sentence honest reasoning for the decision",
    "reasons_to_hire": ["reason1", "reason2", "reason3"],
    "concerns": ["concern1", "concern2", "concern3"]
  }}
}}"""

    api_key = os.environ.get("GROQ_API_KEY", "")
    print(f"GROQ KEY LOADED: {'YES' if api_key else 'NO - KEY IS MISSING!'}")

    client = AsyncGroq(api_key=api_key)

    response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1500,
        temperature=0.2
    )

    text = response.choices[0].message.content
    print(f"Groq recruiter response: {text[:300]}")
    text = text.replace("```json", "").replace("```", "").strip()
    return json.loads(text)


# ================================
# Groq AI — Job Seeker Analysis
# ================================
async def get_jobseeker_analysis(resume_text, job_description, ats_score, predicted_category):
    prompt = f"""You are an expert career coach helping a job seeker improve their resume and chances of getting hired.

RESUME:
{resume_text}

PREDICTED ROLE: {predicted_category}
{f"JOB DESCRIPTION:{job_description}" if job_description else "No job description provided — analyze resume quality only."}
ATS SCORE: {ats_score}/100

Analyze this resume FROM THE JOB SEEKER'S PERSPECTIVE.
Help them understand how strong their resume is and what to fix before applying.

Respond ONLY in this exact JSON format, no explanation, no markdown:
{{
  "scores": {{
    "ats_score": {ats_score},
    "resume_strength": <0-100>,
    "jd_match_percent": <0-100>,
    "apply_confidence": <0-100>,
    "apply_confidence_text": "You are X% ready to apply for this role — one sentence explanation"
  }},
  "section_checker": [
    {{"section": "Summary", "present": true, "quality": "STRONG/AVERAGE/WEAK/MISSING", "note": "1 sentence"}},
    {{"section": "Experience", "present": true, "quality": "STRONG/AVERAGE/WEAK/MISSING", "note": "1 sentence"}},
    {{"section": "Skills", "present": true, "quality": "STRONG/AVERAGE/WEAK/MISSING", "note": "1 sentence"}},
    {{"section": "Education", "present": true, "quality": "STRONG/AVERAGE/WEAK/MISSING", "note": "1 sentence"}},
    {{"section": "Contact", "present": true, "quality": "STRONG/AVERAGE/WEAK/MISSING", "note": "1 sentence"}}
  ],
  "strengths": [
    {{"point": "short title", "detail": "1 sentence explanation"}},
    {{"point": "short title", "detail": "1 sentence explanation"}},
    {{"point": "short title", "detail": "1 sentence explanation"}},
    {{"point": "short title", "detail": "1 sentence explanation"}},
    {{"point": "short title", "detail": "1 sentence explanation"}}
  ],
  "weaknesses": [
    {{"point": "short title", "detail": "1 sentence explanation"}},
    {{"point": "short title", "detail": "1 sentence explanation"}},
    {{"point": "short title", "detail": "1 sentence explanation"}}
  ],
  "suggestions": [
    {{"action": "short action title", "detail": "specific actionable advice in 1-2 sentences"}},
    {{"action": "short action title", "detail": "specific actionable advice in 1-2 sentences"}},
    {{"action": "short action title", "detail": "specific actionable advice in 1-2 sentences"}}
  ],
  "before_after": [
    {{
      "original": "weak line from the actual resume",
      "improved": "stronger rewritten version",
      "why": "1 sentence explanation of what changed"
    }},
    {{
      "original": "weak line from the actual resume",
      "improved": "stronger rewritten version",
      "why": "1 sentence explanation of what changed"
    }},
    {{
      "original": "weak line from the actual resume",
      "improved": "stronger rewritten version",
      "why": "1 sentence explanation of what changed"
    }}
  ]
}}"""

    api_key = os.environ.get("GROQ_API_KEY", "")
    client = AsyncGroq(api_key=api_key)

    response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=2000,
        temperature=0.3
    )

    text = response.choices[0].message.content
    print(f"Groq jobseeker response: {text[:300]}")
    text = text.replace("```json", "").replace("```", "").strip()
    return json.loads(text)


# ================================
# Routes
# ================================
@app.get("/")
def home():
    return {"message": "Resume Screener API v3.0 🚀 — /analyze/recruiter | /analyze/jobseeker"}

# ================================
# FILE EXTRACT ENDPOINT
# ================================
@app.post("/extract")
async def extract_text(file: UploadFile = File(...)):
    filename = file.filename.lower()
    contents = await file.read()

    try:
        if filename.endswith(".pdf"):
            # Extract text from PDF using pymupdf
            pdf = fitz.open(stream=contents, filetype="pdf")
            text = ""
            for page in pdf:
                text += page.get_text()
            pdf.close()

        elif filename.endswith(".docx"):
            # Extract text from DOCX
            doc = DocxDocument(io.BytesIO(contents))
            text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])

        else:
            return {"error": "Unsupported file type. Please upload PDF or DOCX only."}

        if not text.strip():
            return {"error": "Could not extract text from this file. It may be scanned or image-based."}

        print(f"Extracted {len(text)} characters from {filename}")
        return {
            "extracted_text": text.strip(),
            "word_count": len(text.split()),
            "file_type": "PDF" if filename.endswith(".pdf") else "DOCX"
        }

    except Exception as e:
        print(f"EXTRACTION ERROR: {str(e)}")
        return {"error": f"Failed to extract text: {str(e)}"}


# ================================
# RECRUITER ENDPOINT
# ================================
@app.post("/analyze/recruiter")
async def analyze_recruiter(data: ResumeInput):
    resume_text = data.resume_text
    job_description = data.job_description

    cleaned = clean_resume(resume_text)
    prediction = pipeline.predict([cleaned])[0]
    probabilities = pipeline.predict_proba([cleaned])[0]
    confidence = round(max(probabilities) * 100, 2)

    top3 = dict(sorted(
        {cat: round(prob * 100, 2) for cat, prob in zip(pipeline.classes_, probabilities)}.items(),
        key=lambda x: x[1], reverse=True
    )[:3])

    ats_details = calculate_ats_score(resume_text, job_description)

    try:
        recruiter_analysis = await get_recruiter_analysis(
            resume_text, job_description,
            ats_details["total_score"], prediction
        )
    except Exception as e:
        print(f"RECRUITER AI ERROR: {str(e)}")
        recruiter_analysis = {
            "candidate_overview": {
                "name": "Unknown", "predicted_role": prediction,
                "experience_level": "Not determined",
                "education_level": "Not determined",
                "total_experience": "Not determined"
            },
            "jd_match": {
                "overall_match_percent": ats_details["keyword_match_percent"] or 0,
                "experience_match": "Not determined", "education_match": "Not determined",
                "skills_found": [], "skills_missing": [],
                "summary": f"AI analysis unavailable: {str(e)}"
            },
            "resume_breakdown": { "sections_analysis": [], "key_achievements": [], "extracted_skills": [] },
            "recruiter_verdict": {
                "decision": "CONSIDER", "confidence": 0,
                "reasoning": "Manual review required — AI analysis unavailable.",
                "reasons_to_hire": [], "concerns": []
            }
        }

    return {
        "ml_prediction": { "category": prediction, "confidence": confidence, "top3": top3 },
        "ats_score": ats_details["total_score"],
        "ats_breakdown": {
            "sections": { "score": ats_details["sections_score"], "found": ats_details["sections_found"], "missing": ats_details["sections_missing"] },
            "experience": { "score": ats_details["experience_score"], "years_detected": ats_details["experience_years"] },
            "achievements": { "score": ats_details["achievement_score"], "count": ats_details["achievements_found"] },
            "keywords": { "score": ats_details["keyword_score"], "match_percent": ats_details["keyword_match_percent"], "missing": ats_details["keywords_missing"], "important_missing": ats_details["important_missing"] },
            "formatting": { "score": ats_details["formatting_score"], "word_count": ats_details["word_count"] }
        },
        "candidate_overview": recruiter_analysis["candidate_overview"],
        "jd_match": recruiter_analysis["jd_match"],
        "resume_breakdown": recruiter_analysis["resume_breakdown"],
        "recruiter_verdict": recruiter_analysis["recruiter_verdict"]
    }


# ================================
# JOB SEEKER ENDPOINT
# ================================
@app.post("/analyze/jobseeker")
async def analyze_jobseeker(data: ResumeInput):
    resume_text = data.resume_text
    job_description = data.job_description

    cleaned = clean_resume(resume_text)
    prediction = pipeline.predict([cleaned])[0]
    probabilities = pipeline.predict_proba([cleaned])[0]
    confidence = round(max(probabilities) * 100, 2)

    top3 = dict(sorted(
        {cat: round(prob * 100, 2) for cat, prob in zip(pipeline.classes_, probabilities)}.items(),
        key=lambda x: x[1], reverse=True
    )[:3])

    ats_details = calculate_ats_score(resume_text, job_description)

    try:
        jobseeker_analysis = await get_jobseeker_analysis(
            resume_text, job_description,
            ats_details["total_score"], prediction
        )
    except Exception as e:
        print(f"JOB SEEKER AI ERROR: {str(e)}")
        jobseeker_analysis = {
            "scores": {
                "ats_score": ats_details["total_score"], "resume_strength": 0,
                "jd_match_percent": ats_details["keyword_match_percent"] or 0,
                "apply_confidence": 0,
                "apply_confidence_text": f"AI analysis unavailable: {str(e)}"
            },
            "section_checker": [], "strengths": [], "weaknesses": [],
            "suggestions": [], "before_after": []
        }

    return {
        "ml_prediction": { "category": prediction, "confidence": confidence, "top3": top3 },
        "ats_breakdown": {
            "sections": { "found": ats_details["sections_found"], "missing": ats_details["sections_missing"] },
            "keywords": { "match_percent": ats_details["keyword_match_percent"], "missing": ats_details["keywords_missing"], "important_missing": ats_details["important_missing"] },
            "formatting": { "word_count": ats_details["word_count"] }
        },
        "scores": jobseeker_analysis["scores"],
        "section_checker": jobseeker_analysis["section_checker"],
        "strengths": jobseeker_analysis["strengths"],
        "weaknesses": jobseeker_analysis["weaknesses"],
        "suggestions": jobseeker_analysis["suggestions"],
        "before_after": jobseeker_analysis["before_after"]
    }


@app.get("/categories")
def get_categories():
    return {"categories": sorted(categories.tolist())}