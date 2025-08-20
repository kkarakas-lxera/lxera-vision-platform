from __future__ import annotations

import os
import json
import requests
import time
from datetime import datetime
from typing import Optional, Dict, Any, List
from langchain_core.messages import BaseMessage, AIMessage

# Enhanced logging setup using Python's built-in logging
import logging
import sys
from logging.handlers import RotatingFileHandler

# Configure detailed LLM logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d - %(message)s')

# Create logger
logger = logging.getLogger('ollama_service')
logger.setLevel(logging.DEBUG)

# Add file handler for detailed logs
file_handler = RotatingFileHandler(
    'ollama_detailed.log',
    maxBytes=10*1024*1024,  # 10MB
    backupCount=7
)
file_handler.setLevel(logging.DEBUG)
file_formatter = logging.Formatter('%(asctime)s.%(msecs)03d | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d | %(message)s')
file_handler.setFormatter(file_formatter)
logger.addHandler(file_handler)

# Add structured JSON logging
json_handler = RotatingFileHandler(
    'ollama_structured.jsonl',
    maxBytes=5*1024*1024,  # 5MB
    backupCount=3
)
json_handler.setLevel(logging.INFO)
json_formatter = logging.Formatter('%(message)s')
json_handler.setFormatter(json_formatter)

# Create a separate logger for JSON structured logs
json_logger = logging.getLogger('ollama_json')
json_logger.setLevel(logging.INFO)
json_logger.addHandler(json_handler)


