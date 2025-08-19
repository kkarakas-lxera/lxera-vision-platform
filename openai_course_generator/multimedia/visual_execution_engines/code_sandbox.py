#!/usr/bin/env python3
"""
Secure Code Execution Sandbox for AI Visual Pipeline
Safely execute user-provided Python code for custom visualizations
"""

import ast
import sys
import io
import time
import signal
import traceback
import logging
import tempfile
import os
import subprocess
from typing import Dict, List, Optional, Any, Set, Tuple
from dataclasses import dataclass
from enum import Enum
import threading
from contextlib import contextmanager, redirect_stdout, redirect_stderr

logger = logging.getLogger(__name__)


class SecurityLevel(str, Enum):
    """Security levels for code execution"""
    STRICT = "strict"        # Educational content - very restricted
    MODERATE = "moderate"    # Business charts - some flexibility  
    PERMISSIVE = "permissive"  # Internal use - more libraries allowed


class ExecutionStatus(str, Enum):
    """Code execution status"""
    SUCCESS = "success"
    TIMEOUT = "timeout"
    SECURITY_VIOLATION = "security_violation"
    IMPORT_ERROR = "import_error"
    RUNTIME_ERROR = "runtime_error"
    VALIDATION_ERROR = "validation_error"


@dataclass
class ExecutionLimits:
    """Resource limits for code execution"""
    max_execution_time: float = 10.0  # seconds
    max_memory_mb: int = 100  # MB
    max_output_lines: int = 1000
    max_file_size_kb: int = 5000  # KB for generated images


@dataclass
class ExecutionResult:
    """Result of code execution"""
    status: ExecutionStatus
    success: bool
    output: str
    error: Optional[str]
    execution_time: float
    memory_used_mb: float
    generated_files: List[str]
    security_warnings: List[str]
    stdout: str
    stderr: str


class CodeValidator:
    """Validates Python code for security before execution"""
    
    # Dangerous modules/functions that should never be imported
    FORBIDDEN_MODULES = {
        'sys', 'subprocess', 'shutil', 'tempfile', 'glob',
        'socket', 'urllib', 'requests', 'http', 'ftplib', 'smtplib',
        'eval', 'exec', 'compile', 'open', 'file',
        'input', 'raw_input', 'reload', 'vars', 'locals', 'globals',
        'getattr', 'setattr', 'delattr', 'hasattr',
        'importlib', 'pkgutil', 'runpy', 'zipimport'
    }
    
    # Allowed modules for visualization
    ALLOWED_MODULES = {
        'matplotlib', 'matplotlib.pyplot', 'matplotlib.patches', 'matplotlib.colors',
        'plotly', 'plotly.graph_objects', 'plotly.express', 'plotly.subplots',
        'numpy', 'pandas', 'seaborn', 'scipy',
        'math', 'random', 'datetime', 'collections', 'itertools',
        'json', 're', 'string', 'decimal', 'fractions',
        'PIL', 'PIL.Image', 'PIL.ImageDraw', 'PIL.ImageFont',
        'os'  # Limited os access for file operations in temp directory
    }
    
    # Dangerous AST node types (ast.Exec removed in Python 3+)
    FORBIDDEN_AST_NODES = {
        ast.Import, ast.ImportFrom, ast.Global, ast.Nonlocal
    }
    
    def __init__(self, security_level: SecurityLevel = SecurityLevel.STRICT):
        self.security_level = security_level
        
    def validate_code(self, code: str) -> Tuple[bool, List[str]]:
        """
        Validate Python code for security violations
        Returns: (is_valid, list_of_warnings)
        """
        warnings = []
        
        try:
            # Parse code into AST
            tree = ast.parse(code)
        except SyntaxError as e:
            return False, [f"Syntax error: {str(e)}"]
        
        # Check for forbidden patterns
        for node in ast.walk(tree):
            # Check imports
            if isinstance(node, ast.Import):
                for alias in node.names:
                    if not self._is_module_allowed(alias.name):
                        warnings.append(f"Forbidden import: {alias.name}")
                        return False, warnings
                        
            elif isinstance(node, ast.ImportFrom):
                if node.module and not self._is_module_allowed(node.module):
                    warnings.append(f"Forbidden import from: {node.module}")
                    return False, warnings
            
            # Check for dangerous function calls
            elif isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name):
                    if node.func.id in self.FORBIDDEN_MODULES:
                        warnings.append(f"Forbidden function call: {node.func.id}")
                        return False, warnings
            
            # Check for attribute access to dangerous modules
            elif isinstance(node, ast.Attribute):
                if isinstance(node.value, ast.Name):
                    if node.value.id in self.FORBIDDEN_MODULES:
                        warnings.append(f"Forbidden attribute access: {node.value.id}.{node.attr}")
                        return False, warnings
        
        # Additional string-based checks
        dangerous_patterns = [
            'eval(', 'exec(', 'compile(',
            'subprocess.', 'os.system', 'os.popen', 'os.remove', 'os.rmdir',
            'os.unlink', 'os.rename', 'os.chmod', 'os.chown',
            'open(', 'file(', 'input(', 'raw_input('
        ]
        
        for pattern in dangerous_patterns:
            if pattern in code:
                warnings.append(f"Dangerous pattern detected: {pattern}")
                return False, warnings
        
        return True, warnings
    
    def _is_module_allowed(self, module_name: str) -> bool:
        """Check if a module is allowed for import"""
        
        # Check if it's explicitly forbidden
        if module_name in self.FORBIDDEN_MODULES:
            return False
            
        # Check if it's explicitly allowed
        if module_name in self.ALLOWED_MODULES:
            return True
            
        # Check if it's a sub-module of an allowed module
        for allowed in self.ALLOWED_MODULES:
            if module_name.startswith(allowed + '.'):
                return True
        
        # Special handling for built-in modules we need
        safe_builtins = {'os'}  # os is needed for temp_dir access
        if module_name in safe_builtins:
            return True
                
        # Default: deny unknown modules in strict mode
        if self.security_level == SecurityLevel.STRICT:
            return False
            
        return True


