"""Workflow module for OpenAI Agents Course Generator."""

from .course_runner import CourseRunner

try:
    from .conversation_manager import ConversationManager
except ImportError:
    ConversationManager = None

try:
    from .progress_tracker import ProgressTracker
except ImportError:
    ProgressTracker = None

__all__ = [
    "CourseRunner",
]
if ConversationManager:
    __all__.append("ConversationManager")
if ProgressTracker:
    __all__.append("ProgressTracker")