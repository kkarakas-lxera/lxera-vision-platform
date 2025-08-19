"""
AI JSON Fixer - Python implementation
Handles malformed JSON output from Large Language Models (LLMs)
Based on the ai-json-fixer TypeScript library by aotakeda
"""

import json
import re
from typing import Optional, Dict, Any, List, Tuple


class JSONFixer:
    """JSON parser specifically designed to handle malformed JSON from LLMs"""
    
    def __init__(self):
        self.max_fix_attempts = 3
    
    def fix_json(self, input_str: str) -> Optional[Dict[Any, Any]]:
        """
        Parse JSON input with automatic fixing of common LLM output issues
        Returns parsed object or None if parsing fails
        """
        if not input_str or not input_str.strip():
            return None
        
        processed_input = input_str
        
        for attempt in range(self.max_fix_attempts):
            try:
                # Try parsing as-is first
                return json.loads(processed_input)
            except json.JSONDecodeError as e:
                # Apply fixes
                processed_input = self._apply_fixes(processed_input)
                if processed_input == input_str and attempt > 0:
                    # No more fixes to apply
                    break
        
        # Final attempt
        try:
            return json.loads(processed_input)
        except json.JSONDecodeError:
            return None
    
    def _apply_fixes(self, input_str: str) -> str:
        """Apply various fixes to make the JSON parseable"""
        processed = input_str
        
        # 1. Extract from markdown blocks
        processed = self._extract_from_markdown(processed)
        
        # 2. Remove trailing content
        processed = self._remove_trailing_content(processed)
        
        # 3. Fix unescaped quotes
        processed = self._fix_unescaped_quotes(processed)
        
        # 4. Add missing commas
        processed = self._add_missing_commas(processed)
        
        # 5. Handle common JSON formatting issues
        processed = self._fix_common_issues(processed)
        
        return processed
    
    def _extract_from_markdown(self, input_str: str) -> str:
        """Extract JSON from markdown code blocks"""
        # Look for ```json blocks
        json_block_match = re.search(r'```(?:json)?\s*\n?(.*?)\n?```', input_str, re.DOTALL)
        if json_block_match:
            return json_block_match.group(1).strip()
        
        # Look for inline code blocks
        inline_match = re.search(r'`([^`]*[{}][^`]*)`', input_str)
        if inline_match:
            return inline_match.group(1).strip()
        
        return input_str
    
    def _remove_trailing_content(self, input_str: str) -> str:
        """Remove explanatory text after valid JSON structures"""
        # Find the end of JSON structure
        brace_count = 0
        bracket_count = 0
        in_string = False
        escape_next = False
        json_end = -1
        
        for i, char in enumerate(input_str):
            if escape_next:
                escape_next = False
                continue
                
            if char == '\\' and in_string:
                escape_next = True
                continue
                
            if char == '"' and not escape_next:
                in_string = not in_string
                continue
                
            if in_string:
                continue
                
            if char == '{':
                brace_count += 1
            elif char == '}':
                brace_count -= 1
                if brace_count == 0 and bracket_count == 0:
                    json_end = i + 1
                    break
            elif char == '[':
                bracket_count += 1
            elif char == ']':
                bracket_count -= 1
                if brace_count == 0 and bracket_count == 0:
                    json_end = i + 1
                    break
        
        if json_end > 0:
            return input_str[:json_end].strip()
        
        return input_str
    
    def _fix_unescaped_quotes(self, input_str: str) -> str:
        """Fix unescaped quotes inside JSON strings"""
        # This is a simplified approach - look for quotes inside strings
        result = []
        in_string = False
        escape_next = False
        
        i = 0
        while i < len(input_str):
            char = input_str[i]
            
            if escape_next:
                result.append(char)
                escape_next = False
                i += 1
                continue
                
            if char == '\\':
                result.append(char)
                escape_next = True
                i += 1
                continue
                
            if char == '"':
                if not in_string:
                    # Starting a string
                    in_string = True
                    result.append(char)
                else:
                    # Check if this is actually the end of the string
                    # Look ahead to see if there's a colon, comma, or closing bracket
                    next_meaningful = self._find_next_meaningful_char(input_str, i + 1)
                    if next_meaningful in [':', ',', '}', ']', None]:
                        # This is the end of the string
                        in_string = False
                        result.append(char)
                    else:
                        # This is an unescaped quote inside the string
                        result.append('\\"')
                        
            else:
                result.append(char)
                
            i += 1
        
        return ''.join(result)
    
    def _find_next_meaningful_char(self, input_str: str, start_pos: int) -> Optional[str]:
        """Find the next non-whitespace character"""
        for i in range(start_pos, len(input_str)):
            if not input_str[i].isspace():
                return input_str[i]
        return None
    
    def _add_missing_commas(self, input_str: str) -> str:
        """Add missing commas between array elements and object properties"""
        if '\n' not in input_str:
            return self._handle_single_line_json(input_str)
        
        lines = input_str.split('\n')
        result = []
        depth = 0
        
        for line_index, line in enumerate(lines):
            processed_line = line
            in_string = False
            escape_next = False
            
            # Track depth and string state
            for char in line:
                if escape_next:
                    escape_next = False
                    continue
                    
                if char == '\\' and in_string:
                    escape_next = True
                    continue
                    
                if char == '"' and not escape_next:
                    in_string = not in_string
                    continue
                    
                if in_string:
                    continue
                    
                if char in '{[':
                    depth += 1
                elif char in '}]':
                    depth -= 1
            
            trimmed = processed_line.strip()
            
            # Skip empty lines and lines that already end properly
            if (not trimmed or 
                trimmed.endswith(',') or 
                trimmed.endswith(':') or 
                trimmed.endswith('{') or 
                trimmed.endswith('[')):
                result.append(processed_line)
                continue
            
            # Check if we need a comma
            needs_comma = False
            if depth > 0 and line_index < len(lines) - 1:
                # Look at next non-empty line
                next_line_index = line_index + 1
                while (next_line_index < len(lines) and 
                       not lines[next_line_index].strip()):
                    next_line_index += 1
                
                if next_line_index < len(lines):
                    next_line = lines[next_line_index].strip()
                    if (next_line and 
                        not next_line.startswith('}') and 
                        not next_line.startswith(']')):
                        
                        # Check if line ends with a complete value
                        if (re.search(r'["\d}\]]\s*$', trimmed) or
                            re.search(r'\b(true|false|null)\s*$', trimmed)):
                            needs_comma = True
            
            if needs_comma:
                result.append(processed_line + ',')
            else:
                result.append(processed_line)
        
        return '\n'.join(result)
    
    def _handle_single_line_json(self, input_str: str) -> str:
        """Handle single-line JSON comma insertion using regex patterns"""
        result = input_str
        
        # Apply fixes iteratively
        max_iterations = 10  # Prevent infinite loops
        for _ in range(max_iterations):
            before = result
            
            # Pattern 1: Object properties - value followed by quote (new key)
            result = re.sub(r'(["\d}\]]\s*|\b(?:true|false|null)\s+)(")', r'\1, \2', result)
            
            # Pattern 2: Array elements - value followed by value
            result = re.sub(r'(["\d}\]]\s*|\b(?:true|false|null)\s+)(["\d\[{-]|\b(?:true|false|null))', r'\1, \2', result)
            
            if result == before:
                break
        
        return result
    
    def _fix_common_issues(self, input_str: str) -> str:
        """Fix other common JSON issues"""
        result = input_str
        
        # Fix single quotes to double quotes (outside of strings)
        # This is a simplified approach
        result = re.sub(r"'([^']*)':", r'"\1":', result)  # Keys
        result = re.sub(r":\s*'([^']*)'", r': "\1"', result)  # String values
        
        # Remove trailing commas before closing braces/brackets
        result = re.sub(r',(\s*[}\]])', r'\1', result)
        
        return result


# Global instance for easy importing
json_fixer = JSONFixer()