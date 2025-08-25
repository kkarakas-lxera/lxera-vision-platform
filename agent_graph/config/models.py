from __future__ import annotations

from pydantic import BaseModel, Field


class ModelPolicy(BaseModel):
	primary: str = Field(default="openai/gpt-oss-20b")
	fallback: str = Field(default="llama-3.1-8b-instant")


class RetryPolicy(BaseModel):
	max_attempts: int = Field(default=2, ge=0, le=5)
	backoff_seconds: float = Field(default=0.75, ge=0.0)


class Timeouts(BaseModel):
	per_node_seconds: int = Field(default=90, ge=1)
	tool_call_seconds: int = Field(default=45, ge=1)


