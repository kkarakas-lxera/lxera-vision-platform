"""
Comprehensive Agents Module for LXERA Pipeline
Provides full OpenAI-based agent functionality with tool calling and async support
Now using official OpenAI Agents SDK with tracing support
"""

import os
import json
import logging
import asyncio
import inspect
from typing import Dict, Any, List, Optional, Callable, Union
from functools import wraps

# Try to import official SDK first, fallback to custom implementation
try:
    # Import from the official agents SDK
    from agents import (
        Agent as OpenAIAgent, 
        Runner as SDKRunner, 
        function_tool as sdk_function_tool,
        handoff,
        trace,
        Trace,
        Span
    )
    
    OFFICIAL_SDK = True
    logger = logging.getLogger(__name__)
    logger.info("✅ Using official OpenAI Agents SDK with tracing support")
    
    # Create FunctionTool class for compatibility with storage tools
    class FunctionTool:
        def __init__(self, name: str, description: str, params_json_schema: dict, on_invoke_tool: Callable):
            self.name = name
            self.description = description
            self.params_json_schema = params_json_schema
            self.on_invoke_tool = on_invoke_tool
            
        def __call__(self, *args, **kwargs):
            return self.on_invoke_tool(*args, **kwargs)
    
    # Export trace and related functionality for use in other modules
    __all__ = ['Agent', 'Runner', 'function_tool', 'FunctionTool', 'handoff', 'create_agent', 'trace', 'OFFICIAL_SDK']
    
except ImportError as e:
    logger = logging.getLogger(__name__)
    logger.warning(f"⚠️ Official OpenAI Agents SDK not found: {e}")
    logger.warning("Falling back to custom implementation without tracing")
    OFFICIAL_SDK = False
    from openai import OpenAI
    
    # Create dummy trace context manager for compatibility
    from contextlib import contextmanager
    @contextmanager
    def trace(name: str):
        """Dummy trace for compatibility when SDK not available"""
        yield
    
    # Create dummy handoff function for compatibility
    def handoff(agent, **kwargs):
        """Dummy handoff for compatibility when SDK not available"""
        return agent
    
    # Create FunctionTool class for compatibility (fallback)
    class FunctionTool:
        def __init__(self, name: str, description: str, params_json_schema: dict, on_invoke_tool: Callable):
            self.name = name
            self.description = description
            self.params_json_schema = params_json_schema
            self.on_invoke_tool = on_invoke_tool
            
        def __call__(self, *args, **kwargs):
            return self.on_invoke_tool(*args, **kwargs)
    
    __all__ = ['Agent', 'Runner', 'function_tool', 'FunctionTool', 'handoff', 'create_agent', 'trace', 'OFFICIAL_SDK']
    
    # Initialize OpenAI client with fallback handling
    def get_openai_client():
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            logger.warning("OPENAI_API_KEY not found - some functionality will be limited")
            return None
        return OpenAI(api_key=api_key)
    
    client = None  # Will be initialized when needed

class Agent:
    """
    Comprehensive Agent class that supports OpenAI function calling and tool integration
    Now with official SDK support for proper tracing
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
        
        if OFFICIAL_SDK:
            # Create official SDK agent with tools
            sdk_tools = []
            for tool in self.tools:
                if hasattr(tool, '_is_tool'):
                    func = tool._original_function if hasattr(tool, '_original_function') else tool
                    # Wrap function with sdk_function_tool decorator
                    sdk_tools.append(sdk_function_tool(func))
                else:
                    sdk_tools.append(tool)
            
            # Pass handoffs to SDK agent
            self._sdk_agent = OpenAIAgent(
                name=name,
                instructions=instructions,
                model=model,
                tools=sdk_tools,
                handoffs=self.handoffs  # Pass handoffs to SDK agent
            )
        else:
            # Convert tools to OpenAI function format for fallback
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
        Uses official SDK with tracing when available
        """
        if OFFICIAL_SDK:
            # Use official SDK with automatic tracing
            try:
                # Convert messages to string if needed
                if isinstance(messages, str):
                    user_message = messages
                else:
                    # Extract user content from messages
                    user_message = " ".join([m["content"] for m in messages if m["role"] == "user"])
                
                # Run with tracing enabled
                result = await SDKRunner.run(self._sdk_agent, user_message)
                
                # Convert SDK result to our format
                return {
                    "success": True,
                    "content": result.final_output,
                    "tool_calls": [{"tool": t.name, "result": t.result} for t in result.tool_calls] if hasattr(result, 'tool_calls') else [],
                    "usage": result.usage if hasattr(result, 'usage') else {},
                    "model": self.model,
                    "messages": result.messages if hasattr(result, 'messages') else []
                }
            except Exception as e:
                logger.error(f"Agent {self.name} failed with SDK: {e}")
                return {
                    "success": False,
                    "error": str(e),
                    "content": None,
                    "tool_calls": []
                }
        else:
            # Fallback to original implementation
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
                
                # Get OpenAI client (lazy initialization)
                global client
                if client is None:
                    client = get_openai_client()
                    if client is None:
                        raise Exception("OpenAI API key not configured")
                
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


