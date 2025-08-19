#!/usr/bin/env python3
"""
Canvas Instruction Generator - AI Visual Generation
Generates Canvas JSON instructions using LLM orchestration with fallback logic
"""

import os
import json
import logging
import asyncio
from typing import Dict, Any, Optional, List, Union, Tuple
from dataclasses import dataclass
from enum import Enum
import time

# External dependencies
import openai
from groq import Groq

# Import our schemas
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from validators.schema import (
    VisualSpec, CanvasInstructions, CanvasElement, 
    VisualIntent, DataSpec, RenderingPath
)

logger = logging.getLogger(__name__)


class LLMModel(Enum):
    """Available LLM models for visual generation"""
    GROQ_8B = "llama-3.1-8b-instant"
    GROQ_70B = "llama-3.1-70b-versatile"
    OPENAI_GPT4 = "gpt-4o-mini"


@dataclass
class GenerationAttempt:
    """Track generation attempts for debugging and optimization"""
    model: LLMModel
    prompt_tokens: int
    completion_tokens: int
    duration_ms: int
    success: bool
    error: Optional[str] = None


@dataclass
class GenerationResult:
    """Result of Canvas instruction generation"""
    canvas_instructions: Optional[CanvasInstructions]
    attempts: List[GenerationAttempt]
    total_cost_usd: float
    total_duration_ms: int
    success: bool
    final_error: Optional[str] = None


class PromptTemplates:
    """Production-ready prompt templates for different visual types"""
    
    BASE_SYSTEM_PROMPT = """You are an expert data visualization designer. Generate Canvas JSON instructions that create clear, professional visualizations.

CRITICAL REQUIREMENTS:
1. Output ONLY valid JSON - no markdown, no explanations, no code blocks
2. Follow the exact CanvasInstructions schema
3. Use appropriate colors from the theme palette
4. Ensure text is readable (proper contrast, sizing)
5. Position elements to avoid overlaps
6. Keep designs clean and professional

Canvas coordinate system: (0,0) is top-left, positive X goes right, positive Y goes down.
Standard canvas size: 800x600 pixels unless specified otherwise.

Respond with ONLY the JSON object - nothing else."""

    CHART_GENERATION_PROMPTS = {
        "bar_chart": """Generate a {orientation} bar chart with the following data:
{data_json}

Requirements:
- Chart title: "{title}"
- {orientation} bars with proper spacing
- Data labels on bars
- Clean axis lines and labels
- Use theme colors consistently
- Ensure all text is readable""",

        "line_chart": """Generate a line chart with the following data:
{data_json}

Requirements:
- Chart title: "{title}"
- Connected line with data points
- X and Y axis with labels
- Grid lines for readability
- Data point values displayed
- Use theme colors consistently""",

        "pie_chart": """Generate a pie chart with the following data:
{data_json}

Requirements:
- Chart title: "{title}"
- Pie slices with percentage labels
- Legend with category names
- Different colors for each slice
- Clean, professional appearance""",

        "scatter_plot": """Generate a scatter plot with the following data:
{data_json}

Requirements:
- Chart title: "{title}"
- Data points as circles
- X and Y axis with labels
- Grid lines for reference
- If correlation exists, show trend line
- Use theme colors consistently""",

        "timeline": """Generate a timeline visualization with the following data:
{data_json}

Requirements:
- Chart title: "{title}"
- Horizontal timeline with events
- Event markers and labels
- Date/time indicators
- Clean, chronological layout""",

        "process_flow": """Generate a process flow diagram with the following steps:
{data_json}

Requirements:
- Chart title: "{title}"
- Connected boxes representing steps
- Flow arrows between steps
- Clear step labels
- Professional business diagram style""",

        "comparison": """Generate a comparison visualization with the following data:
{data_json}

Requirements:
- Chart title: "{title}"
- Side-by-side or overlay comparison
- Clear labeling of compared items
- Highlighting differences/similarities
- Use contrasting colors for clarity"""
    }

    @classmethod
    def get_prompt(cls, visual_intent: VisualIntent, data_spec: DataSpec, **kwargs) -> str:
        """Generate appropriate prompt based on visual intent and data"""
        
        # Prepare data JSON string from data_points
        if data_spec.data_points:
            # Convert DataPoint objects to simple dict format for prompts
            data_for_prompt = [
                {"name": dp.label, "value": dp.value} 
                for dp in data_spec.data_points
            ]
            data_json = json.dumps(data_for_prompt, indent=2)
        else:
            data_json = "[]"
        
        # Get title or use default
        title = kwargs.get('title', f"{visual_intent.value.replace('_', ' ').title()}")
        
        # Special handling for bar charts
        if visual_intent == VisualIntent.BAR_CHART:
            orientation = kwargs.get('orientation', 'vertical')
            template = cls.CHART_GENERATION_PROMPTS["bar_chart"]
            return template.format(
                orientation=orientation,
                data_json=data_json,
                title=title
            )
        
        # Get template based on visual intent
        template_key = visual_intent.value.lower()
        if template_key in cls.CHART_GENERATION_PROMPTS:
            template = cls.CHART_GENERATION_PROMPTS[template_key]
            return template.format(
                data_json=data_json,
                title=title
            )
        
        # Fallback for unknown types
        return f"""Generate a {visual_intent.value.replace('_', ' ')} visualization with the following data:
{data_json}

Requirements:
- Chart title: "{title}"
- Clear, professional visualization
- Appropriate layout for the data type
- Use theme colors consistently
- Ensure all text is readable"""


