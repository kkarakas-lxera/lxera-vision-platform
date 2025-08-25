from __future__ import annotations

from typing import Dict, Any
import re
import json

from ..services.sentry_service import start_span
from ..utils.json_repair_utils import try_parse_json

def _llm():
	from langchain_groq import ChatGroq
	from ..config.settings import settings
	
	if not settings.groq_api_key:
		raise ValueError("GROQ_API_KEY not configured")
		
	return ChatGroq(
		model="openai/gpt-oss-20b",  # Exact model from Groq docs
		api_key=settings.groq_api_key,
		temperature=0.7,
		max_tokens=4096
	)


def _tools():
	from .planning_tools_wrappers import (
		analyze_employee_profile_tool,
		generate_course_structure_plan_tool,
		generate_research_queries_tool,
		store_course_plan_tool,
		store_planning_metadata_tool,
	)
	return [
		analyze_employee_profile_tool,
		generate_course_structure_plan_tool,
		generate_research_queries_tool,
		store_course_plan_tool,
		store_planning_metadata_tool,
	]


def planning_node(state: Dict[str, Any]) -> Dict[str, Any]:
	"""Planning node: analyze profile, generate plan, store it, and return plan_id."""
	with start_span(op="node", description="planning", tags={
		"node": "planning",
		"job_id": str(state.get("job_id") or ""),
		"thread_id": str(state.get("thread_id") or ""),
	}):
		from langchain_core.messages import SystemMessage, HumanMessage, ToolMessage

		available_tools = _tools()
		name_to_tool = {t.name: t for t in available_tools}
		llm = _llm().bind_tools(available_tools)

		job_id = str(state.get("job_id") or "")
		employee_id = str(state.get("employee_id") or "")
		employee_name = str(state.get("employee_name") or "Learner")
		company_id = state.get("company_id")
		profile_json = str(state.get("employee_profile") or "{}")
		skills_gaps_json = str(state.get("skills_gaps") or "{}")

		messages: list = [
			SystemMessage(content=(
				"You are the Planning Agent in the LangGraph pipeline powered by Qwen3 14B.\n"
				"Your mission: 1) Analyze employee profile and skills gaps, 2) Generate personalized course structure, "
				"3) Generate targeted research queries, 4) Store the complete plan in database.\n"
				"Available tools: analyze_employee_profile_tool, generate_course_structure_plan_tool, "
				"generate_research_queries_tool, store_course_plan_tool, store_planning_metadata_tool.\n"
				"Important: Always call store_course_plan_tool to save the plan and get the plan_id for the research phase.\n\n"
				"DATABASE HANDOFF: The research queries you generate will be saved with the course plan, "
				"and the research agent will fetch them from the database to conduct targeted research.\n\n"
				"CRITICAL: When calling analyze_employee_profile_tool, you MUST pass the complete employee_profile "
				"data provided below. Do not create simplified or placeholder data.\n\n"
				"STRICT OUTPUT POLICY FOR store_course_plan_tool:\n"
				"- All of course_structure, prioritized_gaps, research_strategy, learning_path, research_queries MUST be valid JSON objects (not empty strings).\n"
				"- If any field is unknown, pass an empty JSON object {} rather than an empty string.\n"
				"- Never wrap JSON in backticks or include explanatory text. JSON only."
			)),
			HumanMessage(content=(
				f"Create a personalized course plan for {employee_name} (ID: {employee_id}).\n\n"
				f"EMPLOYEE PROFILE DATA (use this exact data for analyze_employee_profile_tool):\n"
				f"{profile_json}\n\n"
				f"SKILLS GAPS DATA:\n"
				f"{skills_gaps_json}\n\n"
				f"ENHANCED WORKFLOW:\n"
				f"1. Call analyze_employee_profile_tool with the COMPLETE employee profile data above\n"
				f"2. Generate a comprehensive course structure with specific modules\n"
				f"3. Generate targeted research queries based on employee context and course modules\n"
				f"4. Store the complete plan (structure + research queries) for research agent handoff.\n"
				"   When calling store_course_plan_tool, ensure every payload field is valid JSON ({} if unknown). Do not send empty strings.\n\n"
				f"Focus on practical, actionable learning paths aligned with their skill gaps. "
				f"Generate research queries that will help find current, relevant content for this specific employee's context."
			)),
		]

		plan_id: str | None = None
		max_turns = 12
		for _ in range(max_turns):
			ai_msg = llm.invoke(messages)
			# Strip <think> blocks before adding to history
			def _strip_think(text: str) -> str:
				if not isinstance(text, str):
					return text
				start = text.find("<think>")
				end = text.find("</think>")
				if start != -1 and end != -1 and end + len("</think>") <= len(text):
					return text[end + len("</think>"):].lstrip()
				return text
			from langchain_core.messages import AIMessage as _AI
			clean_content = _strip_think(getattr(ai_msg, "content", ""))
			clean_ai = _AI(content=clean_content)
			if hasattr(ai_msg, "tool_calls") and ai_msg.tool_calls:
				clean_ai.tool_calls = ai_msg.tool_calls
			messages.append(clean_ai)
			if not getattr(ai_msg, "tool_calls", None):
				break
			for tc in ai_msg.tool_calls:
				tool_name = tc.get("name") if isinstance(tc, dict) else tc["name"]
				tool_args = tc.get("args") if isinstance(tc, dict) else tc["args"]
				tool = name_to_tool.get(tool_name)
				if tool is None:
					continue
				# Enrich args for store_course_plan_tool
				if tool_name == "store_course_plan_tool":
					def _normalize_json_arg(val: Any, default: dict | list | str = {}):
						parsed = try_parse_json(val, default=default)
						return parsed

					cs = tool_args.get("course_structure") if isinstance(tool_args, dict) else "{}"
					pg = tool_args.get("prioritized_gaps") if isinstance(tool_args, dict) else skills_gaps_json
					rs = tool_args.get("research_strategy") if isinstance(tool_args, dict) else "{}"
					lp = tool_args.get("learning_path") if isinstance(tool_args, dict) else "{}"
					rq = tool_args.get("research_queries") if isinstance(tool_args, dict) else "{}"

					tool_args = {
						"employee_id": employee_id,
						"employee_name": employee_name,
						"session_id": job_id,
						"company_id": company_id,
						"course_structure": _normalize_json_arg(cs, {}),
						"prioritized_gaps": _normalize_json_arg(pg, {}),
						"research_strategy": _normalize_json_arg(rs, {}),
						"learning_path": _normalize_json_arg(lp, {}),
						"research_queries": _normalize_json_arg(rq, {}),
					}
				tool_output = tool.invoke(tool_args)
				messages.append(
					ToolMessage(
						content=str(tool_output),
						tool_call_id=tc.get("id") if isinstance(tc, dict) else tc["id"],
						name=tool_name,
					)
				)
				if tool_name == "store_course_plan_tool" and isinstance(tool_output, str):
					m = re.search(r"with ID:\s*([0-9a-fA-F-]{36})", tool_output)
					if m:
						plan_id = m.group(1)

		return {"plan_id": state.get("plan_id") or plan_id, "status": "research"}


