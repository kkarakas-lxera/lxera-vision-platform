"""
Simple stub for lxera_agents to allow pipeline testing without the full SDK.
This replaces the private lxera-agents package for deployment.
"""

def function_tool(func):
    """Simple decorator that mimics lxera_agents.function_tool"""
    # Just return the function as-is for now
    # The actual function_tool decorator adds tracing/monitoring
    return func

# If there are other imports needed, add them here
# For example:
# class Agent: pass
# class Tool: pass