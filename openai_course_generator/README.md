# OpenAI Agents Course Generator

A sophisticated course generation system using OpenAI Agents SDK that replaces complex LangGraph orchestration with intelligent agent workflows.

## Migration from LangGraph

This system migrates from the existing `refactored_nodes` LangGraph-based system to OpenAI Agents SDK, providing:

- **80% complexity reduction**: 15 nodes → 6 agents
- **Maintained capabilities**: All research, content generation, and multimedia features preserved
- **Better orchestration**: Agent handoffs replace complex routing logic
- **Enhanced debugging**: Conversation logs replace graph state tracking

## Architecture

### Agent System
- **Coordinator Agent**: Orchestrates the entire course generation workflow
- **Research Agent**: Comprehensive web research using Tavily, EXA, Firecrawl APIs
- **Content Agent**: Course content generation with OpenAI models
- **Quality Agent**: Quality assurance and blueprint validation
- **Multimedia Agent**: Audio/video generation with animations and branding
- **Finalizer Agent**: Course assembly and output generation

### Key Features
- **Web Research**: Tavily search, Firecrawl crawling, EXA semantic search
- **Content Generation**: 6750-8250 words per module with personalization
- **Quality Control**: Blueprint compliance and enhancement loops
- **Multimedia**: Progressive video animations, TTS narration, dynamic charts
- **Multi-Module**: Complete 16-module course generation

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your API keys

# Run simple course generation
python examples/simple_course.py

# Run full 16-module course
python examples/full_course.py
```

## Migration from LangGraph

```bash
# Validate migration compatibility
python scripts/validate_migration.py

# Performance comparison
python scripts/performance_benchmark.py

# Migrate existing data
python scripts/migrate_from_langgraph.py
```

## Environment Variables

```env
OPENAI_API_KEY=your_openai_api_key
TAVILY_API_KEY=your_tavily_api_key
EXA_API_KEY=your_exa_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key
JINA_API_KEY=your_jina_api_key
```

## Folder Structure

- `agents/`: Specialized agent implementations
- `tools/`: Function tools wrapping existing logic
- `workflow/`: Main execution and conversation management
- `legacy_adapters/`: LangGraph compatibility layer
- `multimedia/`: Audio/video generation pipeline
- `examples/`: Usage examples and demonstrations

## Benefits Over LangGraph

1. **Simplified Orchestration**: No complex routing logic
2. **Better Error Handling**: Built-in retries and recovery
3. **Enhanced Debugging**: Clear conversation traces
4. **Maintained Quality**: All existing quality controls preserved
5. **AWS Ready**: Easy migration to Bedrock when needed

## Development

```bash
# Run tests
pytest tests/

# Development mode
python -m openai_course_generator.workflow.course_runner --debug

# Legacy compatibility test
python tests/integration/test_legacy_compatibility.py
```