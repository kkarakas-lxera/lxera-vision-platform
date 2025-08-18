from __future__ import annotations

from pydantic import BaseSettings, Field


class AgentGraphSettings(BaseSettings):
	"""Runtime settings for the Agent Graph orchestrator."""

	use_langgraph: bool = Field(default=True, description="Feature-flag to enable LangGraph runner")
	groq_api_key: str = Field(default="", description="Groq API key")
	groq_primary_model: str = Field(default="llama-3.3-70b-versatile", description="Primary Groq model")
	groq_fallback_model: str = Field(default="llama-3.1-8b-instant", description="Fallback Groq model")

	supabase_url: str = Field(default="", description="Supabase project URL")
	supabase_service_key: str = Field(default="", description="Supabase service role key")

	sentry_dsn: str = Field(default="", description="Sentry DSN for observability")

	class Config:
		case_sensitive = False
		env_prefix = "LXERA_"
		env_file = ".env"


settings = AgentGraphSettings()  # Singleton


