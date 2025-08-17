#!/usr/bin/env python3
"""
JSON Utilities for robust JSON extraction and parsing.

This module provides utilities to extract and parse JSON from various response formats,
handling edge cases like truncated JSON, embedded JSON in text, and malformed structures.
"""

import json
import re
import logging
from typing import Dict, Any, Optional, Union

logger = logging.getLogger(__name__)


def fix_common_json_issues(text: str) -> str:
    """
    Fix common JSON formatting issues that cause parsing failures.
    
    Specifically addresses:
    1. Unquoted property names
    2. Missing commas between properties
    3. Single quotes instead of double quotes
    4. Trailing commas
    
    Args:
        text: Raw JSON text with potential issues
        
    Returns:
        Fixed JSON text
    """
    # Fix unquoted property names - most common issue
    # Matches: word: "value" -> "word": "value"
    text = re.sub(r'(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:', r'\1"\2":', text)
    
    # Fix single quotes to double quotes
    # But be careful not to break strings that contain single quotes
    text = re.sub(r"'([^']*)'", r'"\1"', text)
    
    # Fix missing commas between properties
    # Look for patterns like: "value" "nextProperty" or "value" }
    text = re.sub(r'"\s*\n\s*"', '",\n"', text)  # Missing comma between lines
    text = re.sub(r'"\s*([}\]])', r'"\1', text)  # Remove spaces before closing
    text = re.sub(r'([}\]])\s*"', r'\1,"', text)  # Add comma after closing bracket/brace
    
    # Fix missing commas after numbers and booleans
    text = re.sub(r'(\d+|\btrue\b|\bfalse\b|\bnull\b)\s*\n\s*"', r'\1,\n"', text)
    
    # Fix missing commas after nested objects/arrays
    text = re.sub(r'(\}|\])\s*\n\s*"', r'\1,\n"', text)
    
    # Remove trailing commas (which are invalid in strict JSON)
    text = re.sub(r',\s*([}\]])', r'\1', text)
    
    # Fix spacing around colons and commas
    text = re.sub(r'\s*:\s*', ': ', text)
    text = re.sub(r'\s*,\s*', ', ', text)
    
    return text


def fix_nested_json_issues(text: str) -> str:
    """
    Fix JSON issues specific to complex nested structures used in planning tools.
    
    Handles deep nesting patterns common in course structure and research query JSON.
    """
    # Fix missing commas in nested array/object patterns
    # Pattern: } { -> }, {
    text = re.sub(r'(\})\s*(\{)', r'\1, \2', text)
    # Pattern: ] [ -> ], [
    text = re.sub(r'(\])\s*(\[)', r'\1, \2', text)
    # Pattern: ] { -> ], {
    text = re.sub(r'(\])\s*(\{)', r'\1, \2', text)
    # Pattern: } [ -> }, [
    text = re.sub(r'(\})\s*(\[)', r'\1, \2', text)
    
    # Fix missing commas after nested property values
    # Pattern: "value" "property" -> "value", "property"
    text = re.sub(r'(["\d\}\]])\s+("[\w_]+"\s*:)', r'\1, \2', text)
    
    # Fix malformed property-value separators
    # Ensure there's exactly one colon between property and value
    text = re.sub(r'("[\w_]+")\s*:\s*:', r'\1:', text)  # Remove double colons
    text = re.sub(r'("[\w_]+")\s+(["\[\{])', r'\1: \2', text)  # Add missing colon
    
    # Fix array/object closing issues
    # Ensure proper closing bracket/brace sequences
    text = re.sub(r'\]\s*\}\s*\]', ']}]', text)
    text = re.sub(r'\}\s*\]\s*\}', '}]}', text)
    
    return text


