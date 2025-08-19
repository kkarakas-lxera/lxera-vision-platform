from __future__ import annotations

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class AgentGraphSettings(BaseSettings):
	"""Runtime settings for the Agent Graph orchestrator."""

	use_langgraph: bool = Field(default=True, description="Feature-flag to enable LangGraph runner")
	
	# OpenRouter settings (preferred)
	openrouter_api_key: str = Field(default="", description="OpenRouter API key")
	openrouter_primary_model: str = Field(default="anthropic/claude-3-5-sonnet", description="Primary OpenRouter model")
	openrouter_fallback_model: str = Field(default="mistralai/mistral-large-2407", description="Fallback OpenRouter model")
	
	# Groq settings (legacy/fallback)
	groq_api_key: str = Field(default="", description="Groq API key")
	groq_primary_model: str = Field(default="llama-3.3-70b-versatile", description="Primary Groq model")
	groq_fallback_model: str = Field(default="llama-3.1-8b-instant", description="Fallback Groq model")

	supabase_url: str = Field(default="", description="Supabase project URL")
	supabase_service_key: str = Field(default="", description="Supabase service role key")
	
	# Legacy environment variables that may still be present  
	openai_api_key: str = Field(default="", description="Legacy OpenAI API key")
	vite_supabase_url: str = Field(default="", description="Legacy Vite Supabase URL")
	vite_supabase_anon_key: str = Field(default="", description="Legacy Vite Supabase anon key")
	supabase_service_role_key: str = Field(default="", description="Legacy Supabase service role key")

	sentry_dsn: str = Field(default="", description="Sentry DSN for observability")

	model_config = SettingsConfigDict(
		case_sensitive=False,
		env_file=".env",
	)


settings = AgentGraphSettings()  # Singleton


