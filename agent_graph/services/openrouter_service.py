from __future__ import annotations

import os
from typing import Optional


def get_chat_openrouter(model: Optional[str] = None, provider: Optional[str] = None):
    """Return a ChatOpenAI instance configured for OpenRouter with fallback options.
    
    Args:
        model: Specific model to use (e.g., "claude-3-5-sonnet", "mistral-large")
        provider: Provider preference ("anthropic", "mistral", "cohere")
    
    Raises a clear error if the integration is missing.
    """
    # Model selection with intelligent defaults
    if model:
        chosen_model = model
    elif provider == "anthropic":
        chosen_model = "anthropic/claude-3-5-sonnet"
    elif provider == "mistral":
        chosen_model = "mistralai/mistral-large-2407"
    elif provider == "cohere":
        chosen_model = "cohere/command-r-plus"
    else:
        # Default to Claude for best function calling reliability
        chosen_model = os.environ.get("OPENROUTER_MODEL", "anthropic/claude-3-5-sonnet")
    
    try:
        from langchain_openai import ChatOpenAI
        
        api_key = os.environ.get("OPENROUTER_API_KEY")
        if not api_key:
            raise RuntimeError("OPENROUTER_API_KEY is not set")
        
        return ChatOpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
            model=chosen_model,
            temperature=0.0,  # Zero for consistent tool calling
            max_tokens=4096,
            model_kwargs={
                "top_p": 1.0,
                "frequency_penalty": 0.0,
                "presence_penalty": 0.0
            },
            # OpenRouter specific headers
            default_headers={
                "HTTP-Referer": "https://your-app.com",  # Replace with your domain
                "X-Title": "LangGraph Course Generator"
            }
        )
    except ImportError as exc:
        raise RuntimeError(
            "langchain-openai is not installed. Add `langchain-openai` to requirements.txt"
        ) from exc


def get_chat_openrouter_with_fallback(primary_model: Optional[str] = None):
    """Get OpenRouter client with automatic fallback logic"""
    
    # Define fallback chain (ordered by reliability for function calling)
    fallback_models = [
        primary_model or "anthropic/claude-3-5-sonnet",
        "mistralai/mistral-large-2407",
        "cohere/command-r-plus",
        "anthropic/claude-3-haiku"  # Fastest fallback
    ]
    
    for model in fallback_models:
        if model:  # Skip None values
            try:
                return get_chat_openrouter(model=model)
            except Exception as e:
                print(f"Failed to initialize {model}: {e}")
                continue
    
    raise RuntimeError("All OpenRouter models failed to initialize")


# Backward compatibility function
def get_chat_groq_replacement():
    """Drop-in replacement for get_chat_groq() function"""
    return get_chat_openrouter()