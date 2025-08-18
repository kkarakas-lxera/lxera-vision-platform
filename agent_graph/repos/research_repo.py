from __future__ import annotations

from typing import Optional


class ResearchRepository:
	"""Stub repository for cm_research_* operations."""

	def upsert_research_session(self, job_id: str, research_id: Optional[str]) -> None:
		_ = (job_id, research_id)
		return None

	def get_research(self, research_id: str) -> Optional[dict]:
		_ = research_id
		return None


