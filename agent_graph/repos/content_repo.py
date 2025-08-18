from __future__ import annotations

from typing import Optional


class ContentRepository:
	"""Stub repository for cm_module_content operations."""

	def upsert_content(self, job_id: str, content_id: Optional[str]) -> None:
		_ = (job_id, content_id)
		return None

	def get_content(self, content_id: str) -> Optional[dict]:
		_ = content_id
		return None


