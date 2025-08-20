from __future__ import annotations

from typing import Dict, Any
import re

from ..services.sentry_service import start_span

def _llm():
	from ..services.ollama_service import get_chat_ollama
	return get_chat_ollama()


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
				"data provided below. Do not create simplified or placeholder data."
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
				f"4. Store the complete plan (structure + research queries) for research agent handoff\n\n"
				f"Focus on practical, actionable learning paths aligned with their skill gaps. "
				f"Generate research queries that will help find current, relevant content for this specific employee's context."
			)),
		]

		plan_id: str | None = None
		max_turns = 12
		for _ in range(max_turns):
			ai_msg = llm.invoke(messages)
			messages.append(ai_msg)
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
					tool_args = {
						"employee_id": employee_id,
						"employee_name": employee_name,
						"session_id": job_id,
						"company_id": company_id,
						"course_structure": tool_args.get("course_structure") if isinstance(tool_args, dict) else "{}",
						"prioritized_gaps": tool_args.get("prioritized_gaps") if isinstance(tool_args, dict) else skills_gaps_json,
						"research_strategy": tool_args.get("research_strategy") if isinstance(tool_args, dict) else "{}",
						"learning_path": tool_args.get("learning_path") if isinstance(tool_args, dict) else "{}",
						"research_queries": tool_args.get("research_queries") if isinstance(tool_args, dict) else "{}",
					}
				tool_output = tool.invoke(tool_args)
				messages.append(
					ToolMessage(
						content=str(tool_output),
						tool_call_id=tc.get("id") if isinstance(tc, dict) else tc["id"],
					)
				)
				if tool_name == "store_course_plan_tool" and isinstance(tool_output, str):
					m = re.search(r"with ID:\s*([0-9a-fA-F-]{36})", tool_output)
					if m:
						plan_id = m.group(1)

		return {"plan_id": state.get("plan_id") or plan_id, "status": "research"}


