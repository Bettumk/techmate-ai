from typing import Dict, Any, Optional
from app.services.ai_service import ai_service

class CSESubjectAgent:
    """Specialized Agent for core Computer Science curriculum."""

    SYSTEM_PROMPT = """You are TechMate AI's Specialized CSE Subject Mentor.
You cover: DBMS, Operating Systems, Computer Networks, OOP, Software Engineering, Compiler Design,
AI, Machine Learning, Cloud Computing, Cybersecurity, IoT, Distributed Systems.

Guidelines:
- If user requests 'Explain simply', use intuitive beginner-friendly analogies.
- If user requests 'Explain for exam' or mentions marks, format with clear headings, definitions, bullet points, and conclusions.
- Structure responses clearly with Definition, Explanation, Real-world Example, Key Concepts, and Applications.
"""

    async def handle_subject(self, query: str, context: Optional[str] = None, user_profile: Optional[Dict] = None) -> Dict[str, Any]:
        exp_level = user_profile.get("experience_level", "Beginner") if user_profile else "Beginner"
        pref_style = user_profile.get("preferred_style", "Conceptual") if user_profile else "Conceptual"

        prompt = f"""CSE Subject Query: {query}
Target Audience Level: {exp_level}
Preferred Learning Style: {pref_style}

Provide a structured, authoritative explanation:
### Definition & Core Concept
### Detailed Explanation
### Key Principles / Architecture
### Practical Real-World Example
### Advantages & Trade-offs
### Summary Checklist
"""
        response_text = await ai_service.generate_response(prompt, self.SYSTEM_PROMPT, context=context)

        if "### Definition & Core Concept" not in response_text:
            response_text = self._generate_structured_subject_response(query)

        return {
            "agent": "CSESubjectAgent",
            "intent": "CSE_SUBJECT",
            "content": response_text,
            "metadata": {
                "field": "Computer Science & Engineering"
            }
        }

    def _generate_structured_subject_response(self, query: str) -> str:
        q_lower = query.lower()

        if "dbms" in q_lower or "database" in q_lower or "acid" in q_lower:
            return """### Definition & Core Concept
A **Database Management System (DBMS)** is specialized system software designed to store, manage, query, and secure structured collections of data efficiently while ensuring data integrity and concurrency control.

### Detailed Explanation
Modern DBMS architectures adhere to the **ACID Properties** to guarantee transactional reliability:
1. **Atomicity**: Either all operations of a transaction succeed, or none are reflected ("All or Nothing").
2. **Consistency**: Transactions preserve database invariants and integrity constraints.
3. **Isolation**: Concurrent transactions execute without cross-interference (implemented via Locking, MVCC, or Timestamp Ordering).
4. **Durability**: Committed data survives system crashes, power failures, and restarts (achieved via Write-Ahead Logging/WAL).

### Key Principles & Three-Tier Architecture
- **Physical Level**: How data is stored in blocks, B+ Trees, and disk pages.
- **Conceptual/Logical Level**: Entities, relationships, schemas, and relational constraints.
- **View/External Level**: Customized user perspectives and access-restricted projections.

### Practical Real-World Example
**Banking Fund Transfer**:
When transferring $500 from Account A to Account B:
```sql
BEGIN TRANSACTION;
UPDATE accounts SET balance = balance - 500 WHERE account_id = 'A';
UPDATE accounts SET balance = balance + 500 WHERE account_id = 'B';
COMMIT;
```
If power fails before the second update, the transaction automatically rolls back, preserving consistency.

### Advantages & Trade-offs
- **Advantages**: Eliminates data redundancy, enforces centralized security, provides multi-user concurrency.
- **Trade-offs**: Storage overhead, system complexity, specialized administrator requirements.

### Summary Checklist
- Relational vs. NoSQL distinction
- ACID vs. BASE models
- Primary and Foreign Key constraints
"""

        if "deadlock" in q_lower or "operating system" in q_lower:
            return """### Definition & Core Concept
A **Deadlock** in Operating Systems is a state where a set of processes are permanently blocked because each process holds a resource and waits for another resource held by another process in the same set.

### Coffman Conditions (All 4 must hold simultaneously for a deadlock)
1. **Mutual Exclusion**: At least one resource must be held in a non-shareable mode.
2. **Hold and Wait**: A process holds at least one resource and is waiting to acquire additional resources held by others.
3. **No Preemption**: Resources cannot be forcibly confiscated; they can only be released voluntarily by the holding process.
4. **Circular Wait**: A closed chain of processes \\(P_0, P_1, \\dots, P_n\\) exists such that \\(P_0\\) waits for a resource held by \\(P_1\\), \\(P_1\\) waits for \\(P_2\\), and \\(P_n\\) waits for \\(P_0\\).

### Practical Real-World Example
Consider two threads and two locks:
- Thread 1 acquires `Lock_A` and requests `Lock_B`.
- Simultaneously, Thread 2 acquires `Lock_B` and requests `Lock_A`.
Neither thread can proceed, causing an indefinite deadlock.

### Handling Deadlocks
- **Prevention**: Invalidate at least one of the 4 Coffman conditions (e.g., impose global resource ordering).
- **Avoidance**: Use **Banker's Algorithm** to evaluate safe states before granting requests.
- **Detection & Recovery**: Construct a Resource Allocation Graph (RAG), detect cycles, and terminate or preempt processes.
- **Ignoration**: The "Ostrich Algorithm" adopted by most general-purpose OSes (Linux, Windows) when deadlock frequency is minimal.
"""

        return f"""### Definition & Core Concept
**{query.strip()}** is a foundational concept in Computer Science that addresses core system reliability, resource allocation, and software architecture.

### Detailed Explanation
In software and system engineering, this concept enables:
1. Systematic abstraction of complex computational tasks.
2. Predictable state transitions and predictable performance guarantees.
3. Decoupling of concerns between data storage, processing, and communication.

### Practical Real-World Example
Modern production frameworks implement this paradigm across cloud native services, distributed caches, and modular microservices to achieve fault tolerance and vertical/horizontal scalability.

### Advantages & Trade-offs
- **Advantages**: Modularity, maintainability, standardized operational interfaces.
- **Trade-offs**: Added abstraction layers, initial architectural configuration.
"""

cse_subject_agent = CSESubjectAgent()
