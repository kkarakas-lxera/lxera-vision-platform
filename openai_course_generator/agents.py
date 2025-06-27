"""
Comprehensive Agents Module for LXERA Pipeline
Provides full OpenAI-based agent functionality with tool calling and async support
"""

import os
import json
import logging
import asyncio
import inspect
from typing import Dict, Any, List, Optional, Callable, Union
from openai import OpenAI
from functools import wraps

logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

class Agent:
    """
    Comprehensive Agent class that supports OpenAI function calling and tool integration
    """
    
    def __init__(self, 
                 name: str, 
                 instructions: str, 
                 model: str = "gpt-4o-mini",
                 tools: Optional[List[Callable]] = None,
                 handoffs: Optional[List] = None,
                 **kwargs):
        self.name = name
        self.instructions = instructions
        self.model = model
        self.tools = tools or []
        self.handoffs = handoffs or []
        self.temperature = kwargs.get('temperature', 0.1)
        self.max_tokens = kwargs.get('max_tokens', 4096)
        
        # Convert tools to OpenAI function format
        self.openai_tools = self._prepare_tools()
        
    def _prepare_tools(self) -> List[Dict[str, Any]]:
        """Convert tool functions to OpenAI function calling format"""
        openai_tools = []
        
        for tool in self.tools:
            if hasattr(tool, '_is_tool'):
                # Get function signature and docstring
                func = tool._original_function if hasattr(tool, '_original_function') else tool
                sig = inspect.signature(func)
                doc = func.__doc__ or f"Execute {func.__name__}"
                
                # Build parameters schema
                parameters = {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
                
                for param_name, param in sig.parameters.items():
                    param_type = "string"  # Default type
                    if param.annotation != inspect.Parameter.empty:
                        if param.annotation == int:
                            param_type = "integer"
                        elif param.annotation == float:
                            param_type = "number"
                        elif param.annotation == bool:
                            param_type = "boolean"
                        elif param.annotation == list:
                            param_type = "array"
                        elif param.annotation == dict:
                            param_type = "object"
                    
                    parameters["properties"][param_name] = {"type": param_type}
                    
                    if param.default == inspect.Parameter.empty:
                        parameters["required"].append(param_name)
                
                openai_tools.append({
                    "type": "function",
                    "function": {
                        "name": func.__name__,
                        "description": doc,
                        "parameters": parameters
                    }
                })
        
        return openai_tools
    
    def _execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Any:
        """Execute a tool function by name"""
        for tool in self.tools:
            func = tool._original_function if hasattr(tool, '_original_function') else tool
            if func.__name__ == tool_name:
                try:
                    return tool(**arguments)
                except Exception as e:
                    logger.error(f"Tool {tool_name} failed: {e}")
                    return f"Error executing {tool_name}: {str(e)}"
        
        return f"Tool {tool_name} not found"
    
    async def run(self, 
                  messages: Union[str, List[Dict[str, str]]], 
                  **kwargs) -> Dict[str, Any]:
        """
        Run the agent with given messages, supporting tool calling
        """
        try:
            # Handle string input
            if isinstance(messages, str):
                messages = [{"role": "user", "content": messages}]
            
            # Prepare system message
            system_message = {
                "role": "system", 
                "content": self.instructions
            }
            
            # Combine system message with user messages
            all_messages = [system_message] + messages
            
            # Prepare OpenAI request
            request_params = {
                "model": self.model,
                "messages": all_messages,
                "temperature": self.temperature,
                "max_tokens": self.max_tokens
            }
            
            # Add tools if available
            if self.openai_tools:
                request_params["tools"] = self.openai_tools
                request_params["tool_choice"] = "auto"
            
            # Call OpenAI
            response = client.chat.completions.create(**request_params)
            
            message = response.choices[0].message
            content = message.content
            tool_calls = message.tool_calls
            
            # Handle tool calls
            tool_results = []
            if tool_calls:
                for tool_call in tool_calls:
                    function_name = tool_call.function.name
                    arguments = json.loads(tool_call.function.arguments)
                    
                    logger.info(f"Executing tool: {function_name} with args: {arguments}")
                    result = self._execute_tool(function_name, arguments)
                    tool_results.append({
                        "tool": function_name,
                        "arguments": arguments,
                        "result": result
                    })
            
            return {
                "success": True,
                "content": content,
                "tool_calls": tool_results,
                "usage": response.usage.model_dump() if response.usage else {},
                "model": self.model,
                "raw_response": message
            }
            
        except Exception as e:
            logger.error(f"Agent {self.name} failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "content": None,
                "tool_calls": []
            }
    
    def run_sync(self, messages: Union[str, List[Dict[str, str]]], **kwargs) -> Dict[str, Any]:
        """Synchronous version of run"""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(self.run(messages, **kwargs))
        finally:
            loop.close()

def function_tool(func: Callable) -> Callable:
    """
    Decorator to mark functions as tools for agents
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            result = func(*args, **kwargs)
            logger.info(f"Tool {func.__name__} executed successfully")
            return result
        except Exception as e:
            logger.error(f"Tool {func.__name__} failed: {e}")
            raise
    
    # Add metadata for tool discovery
    wrapper._is_tool = True
    wrapper._original_function = func
    wrapper.__name__ = func.__name__
    wrapper.__doc__ = func.__doc__
    
    return wrapper

def create_agent(name: str, 
                instructions: str, 
                model: str = "gpt-4o-mini",
                tools: Optional[List[Callable]] = None,
                handoffs: Optional[List] = None,
                **kwargs) -> Agent:
    """
    Factory function to create agents with full functionality
    """
    return Agent(
        name=name, 
        instructions=instructions, 
        model=model,
        tools=tools,
        handoffs=handoffs,
        **kwargs
    )