import json
import logging
from typing import Dict, Any, List, Optional
from app.services.ai_service import ai_service

logger = logging.getLogger("techmate.interview")

class InterviewAgent:
    """Specialized Agent for Technical, HR, and Interactive Mock Interview Simulations."""

    ROLE_QUESTIONS = {
        "Software Developer": [
            {
                "question": "Can you explain the difference between Process and Thread, and how context switching impacts CPU overhead?",
                "type": "Technical - OS & Systems",
                "criteria": "Mentions separate address space for processes, shared memory for threads, registers/stack switching, PCB/TCB."
            },
            {
                "question": "How do Hash Tables handle collisions under high load factors, and what are the trade-offs between Open Addressing and Chaining?",
                "type": "Technical - DSA",
                "criteria": "Explains buckets with linked lists/red-black trees vs linear/quadratic probing, cache locality, and rehashing."
            },
            {
                "question": "What are ACID properties in relational databases, and which mechanism ensures Durability during sudden server crashes?",
                "type": "Technical - DBMS",
                "criteria": "Atomicity, Consistency, Isolation, Durability. Write-Ahead Logging (WAL) or transaction logs."
            },
            {
                "question": "Tell me about a challenging technical bug you encountered in a project, and how you systematically diagnosed and resolved it.",
                "type": "Behavioral / Technical Project",
                "criteria": "Uses STAR method: Situation, Task, Action, Result. Demonstrates logical debugging."
            },
            {
                "question": "Why do you want to join our engineering team, and what technical areas are you actively working to improve this year?",
                "type": "HR / Culture Fit",
                "criteria": "Demonstrates self-awareness, passion for continuous learning, and alignment with engineering excellence."
            }
        ],
        "Python Developer": [
            {
                "question": "How does the Global Interpreter Lock (GIL) affect multi-threaded programs in CPython, and how do you achieve true parallel CPU execution?",
                "type": "Technical - Python Core",
                "criteria": "Explains GIL mutex preventing concurrent bytecode execution in threads, multiprocessing module, process pools, or C extensions."
            },
            {
                "question": "What is the difference between generators and regular functions in Python, and how does `yield` manage memory for large datasets?",
                "type": "Technical - Memory & Generators",
                "criteria": "Lazy evaluation, generator object, state preservation without holding all elements in RAM."
            },
            {
                "question": "How do Python decorators work under the hood, and how can you preserve function metadata when wrapping functions?",
                "type": "Technical - Metaprogramming",
                "criteria": "First-class functions, closures, returning wrapper function, and `functools.wraps`."
            },
            {
                "question": "Explain how you would profile and optimize a slow Python API endpoint communicating with an external database.",
                "type": "System & Profiling",
                "criteria": "cProfile, line_profiler, checking N+1 queries, async database drivers, connection pooling, and caching."
            },
            {
                "question": "Describe a project where you used Python in production. What libraries did you pick and what architectural trade-offs did you make?",
                "type": "Project & Architecture",
                "criteria": "Concrete experience, rationale for framework choices (FastAPI/Django), handling deployment."
            }
        ],
        "Frontend Developer": [
            {
                "question": "Explain the Virtual DOM reconciliation algorithm in React. What are the key rules for choosing list `key` props?",
                "type": "Technical - React & UI",
                "criteria": "Diffing algorithm, fiber architecture, avoiding index keys when order changes to prevent re-render bugs."
            },
            {
                "question": "What causes layout thrashing and reflow in modern browsers, and how can you optimize Critical Rendering Path performance?",
                "type": "Technical - Browser Internals",
                "criteria": "DOM tree + CSSOM -> Render tree -> Layout -> Paint. Minimizing synchronous layout queries, using transform/opacity."
            },
            {
                "question": "How do you manage complex global state across a large web application without introducing unnecessary component re-renders?",
                "type": "Technical - State Architecture",
                "criteria": "Context API vs Redux/Zustand, selector hooks, memoization with useMemo/useCallback."
            },
            {
                "question": "Describe how you approach accessibility (a11y) and responsive design across diverse devices and screen readers.",
                "type": "Technical - Accessibility & CSS",
                "criteria": "Semantic HTML, ARIA attributes, keyboard navigation, focus management, fluid CSS."
            }
        ],
        "Backend Developer": [
            {
                "question": "How do you design an idempotent payment processing API to prevent duplicate charges when network timeouts occur?",
                "type": "Technical - System Design",
                "criteria": "Idempotency keys generated by client, stored in Redis/DB with unique constraint, distributed locks."
            },
            {
                "question": "Compare relational database B-Tree indexes with LSM-Trees used in distributed NoSQL databases.",
                "type": "Technical - Storage Engines",
                "criteria": "B-Trees optimize for fast in-place reads/updates, LSM-Trees optimize for write-heavy append-only sequential disk writes."
            },
            {
                "question": "How would you implement rate limiting across a cluster of API servers to prevent brute-force attacks or DDoS?",
                "type": "Technical - Security & Microservices",
                "criteria": "Token bucket / Leaky bucket algorithm, Redis atomic commands or Sliding Window counter."
            },
            {
                "question": "What is connection pooling, and why does opening a new database connection for every incoming HTTP request hurt server throughput?",
                "type": "Technical - Database Networking",
                "criteria": "TCP handshake overhead, authentication handshake, process allocation on DB server."
            }
        ],
        "AI/ML Engineer": [
            {
                "question": "Explain the trade-off between Bias and Variance, and describe three techniques to combat overfitting in deep neural networks.",
                "type": "Technical - Machine Learning",
                "criteria": "Underfitting vs overfitting. Regularization (L1/L2), Dropout, Data Augmentation, Early Stopping."
            },
            {
                "question": "What is the Self-Attention mechanism in the Transformer architecture, and why does it scale as \\(O(N^2)\\) with sequence length?",
                "type": "Technical - Deep Learning & NLP",
                "criteria": "Query, Key, Value dot products, softmax attention weights, all pairs of token comparisons."
            },
            {
                "question": "How do you evaluate a model trained on heavily imbalanced classification data where accuracy is a misleading metric?",
                "type": "Technical - Model Evaluation",
                "criteria": "Precision, Recall, F1-Score, ROC-AUC, PR-AUC, Confusion Matrix."
            }
        ]
    }

    def get_questions_for_role(self, role: str, count: int = 5) -> List[Dict[str, Any]]:
        questions = self.ROLE_QUESTIONS.get(role, self.ROLE_QUESTIONS["Software Developer"])
        return questions[:count]

    async def evaluate_turn(
        self,
        question: Dict[str, Any],
        user_answer: str,
        role: str
    ) -> Dict[str, Any]:
        """Evaluates an interview response and provides scoring feedback."""
        prompt = f"""You are a Senior Technical Interviewer evaluating a candidate for the role of {role}.

Question: {question.get('question')}
Question Type: {question.get('type')}
Key Technical Points Expected: {question.get('criteria')}

Candidate's Answer:
\"\"\"{user_answer}\"\"\"

Provide concise, constructive interview feedback:
1. Score from 1 to 10.
2. Strengths demonstrated.
3. Missing technical points or areas for improvement.
4. Model ideal answer.

Format as JSON:
{{
  "score": 8,
  "feedback": "...",
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "model_answer": "..."
}}
"""
        eval_resp = await ai_service.generate_response(prompt, "You are an expert interviewer. Return JSON.")

        # Attempt to parse json
        try:
            # find json block
            start = eval_resp.find("{")
            end = eval_resp.rfind("}") + 1
            if start != -1 and end != -1:
                return json.loads(eval_resp[start:end])
        except Exception:
            pass

        # Fallback to local evaluation
        return ai_service.evaluate_answer(
            question.get("question", ""),
            question.get("criteria", ""),
            user_answer
        )

interview_agent = InterviewAgent()
