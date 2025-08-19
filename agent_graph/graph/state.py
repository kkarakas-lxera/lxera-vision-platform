from __future__ import annotations

from typing import Dict, List, Optional, TypedDict


class GraphState(TypedDict, total=False):
	job_id: str
	employee_id: Optional[str]
	employee_name: Optional[str]
	company_id: Optional[str]
	employee_profile: Optional[str]
	skills_gaps: Optional[str]
	generation_mode: Optional[str]
	plan_id: Optional[str]
	research_id: Optional[str]
	content_id: Optional[str]
	status: str
	errors: List[str]
	metrics: Dict[str, float]


