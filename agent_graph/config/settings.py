from __future__ import annotations

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict



class AgentGraphSettings(BaseSettings):
	"""Runtime settings for the Agent Graph orchestrator."""

	use_langgraph: bool = Field(default=True, description="Feature-flag to enable LangGraph runner")
	groq_api_key: str = Field(default="", description="Groq API key")
	groq_primary_model: str = Field(default="llama-3.3-70b-versatile", description="Primary Groq model")
	groq_fallback_model: str = Field(default="llama-3.1-8b-instant", description="Fallback Groq model")

	supabase_url: str = Field(default="", description="Supabase project URL")
	supabase_service_key: str = Field(default="", description="Supabase service role key")
	
	# Ollama configuration
	ollama_token: str = Field(default="", description="Ollama API token")
	ollama_base_url: str = Field(default="http://127.0.0.1:11434", description="Ollama base URL")
	ollama_model: str = Field(default="qwen3:14b", description="Ollama model name")
	ollama_planning_model: str = Field(default="deepseek-r1:8b", description="Ollama planning model")
	ollama_embedding_model: str = Field(default="nomic-embed-text", description="Ollama embedding model")
	
	# Research API keys
	firecrawl_api_key: str = Field(default="", description="Firecrawl API key")
	scrape_do_api_key: str = Field(default="", description="Scrape.do API key")
	tavily_api_key: str = Field(default="", description="Tavily API key")
	brightdata_api_key: str = Field(default="", description="BrightData API key")
	
	# Monitoring and tracing
	langsmith_api_key: str = Field(default="", description="LangSmith API key")
	langsmith_tracing: bool = Field(default=False, description="Enable LangSmith tracing")
	langsmith_project: str = Field(default="", description="LangSmith project name")
	log_level: str = Field(default="INFO", description="Logging level")
	debug_mode: bool = Field(default=False, description="Enable debug mode")
	enable_tracing: bool = Field(default=False, description="Enable tracing")
	
	# Legacy environment variables that may still be present  
	openai_api_key: str = Field(default="", description="Legacy OpenAI API key")
	vite_supabase_url: str = Field(default="", description="Legacy Vite Supabase URL")
	vite_supabase_anon_key: str = Field(default="", description="Legacy Vite Supabase anon key")
	supabase_service_role_key: str = Field(default="", description="Legacy Supabase service role key")

	sentry_dsn: str = Field(default="", description="Sentry DSN for observability")

	model_config = SettingsConfigDict(
		case_sensitive=False,
		env_file=".env",
		extra='ignore',  # Ignore unrelated env vars (e.g., OLLAMA_*, FIRECRAWL_*)
	)


settings = AgentGraphSettings()  # Singleton