class Runner:
    """
    Runner class for executing agent conversations with OpenAI SDK
    Now with official SDK tracing support
    """
    
    @staticmethod
    async def run(agent: Agent, input: str, max_turns: int = 10, progress_callback: Optional[Callable] = None, trace_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Run an agent conversation with tool calling support
        
        Args:
            agent: Agent instance to run
            input: Initial user message
            max_turns: Maximum conversation turns
            progress_callback: Optional callback for progress updates
            trace_name: Optional name for the trace (SDK only)
            
        Returns:
            Dict with conversation results including content_id if applicable
        """
        if OFFICIAL_SDK:
            # Use official SDK Runner with tracing
            try:
                # Create trace context if name provided
                if trace_name:
                    with trace(trace_name):
                        result = await SDKRunner.run(
                            agent._sdk_agent,
                            input,
                            max_turns=max_turns
                        )
                else:
                    result = await SDKRunner.run(
                        agent._sdk_agent,
                        input,
                        max_turns=max_turns
                    )
                
                # Extract content_id if present
                # Check what attributes the result has
                result_attrs = dir(result)
                logger.info(f"RunResult attributes: {[attr for attr in result_attrs if not attr.startswith('_')]}")
                
                # Return the raw RunResult object for test scripts
                # The test scripts need access to raw_responses to extract IDs
                return result
                
            except Exception as e:
                logger.error(f"SDK Runner failed for agent {agent.name}: {e}")
                logger.error(f"Error type: {type(e).__name__}")
                import traceback
                logger.error(f"Traceback: {traceback.format_exc()}")
                return {
                    "error": str(e),
                    "success": False,
                    "agent_name": agent.name
                }
        else:
            # Fallback to original implementation
            global client
            if not client:
                client = get_openai_client()
                
            if not client:
                logger.error("OpenAI client not available")
                return {"error": "OpenAI client not initialized", "success": False}
            
        try:
            logger.info(f"🤖 Starting agent: {agent.name}")
            messages = [
                {"role": "system", "content": agent.instructions},
                {"role": "user", "content": input}
            ]
            
            result_data = {}
            
            for turn in range(max_turns):
                logger.info(f"🔄 Agent {agent.name} - Turn {turn + 1}/{max_turns}")
                
                # Call OpenAI API with tools
                response = client.chat.completions.create(
                    model=agent.model,
                    messages=messages,
                    tools=agent.openai_tools if agent.openai_tools else None,
                    tool_choice="auto" if agent.openai_tools else None,
                    temperature=agent.temperature,
                    max_tokens=agent.max_tokens
                )
                
                message = response.choices[0].message
                messages.append(message.model_dump())
                
                # Handle tool calls if present
                if message.tool_calls:
                    for tool_call in message.tool_calls:
                        tool_name = tool_call.function.name
                        tool_args = json.loads(tool_call.function.arguments)
                        
                        logger.info(f"🔧 Calling tool: {tool_name}")
                        
                        # Find and execute the tool
                        tool_func = None
                        for tool in agent.tools:
                            if tool.__name__ == tool_name:
                                tool_func = tool
                                break
                                
                        if tool_func:
                            try:
                                # Execute the tool
                                if asyncio.iscoroutinefunction(tool_func):
                                    result = await tool_func(**tool_args)
                                else:
                                    result = tool_func(**tool_args)
                                
                                logger.info(f"✅ Tool {tool_name} completed")
                                
                                # Extract content_id if present in tool result
                                if isinstance(result, str) and 'content_id:' in result:
                                    content_id = result.split('content_id:')[1].strip().split()[0]
                                    result_data['content_id'] = content_id
                                    logger.info(f"📝 Captured content_id: {content_id}")
                                
                                # Add tool result to messages
                                messages.append({
                                    "role": "tool",
                                    "tool_call_id": tool_call.id,
                                    "content": str(result)
                                })
                                
                                # Progress callback if provided
                                if progress_callback:
                                    await progress_callback(agent.name, tool_name, turn + 1)
                                    
                            except Exception as e:
                                logger.error(f"Tool {tool_name} failed: {e}")
                                messages.append({
                                    "role": "tool",
                                    "tool_call_id": tool_call.id,
                                    "content": f"Error: {str(e)}"
                                })
                        else:
                            logger.warning(f"Tool {tool_name} not found")
                            messages.append({
                                "role": "tool",
                                "tool_call_id": tool_call.id,
                                "content": f"Tool {tool_name} not found"
                            })
                else:
                    # No tool calls, check if agent wants to finish
                    if message.content and any(phrase in message.content.lower() for phrase in ['completed', 'finished', 'done']):
                        logger.info(f"✅ Agent {agent.name} completed")
                        break
                    
            # Extract final content and any content_id
            final_content = messages[-1].get("content", "")
            
            # Check for content_id in final message
            if 'content_id:' in final_content and 'content_id' not in result_data:
                content_id = final_content.split('content_id:')[1].strip().split()[0]
                result_data['content_id'] = content_id
                
            # Return comprehensive results
            return {
                "content": final_content,
                "messages": messages,
                "turns": turn + 1,
                "success": True,
                "agent_name": agent.name,
                **result_data  # Include any extracted data like content_id
            }
            
        except Exception as e:
            logger.error(f"Agent {agent.name} run failed: {e}")
            return {
                "error": str(e),
                "success": False,
                "agent_name": agent.name
            }