class TimeoutError(Exception):
    """Custom timeout exception"""
    pass


def timeout_handler(signum, frame):
    """Signal handler for execution timeout"""
    raise TimeoutError("Code execution timed out")


class CodeSandbox:
    """Secure sandbox for executing Python visualization code"""
    
    def __init__(self, 
                 security_level: SecurityLevel = SecurityLevel.STRICT,
                 limits: Optional[ExecutionLimits] = None):
        self.security_level = security_level
        self.limits = limits or ExecutionLimits()
        self.validator = CodeValidator(security_level)
        
    def execute_code(self, 
                    code: str, 
                    context: Optional[Dict[str, Any]] = None) -> ExecutionResult:
        """
        Safely execute Python code in a sandboxed environment
        
        Args:
            code: Python code to execute
            context: Optional context variables to make available
            
        Returns:
            ExecutionResult with status, output, and metadata
        """
        start_time = time.time()
        
        # Validate code first
        is_valid, warnings = self.validator.validate_code(code)
        if not is_valid:
            return ExecutionResult(
                status=ExecutionStatus.SECURITY_VIOLATION,
                success=False,
                output="",
                error="Security validation failed",
                execution_time=0.0,
                memory_used_mb=0.0,
                generated_files=[],
                security_warnings=warnings,
                stdout="",
                stderr=""
            )
        
        # Set up execution environment
        with tempfile.TemporaryDirectory() as temp_dir:
            # Capture output
            stdout_capture = io.StringIO()
            stderr_capture = io.StringIO()
            
            try:
                # Set up timeout
                signal.signal(signal.SIGALRM, timeout_handler)
                signal.alarm(int(self.limits.max_execution_time))
                
                # Create restricted execution environment
                exec_globals = self._create_restricted_globals(temp_dir)
                if context:
                    exec_globals.update(context)
                
                # Execute code with output capture
                with redirect_stdout(stdout_capture), redirect_stderr(stderr_capture):
                    exec(code, exec_globals)
                
                # Cancel timeout
                signal.alarm(0)
                
                execution_time = time.time() - start_time
                
                # Check for generated files
                generated_files = []
                for filename in os.listdir(temp_dir):
                    file_path = os.path.join(temp_dir, filename)
                    if os.path.isfile(file_path):
                        # Check file size
                        file_size = os.path.getsize(file_path) / 1024  # KB
                        if file_size <= self.limits.max_file_size_kb:
                            generated_files.append(filename)
                        else:
                            warnings.append(f"File {filename} exceeds size limit ({file_size:.1f}KB)")
                
                return ExecutionResult(
                    status=ExecutionStatus.SUCCESS,
                    success=True,
                    output=stdout_capture.getvalue(),
                    error=None,
                    execution_time=execution_time,
                    memory_used_mb=0.0,  # TODO: Implement memory tracking
                    generated_files=generated_files,
                    security_warnings=warnings,
                    stdout=stdout_capture.getvalue(),
                    stderr=stderr_capture.getvalue()
                )
                
            except TimeoutError:
                signal.alarm(0)
                return ExecutionResult(
                    status=ExecutionStatus.TIMEOUT,
                    success=False,
                    output="",
                    error=f"Code execution timed out after {self.limits.max_execution_time}s",
                    execution_time=self.limits.max_execution_time,
                    memory_used_mb=0.0,
                    generated_files=[],
                    security_warnings=warnings,
                    stdout=stdout_capture.getvalue(),
                    stderr=stderr_capture.getvalue()
                )
                
            except ImportError as e:
                signal.alarm(0)
                return ExecutionResult(
                    status=ExecutionStatus.IMPORT_ERROR,
                    success=False,
                    output="",
                    error=f"Import error: {str(e)}",
                    execution_time=time.time() - start_time,
                    memory_used_mb=0.0,
                    generated_files=[],
                    security_warnings=warnings,
                    stdout=stdout_capture.getvalue(),
                    stderr=stderr_capture.getvalue()
                )
                
            except Exception as e:
                signal.alarm(0)
                error_msg = f"{type(e).__name__}: {str(e)}"
                return ExecutionResult(
                    status=ExecutionStatus.RUNTIME_ERROR,
                    success=False,
                    output="",
                    error=error_msg,
                    execution_time=time.time() - start_time,
                    memory_used_mb=0.0,
                    generated_files=[],
                    security_warnings=warnings,
                    stdout=stdout_capture.getvalue(),
                    stderr=stderr_capture.getvalue()
                )
    
    def _create_restricted_globals(self, temp_dir: str) -> Dict[str, Any]:
        """Create a restricted global namespace for code execution"""
        
        # Start with minimal builtins
        safe_builtins = {
            'len', 'range', 'enumerate', 'zip', 'map', 'filter',
            'sum', 'min', 'max', 'abs', 'round', 'sorted',
            'list', 'tuple', 'dict', 'set', 'str', 'int', 'float',
            'bool', 'type', 'isinstance', 'issubclass',
            'print', 'repr', 'chr', 'ord',
            '__import__'  # Needed for imports to work
        }
        
        restricted_builtins = {}
        import builtins
        for name in safe_builtins:
            if hasattr(builtins, name):
                restricted_builtins[name] = getattr(builtins, name)
        
        # Create restricted os module with only safe operations
        import os as _os
        safe_os = type('SafeOS', (), {
            'path': _os.path,
            'join': _os.path.join,
            'dirname': _os.path.dirname,
            'basename': _os.path.basename,
            'exists': _os.path.exists,
            'isfile': _os.path.isfile,
            'isdir': _os.path.isdir
        })()

        # Create restricted globals
        restricted_globals = {
            '__builtins__': restricted_builtins,
            '__temp_dir__': temp_dir,  # Allow access to temp directory for file output
            'os': safe_os,  # Provide safe os module
        }
        
        # Import allowed modules
        try:
            import matplotlib
            import matplotlib.pyplot as plt
            # Configure matplotlib for file output
            matplotlib.use('Agg')  # Non-interactive backend
            plt.ioff()  # Turn off interactive mode
            
            restricted_globals['matplotlib'] = matplotlib
            restricted_globals['plt'] = plt
            
        except ImportError:
            logger.warning("matplotlib not available in sandbox")
        
        try:
            import numpy as np
            restricted_globals['np'] = np
        except ImportError:
            logger.warning("numpy not available in sandbox")
            
        try:
            import pandas as pd
            restricted_globals['pd'] = pd
        except ImportError:
            logger.warning("pandas not available in sandbox")
        
        return restricted_globals