def extract_json_from_text(text: str) -> Optional[Dict[str, Any]]:
    """
    Extract JSON from text that may contain additional content.
    
    Tries multiple strategies:
    1. Direct JSON parsing
    2. Fix common JSON formatting issues
    3. Extract JSON from markdown code blocks
    4. Find JSON boundaries using regex
    5. Repair truncated JSON
    6. Handle "Extra data" error by extracting first valid JSON
    
    Args:
        text: Text potentially containing JSON
        
    Returns:
        Parsed JSON dict or None if extraction fails
    """
    if not text:
        return None
    
    # Strategy 1: Try direct parsing
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError as e:
        # Handle "Extra data" error - try to extract just the valid JSON part
        if "Extra data" in str(e):
            try:
                # Extract position where valid JSON ends
                error_str = str(e)
                if "column" in error_str:
                    # Parse error like "Extra data: line 1 column 1696 (char 1695)"
                    char_pos = None
                    if "(char " in error_str and ")" in error_str:
                        char_start = error_str.find("(char ") + 6
                        char_end = error_str.find(")", char_start)
                        char_pos = int(error_str[char_start:char_end])
                    
                    if char_pos and char_pos < len(text):
                        # Extract text up to the error position
                        valid_json_text = text[:char_pos]
                        return json.loads(valid_json_text.strip())
            except (ValueError, json.JSONDecodeError):
                pass
    
    # Strategy 2: Fix common JSON formatting issues
    try:
        fixed_json = fix_common_json_issues(text.strip())
        return json.loads(fixed_json)
    except json.JSONDecodeError:
        pass
    
    # Strategy 2b: Fix nested JSON issues specifically
    try:
        fixed_json = fix_common_json_issues(text.strip())
        nested_fixed = fix_nested_json_issues(fixed_json)
        return json.loads(nested_fixed)
    except json.JSONDecodeError:
        pass
    
    # Strategy 3: Extract from markdown code blocks
    code_block_patterns = [
        r'```json\s*\n(.*?)\n```',
        r'```\s*\n(.*?)\n```',
        r'`(.*?)`'
    ]
    
    for pattern in code_block_patterns:
        matches = re.findall(pattern, text, re.DOTALL)
        for match in matches:
            try:
                return json.loads(match.strip())
            except json.JSONDecodeError:
                continue
    
    # Strategy 4: Find JSON boundaries
    json_patterns = [
        # Match complete JSON object
        r'(\{[^{}]*\{[^{}]*\}[^{}]*\})',  # Nested objects
        r'(\{[^{}]+\})',  # Simple objects
        r'(\{.*\})',  # Greedy match (last resort)
    ]
    
    for pattern in json_patterns:
        matches = re.findall(pattern, text, re.DOTALL)
        for match in matches:
            try:
                # Clean up common issues
                cleaned = match.strip()
                # Remove trailing commas
                cleaned = re.sub(r',\s*}', '}', cleaned)
                cleaned = re.sub(r',\s*]', ']', cleaned)
                return json.loads(cleaned)
            except json.JSONDecodeError:
                continue
    
    # Strategy 5: Try to repair truncated JSON
    truncated_json = try_repair_truncated_json(text)
    if truncated_json:
        try:
            return json.loads(truncated_json)
        except json.JSONDecodeError:
            pass
    
    return None


def try_repair_truncated_json(text: str) -> Optional[str]:
    """
    Attempt to repair truncated JSON by closing open structures.
    
    Args:
        text: Potentially truncated JSON text
        
    Returns:
        Repaired JSON string or None
    """
    # Find the start of JSON
    json_start = -1
    for i, char in enumerate(text):
        if char == '{':
            json_start = i
            break
    
    if json_start == -1:
        return None
    
    json_text = text[json_start:]
    
    # Count open/close braces and brackets
    brace_count = 0
    bracket_count = 0
    in_string = False
    escape_next = False
    
    for i, char in enumerate(json_text):
        if escape_next:
            escape_next = False
            continue
            
        if char == '\\':
            escape_next = True
            continue
            
        if char == '"' and not escape_next:
            in_string = not in_string
            continue
            
        if not in_string:
            if char == '{':
                brace_count += 1
            elif char == '}':
                brace_count -= 1
            elif char == '[':
                bracket_count += 1
            elif char == ']':
                bracket_count -= 1
    
    # Add missing closing characters
    repaired = json_text
    
    # Close any open strings
    if in_string:
        repaired += '"'
    
    # Close any open arrays
    while bracket_count > 0:
        repaired += ']'
        bracket_count -= 1
    
    # Close any open objects
    while brace_count > 0:
        repaired += '}'
        brace_count -= 1
    
    return repaired


def safe_json_parse(text: str, default: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Safely parse JSON with fallback to default value.
    
    Args:
        text: JSON text to parse
        default: Default value if parsing fails
        
    Returns:
        Parsed JSON or default value
    """
    if default is None:
        default = {}
    
    try:
        result = extract_json_from_text(text)
        return result if result is not None else default
    except Exception as e:
        logger.error(f"Failed to parse JSON: {e}")
        return default


def validate_json_structure(data: Dict[str, Any], required_keys: list) -> bool:
    """
    Validate that JSON contains required keys.
    
    Args:
        data: JSON data to validate
        required_keys: List of required top-level keys
        
    Returns:
        True if all required keys present
    """
    if not isinstance(data, dict):
        return False
    
    return all(key in data for key in required_keys)


def merge_json_safely(base: Dict[str, Any], update: Dict[str, Any]) -> Dict[str, Any]:
    """
    Safely merge two JSON objects, preserving base structure.
    
    Args:
        base: Base JSON object
        update: JSON object with updates
        
    Returns:
        Merged JSON object
    """
    result = base.copy()
    
    for key, value in update.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = merge_json_safely(result[key], value)
        else:
            result[key] = value
    
    return result


if __name__ == "__main__":
    # Test cases
    test_cases = [
        '{"key": "value"}',
        '```json\n{"key": "value"}\n```',
        'Some text before {"key": "value"} and after',
        '{"incomplete": "json", "missing": "closing',
        '{"nested": {"inner": "value"}}',
    ]
    
    for test in test_cases:
        result = extract_json_from_text(test)
        print(f"Input: {test[:50]}...")
        print(f"Result: {result}")
        print()