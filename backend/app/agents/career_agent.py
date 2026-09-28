from typing import Dict, Any, Optional
from app.services.ai_service import ai_service

class CareerAgent:
    """Specialized Agent for Career Guidance, Skill Gap Analysis & Learning Roadmaps."""

    SYSTEM_PROMPT = """You are TechMate AI's Specialized Career & Learning Roadmap Agent.
You mentor students and professionals transitioning into technology domains:
- Backend Engineering, Frontend Engineering, Full Stack, AI/ML, DevOps, Cloud Architecture, Data Engineering.

Guidelines:
1. Provide actionable, step-by-step milestones rather than abstract lists.
2. Structure roadmaps with:
   - Phase / Level (Beginner -> Intermediate -> Advanced -> Industry Ready)
   - Core Skills & Tools
   - Concrete Project Milestones
   - Free & Authoritative Learning Resources
   - Common Pitfalls to Avoid
3. Provide GitHub and portfolio optimization advice.
4. Never make unrealistic claims; emphasize verified fundamentals and tangible projects.
"""

    async def handle_career(self, query: str, context: Optional[str] = None, user_profile: Optional[Dict] = None) -> Dict[str, Any]:
        career_goal = user_profile.get("career_goal", "Software Engineer") if user_profile else "Software Engineer"

        prompt = f"""Career / Learning Roadmap Request: {query}
Target Role / Goal: {career_goal}

Provide an actionable, structured roadmap:
### Executive Summary & Role Overview
### Actionable Step-by-Step Learning Progression (Phased)
### Real-World Portfolio Projects (From Beginner to Production)
### Skill Gap Analysis & Key Technologies
### GitHub & Resume Enhancement Checklist
### Target Interview Readiness Metrics
"""
        response_text = await ai_service.generate_response(prompt, self.SYSTEM_PROMPT, context=context)

        if "### Actionable Step-by-Step" not in response_text:
            response_text = self._generate_structured_career_response(query, career_goal)

        return {
            "agent": "CareerAgent",
            "intent": "CAREER",
            "content": response_text,
            "metadata": {
                "target_role": career_goal
            }
        }

    def _generate_structured_career_response(self, query: str, goal: str) -> str:
        q_lower = query.lower()

        role = "Backend Developer"
        if "frontend" in q_lower:
            role = "Frontend Developer"
        elif "ai" in q_lower or "machine learning" in q_lower or "ml" in q_lower:
            role = "AI/ML Engineer"
        elif "full stack" in q_lower or "fullstack" in q_lower:
            role = "Full Stack Engineer"

        return f"""### Executive Summary & Role Overview
Target Domain: **{role}**
The industry demands engineers who understand not just how to assemble libraries, but how distributed data systems, latency, security, and scalability function under production load.

```text
[PHASE 1: FOUNDATIONS]  -->  [PHASE 2: FRAMEWORKS & DB]  -->  [PHASE 3: ARCHITECTURE]  -->  [PHASE 4: PORTFOLIO]
  * Language Mastery          * Web Frameworks (FastAPI/Node) * Caching & Queues (Redis/Kafka) * 2 Star Production Apps
  * Data Structures & Alg     * SQL & Schema Normalization    * Docker & CI/CD Pipelines      * Deployed with Live URLs
```

---

### Actionable Step-by-Step Learning Progression

#### Phase 1: Core Programming & Foundations (Weeks 1 - 4)
- **Primary Language**: Master either Python (Type hints, Generators, AsyncIO) or TypeScript/Go.
- **Data Structures**: Hash Tables, Linked Lists, Trees, Two-Pointer technique, Binary Search.
- **Git & GitHub**: Feature branch workflows, interactive rebase, pull requests, conventional commits.

#### Phase 2: Relational Databases & Web Services (Weeks 5 - 8)
- **Databases**: PostgreSQL. Indexing (B-Tree, GIN), ACID transactions, query plan analysis (`EXPLAIN ANALYZE`).
- **APIs**: REST architectural principles, status codes, OpenAPI/Swagger specifications, authentication with JWT & OAuth2.
- **Frameworks**: FastAPI / Django or Node.js / Express.

#### Phase 3: Systems, Caching & Concurrency (Weeks 9 - 12)
- **Caching**: Redis (Session management, write-through caching, rate limiting).
- **Asynchronous Tasks**: Celery / BullMQ for background job processing.
- **DevOps Basics**: Docker containerization, Docker Compose, Linux CLI, Nginx reverse proxy.

#### Phase 4: Production Projects & Placement Readiness (Weeks 13 - 16)
- Build and deploy two complete portfolio-worthy systems.
- Practice mock technical interviews and optimize GitHub repositories.

---

### Real-World Portfolio Projects (Zero-Fluff)
1. **High-Throughput URL Shortener with Analytics**:
   - Custom Base62 encoding, Redis caching for \\(< 5ms\\) redirects, PostgreSQL for historical click analytics.
2. **Real-Time Collaborative Document or Chat Engine**:
   - WebSocket protocol, Redis Pub/Sub, JWT authentication, and automated integration test suite.

---

### GitHub & Resume Enhancement Checklist
- [ ] Provide clear `README.md` in every repo with an architectural diagram and live demo link.
- [ ] Use GitHub Actions for automated linting and unit tests on every commit.
- [ ] Write meaningful commit messages: `feat: implement redis rate limiting middleware`.
- [ ] Include an MIT or Apache license and setup instructions (`docker compose up`).
"""

career_agent = CareerAgent()