class LLMRouter:
    """LLM orchestration with intelligent model selection and fallback"""
    
    def __init__(self):
        self.groq_client = None
        self.openai_client = None
        
        # Initialize Groq client
        if os.getenv('GROQ_API_KEY'):
            self.groq_client = Groq(api_key=os.getenv('GROQ_API_KEY'))
        
        # Initialize OpenAI client
        if os.getenv('OPENAI_API_KEY'):
            self.openai_client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    
    def estimate_complexity(self, visual_spec: VisualSpec) -> str:
        """Estimate visual complexity to choose appropriate model"""
        data_points = len(visual_spec.dataspec.raw_data) if visual_spec.dataspec.raw_data else 0
        
        # Simple heuristics for model selection
        if data_points > 50 or visual_spec.intent in [
            VisualIntent.COMPLEX_DIAGRAM, 
            VisualIntent.CUSTOM_VISUALIZATION
        ]:
            return "high"
        elif data_points > 20 or visual_spec.intent in [
            VisualIntent.SCATTER_PLOT, 
            VisualIntent.TIMELINE,
            VisualIntent.PROCESS_FLOW
        ]:
            return "medium"
        else:
            return "low"
    
    def get_model_sequence(self, complexity: str) -> List[LLMModel]:
        """Get model sequence based on complexity"""
        if complexity == "high":
            return [LLMModel.GROQ_70B, LLMModel.OPENAI_GPT4]
        elif complexity == "medium":
            return [LLMModel.GROQ_70B, LLMModel.GROQ_8B, LLMModel.OPENAI_GPT4]
        else:
            return [LLMModel.GROQ_8B, LLMModel.GROQ_70B, LLMModel.OPENAI_GPT4]
    
    async def generate_with_model(self, model: LLMModel, prompt: str, system_prompt: str) -> Tuple[Optional[Dict], GenerationAttempt]:
        """Generate Canvas instructions with specific model"""
        start_time = time.time()
        attempt = GenerationAttempt(
            model=model,
            prompt_tokens=0,
            completion_tokens=0,
            duration_ms=0,
            success=False
        )
        
        try:
            if model in [LLMModel.GROQ_8B, LLMModel.GROQ_70B]:
                if not self.groq_client:
                    raise Exception("Groq client not initialized - missing API key")
                
                response = self.groq_client.chat.completions.create(
                    model=model.value,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.1,
                    max_tokens=4000,
                    top_p=0.9
                )
                
                content = response.choices[0].message.content
                attempt.prompt_tokens = response.usage.prompt_tokens if response.usage else 0
                attempt.completion_tokens = response.usage.completion_tokens if response.usage else 0
                
            elif model == LLMModel.OPENAI_GPT4:
                if not self.openai_client:
                    raise Exception("OpenAI client not initialized - missing API key")
                
                response = self.openai_client.chat.completions.create(
                    model=model.value,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.1,
                    max_tokens=4000,
                    response_format={"type": "json_object"}  # Force JSON output
                )
                
                content = response.choices[0].message.content
                attempt.prompt_tokens = response.usage.prompt_tokens if response.usage else 0
                attempt.completion_tokens = response.usage.completion_tokens if response.usage else 0
            
            # Parse JSON response
            if content:
                content = content.strip()
                # Remove markdown code blocks if present
                if content.startswith("```json"):
                    content = content[7:]
                if content.endswith("```"):
                    content = content[:-3]
                content = content.strip()
                
                canvas_data = json.loads(content)
                attempt.success = True
                return canvas_data, attempt
            
        except json.JSONDecodeError as e:
            attempt.error = f"JSON decode error: {str(e)}"
        except Exception as e:
            attempt.error = f"Generation error: {str(e)}"
        
        finally:
            attempt.duration_ms = int((time.time() - start_time) * 1000)
        
        return None, attempt