class ChatOllama:
    """Custom Ollama chat interface compatible with LangChain."""
    
    def __init__(
        self, 
        model: str = "qwen3:14b",
        base_url: str = "http://127.0.0.1:11434",
        token: str = "",
        temperature: float = 0.0,
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
        """Invoke the Ollama model with messages and detailed logging."""
        start_time = time.time()
        request_id = f"req_{int(time.time() * 1000)}"
        
        # Log request initiation
        request_info = {
            "request_id": request_id,
            "model": self.model,
            "message_count": len(messages),
            "has_tools": bool(self._tools),
            "temperature": self.temperature,
            "max_tokens": self.max_tokens
        }
        logger.info(f"🚀 LLM Request Started - {request_info}")
        json_logger.info(json.dumps({"event": "request_started", "timestamp": datetime.now().isoformat(), **request_info}))
        
        # Convert messages to Ollama format
        ollama_messages = []
        for i, msg in enumerate(messages):
            if hasattr(msg, 'content'):
                role = "user" if msg.__class__.__name__ == "HumanMessage" else "assistant"
                if msg.__class__.__name__ == "SystemMessage":
                    role = "system"
                elif msg.__class__.__name__ == "ToolMessage":
                    role = "tool"
                    
                message_content = str(msg.content)
                ollama_messages.append({
                    "role": role,
                    "content": message_content
                })
                
                # Log individual messages (truncated for readability)
                message_info = {
                    "request_id": request_id,
                    "role": role,
                    "content_preview": message_content[:200] + "..." if len(message_content) > 200 else message_content,
                    "content_length": len(message_content)
                }
                logger.debug(f"📝 Message {i+1}/{len(messages)} - {message_info}")

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
            
            # Add tools if bound - optimized for Qwen3:14B
            if self._tools:
                payload["tools"] = self._tools
                # Ensure optimal settings for tool calling
                payload["options"]["temperature"] = 0.0  # Critical for consistent tool calling
                payload["options"]["top_p"] = 0.9
                payload["options"]["repeat_penalty"] = 1.1
                
                tool_info = {
                    "request_id": request_id,
                    "tool_count": len(self._tools),
                    "tool_names": [tool.get("function", {}).get("name", "unknown") for tool in self._tools]
                }
                logger.debug(f"🛠️ Tool Calling Enabled - {tool_info}")
                json_logger.info(json.dumps({"event": "tools_enabled", "timestamp": datetime.now().isoformat(), **tool_info}))
            
            # For JSON generation, disable thinking mode for cleaner output
            has_json_request = any(msg.get("content", "").find("JSON") != -1 for msg in ollama_messages)
            if has_json_request:
                payload["think"] = False  # Disable thinking for JSON responses
                think_info = {
                    "request_id": request_id,
                    "reason": "JSON generation detected"
                }
                logger.debug(f"🧠 Thinking Mode Disabled for JSON - {think_info}")
            
            # Log request payload (without full content for brevity)
            payload_info = {
                "request_id": request_id,
                "endpoint": f"{self.base_url}/api/chat",
                "payload_size": len(json.dumps(payload)),
                "has_tools": bool(self._tools),
                "think_disabled": has_json_request
            }
            logger.debug(f"📤 Sending Request - {payload_info}")
            
            # Make request to remote Ollama API with token in cookie
            headers = {"Content-Type": "application/json"}
            cookies = {f"C.25124719_auth_token": self.token} if self.token else None
            
            response = requests.post(
                f"{self.base_url}/api/chat",
                json=payload,
                headers=headers,
                cookies=cookies,
                timeout=300
            )
            response.raise_for_status()
            
            # Calculate response time
            response_time = time.time() - start_time
            
            result = response.json()
            content = result.get("message", {}).get("content", "")
            
            # Log response details
            response_info = {
                "request_id": request_id,
                "response_time_ms": round(response_time * 1000, 2),
                "content_length": len(content),
                "content_preview": content[:200] + "..." if len(content) > 200 else content,
                "status_code": response.status_code
            }
            logger.info(f"📥 LLM Response Received - {response_info}")
            json_logger.info(json.dumps({"event": "response_received", "timestamp": datetime.now().isoformat(), **response_info}))
            
            ai_message = AIMessage(content=content)
            
            # Handle tool calls if present in response
            message_data = result.get("message", {})
            if "tool_calls" in message_data and message_data["tool_calls"]:
                # Convert Ollama tool calls to LangChain format
                tool_calls = []
                for i, tc in enumerate(message_data["tool_calls"]):
                    tool_call = {
                        "name": tc.get("function", {}).get("name", ""),
                        "args": tc.get("function", {}).get("arguments", {}),
                        "id": str(hash(str(tc)))  # Generate a simple ID
                    }
                    tool_calls.append(tool_call)
                    
                    # Log each tool call
                    tool_call_info = {
                        "request_id": request_id,
                        "tool_name": tool_call["name"],
                        "tool_args": tool_call["args"],
                        "tool_id": tool_call["id"]
                    }
                    logger.info(f"🔧 Tool Call {i+1} - {tool_call_info}")
                    json_logger.info(json.dumps({"event": "tool_call", "timestamp": datetime.now().isoformat(), **tool_call_info}))
                
                ai_message.tool_calls = tool_calls
                
                tool_complete_info = {
                    "request_id": request_id,
                    "total_tool_calls": len(tool_calls),
                    "tool_names": [tc["name"] for tc in tool_calls]
                }
                logger.info(f"🎯 Tool Calling Complete - {tool_complete_info}")
                json_logger.info(json.dumps({"event": "tool_calling_complete", "timestamp": datetime.now().isoformat(), **tool_complete_info}))
            else:
                text_info = {
                    "request_id": request_id,
                    "has_thinking": "<think>" in content
                }
                logger.debug(f"💬 Text-Only Response - {text_info}")
            
            # Log successful completion
            completion_info = {
                "request_id": request_id,
                "total_time_ms": round(response_time * 1000, 2),
                "success": True,
                "tool_calls_made": len(tool_calls) if "tool_calls" in locals() else 0
            }
            logger.info(f"✅ LLM Request Complete - {completion_info}")
            json_logger.info(json.dumps({"event": "request_complete", "timestamp": datetime.now().isoformat(), **completion_info}))
            
            return ai_message
            
        except Exception as e:
            error_time = time.time() - start_time
            
            # Log detailed error
            error_info = {
                "request_id": request_id,
                "error_type": type(e).__name__,
                "error_message": str(e),
                "error_time_ms": round(error_time * 1000, 2),
                "model": self.model,
                "endpoint": f"{self.base_url}/api/chat"
            }
            logger.error(f"❌ LLM Request Failed - {error_info}")
            json_logger.error(json.dumps({"event": "request_failed", "timestamp": datetime.now().isoformat(), **error_info}))
            
            return AIMessage(content=f"Error calling Ollama: {e}")
    
    @property
    def _llm_type(self) -> str:
        return "ollama"


def get_chat_ollama(model: Optional[str] = None) -> ChatOllama:
    """Return a ChatOllama instance optimized for tool calling.
    
    Args:
        model: Model name (qwen3:14b recommended for tool calling)
    
    Returns:
        ChatOllama instance configured for your Vast.ai GPU with tool calling support
    """
    chosen_model = model or os.environ.get("OLLAMA_MODEL", "qwen3:14b")
    base_url = os.environ.get("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
    token = os.environ.get("OLLAMA_TOKEN", "")
    
    print(f"🤖 Using Ollama model: {chosen_model} (Tool calling optimized)")
    print(f"🔗 Endpoint: {base_url}")
    print(f"🛠️  Tool calling: ✅ Enabled")
    
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
        base_url = os.environ.get("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
        token = os.environ.get("OLLAMA_TOKEN", "")
        
        # Use cookie authentication for Caddy proxy only if token provided
        cookies = {f"C.25124719_auth_token": token} if token else None
        response = requests.get(f"{base_url}/api/tags", cookies=cookies, timeout=10)
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