# Convenience functions for common visualization patterns
def create_matplotlib_visualization(data: Dict[str, Any], 
                                  chart_type: str = "bar",
                                  title: str = "",
                                  security_level: SecurityLevel = SecurityLevel.STRICT) -> ExecutionResult:
    """
    Create a matplotlib visualization using safe, pre-defined patterns
    
    Args:
        data: Data dictionary with 'labels' and 'values' keys
        chart_type: Type of chart ('bar', 'line', 'pie', 'scatter')
        title: Chart title
        security_level: Security level for execution
        
    Returns:
        ExecutionResult with generated chart
    """
    
    # Generate safe matplotlib code
    if chart_type == "bar":
        code = f"""
import matplotlib.pyplot as plt
import os

labels = {data.get('labels', [])}
values = {data.get('values', [])}

fig, ax = plt.subplots(figsize=(10, 6))
bars = ax.bar(labels, values, color=['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'])

ax.set_title('{title}', fontsize=16, fontweight='bold')
ax.set_ylabel('Value', fontsize=12)
ax.grid(True, alpha=0.3)

# Add value labels on bars
for bar, value in zip(bars, values):
    height = bar.get_height()
    ax.text(bar.get_x() + bar.get_width()/2., height + 0.01*max(values),
            f'{{:.1f}}'.format(value), ha='center', va='bottom')

plt.tight_layout()
plt.savefig(os.path.join(__temp_dir__, 'chart.png'), dpi=150, bbox_inches='tight')
plt.close()

print(f"Generated {{chart_type}} chart with {{len(labels)}} data points")
"""
    
    elif chart_type == "line":
        code = f"""
import matplotlib.pyplot as plt
import os

labels = {data.get('labels', [])}
values = {data.get('values', [])}

fig, ax = plt.subplots(figsize=(10, 6))
line = ax.plot(labels, values, marker='o', linewidth=2, markersize=6, color='#3498db')

ax.set_title('{title}', fontsize=16, fontweight='bold')
ax.set_ylabel('Value', fontsize=12)
ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig(os.path.join(__temp_dir__, 'chart.png'), dpi=150, bbox_inches='tight')
plt.close()

print(f"Generated line chart with {{len(labels)}} data points")
"""
    
    else:
        return ExecutionResult(
            status=ExecutionStatus.VALIDATION_ERROR,
            success=False,
            output="",
            error=f"Unsupported chart type: {chart_type}",
            execution_time=0.0,
            memory_used_mb=0.0,
            generated_files=[],
            security_warnings=[],
            stdout="",
            stderr=""
        )
    
    # Execute the generated code
    sandbox = CodeSandbox(security_level=security_level)
    return sandbox.execute_code(code)


