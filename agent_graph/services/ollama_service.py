from __future__ import annotations

import os
import json
import requests
from typing import Optional, Dict, Any, List
from langchain_core.messages import BaseMessage, AIMessage


class ChatOllama:
    """Custom Ollama chat interface compatible with LangChain."""
    
    def __init__(
        self, 
        model: str = "qwen3:14b",
        base_url: str = "http://127.0.0.1:11434",
        token: str = "",
        temperature: float = 0.7,
        max_tokens: int = 4096,
        **kwargs
    ):
        # Store kwargs for potential future use
        self.kwargs = kwargs
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
        import inspect
        from typing import get_type_hints
        
        # Get tool name and description
        tool_name = getattr(tool, 'name', str(tool))
        tool_description = getattr(tool, 'description', '')
        
        # Get function signature for parameters
        if hasattr(tool, 'func'):
            func = tool.func
        else:
            func = tool
            
        properties = {}
        required = []
        
        try:
            # Get function signature
            sig = inspect.signature(func)
            type_hints = get_type_hints(func)
            
            for param_name, param in sig.parameters.items():
                # Skip 'self' and other special parameters
                if param_name in ['self', 'cls']:
                    continue
                    
                param_type = "string"  # Default to string
                param_description = f"Parameter {param_name}"
                
                # Try to get type from annotations
                if param_name in type_hints:
                    hint = type_hints[param_name]
                    if hint == str:
                        param_type = "string"
                    elif hint in [int, float]:
                        param_type = "number"
                    elif hint == bool:
                        param_type = "boolean"
                
                properties[param_name] = {
                    "type": param_type,
                    "description": param_description
                }
                
                # Check if parameter is required (no default value)
                if param.default == inspect.Parameter.empty:
                    required.append(param_name)
                    
        except Exception as e:
            print(f"⚠️  Warning: Could not introspect tool {tool_name}: {e}")
            # Fallback: create a generic parameter
            properties = {
                "input": {
                    "type": "string",
                    "description": "Tool input"
                }
            }
            required = ["input"]
        
        return {
            "type": "function",
            "function": {
                "name": tool_name,
                "description": tool_description,
                "parameters": {
                    "type": "object",
                    "properties": properties,
                    "required": required
                }
            }
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
                elif msg.__class__.__name__ == "ToolMessage":
                    role = "tool"

                payload_msg = {
                    "role": role,
                    "content": str(msg.content)
                }
                # Include tool_call_id and optional name for tool role messages
                if role == "tool":
                    tool_call_id = getattr(msg, "tool_call_id", None)
                    if tool_call_id:
                        payload_msg["tool_call_id"] = tool_call_id
                    tool_name = getattr(msg, "name", None)
                    if tool_name:
                        payload_msg["name"] = tool_name

                ollama_messages.append(payload_msg)
        
        try:
            # Prepare request payload for remote Ollama
            payload = {
                "model": self.model,
                "messages": ollama_messages,
                "stream": False,
                "options": {
                    "temperature": self.temperature,
                    "num_predict": self.max_tokens
                }
            }
            
            # Add tools if bound and tune sampling/penalties per Qwen3 guidance
            if self._tools:
                payload["tools"] = self._tools
                payload["options"]["temperature"] = 0.0
                payload["options"]["top_p"] = 0.9
                payload["options"]["repeat_penalty"] = 1.1
            else:
                # Non-tool general text: Qwen3 suggested defaults
                payload["options"]["temperature"] = max(self.temperature, 0.7)
                payload["options"]["top_p"] = 0.8

            # If prompt mentions JSON, disable thinking to avoid <think> blocks
            try:
                has_json = any("JSON" in (m.get("content") or "") for m in ollama_messages)
            except Exception:
                has_json = False
            if has_json:
                payload["think"] = False
            
            # Make request to remote Ollama API (use Bearer token if provided)
            headers = {"Content-Type": "application/json"}
            if self.token:
                headers["Authorization"] = f"Bearer {self.token}"
            response = requests.post(
                f"{self.base_url}/api/chat",
                json=payload,
                headers=headers,
                timeout=300
            )
            response.raise_for_status()
            
            result = response.json()
            content = result.get("message", {}).get("content", "")
            ai_message = AIMessage(content=content)
            
            # Handle tool calls if present in response
            message_data = result.get("message", {})
            if "tool_calls" in message_data and message_data["tool_calls"]:
                # Convert Ollama tool calls to LangChain format
                tool_calls = []
                for tc in message_data["tool_calls"]:
                    tool_calls.append({
                        "name": tc.get("function", {}).get("name", ""),
                        "args": tc.get("function", {}).get("arguments", {}),
                        "id": str(hash(str(tc)))  # Generate a simple ID
                    })
                ai_message.tool_calls = tool_calls
            
            return ai_message
            
        except Exception as e:
            print(f"❌ Ollama API Error: {e}")
            return AIMessage(content=f"Error calling Ollama: {e}")
    
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
    chosen_model = model or os.environ.get("OLLAMA_MODEL", "qwen3:14b")
    base_url = os.environ.get("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
    token = os.environ.get("OLLAMA_TOKEN", "")
    
    print(f"🤖 Using Ollama model: {chosen_model}")
    print(f"🔗 Endpoint: {base_url}")
    
    return ChatOllama(
        model=chosen_model,
        base_url=base_url,
        token=token,
        temperature=0.7,  # default for non-tool; per-call logic adjusts for tools
        max_tokens=4096
    )


def test_ollama_connection() -> bool:
    """Test connection to Ollama instance."""
    try:
        base_url = os.environ.get("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
        token = os.environ.get("OLLAMA_TOKEN", "")
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        response = requests.get(f"{base_url}/api/tags", headers=headers, timeout=10)
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