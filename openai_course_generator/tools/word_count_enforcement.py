"""
Word Count Enforcement System
Ensures content generation meets target word count requirements with intelligent retry mechanisms
"""

import json
import logging
import re
from typing import Dict, Any, List, Tuple, Optional
from dataclasses import dataclass
from openai import OpenAI
import os

logger = logging.getLogger(__name__)

@dataclass
class WordCountResult:
    """Result of word count analysis"""
    actual_words: int
    target_words: int
    min_words: int
    max_words: int
    percentage_of_target: float
    status: str  # "within_range", "too_short", "too_long", "critically_short"
    gap: int  # positive if over, negative if under
    needs_retry: bool
    retry_strategy: str

@dataclass
class ContentEnhancementStrategy:
    """Strategy for enhancing short content"""
    strategy_type: str
    enhancement_prompt: str
    expected_word_increase: int
    max_attempts: int

class WordCountEnforcer:
    """Intelligent word count enforcement with adaptive strategies"""
    
    def __init__(self):
        # Initialize OpenAI client
        self.openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        
        # Word count tolerance thresholds
        self.thresholds = {
            "acceptable_min": 0.85,    # 85% of target is acceptable
            "preferred_min": 0.90,     # 90% of target is preferred
            "preferred_max": 1.15,     # 115% of target is preferred
            "acceptable_max": 1.30,    # 130% of target is acceptable
            "critical_min": 0.70       # Below 70% requires immediate action
        }
        
        # Enhancement strategies for different content types
        self.enhancement_strategies = {
            "add_examples": ContentEnhancementStrategy(
                strategy_type="add_examples",
                enhancement_prompt="Add 2-3 specific, detailed examples with step-by-step explanations. Include real-world scenarios that illustrate the concepts.",
                expected_word_increase=300,
                max_attempts=2
            ),
            "expand_explanations": ContentEnhancementStrategy(
                strategy_type="expand_explanations",
                enhancement_prompt="Expand existing explanations with more detail, include 'why' and 'how' for each concept, add implementation details.",
                expected_word_increase=400,
                max_attempts=2
            ),
            "add_subsections": ContentEnhancementStrategy(
                strategy_type="add_subsections",
                enhancement_prompt="Break down main topics into detailed subsections with comprehensive explanations for each part.",
                expected_word_increase=500,
                max_attempts=1
            ),
            "add_practical_tips": ContentEnhancementStrategy(
                strategy_type="add_practical_tips",
                enhancement_prompt="Add practical tips, best practices, common pitfalls to avoid, and professional recommendations.",
                expected_word_increase=250,
                max_attempts=2
            ),
            "add_detailed_context": ContentEnhancementStrategy(
                strategy_type="add_detailed_context",
                enhancement_prompt="Add more context, background information, industry standards, and detailed explanations of terminology.",
                expected_word_increase=350,
                max_attempts=2
            )
        }

    def analyze_word_count(
        self, 
        content: str, 
        target_words: int, 
        min_words: int, 
        max_words: int
    ) -> WordCountResult:
        """Analyze content word count and determine required actions"""
        
        actual_words = len(content.split())
        percentage = (actual_words / target_words) if target_words > 0 else 0
        gap = actual_words - target_words
        
        # Determine status
        if actual_words < int(target_words * self.thresholds["critical_min"]):
            status = "critically_short"
            needs_retry = True
            retry_strategy = "expand_significantly"
        elif actual_words < min_words:
            status = "too_short" 
            needs_retry = True
            retry_strategy = "expand_moderately"
        elif actual_words > max_words:
            status = "too_long"
            needs_retry = True
            retry_strategy = "trim_content"
        else:
            status = "within_range"
            needs_retry = False
            retry_strategy = "none"
        
        return WordCountResult(
            actual_words=actual_words,
            target_words=target_words,
            min_words=min_words,
            max_words=max_words,
            percentage_of_target=percentage,
            status=status,
            gap=gap,
            needs_retry=needs_retry,
            retry_strategy=retry_strategy
        )

    def select_enhancement_strategy(
        self, 
        word_result: WordCountResult, 
        content_type: str,
        attempt_number: int
    ) -> ContentEnhancementStrategy:
        """Select the best enhancement strategy based on word count gap and content type"""
        
        word_gap = abs(word_result.gap)
        
        # Strategy selection based on word gap and attempt number
        if word_gap >= 500 or word_result.status == "critically_short":
            if attempt_number == 1:
                return self.enhancement_strategies["add_subsections"]
            else:
                return self.enhancement_strategies["expand_explanations"]
        
        elif word_gap >= 300:
            if content_type in ["core_content", "practical_applications"]:
                return self.enhancement_strategies["expand_explanations"]
            else:
                return self.enhancement_strategies["add_examples"]
        
        elif word_gap >= 200:
            if content_type == "practical_applications":
                return self.enhancement_strategies["add_practical_tips"]
            else:
                return self.enhancement_strategies["add_examples"]
        
        else:  # Small gap < 200 words
            return self.enhancement_strategies["add_detailed_context"]

    def enhance_content_for_word_count(
        self,
        content: str,
        word_result: WordCountResult,
        content_type: str,
        module_context: Dict[str, Any],
        attempt_number: int = 1
    ) -> Tuple[str, WordCountResult]:
        """Enhance content to meet word count targets"""
        
        try:
            logger.info(f"🔧 Enhancing {content_type} content: {word_result.actual_words} → {word_result.target_words} words (attempt {attempt_number})")
            
            # Select enhancement strategy
            strategy = self.select_enhancement_strategy(word_result, content_type, attempt_number)
            
            # Calculate words needed
            words_needed = word_result.target_words - word_result.actual_words
            
            # Create enhancement prompt
            enhancement_prompt = f"""
            Enhance the following {content_type} content to reach the target word count.
            
            CURRENT CONTENT:
            {content}
            
            WORD COUNT ANALYSIS:
            - Current: {word_result.actual_words} words
            - Target: {word_result.target_words} words  
            - Gap: {words_needed} words needed
            - Status: {word_result.status}
            
            ENHANCEMENT STRATEGY: {strategy.strategy_type}
            ENHANCEMENT INSTRUCTIONS:
            {strategy.enhancement_prompt}
            
            SPECIFIC REQUIREMENTS:
            - Add approximately {words_needed} more words of high-quality content
            - Maintain the existing structure and flow
            - Ensure all additions are relevant and valuable
            - Keep the same tone and style
            - Do not repeat existing information
            - Focus on depth and practical value
            
            CONTENT CONTEXT:
            - Module: {module_context.get('module_name', 'Unknown')}
            - Learner: {module_context.get('employee_name', 'Professional')}
            - Role: {module_context.get('current_role', 'Analyst')}
            - Tools: {', '.join(module_context.get('tools', []))}
            
            Return the enhanced content that meets the target word count while maintaining quality.
            """
            
            # Call OpenAI for enhancement
            response = self.openai_client.chat.completions.create(
                model="gpt-4-turbo",
                messages=[
                    {
                        "role": "system", 
                        "content": f"You are an expert content enhancer specializing in {content_type} sections. Create comprehensive, valuable content that meets specific word count targets while maintaining high quality and relevance."
                    },
                    {"role": "user", "content": enhancement_prompt}
                ],
                temperature=0.4,
                max_tokens=int(words_needed * 1.8 + 1000)  # Dynamic token limit
            )
            
            enhanced_content = response.choices[0].message.content
            
            # Analyze enhanced content
            enhanced_result = self.analyze_word_count(
                enhanced_content, 
                word_result.target_words, 
                word_result.min_words, 
                word_result.max_words
            )
            
            logger.info(f"✅ Enhanced {content_type}: {enhanced_result.actual_words} words ({enhanced_result.percentage_of_target:.1%} of target)")
            
            return enhanced_content, enhanced_result
            
        except Exception as e:
            logger.error(f"❌ Content enhancement failed: {e}")
            return content, word_result

    def trim_content_for_word_count(
        self,
        content: str,
        word_result: WordCountResult,
        content_type: str
    ) -> Tuple[str, WordCountResult]:
        """Trim content that exceeds word count limits"""
        
        try:
            logger.info(f"✂️ Trimming {content_type} content: {word_result.actual_words} → {word_result.target_words} words")
            
            words_to_remove = word_result.actual_words - word_result.target_words
            
            trimming_prompt = f"""
            Trim the following {content_type} content to meet the target word count while preserving core value.
            
            CURRENT CONTENT:
            {content}
            
            WORD COUNT ANALYSIS:
            - Current: {word_result.actual_words} words
            - Target: {word_result.target_words} words
            - Excess: {words_to_remove} words to remove
            
            TRIMMING INSTRUCTIONS:
            - Remove approximately {words_to_remove} words
            - Preserve all core concepts and main points
            - Remove redundant explanations and repetitive content
            - Condense verbose sections while maintaining clarity
            - Keep all essential examples and practical information
            - Maintain logical flow and structure
            
            Return the trimmed content that meets the target word count.
            """
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": f"You are an expert content editor specializing in concise, high-value {content_type} sections. Trim content while preserving all essential information and maintaining quality."
                    },
                    {"role": "user", "content": trimming_prompt}
                ],
                temperature=0.3,
                max_tokens=int(word_result.target_words * 1.5)
            )
            
            trimmed_content = response.choices[0].message.content
            
            # Analyze trimmed content
            trimmed_result = self.analyze_word_count(
                trimmed_content,
                word_result.target_words,
                word_result.min_words,
                word_result.max_words
            )
            
            logger.info(f"✅ Trimmed {content_type}: {trimmed_result.actual_words} words ({trimmed_result.percentage_of_target:.1%} of target)")
            
            return trimmed_content, trimmed_result
            
        except Exception as e:
            logger.error(f"❌ Content trimming failed: {e}")
            return content, word_result

    def enforce_word_count_with_retries(
        self,
        content: str,
        target_words: int,
        min_words: int,
        max_words: int,
        content_type: str,
        module_context: Dict[str, Any],
        max_retries: int = 3
    ) -> Tuple[str, WordCountResult, List[str]]:
        """Enforce word count with intelligent retry mechanism"""
        
        attempt_log = []
        current_content = content
        
        for attempt in range(1, max_retries + 1):
            # Analyze current word count
            word_result = self.analyze_word_count(current_content, target_words, min_words, max_words)
            
            attempt_log.append(f"Attempt {attempt}: {word_result.actual_words} words ({word_result.status})")
            
            if not word_result.needs_retry:
                logger.info(f"✅ Word count achieved on attempt {attempt}: {word_result.actual_words} words")
                break
            
            if attempt == max_retries:
                logger.warning(f"⚠️ Max retries reached. Final: {word_result.actual_words} words ({word_result.percentage_of_target:.1%})")
                break
            
            # Apply appropriate strategy
            if word_result.status in ["too_short", "critically_short"]:
                current_content, word_result = self.enhance_content_for_word_count(
                    current_content, word_result, content_type, module_context, attempt
                )
            elif word_result.status == "too_long":
                current_content, word_result = self.trim_content_for_word_count(
                    current_content, word_result, content_type
                )
        
        final_result = self.analyze_word_count(current_content, target_words, min_words, max_words)
        
        return current_content, final_result, attempt_log

    def get_word_count_summary(self, word_result: WordCountResult) -> str:
        """Get a summary of word count analysis for logging"""
        
        status_emoji = {
            "within_range": "✅",
            "too_short": "📏",
            "too_long": "📐", 
            "critically_short": "🚨"
        }
        
        emoji = status_emoji.get(word_result.status, "❓")
        
        return f"{emoji} {word_result.actual_words}/{word_result.target_words} words ({word_result.percentage_of_target:.1%}) - {word_result.status}"

# Global instance for use in content tools
word_count_enforcer = WordCountEnforcer()

def enforce_word_count(
    content: str,
    target_words: int,
    min_words: int,
    max_words: int,
    content_type: str,
    module_context: Dict[str, Any],
    max_retries: int = 3
) -> Tuple[str, Dict[str, Any]]:
    """
    Enforce word count requirements with intelligent retry mechanism
    
    Returns:
        Tuple of (final_content, enforcement_results)
    """
    
    final_content, word_result, attempt_log = word_count_enforcer.enforce_word_count_with_retries(
        content, target_words, min_words, max_words, content_type, module_context, max_retries
    )
    
    enforcement_results = {
        "final_word_count": word_result.actual_words,
        "target_word_count": target_words,
        "percentage_of_target": word_result.percentage_of_target,
        "status": word_result.status,
        "attempts_made": len(attempt_log),
        "attempt_log": attempt_log,
        "within_acceptable_range": word_result.status == "within_range",
        "enforcement_summary": word_count_enforcer.get_word_count_summary(word_result)
    }
    
    return final_content, enforcement_results