class CanvasInstructionGenerator:
    """Main class for generating Canvas instructions from VisualSpec"""
    
    def __init__(self):
        self.llm_router = LLMRouter()
        self.prompt_templates = PromptTemplates()
    
    def validate_canvas_instructions(self, canvas_data: Dict[str, Any]) -> Optional[CanvasInstructions]:
        """Validate and convert raw JSON to CanvasInstructions schema"""
        try:
            # Use Pydantic validation
            canvas_instructions = CanvasInstructions.model_validate(canvas_data)
            
            # Additional business logic validation
            if not canvas_instructions.elements:
                logger.warning("Canvas instructions contain no elements")
                return None
            
            # Check for reasonable bounds
            if canvas_instructions.width > 4000 or canvas_instructions.height > 4000:
                logger.warning(f"Canvas size too large: {canvas_instructions.width}x{canvas_instructions.height}")
                return None
            
            return canvas_instructions
            
        except Exception as e:
            logger.error(f"Canvas validation error: {str(e)}")
            return None
    
    def calculate_cost(self, attempts: List[GenerationAttempt]) -> float:
        """Calculate total cost in USD for all attempts"""
        total_cost = 0.0
        
        # Pricing per 1M tokens (as of 2024)
        pricing = {
            LLMModel.GROQ_8B: {"input": 0.05, "output": 0.08},      # Groq 8B
            LLMModel.GROQ_70B: {"input": 0.59, "output": 0.79},     # Groq 70B
            LLMModel.OPENAI_GPT4: {"input": 0.15, "output": 0.60}   # GPT-4o-mini
        }
        
        for attempt in attempts:
            if attempt.model in pricing:
                rates = pricing[attempt.model]
                input_cost = (attempt.prompt_tokens / 1_000_000) * rates["input"]
                output_cost = (attempt.completion_tokens / 1_000_000) * rates["output"]
                total_cost += input_cost + output_cost
        
        return total_cost
    
    async def generate(self, visual_spec: VisualSpec, **kwargs) -> GenerationResult:
        """Generate Canvas instructions from VisualSpec with fallback logic"""
        
        start_time = time.time()
        attempts = []
        
        # Estimate complexity and get model sequence
        complexity = self.llm_router.estimate_complexity(visual_spec)
        model_sequence = self.llm_router.get_model_sequence(complexity)
        
        logger.info(f"Generating visual for {visual_spec.intent.value} (complexity: {complexity})")
        
        # Generate prompt
        system_prompt = self.prompt_templates.BASE_SYSTEM_PROMPT
        user_prompt = self.prompt_templates.get_prompt(
            visual_spec.intent, 
            visual_spec.dataspec,
            **kwargs
        )
        
        # Try each model in sequence
        for model in model_sequence:
            logger.info(f"Attempting generation with {model.value}")
            
            canvas_data, attempt = await self.llm_router.generate_with_model(
                model, user_prompt, system_prompt
            )
            attempts.append(attempt)
            
            if canvas_data:
                # Validate the generated Canvas instructions
                canvas_instructions = self.validate_canvas_instructions(canvas_data)
                if canvas_instructions:
                    total_duration = int((time.time() - start_time) * 1000)
                    total_cost = self.calculate_cost(attempts)
                    
                    logger.info(f"Successfully generated Canvas instructions with {model.value}")
                    return GenerationResult(
                        canvas_instructions=canvas_instructions,
                        attempts=attempts,
                        total_cost_usd=total_cost,
                        total_duration_ms=total_duration,
                        success=True
                    )
                else:
                    logger.warning(f"Generated invalid Canvas instructions with {model.value}")
                    attempt.success = False
                    attempt.error = "Failed Canvas validation"
        
        # All models failed
        total_duration = int((time.time() - start_time) * 1000)
        total_cost = self.calculate_cost(attempts)
        
        logger.error("All models failed to generate valid Canvas instructions")
        return GenerationResult(
            canvas_instructions=None,
            attempts=attempts,
            total_cost_usd=total_cost,
            total_duration_ms=total_duration,
            success=False,
            final_error="All generation attempts failed"
        )


