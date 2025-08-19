from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Iterable, Optional
import uuid

from ..services.supabase_client import SupabaseRestClient


@dataclass
class CheckpointTuple:
	"""Minimal representation of a LangGraph checkpoint tuple for persistence.

	This mirrors the shape needed by LangGraph get_state/get_state_history usage.
	"""
	checkpoint: Dict[str, Any]
	config: Dict[str, Any]
	metadata: Dict[str, Any]
	pending_writes: Optional[Dict[str, Any]]


class BaseCheckpointSaver:
	"""Subset of LangGraph BaseCheckpointSaver interface used by our runner.

	This is a local stub to avoid runtime imports before full integration.
	"""

	def put(self, config: Dict[str, Any], checkpoint: Dict[str, Any], metadata: Dict[str, Any]) -> None:
		raise NotImplementedError

	def put_writes(self, config: Dict[str, Any], writes: Dict[str, Any], task_id: str = None) -> None:
		raise NotImplementedError

	def get_tuple(self, config: Dict[str, Any]) -> Optional[CheckpointTuple]:
		raise NotImplementedError

	def list(self, config: Dict[str, Any], filter_criteria: Optional[Dict[str, Any]] = None) -> Iterable[CheckpointTuple]:
		raise NotImplementedError


class SupabaseCheckpointSaver(BaseCheckpointSaver):
	"""Supabase Postgres-backed checkpointer (stub).

	Implements the BaseCheckpointSaver subset. Actual DB operations will be added next.
	"""

	def __init__(self) -> None:
		self._client = SupabaseRestClient()

	def put(self, config: Dict[str, Any], checkpoint: Dict[str, Any], metadata: Dict[str, Any], new_versions: Any = None) -> None:
		thread_id = _require_thread_id(config)
		checkpoint_id = _get_or_generate_checkpoint_id(config)
		# Merge new_versions into metadata if provided
		if new_versions:
			metadata = {**metadata, "new_versions": new_versions}
		self._client.upsert_checkpoint(thread_id=thread_id, checkpoint_id=checkpoint_id, state=checkpoint, metadata=metadata)

	def put_writes(self, config: Dict[str, Any], writes: Dict[str, Any], task_id: str = None) -> None:
		thread_id = _require_thread_id(config)
		checkpoint_id = _get_or_generate_checkpoint_id(config)
		# Merge pending writes into metadata for simplicity
		row = self._client.get_checkpoint(thread_id, checkpoint_id)
		metadata: Dict[str, Any] = (row.get("metadata") if row else {}) or {}
		metadata["pending_writes"] = writes
		if task_id:
			metadata["task_id"] = task_id
		self._client.update_metadata(thread_id, checkpoint_id, metadata)

	def get_tuple(self, config: Dict[str, Any]) -> Optional[CheckpointTuple]:
		thread_id = _require_thread_id(config)
		checkpoint_id = _optional_checkpoint_id(config)
		row = self._client.get_checkpoint(thread_id, checkpoint_id) if checkpoint_id else self._client.get_latest_checkpoint(thread_id)
		if not row:
			return None
		checkpoint = row.get("state") or {}
		metadata = row.get("metadata") or {}
		stored_checkpoint_id = str(row.get("checkpoint_id"))
		cfg = {"configurable": {"thread_id": thread_id, "checkpoint_id": stored_checkpoint_id}}
		pending = (metadata or {}).get("pending_writes")
		return CheckpointTuple(checkpoint=checkpoint, config=cfg, metadata=metadata, pending_writes=pending)

	def list(self, config: Dict[str, Any], filter_criteria: Optional[Dict[str, Any]] = None) -> Iterable[CheckpointTuple]:
		thread_id = _require_thread_id(config)
		rows = self._client.list_checkpoints(thread_id)
		out: list[CheckpointTuple] = []
		for row in rows:
			checkpoint = row.get("state") or {}
			metadata = row.get("metadata") or {}
			stored_checkpoint_id = str(row.get("checkpoint_id"))
			cfg = {"configurable": {"thread_id": thread_id, "checkpoint_id": stored_checkpoint_id}}
			pending = (metadata or {}).get("pending_writes")
			out.append(CheckpointTuple(checkpoint=checkpoint, config=cfg, metadata=metadata, pending_writes=pending))
		return out

	def get_next_version(self, current_version: Any, channel_versions: Any) -> str:
		"""Return a monotonically unique version identifier.

		LangGraph expects a version to manage checkpoint progression. We use a UUID.
		Args match LangGraph's internal call pattern from _algo.py.
		"""
		_ = (current_version, channel_versions)  # Ignore input versions for UUID-based approach
		return str(uuid.uuid4())


def _require_thread_id(config: Dict[str, Any]) -> str:
	configurable = (config or {}).get("configurable") or {}
	thread_id = configurable.get("thread_id")
	if not thread_id:
		raise ValueError("thread_id is required in config.configurable.thread_id")
	return str(thread_id)


def _optional_checkpoint_id(config: Dict[str, Any]) -> Optional[str]:
	configurable = (config or {}).get("configurable") or {}
	checkpoint_id = configurable.get("checkpoint_id")
	return str(checkpoint_id) if checkpoint_id else None


def _get_or_generate_checkpoint_id(config: Dict[str, Any]) -> str:
	checkpoint_id = _optional_checkpoint_id(config)
	return checkpoint_id or str(uuid.uuid4())


