from __future__ import annotations

from langchain_core.tools import tool


@tool
def create_new_module_content_tool(module_name: str, employee_name: str, session_id: str, module_spec: str, research_context: str = "{}") -> str:
	"""Create new module content in DB; returns JSON with content_id."""
	from openai_course_generator.tools.database_content_tools import create_new_module_content
	return create_new_module_content(module_name, employee_name, session_id, module_spec, research_context)


@tool
def store_content_section_tool(content_id: str, section_name: str, section_content: str, section_metadata: str = "{}") -> str:
	"""Store a content section in DB; returns JSON status."""
	from openai_course_generator.tools.database_content_tools import store_content_section
	return store_content_section(content_id, section_name, section_content, section_metadata)


