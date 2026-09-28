import re
from typing import Dict, Any, Optional, List
from app.services.ai_service import ai_service

class ResumeAgent:
    """Specialized Agent for Resume Improvement, ATS Evaluation & Bullet Point Rewriting."""

    SYSTEM_PROMPT = """You are TechMate AI's Specialized Resume & ATS Strategy Agent.
You review resumes for engineering students, software developers, and tech applicants.

Important Rules:
1. Never invent skills, companies, grades, degrees, or certifications that the user did not state.
2. Do NOT falsely promise that any resume is guaranteed to pass an ATS; frame guidance around maximizing parsing readability and matching relevant industry keywords.
3. Use the Google 'XYZ Formula' (Accomplished [X] as measured by [Y] by doing [Z]) to rewrite weak bullet points.
4. If a job description is provided, organize your review into:
   - MATCHED SKILLS
   - MISSING / NOT SHOWN
   - PROJECT RELEVANCE
   - SUGGESTED CHANGES
"""

    async def handle_resume(
        self,
        resume_text: str,
        job_description: Optional[str] = None,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Analyzes resume text and generates actionable feedback."""
        prompt = f"""Review and optimize the following resume text:

Resume Content:
{resume_text}

Target Job Description (if any):
{job_description or 'General Software Engineering / Developer Role'}

Provide a rigorous, actionable evaluation:
### Overall ATS & Structural Audit
### Strengths Identified
### Matched Skills vs. Missing / Not Shown
### Bullet Point Transformations (Before vs. After using XYZ Formula)
### Project Descriptions & Technical Depth Recommendations
### Actionable Next Steps
"""
        response_text = await ai_service.generate_response(prompt, self.SYSTEM_PROMPT, context=context)

        if "### Overall ATS & Structural Audit" not in response_text:
            response_text = self._generate_structured_resume_response(resume_text, job_description)

        return {
            "agent": "ResumeAgent",
            "intent": "RESUME",
            "content": response_text,
            "metadata": {
                "has_job_description": bool(job_description)
            }
        }

    def _generate_structured_resume_response(self, text: str, job_desc: Optional[str]) -> str:
        # Extract detected skills
        known_keywords = [
            "python", "javascript", "typescript", "c++", "java", "sql", "react", "django",
            "fastapi", "docker", "aws", "git", "linux", "rest", "nosql", "mongodb", "postgresql",
            "redis", "data structures", "algorithms"
        ]
        text_lower = text.lower()
        found_keywords = [k.capitalize() for k in known_keywords if k in text_lower]

        return f"""### Overall ATS & Structural Audit
- **Format Readability**: Clean single-column layout is recommended for automated parser readability. Avoid nested tables, text boxes, and multi-column skill bars.
- **Quantifiable Metrics**: Ensure your project and experience bullet points quantify impact (e.g. latency reduced by 30%, 500+ daily requests handled).
- **ATS Disclaimer**: While these optimizations maximize keyword alignment and parser fidelity, no tool guarantees a human hiring callback or algorithmic bypass.

---

### Strengths Identified
- **Technical Competencies Detected**: {', '.join(found_keywords) if found_keywords else 'Foundational programming concepts'}.
- Clear project focus demonstrating hands-on building capability.

---

### Matched Skills vs. Missing / Not Shown
| Category | Identified In Resume | Missing / Recommended To Highlight |
|---|---|---|
| **Languages** | {', '.join([k for k in found_keywords if k in ['Python', 'Javascript', 'C++', 'Java', 'Typescript']]) or 'C / Python'} | TypeScript, SQL / Relational queries |
| **Frameworks & Tools** | {', '.join([k for k in found_keywords if k in ['React', 'Fastapi', 'Django', 'Git', 'Docker']]) or 'Git / Web Frameworks'} | Docker, Unit Testing (PyTest/Jest), CI/CD |
| **Architecture** | System design principles | Caching (Redis), REST API contract design |

---

### Bullet Point Transformations (Before vs. After using Google XYZ Formula)
*Formula: Accomplished [X] as measured by [Y] by doing [Z]*

1. **Weak Bullet (Example)**:
   - *Before*: "Built an attendance system using Python and OpenCV for college."
   - *After*: "**Engineered an automated facial recognition attendance platform** utilizing OpenCV and InsightFace, reducing manual roll-call time by **70%** and processing **60+ student faces/minute** with sub-second inference."

2. **Weak Bullet (Example)**:
   - *Before*: "Created REST APIs and connected to database."
   - *After*: "**Architected 12+ RESTful microservice endpoints** using FastAPI and PostgreSQL, implementing JWT token authentication and indexed database queries to achieve **< 45ms average response latency**."

---

### Project Descriptions & Technical Depth Recommendations
- Emphasize the architectural challenge you overcame (e.g., handling concurrency, database indexing, caching strategies).
- Always include the GitHub repository link and live deployed URL (Render/Vercel/Fly.io) next to project headers.

---

### Actionable Next Steps
1. Re-format bullet points to lead with strong action verbs (*Architected, Spearheaded, Optimized, Deployed*).
2. Group technical skills into distinct buckets: *Languages, Frameworks, Developer Tools, Databases*.
3. Keep resume length strictly to **1 page** for students and early-career developers.
"""

resume_agent = ResumeAgent()
