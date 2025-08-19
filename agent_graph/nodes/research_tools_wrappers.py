from __future__ import annotations

from langchain_core.tools import tool


@tool
def fetch_course_plan_tool(plan_id: str) -> str:
	"""Fetch course plan details from database using plan_id; returns JSON string."""
	from openai_course_generator.tools.research_tools import fetch_course_plan
	return fetch_course_plan(plan_id)


@tool
def firecrawl_search_tool(query: str, context: str = "general") -> str:
	"""Search the web via Firecrawl; returns JSON with URLs."""
	from openai_course_generator.tools.research_tools import firecrawl_search
	return firecrawl_search(query=query, context=context)


@tool
def firecrawl_scrape_tool(url: str, extraction_type: str = "full") -> str:
	"""Extract content from a URL via Firecrawl; returns JSON with content."""
	from openai_course_generator.tools.research_tools import firecrawl_scrape
	return firecrawl_scrape(url=url, extraction_type=extraction_type)


@tool
def research_synthesizer_tool(research_results: str, synthesis_focus: str = "comprehensive") -> str:
	"""Synthesize multiple research sources into structured knowledge base; returns JSON string."""
	from openai_course_generator.tools.research_tools import research_synthesizer
	return research_synthesizer(research_results=research_results, synthesis_focus=synthesis_focus)


@tool
def store_research_results_tool(plan_id: str, session_id: str, research_findings: str, content_library: str, module_mappings: str) -> str:
	"""Store comprehensive research results in cm_research_results; returns status string with research_id."""
	from openai_course_generator.tools.research_storage_tools_v2 import store_research_results
	args = {
		"plan_id": plan_id,
		"session_id": session_id,
		"research_findings": research_findings,
		"content_library": content_library,
		"module_mappings": module_mappings,
	}
	# Underlying tool expects a tool_context arg; pass None
	return store_research_results.on_invoke_tool(None, args)  # type: ignore[attr-defined]


@tool
def store_research_session_tool(research_id: str, search_queries: str, sources_analyzed: str, synthesis_sessions: str, tool_calls: str, execution_metrics: str) -> str:
	"""Store session metadata for research; returns status string."""
	from openai_course_generator.tools.research_storage_tools_v2 import store_research_session
	args = {
		"research_id": research_id,
		"search_queries": search_queries,
		"sources_analyzed": sources_analyzed,
		"synthesis_sessions": synthesis_sessions,
		"tool_calls": tool_calls,
		"execution_metrics": execution_metrics,
	}
	return store_research_session.on_invoke_tool(None, args)  # type: ignore[attr-defined]


@tool
def fetch_research_results_tool(plan_id: str) -> str:
	"""Fetch research results and content library for a course plan; returns JSON string."""
	from openai_course_generator.tools.research_tools import fetch_research_results
	return fetch_research_results(plan_id)


