from __future__ import annotations

from langchain_core.tools import tool


@tool
def analyze_employee_profile_tool(employee_data: str) -> str:
	"""Analyze employee profile JSON and return structured analysis as JSON string."""
	from openai_course_generator.tools.planning_tools import analyze_employee_profile as _fn
	return _fn(employee_data)


@tool
def generate_course_structure_plan_tool(profile_data: str, skills_gaps: str) -> str:
	"""Generate a course structure plan given profile and gaps; returns JSON string."""
	from openai_course_generator.tools.planning_tools import generate_course_structure_plan as _fn
	return _fn(profile_data, skills_gaps)


@tool
def store_course_plan_tool(employee_id: str, employee_name: str, session_id: str, course_structure: str, prioritized_gaps: str, research_strategy: str, learning_path: str, research_queries: str, company_id: str | None = None) -> str:
	"""Store the course plan with research queries in cm_course_plans; returns status string containing plan_id."""
	from openai_course_generator.tools.planning_storage_tools_v2 import store_course_plan as _tool
	args = {
		"employee_id": employee_id,
		"employee_name": employee_name,
		"session_id": session_id,
		"company_id": company_id,
		"course_structure": course_structure,
		"prioritized_gaps": prioritized_gaps,
		"research_strategy": research_strategy,
		"learning_path": learning_path,
		"research_queries": research_queries,
	}
	return _tool.on_invoke_tool(None, args)  # type: ignore[attr-defined]


@tool
def generate_research_queries_tool(course_structure: str, employee_profile: str) -> str:
	"""Generate targeted research queries for course modules; returns JSON string."""
	from openai_course_generator.tools.planning_tools import generate_research_queries as _fn
	return _fn(course_structure, employee_profile)


@tool
def store_planning_metadata_tool(plan_id: str, employee_profile: str, tool_calls: str, execution_time: str, agent_turns: str) -> str:
	"""Store planning metadata for a plan; returns status string."""
	from openai_course_generator.tools.planning_storage_tools_v2 import store_planning_metadata as _tool
	# Handle type conversion safely - Groq may pass timestamps or other strings
	try:
		exec_time = float(execution_time) if execution_time else 0.0
	except (ValueError, TypeError):
		exec_time = 300.0  # Default 5 minutes if conversion fails
	
	try:
		turns = int(agent_turns) if agent_turns else 0
	except (ValueError, TypeError):
		turns = 5  # Default turns if conversion fails
	
	args = {
		"plan_id": plan_id,
		"employee_profile": employee_profile,
		"tool_calls": tool_calls,
		"execution_time": exec_time,
		"agent_turns": turns,
	}
	return _tool.on_invoke_tool(None, args)  # type: ignore[attr-defined]


