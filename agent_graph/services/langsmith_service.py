from __future__ import annotations

import os


def init_langsmith() -> None:
	"""Enable LangSmith tracing if API key or project is present.

	Sets LANGCHAIN_TRACING_V2=true and configures endpoint/project/key.
	No-ops if variables are already set.
	"""
	# Support both modern LANGCHAIN_* and legacy LANGSMITH_* envs
	api_key = (
		os.getenv("LANGCHAIN_API_KEY")
		or os.getenv("LANGSMITH_API_KEY")
		or os.getenv("LXERA_LANGSMITH_API_KEY")
	)
	project = (
		os.getenv("LANGCHAIN_PROJECT")
		or os.getenv("LANGSMITH_PROJECT")
		or os.getenv("LXERA_LANGSMITH_PROJECT")
		or "agent-graph"
	)
	endpoint = (
		os.getenv("LANGCHAIN_ENDPOINT")
		or os.getenv("LANGSMITH_ENDPOINT")
		or "https://api.smith.langchain.com"
	)
	tracing = os.getenv("LANGCHAIN_TRACING_V2") or os.getenv("LANGSMITH_TRACING")

	if api_key:
		os.environ.setdefault("LANGCHAIN_TRACING_V2", tracing or "true")
		os.environ.setdefault("LANGCHAIN_API_KEY", api_key)
		os.environ.setdefault("LANGCHAIN_PROJECT", project)
		os.environ.setdefault("LANGCHAIN_ENDPOINT", endpoint)