if __name__ == "__main__":
    # Test the sandbox
    def test_code_sandbox():
        print("🔒 Testing Code Sandbox")
        print("=" * 50)
        
        sandbox = CodeSandbox(security_level=SecurityLevel.STRICT)
        
        # Test 1: Safe matplotlib code
        print("📊 Test 1: Safe matplotlib visualization")
        safe_code = """
import matplotlib.pyplot as plt
import os

# Create simple bar chart
labels = ['A', 'B', 'C', 'D']
values = [10, 25, 15, 30]

fig, ax = plt.subplots(figsize=(8, 5))
ax.bar(labels, values, color='skyblue')
ax.set_title('Test Chart')
ax.set_ylabel('Values')

plt.savefig(os.path.join(__temp_dir__, 'test_chart.png'), dpi=150)
plt.close()

print("Chart generated successfully!")
"""
        
        result = sandbox.execute_code(safe_code)
        print(f"  Status: {result.status}")
        print(f"  Success: {result.success}")
        print(f"  Execution time: {result.execution_time:.3f}s")
        print(f"  Generated files: {result.generated_files}")
        print(f"  Output: {result.output}")
        if result.error:
            print(f"  Error: {result.error}")
        print()
        
        # Test 2: Malicious code (should be blocked)
        print("🚫 Test 2: Malicious code (should be blocked)")
        malicious_code = """
import os
os.system('rm -rf /')  # This should be blocked!
"""
        
        result = sandbox.execute_code(malicious_code)
        print(f"  Status: {result.status}")
        print(f"  Success: {result.success}")
        print(f"  Security warnings: {result.security_warnings}")
        print()
        
        # Test 3: Convenience function
        print("🎨 Test 3: Convenience function")
        data = {
            'labels': ['Method A', 'Method B', 'Method C'],
            'values': [85, 65, 75]
        }
        
        result = create_matplotlib_visualization(
            data=data,
            chart_type="bar",
            title="Learning Method Effectiveness"
        )
        
        print(f"  Status: {result.status}")
        print(f"  Success: {result.success}")
        print(f"  Generated files: {result.generated_files}")
        print(f"  Output: {result.output}")
        print()
        
        print("🔒 Code Sandbox Test Complete")
    
    test_code_sandbox()