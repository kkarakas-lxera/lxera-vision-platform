from __future__ import annotations

import uuid
from typing import Any, Dict, Optional

from typing_extensions import TypedDict

from .state import GraphState
from .graph import build_graph as build_placeholder_graph
from ..persistence.checkpointer import SupabaseCheckpointSaver


def _build_langgraph(supabase_client=None):
    """Build a minimal LangGraph using the stub nodes and Supabase checkpointer."""
    try:
        from langgraph.graph import StateGraph, START, END
    except Exception as exc:  # pragma: no cover
        raise RuntimeError("LangGraph is not installed. Please add `langgraph` to requirements.") from exc

    # Import nodes
    from ..nodes.planning import planning_node
    from ..nodes.research import research_node
    from ..nodes.content import content_node

    builder = StateGraph(GraphState)
    builder.add_node("planning", planning_node)
    builder.add_node("research", research_node)
    builder.add_node("content", content_node)
    builder.add_edge(START, "planning")
    builder.add_edge("planning", "research")
    builder.add_edge("research", "content")
    builder.add_edge("content", END)

    # Use provided Supabase client if available, otherwise create new one
    checkpointer = SupabaseCheckpointSaver(supabase_client=supabase_client)
    graph = builder.compile(checkpointer=checkpointer)
    return graph


def start_job(job_id: str, thread_id: Optional[str] = None, extra_state: Optional[Dict[str, Any]] = None, supabase_client=None) -> Dict[str, Any]:
    """Start a LangGraph job with Planning → Research → Content pipeline.

    Uses DeepSeek-R1 8B and Qwen3 14B via Ollama on RTX 4090 GPU for AI inference.
    Returns a status dictionary including thread_id and phase.
    """
    print(f"🚀 LangGraph Pipeline Starting")
    print(f"   Job ID: {job_id}")
    print(f"   Thread ID: {thread_id or 'auto-generated'}")
    print(f"   Pipeline: Planning → Research → Content")
    print(f"   AI Models: DeepSeek-R1 8B + Qwen3 14B (Ollama GPU)")
    
    graph = _build_langgraph(supabase_client=supabase_client)
    thread = thread_id or str(uuid.uuid4())
    config = {"configurable": {"thread_id": thread}}
    initial_state: GraphState = {
        "job_id": job_id,
        "status": "planning",
        "errors": [],
        "metrics": {},
    }
    if extra_state:
        initial_state.update(extra_state)  # merge caller-provided fields
        print(f"   Employee: {extra_state.get('employee_name', 'Unknown')}")
        print(f"   Mode: {extra_state.get('generation_mode', 'individual')}")
    
    print(f"🎯 Executing LangGraph pipeline...")
    # Run the graph to completion for now (no interrupts yet)
    graph.invoke(initial_state, config=config)
    print(f"✅ LangGraph pipeline completed successfully")
    
    return {
        "ok": True,
        "thread_id": thread,
        "job_id": job_id,
        "phase": "complete",
    }


def resume_job(thread_id: str, checkpoint_id: Optional[str] = None) -> Dict[str, Any]:
    """Resume a job from a checkpoint (or latest if none specified)."""
    graph = _build_langgraph()
    cfg: Dict[str, Any] = {"configurable": {"thread_id": thread_id}}
    if checkpoint_id:
        cfg["configurable"]["checkpoint_id"] = checkpoint_id
    graph.invoke(None, config=cfg)
    return {
        "ok": True,
        "thread_id": thread_id,
        "phase": "complete",
    }


def get_status(thread_id: str) -> Dict[str, Any]:
    """Get the latest state snapshot for a thread."""
    graph = _build_langgraph()
    cfg: Dict[str, Any] = {"configurable": {"thread_id": thread_id}}
    state = graph.get_state(cfg)
    values = getattr(state, "values", None) or state.get("values", {})  # type: ignore[assignment]
    next_nodes = getattr(state, "next", None) or state.get("next", [])  # type: ignore[assignment]
    return {
        "ok": True,
        "thread_id": thread_id,
        "values": values,
        "next": list(next_nodes) if next_nodes else [],
    }


