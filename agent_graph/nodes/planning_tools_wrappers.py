from __future__ import annotations

from langchain_core.tools import tool


@tool
def analyze_employee_profile_tool(employee_data: str) -> str:
	"""Analyze employee profile JSON and return structured analysis as JSON string."""
	from openai_course_generator.tools.planning_tools import analyze_employee_profile
	return analyze_employee_profile(employee_data)


@tool
def generate_course_structure_plan_tool(profile_data: str, skills_gaps: str) -> str:
	"""Generate a course structure plan given profile and gaps; returns JSON string."""
	from openai_course_generator.tools.planning_tools import generate_course_structure_plan
	return generate_course_structure_plan(profile_data, skills_gaps)


@tool
def store_course_plan_tool(employee_id: str, employee_name: str, session_id: str, course_structure: str, prioritized_gaps: str, research_strategy: str, learning_path: str, company_id: str | None = None) -> str:
	"""Store the course plan in cm_course_plans; returns status string containing plan_id."""
	from openai_course_generator.tools.planning_storage_tools_v2 import store_course_plan
	args = {
		"employee_id": employee_id,
		"employee_name": employee_name,
		"session_id": session_id,
		"company_id": company_id,
		"course_structure": course_structure,
		"prioritized_gaps": prioritized_gaps,
		"research_strategy": research_strategy,
		"learning_path": learning_path,
	}
	return store_course_plan.on_invoke_tool(None, args)  # type: ignore[attr-defined]


@tool
def store_planning_metadata_tool(plan_id: str, employee_profile: str, tool_calls: str, execution_time: float, agent_turns: int) -> str:
	"""Store planning metadata for a plan; returns status string."""
	from openai_course_generator.tools.planning_storage_tools_v2 import store_planning_metadata
	args = {
		"plan_id": plan_id,
		"employee_profile": employee_profile,
		"tool_calls": tool_calls,
		"execution_time": execution_time,
		"agent_turns": agent_turns,
	}
	return store_planning_metadata.on_invoke_tool(None, args)  # type: ignore[attr-defined]


