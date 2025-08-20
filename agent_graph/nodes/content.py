from __future__ import annotations

from typing import Dict, Any
import json

from ..services.sentry_service import start_span

def _llm():
	from ..services.ollama_service import get_chat_ollama
	# Use qwen3:14b for content generation with tool calling support
	return get_chat_ollama("qwen3:14b")


def _tools():
	from .content_tools_wrappers import (
		create_new_module_content_tool,
		store_content_section_tool,
	)
	from .research_tools_wrappers import (
		fetch_course_plan_tool,
		fetch_research_results_tool,
	)
	return [
		fetch_course_plan_tool,
		fetch_research_results_tool,
		create_new_module_content_tool,
		store_content_section_tool
	]


def content_node(state: Dict[str, Any]) -> Dict[str, Any]:
	"""Content node: create module content and store sections based on research and plan."""
	with start_span(op="node", description="content", tags={
		"node": "content",
		"job_id": str(state.get("job_id") or ""),
		"thread_id": str(state.get("thread_id") or ""),
	}):
		from langchain_core.messages import SystemMessage, HumanMessage, ToolMessage

		available_tools = _tools()
		name_to_tool = {t.name: t for t in available_tools}
		llm = _llm().bind_tools(available_tools)

		job_id = str(state.get("job_id") or "")
		employee_name = str(state.get("employee_name") or "Learner")
		plan_id = str(state.get("plan_id") or "")
		research_id = str(state.get("research_id") or "")
		module_name = str(state.get("module_name") or "Module 1")

		messages: list = [
			SystemMessage(content=(
				"You are the Content Generation Agent in the LangGraph pipeline powered by Qwen3 14B.\n"
				"Your mission: Create engaging, practical course content using research findings and course structure.\n"
				"Available tools: fetch_course_plan_tool, fetch_research_results_tool, create_new_module_content_tool, store_content_section_tool.\n"
				"Content sections: 'introduction', 'core_content', 'practical_applications', 'case_studies', 'assessments'.\n"
				"Focus on: Clear explanations, practical examples, interactive exercises, real-world applications.\n"
				"Quality standards: Accurate, engaging, actionable, properly structured, and pedagogically sound.\n\n"
				"WORKFLOW: 1) First fetch course plan to get structure and research context, 2) Then generate content."
			)),
			HumanMessage(content=(
				f"Generate comprehensive content using database-driven approach.\n\n"
				f"STEP 1: Fetch course plan and research context\n"
				f"- Call fetch_course_plan_tool with plan_id: {plan_id}\n"
				f"- Call fetch_research_results_tool with plan_id: {plan_id}\n"
				f"- This will provide course structure, modules, and research findings\n\n"
				f"STEP 2: Generate module content for: '{module_name}'\n"
				f"- Create module structure with research-backed content\n"
				f"- Write sections: introduction, core_content, practical_applications, case_studies, assessments\n"
				f"- Use research findings to enrich content with current examples\n\n"
				f"Employee: {employee_name}, Session: {job_id}, Research ID: {research_id}\n"
				f"Ensure all content is research-backed, practical, and aligned with learning objectives."
			)),
		]

		content_id: str | None = None
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
				
				# Enrich args for create_new_module_content_tool to include plan_id
				if tool_name == "create_new_module_content_tool":
					if isinstance(tool_args, dict):
						tool_args["plan_id"] = plan_id  # Add plan_id for database linking
				
				# Let the LLM pass the data it fetched from fetch_course_plan_tool
				# Don't override with empty state data
				tool_output = tool.invoke(tool_args)
				messages.append(
					ToolMessage(
						content=str(tool_output),
						tool_call_id=tc.get("id") if isinstance(tc, dict) else tc["id"],
					)
				)
				if tool_name == "create_new_module_content_tool" and isinstance(tool_output, str):
					try:
						parsed = json.loads(tool_output)
						content_id = parsed.get("content_id") or content_id
					except Exception:
						pass

		return {"content_id": state.get("content_id") or content_id, "status": "complete"}


