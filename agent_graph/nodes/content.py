from __future__ import annotations

from typing import Dict, Any
import json

from ..services.sentry_service import start_span

def _llm():
	from ..services.groq_service import get_chat_groq
	return get_chat_groq()


def _tools():
	from .content_tools_wrappers import (
		create_new_module_content_tool,
		store_content_section_tool,
	)
	return [create_new_module_content_tool, store_content_section_tool]


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
		module_spec = json.dumps(state.get("module_spec") or {})
		research_context = json.dumps(state.get("research_context") or {})
		module_name = str(state.get("module_name") or "Module 1")

		messages: list = [
			SystemMessage(content=(
				"You are the Content Agent. Create module content and store sections using the DB tools."
			)),
			HumanMessage(content=(
				f"Create content for '{module_name}' and store sections."
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
				if tool_name == "create_new_module_content_tool":
					tool_args = {
						"module_name": module_name,
						"employee_name": employee_name,
						"session_id": job_id,
						"module_spec": module_spec,
						"research_context": research_context,
					}
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


