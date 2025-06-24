# Quality Loop Implementation

## Overview
This document describes the minimal changes made to implement quality checking with revision loops and fix the research context length issue.

## Changes Made

### 1. Research Context Fix
**File:** `tools/research_tools.py`
- Changed `research_synthesizer` truncation from 12000 to 8000 characters
- This prevents context length exceeded errors when multiple Tavily queries accumulate

### 2. Quality Revision Loop
**File:** `course_agents/quality_agent.py`
- Enabled handoffs: `handoffs=["content_agent", "research_agent"]`
- Quality agent can now send content back for revision

**File:** `course_agents/content_agent.py`
- Added handoff to quality: `handoffs=["quality_agent"]`
- Ensures content flows to quality check

**File:** `config/agent_configs.py`
- Added instruction for targeted revisions in content agent
- Content agent now focuses on specific improvements rather than full regeneration

**File:** `tools/quality_tools.py`
- Enhanced `enhancement_suggester` to track revision attempts
- Limits suggestions to top 3 for focused improvements
- Adds revision counter to prevent infinite loops (max 2 revisions)

## How It Works

1. **Research Phase**: Research agent gathers information, synthesizer truncates to prevent overflow
2. **Content Generation**: Content agent creates module content
3. **Quality Check**: Quality agent evaluates content
   - If score >= 7.5: Pass to multimedia agent
   - If score 6.0-7.4: Send back to content agent with specific feedback
   - If score < 6.0: Send to research agent for more information
4. **Revision**: Content agent receives feedback and improves specific areas
5. **Re-evaluation**: Quality agent checks again (max 2 revision attempts)

## Testing
Run `python test_quality_loop.py` to test:
- Research context handling with 10 queries
- Quality revision loop with intentionally basic content

## Benefits
- Minimal code changes (< 10 lines modified)
- Uses existing agent handoff system
- Preserves research quality while managing context
- Enables targeted content improvements
- Automatic quality enforcement