# Convenience functions for direct usage
async def generate_canvas_instructions(
    visual_intent: VisualIntent,
    data: List[Dict[str, Any]],
    title: str = "",
    **kwargs
) -> GenerationResult:
    """Convenience function to generate Canvas instructions"""
    
    # Convert dict data to DataPoint objects
    from validators.schema import DataPoint, DataType
    data_points = [
        DataPoint(label=item.get('name', item.get('label', str(i))), value=item.get('value', 0))
        for i, item in enumerate(data)
    ]
    
    # Create VisualSpec
    data_spec = DataSpec(
        data_type=DataType.NUMERICAL,  # Default to numerical
        data_points=data_points
    )
    visual_spec = VisualSpec(
        scene_id=f"scene_{int(time.time())}",
        intent=visual_intent,
        dataspec=data_spec,
        path_preferences=[RenderingPath.CANVAS_INSTRUCTIONS]  # Force Canvas path
    )
    
    # Generate
    generator = CanvasInstructionGenerator()
    return await generator.generate(visual_spec, title=title, **kwargs)


async def generate_chart(
    chart_type: str,
    data: List[Dict[str, Any]],
    title: str = "",
    **kwargs
) -> GenerationResult:
    """Convenience function for common chart types"""
    
    # Map chart types to VisualIntent
    chart_mapping = {
        "bar": VisualIntent.BAR_CHART,
        "line": VisualIntent.LINE_CHART,
        "pie": VisualIntent.PIE_CHART,
        "scatter": VisualIntent.SCATTER_PLOT,
        "timeline": VisualIntent.TIMELINE,
        "process": VisualIntent.PROCESS_FLOW,
        "comparison": VisualIntent.COMPARISON
    }
    
    if chart_type not in chart_mapping:
        raise ValueError(f"Unsupported chart type: {chart_type}")
    
    return await generate_canvas_instructions(
        chart_mapping[chart_type],
        data,
        title,
        **kwargs
    )


if __name__ == "__main__":
    # Simple test
    async def test_generation():
        test_data = [
            {"name": "Q1", "value": 120},
            {"name": "Q2", "value": 150},
            {"name": "Q3", "value": 180},
            {"name": "Q4", "value": 200}
        ]
        
        result = await generate_chart("bar", test_data, "Quarterly Sales")
        
        if result.success:
            print("✅ Generation successful!")
            print(f"Cost: ${result.total_cost_usd:.4f}")
            print(f"Duration: {result.total_duration_ms}ms")
            print(f"Attempts: {len(result.attempts)}")
        else:
            print("❌ Generation failed!")
            print(f"Error: {result.final_error}")
    
    asyncio.run(test_generation())