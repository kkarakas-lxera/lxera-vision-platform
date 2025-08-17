"""Tools module for OpenAI Agents Course Generator."""

# Import only agentic tools to avoid import errors during testing

# Research tools (confirmed working)
try:
    from .research_tools import (
        firecrawl_search,
        scrape_do_extract,
        research_synthesizer
    )
except ImportError:
    print("Warning: Could not import research_tools")
    firecrawl_search = None
    scrape_do_extract = None
    research_synthesizer = None

# Skip problematic imports for now - focus on agentic tools
# from .content_tools import (...)
# from .quality_tools import (...)
# etc.

__all__ = [
    # Research tools (working)
    "firecrawl_search",
    "scrape_do_extract",
    "research_synthesizer"
]