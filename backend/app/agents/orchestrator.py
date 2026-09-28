import logging
import json
from typing import Dict, Any, Optional, List
from app.services.ai_service import ai_service
from app.agents.coding_agent import coding_agent
from app.agents.dsa_agent import dsa_agent
from app.agents.cse_subject_agent import cse_subject_agent
from app.agents.exam_agent import exam_agent
from app.agents.project_agent import project_agent
from app.agents.career_agent import career_agent
from app.agents.resume_agent import resume_agent

logger = logging.getLogger("techmate.orchestrator")

class TechMateOrchestrator:
    """
    Central orchestrator agent responsible for:
    1. Intent detection & mode routing
    2. Context retrieval & conversation memory integration
    3. Specialized agent delegation
    4. Quality checks & standardized response formatting
    """

    async def process_request(
        self,
        query: str,
        mode: str = "AUTO",
        conversation_history: Optional[List[Dict[str, Any]]] = None,
        project_context: Optional[Dict[str, Any]] = None,
        exam_params: Optional[Dict[str, Any]] = None,
        retrieved_knowledge: Optional[str] = None,
        user_profile: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        try:
            # 1. Intent Detection
            intent = ai_service.classify_intent(query, mode=mode)
            logger.info(f"Orchestrator routed query to intent: {intent} (Mode: {mode})")

            # 2. Build Memory Context
            memory_summary = ""
            if conversation_history:
                recent_turns = conversation_history[-4:]
                memory_summary = "\n".join([
                    f"{turn.get('role', 'user').capitalize()}: {turn.get('content', '')[:250]}"
                    for turn in recent_turns
                ])

            combined_context = ""
            if retrieved_knowledge:
                combined_context += f"Knowledge Retrieval:\n{retrieved_knowledge}\n\n"
            if memory_summary:
                combined_context += f"Recent Chat Memory:\n{memory_summary}\n\n"

            # 3. Route to Specialized Agent
            if intent in ["CODING", "DEBUGGING"]:
                if intent == "DEBUGGING":
                    result = await coding_agent.handle_debugging(query, context=combined_context, user_profile=user_profile)
                else:
                    result = await coding_agent.handle_coding(query, context=combined_context, user_profile=user_profile)

            elif intent == "DSA":
                result = await dsa_agent.handle_dsa(query, context=combined_context, user_profile=user_profile)

            elif intent == "EXAM_PREPARATION":
                sub = exam_params.get("subject") if exam_params else None
                top = exam_params.get("topic") if exam_params else query
                marks = int(exam_params.get("marks", 15)) if exam_params else 15
                diff = exam_params.get("difficulty", "Medium") if exam_params else "Medium"
                result = await exam_agent.handle_exam(query, subject=sub, topic=top, marks=marks, difficulty=diff, context=combined_context)

            elif intent == "PROJECT_DEVELOPMENT" or intent == "PROJECT_DOCUMENTATION":
                result = await project_agent.handle_project(
                    query,
                    project_context=project_context,
                    conversation_context=memory_summary,
                    user_profile=user_profile
                )

            elif intent in ["CAREER", "LEARNING_ROADMAP"]:
                result = await career_agent.handle_career(query, context=combined_context, user_profile=user_profile)

            elif intent == "RESUME":
                result = await resume_agent.handle_resume(query, context=combined_context)

            elif intent == "CSE_SUBJECT":
                result = await cse_subject_agent.handle_subject(query, context=combined_context, user_profile=user_profile)

            else:  # GENERAL_TECHNOLOGY fallback
                resp_text = await ai_service.generate_response(
                    query,
                    system_prompt="You are TechMate AI, an intelligent mentor for Computer Science students and developers. Answer with high technical clarity.",
                    context=combined_context
                )
                result = {
                    "agent": "GeneralTechAgent",
                    "intent": "GENERAL_TECHNOLOGY",
                    "content": resp_text,
                    "metadata": {}
                }

            # 4. Quality Check
            content = result.get("content", "")
            if not content or len(content.strip()) < 10:
                result["content"] = "### Answer\nI have analyzed your technical query. Could you please specify the exact programming language or requirements so I can provide the most precise implementation?"

            return result

        except Exception as e:
            logger.error(f"Error in TechMateOrchestrator: {e}", exc_info=True)
            return {
                "agent": "Orchestrator",
                "intent": "ERROR",
                "content": "TechMate is temporarily unable to process your request. Please try again.",
                "metadata": {"error": "Internal processing handled"}
            }

orchestrator = TechMateOrchestrator()
