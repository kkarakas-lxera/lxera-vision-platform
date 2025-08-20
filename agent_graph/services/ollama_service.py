from __future__ import annotations

import os
import json
import requests
from typing import Optional, Dict, Any, List
from langchain_core.language_models.base import BaseLanguageModel
from langchain_core.messages import BaseMessage, AIMessage
from langchain_core.callbacks import CallbackManagerForLLMRun
from langchain_core.outputs import LLMResult, Generation


class ChatOllama(BaseLanguageModel):
    """Custom Ollama chat interface compatible with LangChain."""
    
    def __init__(
        self, 
        model: str = "deepseek-r1:8b",
        base_url: str = "http://109.198.107.223:50435",
        token: str = "a74aa3368d646eb26a2a8470cd8c831774052110f3f8246cc6b208ab9262aaf3",
        temperature: float = 0.0,
        max_tokens: int = 4096,
        **kwargs
    ):
        super().__init__(**kwargs)
        self.model = model
        self.base_url = base_url.rstrip('/')
        self.token = token
        self.temperature = temperature
        self.max_tokens = max_tokens
        self._tools: List[Dict[str, Any]] = []
    
    def bind_tools(self, tools: List[Any]) -> "ChatOllama":
        """Bind tools to the model for tool calling."""
        # Convert LangChain tools to Ollama format if needed
        bound_instance = ChatOllama(
            model=self.model,
            base_url=self.base_url,
            token=self.token,
            temperature=self.temperature,
            max_tokens=self.max_tokens
        )
        bound_instance._tools = [self._convert_tool(tool) for tool in tools]
        return bound_instance
    
    def _convert_tool(self, tool: Any) -> Dict[str, Any]:
        """Convert LangChain tool to Ollama tool format."""
        return {
            "name": getattr(tool, 'name', str(tool)),
            "description": getattr(tool, 'description', ''),
            "parameters": getattr(tool, 'args_schema', {})
        }
    
    def invoke(self, messages: List[BaseMessage], **kwargs) -> AIMessage:
        """Invoke the Ollama model with messages."""
        # Convert messages to Ollama format
        ollama_messages = []
        for msg in messages:
            if hasattr(msg, 'content'):
                role = "user" if msg.__class__.__name__ == "HumanMessage" else "assistant"
                if msg.__class__.__name__ == "SystemMessage":
                    role = "system"
                ollama_messages.append({
                    "role": role,
                    "content": str(msg.content)
                })
        
        # Prepare request payload
        payload = {
            "model": self.model,
            "messages": ollama_messages,
            "stream": False,
            "options": {
                "temperature": self.temperature,
                "num_predict": self.max_tokens
            }
        }
        
        # Add tools if bound
        if self._tools:
            payload["tools"] = self._tools
        
        try:
            # Make request to Ollama API with token
            response = requests.post(
                f"{self.base_url}/api/chat?token={self.token}",
                json=payload,
                timeout=300
            )
            response.raise_for_status()
            
            result = response.json()
            content = result.get("message", {}).get("content", "")
            
            # Create AI message with tool calls if present
            ai_message = AIMessage(content=content)
            
            # Handle tool calls if present in response
            if "tool_calls" in result.get("message", {}):
                ai_message.tool_calls = result["message"]["tool_calls"]
            
            return ai_message
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Ollama API Error: {e}")
            return AIMessage(content=f"Error calling Ollama: {e}")
    
    def _generate(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> LLMResult:
        """Generate response using Ollama."""
        ai_message = self.invoke(messages, **kwargs)
        generation = Generation(text=ai_message.content)
        return LLMResult(generations=[[generation]])
    
    @property
    def _llm_type(self) -> str:
        return "ollama"


def get_chat_ollama(model: Optional[str] = None) -> ChatOllama:
    """Return a ChatOllama instance.
    
    Args:
        model: Model name (deepseek-r1:8b, qwen3:14b)
    
    Returns:
        ChatOllama instance configured for your Vast.ai GPU
    """
    chosen_model = model or os.environ.get("OLLAMA_MODEL", "deepseek-r1:8b")
    base_url = os.environ.get("OLLAMA_BASE_URL", "http://109.198.107.223:50435")
    token = os.environ.get("OLLAMA_TOKEN", "a74aa3368d646eb26a2a8470cd8c831774052110f3f8246cc6b208ab9262aaf3")
    
    print(f"🤖 Using Ollama model: {chosen_model}")
    print(f"🔗 Endpoint: {base_url}")
    
    return ChatOllama(
        model=chosen_model,
        base_url=base_url,
        token=token,
        temperature=0.0,  # Zero for consistent tool calling
        max_tokens=4096
    )


def test_ollama_connection() -> bool:
    """Test connection to Ollama instance."""
    try:
        base_url = os.environ.get("OLLAMA_BASE_URL", "http://109.198.107.223:50435")
        token = os.environ.get("OLLAMA_TOKEN", "a74aa3368d646eb26a2a8470cd8c831774052110f3f8246cc6b208ab9262aaf3")
        response = requests.get(f"{base_url}/api/tags?token={token}", timeout=10)
        response.raise_for_status()
        models = response.json().get("models", [])
        print(f"✅ Connected to Ollama. Available models: {[m['name'] for m in models]}")
        return True
    except Exception as e:
        print(f"❌ Failed to connect to Ollama: {e}")
        return False


if __name__ == "__main__":
    # Test the connection
    test_ollama_connection()