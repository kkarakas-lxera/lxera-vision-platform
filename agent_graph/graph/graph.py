from __future__ import annotations

from typing import Dict, Any

from ..nodes.planning import planning_node
from ..nodes.research import research_node
from ..nodes.content import content_node


def build_graph() -> Dict[str, Any]:
	"""Return a placeholder graph spec to be replaced by LangGraph wiring."""
	return {
		"nodes": [
			{"name": "planning", "fn": planning_node},
			{"name": "research", "fn": research_node},
			{"name": "content", "fn": content_node},
		],
		"edges": [
			("planning", "research"),
			("research", "content"),
		],
	}


