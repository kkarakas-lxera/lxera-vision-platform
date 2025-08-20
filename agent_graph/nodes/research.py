from __future__ import annotations

from typing import Dict, Any
import re

from ..services.sentry_service import start_span

def _llm():
	from ..services.ollama_service import get_chat_ollama
	return get_chat_ollama()

def _tools():
	from .research_tools_wrappers import (
		fetch_course_plan_tool,
		firecrawl_search_tool,
		firecrawl_scrape_tool,
		research_synthesizer_tool,
		store_research_results_tool,
		store_research_session_tool,
	)
	return [
		fetch_course_plan_tool,
		firecrawl_search_tool,
		firecrawl_scrape_tool,
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

		plan_id = str(state.get("plan_id") or state.get("job_id") or "")
		session_id = str(state.get("job_id") or "")
		messages: list = [
			SystemMessage(content=(
				"You are the Research Agent in the LangGraph pipeline powered by Llama 3.3 70B.\n"
				"Your mission: Conduct comprehensive web research to enrich course content with current, authoritative information.\n"
				"Available tools: fetch_course_plan_tool, firecrawl_search_tool, firecrawl_scrape_tool, "
				"research_synthesizer_tool, store_research_results_tool, store_research_session_tool.\n\n"
				"DATABASE-DRIVEN WORKFLOW:\n"
				"1) Fetch course plan from database using plan_id - this provides course structure, modules, employee context\n"
				"2) Conduct targeted research based on course modules and skill gaps\n"
				"3) Store comprehensive research results in database for content generation phase\n\n"
				"Focus on: Recent trends, best practices, case studies, expert insights, and practical examples."
			)),
			HumanMessage(content=(
				f"Conduct database-driven research workflow for plan_id: {plan_id}\n\n"
				f"STEP 1: Fetch course plan from database\n"
				f"- Call fetch_course_plan_tool with plan_id: {plan_id}\n"
			"- This will provide course structure, modules, employee context, skill gaps, AND research queries\n"
			"- The planning agent has already generated targeted research queries based on employee context\n\n"
				f"STEP 2: Execute targeted research using planning agent's queries\n"
			"- Use the research_queries from the course plan as your starting point\n"
			"- Search for current, authoritative content using Firecrawl with these targeted queries\n"
			"- Scrape 3-5 high-quality sources per query/topic\n\n"
				f"STEP 3: Store comprehensive results\n"
			"- Synthesize research into actionable knowledge base\n"
			"- Store results in database with plan_id: {plan_id} for content generation\n\n"
				f"Session: {session_id} | Focus: practical, current examples for skill development"
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


