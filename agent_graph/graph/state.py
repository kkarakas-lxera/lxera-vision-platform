from __future__ import annotations

from typing import Dict, List, Optional, TypedDict


class GraphState(TypedDict, total=False):
	job_id: str
	plan_id: Optional[str]
	research_id: Optional[str]
	content_id: Optional[str]
	status: str
	errors: List[str]
	metrics: Dict[str, float]


