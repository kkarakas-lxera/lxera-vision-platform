#!/usr/bin/env python3
"""
Quick fix for all function tool schema compliance issues.
Converts Dict[str, Any] returns to JSON strings for OpenAI Agents compatibility.
"""

import os
import re
from pathlib import Path

def fix_function_tool_schemas():
    """Fix all function tool schemas in the tools directory."""
    
    tools_dir = Path("tools")
    
    for py_file in tools_dir.glob("*.py"):
        if py_file.name.startswith("__"):
            continue
            
        print(f"🔧 Fixing {py_file.name}...")
        
        with open(py_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Fix function signatures: Dict[str, Any] -> str
        content = re.sub(
            r'(\w+: )Dict\[str, Any\]',
            r'\1str',
            content
        )
        
        # Fix return type annotations: -> Dict[str, Any] -> str
        content = re.sub(
            r'-> Dict\[str, Any\]:',
            r'-> str:',
            content
        )
        
        # Fix returns that should be JSON dumped
        # Pattern: return { ... }
        content = re.sub(
            r'(\s+)return \{([^}]+(?:\{[^}]*\}[^}]*)*)\}',
            lambda m: f'{m.group(1)}result_data = {{{m.group(2)}}}\n{m.group(1)}return json.dumps(result_data)',
            content,
            flags=re.MULTILINE | re.DOTALL
        )
        
        # Ensure json import is present
        if 'import json' not in content and 'json.dumps' in content:
            content = content.replace(
                'import logging',
                'import json\nimport logging'
            )
        
        with open(py_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Fixed {py_file.name}")

if __name__ == "__main__":
    print("🔧 Auto-fixing function tool schemas for OpenAI Agents compliance...")
    fix_function_tool_schemas()
    print("✅ All schemas fixed!")