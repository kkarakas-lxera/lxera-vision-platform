"""Configuration settings for OpenAI Agents Course Generator."""

import os
from typing import Optional
from pydantic import Field
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Core OpenAI Configuration
    openai_api_key: str = Field(..., env="OPENAI_API_KEY")
    default_model: str = Field("gpt-4o-mini", env="DEFAULT_MODEL")
    default_temperature: float = Field(0.7, env="DEFAULT_TEMPERATURE")
    max_tokens_per_tool: int = Field(4096, env="MAX_TOKENS_PER_TOOL")
    max_agent_turns: int = Field(25, env="MAX_AGENT_TURNS")
    
    # Timeout Configuration
    planning_timeout_minutes: int = Field(5, env="PLANNING_TIMEOUT_MINUTES")
    research_timeout_minutes: int = Field(10, env="RESEARCH_TIMEOUT_MINUTES")
    content_generation_timeout_minutes: int = Field(12, env="CONTENT_GENERATION_TIMEOUT_MINUTES")
    total_pipeline_timeout_minutes: int = Field(30, env="TOTAL_PIPELINE_TIMEOUT_MINUTES")
    
    # Research API Configuration
    tavily_api_key: str = Field(..., env="TAVILY_API_KEY")
    firecrawl_api_key: str = Field(..., env="FIRECRAWL_API_KEY")
    jina_api_key: str = Field(..., env="JINA_API_KEY")
    exa_api_key: Optional[str] = Field(None, env="EXA_API_KEY")  # Legacy support, not actively used
    
    # Optional LLM Providers
    anthropic_api_key: Optional[str] = Field(None, env="ANTHROPIC_API_KEY")
    groq_api_key: Optional[str] = Field(None, env="GROQ_API_KEY")
    
    # Database Configuration
    supabase_url: Optional[str] = Field(None, env="SUPABASE_URL")
    supabase_anon_key: Optional[str] = Field(None, env="SUPABASE_ANON_KEY")
    supabase_service_role_key: Optional[str] = Field(None, env="SUPABASE_SERVICE_ROLE_KEY")
    
    # Optional Memory Integration
    mem0_api_key: Optional[str] = Field(None, env="MEM0_API_KEY")
    
    # Optional Tracing
    langchain_tracing_v2: bool = Field(False, env="LANGCHAIN_TRACING_V2")
    langchain_api_key: Optional[str] = Field(None, env="LANGCHAIN_API_KEY")
    langchain_project: str = Field("openai-agents-course-generator", env="LANGCHAIN_PROJECT")
    
    # System Configuration
    log_level: str = Field("INFO", env="LOG_LEVEL")
    debug_mode: bool = Field(False, env="DEBUG_MODE")
    enable_tracing: bool = Field(True, env="ENABLE_TRACING")
    enable_performance_monitoring: bool = Field(True, env="ENABLE_PERFORMANCE_MONITORING")
    
    # Video Generation Settings
    video_resolution: str = Field("1920x1080", env="VIDEO_RESOLUTION")
    video_fps: int = Field(30, env="VIDEO_FPS")
    audio_sample_rate: int = Field(44100, env="AUDIO_SAMPLE_RATE")
    
    # Output Configuration
    output_dir: str = Field("./output", env="OUTPUT_DIR")
    temp_dir: str = Field("./temp", env="TEMP_DIR")
    cache_enabled: bool = Field(True, env="CACHE_ENABLED")
    cache_ttl_hours: int = Field(24, env="CACHE_TTL_HOURS")
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        
    def get_openai_config(self) -> dict:
        """Get OpenAI client configuration."""
        return {
            "api_key": self.openai_api_key,
            "model": self.default_model,
            "temperature": self.default_temperature,
            "max_tokens": self.max_tokens_per_tool
        }
    
    def get_research_apis_config(self) -> dict:
        """Get research APIs configuration (EXA removed)."""
        return {
            "tavily": {"api_key": self.tavily_api_key},
            "firecrawl": {"api_key": self.firecrawl_api_key},
            "jina": {"api_key": self.jina_api_key}
        }
    
    def get_video_config(self) -> dict:
        """Get video generation configuration."""
        width, height = self.video_resolution.split('x')
        return {
            "resolution": (int(width), int(height)),
            "fps": self.video_fps,
            "audio_sample_rate": self.audio_sample_rate
        }
    
    def get_timeout_config(self) -> dict:
        """Get timeout configuration in seconds."""
        return {
            "planning_timeout": self.planning_timeout_minutes * 60,
            "research_timeout": self.research_timeout_minutes * 60,
            "content_generation_timeout": self.content_generation_timeout_minutes * 60,
            "total_pipeline_timeout": self.total_pipeline_timeout_minutes * 60
        }


# Global settings instance
_settings: Optional[Settings] = None


def get_settings() -> Settings:
    """Get or create global settings instance."""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings