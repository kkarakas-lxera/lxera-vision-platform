from __future__ import annotations

import json
import urllib.request
import urllib.parse
from typing import Any, Dict, List, Optional

from ..config.settings import settings
import os


class SupabaseRestClient:
	"""Minimal REST client for Supabase PostgREST endpoints.

	Avoids extra dependencies by using urllib from the standard library.
	"""

	def __init__(self, base_url: Optional[str] = None, service_key: Optional[str] = None) -> None:
		env_base = os.environ.get("SUPABASE_URL")
		env_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
		self._base_url = (base_url or settings.supabase_url or env_base or "").rstrip("/")
		self._service_key = service_key or settings.supabase_service_key or env_key or ""
		if not self._base_url or not self._service_key:
			raise ValueError("Supabase URL and service role key must be configured")

	def _request(self, method: str, path: str, params: Optional[Dict[str, str]] = None, body: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None) -> Any:
		url = f"{self._base_url}{path}"
		if params:
			query = urllib.parse.urlencode(params, doseq=True)
			url = f"{url}?{query}"
		req_headers = {
			"Content-Type": "application/json",
			"Accept": "application/json",
			"apikey": self._service_key,
			"Authorization": f"Bearer {self._service_key}",
		}
		if headers:
			req_headers.update(headers)
		data = None
		if body is not None:
			data = json.dumps(body).encode("utf-8")
		request = urllib.request.Request(url, data=data, headers=req_headers, method=method.upper())
		with urllib.request.urlopen(request) as resp:
			charset = resp.headers.get_content_charset() or "utf-8"
			text = resp.read().decode(charset)
			if not text:
				return None
			try:
				return json.loads(text)
			except json.JSONDecodeError:
				return text

	# Graph checkpoints table helpers
	def insert_checkpoint(self, thread_id: str, checkpoint_id: str, state: Dict[str, Any], metadata: Optional[Dict[str, Any]] = None) -> None:
		body = {
			"thread_id": thread_id,
			"checkpoint_id": checkpoint_id,
			"state": state,
			"metadata": metadata or {},
		}
		self._request("POST", "/rest/v1/graph_checkpoints", body=[body], headers={"Prefer": "return=minimal"})

	def upsert_checkpoint(self, thread_id: str, checkpoint_id: str, state: Dict[str, Any], metadata: Optional[Dict[str, Any]] = None) -> None:
		# Use PostgREST upsert via on_conflict primary key
		body = [{
			"thread_id": thread_id,
			"checkpoint_id": checkpoint_id,
			"state": state,
			"metadata": metadata or {},
		}]
		self._request("POST", "/rest/v1/graph_checkpoints", params={"on_conflict": "thread_id,checkpoint_id"}, body=body, headers={"Prefer": "resolution=merge-duplicates,return=minimal"})

	def update_metadata(self, thread_id: str, checkpoint_id: str, metadata: Dict[str, Any]) -> None:
		filters = {
			"thread_id": f"eq.{thread_id}",
			"checkpoint_id": f"eq.{checkpoint_id}",
		}
		self._request("PATCH", "/rest/v1/graph_checkpoints", params=filters, body={"metadata": metadata}, headers={"Prefer": "return=minimal"})

	def get_latest_checkpoint(self, thread_id: str) -> Optional[Dict[str, Any]]:
		params = {
			"thread_id": f"eq.{thread_id}",
			"order": "created_at.desc",
			"limit": "1",
		}
		rows: List[Dict[str, Any]] = self._request("GET", "/rest/v1/graph_checkpoints", params=params)
		if rows:
			return rows[0]
		return None

	def get_checkpoint(self, thread_id: str, checkpoint_id: str) -> Optional[Dict[str, Any]]:
		params = {
			"thread_id": f"eq.{thread_id}",
			"checkpoint_id": f"eq.{checkpoint_id}",
			"limit": "1",
		}
		rows: List[Dict[str, Any]] = self._request("GET", "/rest/v1/graph_checkpoints", params=params)
		if rows:
			return rows[0]
		return None

	def list_checkpoints(self, thread_id: str, limit: int = 50) -> List[Dict[str, Any]]:
		params = {
			"thread_id": f"eq.{thread_id}",
			"order": "created_at.desc",
			"limit": str(limit),
		}
		rows: List[Dict[str, Any]] = self._request("GET", "/rest/v1/graph_checkpoints", params=params)
		return rows or []


