from __future__ import annotations

from typing import Dict, Any
import re

from ..services.sentry_service import start_span

def _llm():
	from ..services.groq_service import get_chat_groq
	return get_chat_groq()

def _tools():
	from .research_tools_wrappers import (
		fetch_course_plan_tool,
		firecrawl_search_tool,
		scrape_do_extract_tool,
		research_synthesizer_tool,
		store_research_results_tool,
		store_research_session_tool,
	)
	return [
		fetch_course_plan_tool,
		firecrawl_search_tool,
		scrape_do_extract_tool,
		research_synthesizer_tool,
		store_research_results_tool,
		store_research_session_tool,
	]


def research_node(state: Dict[str, Any]) -> Dict[str, Any]:
	"""Research node: produce a research_id placeholder and minimal metadata."""
	with start_span(op="node", description="research", tags={
		"node": "research",
		"job_id": str(state.get("job_id") or ""),
		"thread_id": str(state.get("thread_id") or ""),
	}):
		from langchain_core.messages import SystemMessage, HumanMessage, ToolMessage

		available_tools = _tools()
		name_to_tool = {t.name: t for t in available_tools}
		llm = _llm().bind_tools(available_tools)

		plan_id = str(state.get("plan_id") or "")
		session_id = str(state.get("job_id") or "")
		messages: list = [
			SystemMessage(content=(
				"You are the Research Agent. Use tools to: 1) fetch plan, 2) search (Firecrawl), 3) scrape (Scrape.do), "
				"4) synthesize, 5) store research results and session metadata."
			)),
			HumanMessage(content=(
				f"Begin research for plan_id={plan_id} session_id={session_id}. "
				"Fetch plan, then search and scrape key topics, synthesize, and store results."
			)),
		]

		research_id: str | None = None
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
				tool_output = tool.invoke(tool_args)
				messages.append(
					ToolMessage(
						content=str(tool_output),
						tool_call_id=tc.get("id") if isinstance(tc, dict) else tc["id"],
					)
				)
				if tool_name == "store_research_results_tool" and isinstance(tool_output, str):
					m = re.search(r"ID:\s*([0-9a-fA-F-]{36})", tool_output)
					if m:
						research_id = m.group(1)

		return {"research_id": state.get("research_id") or research_id, "status": "content"}


