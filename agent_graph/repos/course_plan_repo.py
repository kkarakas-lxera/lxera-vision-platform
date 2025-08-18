from __future__ import annotations

from typing import Optional


class CoursePlanRepository:
	"""Stub repository for cm_course_plans operations."""

	def upsert_plan(self, job_id: str, plan_id: Optional[str]) -> None:
		_ = (job_id, plan_id)
		return None

	def get_plan(self, plan_id: str) -> Optional[dict]:
		_ = plan_id
		return None


