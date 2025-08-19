#!/usr/bin/env python3
"""
Environment Validation Script for AI Visual Pipeline
Validates all required environment variables and dependencies
"""

import os
import sys
import logging
import shutil
import platform
import subprocess
from pathlib import Path
from typing import Dict, List, Tuple

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)


class EnvironmentValidator:
    """Validates environment setup for AI visual pipeline"""
    
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.checks_passed = 0
        self.total_checks = 0
    
    def validate_environment_variables(self) -> bool:
        """Validate all required environment variables"""
        logger.info("🔍 Validating environment variables...")
        self.total_checks += 1
        
        required_vars = {
            'OPENAI_API_KEY': 'OpenAI API key for fallback LLM',
            'GROQ_API_KEY': 'Groq API key for fast AI visual generation',
            'SUPABASE_URL': 'Supabase project URL for asset storage',
            'SUPABASE_ANON_KEY': 'Supabase anonymous key',
            'SUPABASE_SERVICE_ROLE_KEY': 'Supabase service role key for storage'
        }
        
        optional_vars = {
            'GROQ_MODEL_8B': 'Groq 8B model name (default: llama-3.1-8b-instant)',
            'GROQ_MODEL_70B': 'Groq 70B model name (default: llama-3.1-70b-versatile)',
            'AI_VISUAL_CACHE_ENABLED': 'Enable caching (default: true)',
            'AI_VISUAL_SANDBOX_TIMEOUT': 'Sandbox timeout in seconds (default: 8)',
            'AI_VISUAL_SANDBOX_MEMORY_MB': 'Sandbox memory limit (default: 512)'
        }
        
        missing_required = []
        missing_optional = []
        
        # Check required variables
        for var, description in required_vars.items():
            value = os.getenv(var)
            if not value or value == f'your-{var.lower().replace("_", "-")}-here':
                missing_required.append(f"  {var}: {description}")
        
        # Check optional variables
        for var, description in optional_vars.items():
            value = os.getenv(var)
            if not value:
                missing_optional.append(f"  {var}: {description}")
        
        if missing_required:
            self.errors.append(f"Missing required environment variables:\n" + "\n".join(missing_required))
            return False
        
        if missing_optional:
            self.warnings.append(f"Missing optional environment variables (using defaults):\n" + "\n".join(missing_optional))
        
        logger.info("✅ Environment variables validated")
        self.checks_passed += 1
        return True
    
    def validate_python_dependencies(self) -> bool:
        """Validate Python dependencies are installed"""
        logger.info("🔍 Validating Python dependencies...")
        self.total_checks += 1
        
        required_packages = {
            'PIL': 'Pillow for image processing',
            'matplotlib': 'Matplotlib for chart generation',
            'plotly': 'Plotly for interactive charts',
            'cairosvg': 'CairoSVG for SVG to PNG conversion',
            'pydantic': 'Pydantic for data validation',
            'supabase': 'Supabase client for storage',
            'groq': 'Groq client for fast LLM',
            'openai': 'OpenAI client for fallback LLM'
        }
        
        missing_packages = []
        
        for package, description in required_packages.items():
            try:
                __import__(package)
            except ImportError:
                missing_packages.append(f"  {package}: {description}")
        
        if missing_packages:
            self.errors.append(f"Missing required Python packages:\n" + "\n".join(missing_packages))
            self.errors.append("Install with: pip install -r requirements.txt")
            return False
        
        logger.info("✅ Python dependencies validated")
        self.checks_passed += 1
        return True
    
    def validate_ffmpeg(self) -> bool:
        """Validate FFmpeg is available for video processing"""
        logger.info("🔍 Validating FFmpeg availability...")
        self.total_checks += 1
        
        # Check for FFmpeg in common locations
        ffmpeg_paths = [
            shutil.which('ffmpeg'),
            '/usr/local/bin/ffmpeg',
            '/opt/homebrew/bin/ffmpeg',
            '/usr/bin/ffmpeg'
        ]
        
        ffmpeg_found = None
        for path in ffmpeg_paths:
            if path and os.path.isfile(path):
                ffmpeg_found = path
                break
        
        if not ffmpeg_found:
            self.errors.append(
                "FFmpeg not found. Install instructions:\n"
                "  macOS: brew install ffmpeg\n"
                "  Ubuntu/Debian: apt install ffmpeg\n"
                "  Windows: Download from https://ffmpeg.org/"
            )
            return False
        
        # Test FFmpeg functionality
        try:
            result = subprocess.run([ffmpeg_found, '-version'], 
                                  capture_output=True, text=True, timeout=5)
            if result.returncode != 0:
                self.errors.append(f"FFmpeg found at {ffmpeg_found} but not working")
                return False
        except Exception as e:
            self.errors.append(f"FFmpeg test failed: {e}")
            return False
        
        logger.info(f"✅ FFmpeg validated at {ffmpeg_found}")
        self.checks_passed += 1
        return True
    
    def check_dangerous_imports(self) -> bool:
        """Check for dangerous or legacy imports that should be blocked"""
        logger.info("🔍 Checking for dangerous imports...")
        self.total_checks += 1
        
        # Patterns that indicate dangerous/legacy imports
        dangerous_patterns = [
            'from remotion',
            'import remotion', 
            'from motion_canvas',
            'import motion_canvas',
            'direct_multimedia_processor',
            'educational_slide_generator', 
            'video_assembly_service'
        ]
        
        multimedia_dir = Path(__file__).parent
        python_files = list(multimedia_dir.rglob('*.py'))
        
        # Exclude this validation script itself
        validation_script = Path(__file__)
        python_files = [f for f in python_files if f != validation_script]
        
        dangerous_files = []
        
        for file_path in python_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                for pattern in dangerous_patterns:
                    if pattern in content:
                        dangerous_files.append(f"  {file_path.relative_to(multimedia_dir)}: contains '{pattern}'")
            except Exception as e:
                self.warnings.append(f"Could not read {file_path}: {e}")
        
        if dangerous_files:
            self.errors.append(f"Dangerous imports found:\n" + "\n".join(dangerous_files))
            return False
        
        logger.info("✅ No dangerous imports found")
        self.checks_passed += 1
        return True
    
    def validate_directory_structure(self) -> bool:
        """Validate required directory structure exists"""
        logger.info("🔍 Validating directory structure...")
        self.total_checks += 1
        
        base_dir = Path(__file__).parent
        required_dirs = [
            'validators',
            'ai_visual_generation',
            'visual_execution_engines',
            'storage',
            'templates'
        ]
        
        missing_dirs = []
        for dir_name in required_dirs:
            dir_path = base_dir / dir_name
            if not dir_path.exists():
                dir_path.mkdir(parents=True, exist_ok=True)
                logger.info(f"Created directory: {dir_path}")
        
        logger.info("✅ Directory structure validated")
        self.checks_passed += 1
        return True
    
    def validate_system_resources(self) -> bool:
        """Validate system has sufficient resources"""
        logger.info("🔍 Validating system resources...")
        self.total_checks += 1
        
        # Check available disk space (need at least 1GB)
        try:
            statvfs = os.statvfs(Path(__file__).parent)
            free_bytes = statvfs.f_frsize * statvfs.f_bavail
            free_gb = free_bytes / (1024**3)
            
            if free_gb < 1.0:
                self.warnings.append(f"Low disk space: {free_gb:.1f}GB available (recommend 1GB+)")
        except Exception as e:
            self.warnings.append(f"Could not check disk space: {e}")
        
        # Check Python version (need 3.8+)
        python_version = sys.version_info
        if python_version < (3, 8):
            self.errors.append(f"Python {python_version.major}.{python_version.minor} not supported (need 3.8+)")
            return False
        
        logger.info(f"✅ System resources validated (Python {python_version.major}.{python_version.minor}.{python_version.micro})")
        self.checks_passed += 1
        return True
    
    def run_all_validations(self) -> bool:
        """Run all validation checks"""
        logger.info("🚀 Starting environment validation for AI Visual Pipeline...")
        logger.info(f"Platform: {platform.system()} {platform.release()}")
        
        validations = [
            self.validate_environment_variables,
            self.validate_python_dependencies,
            self.validate_ffmpeg,
            self.check_dangerous_imports,
            self.validate_directory_structure,
            self.validate_system_resources
        ]
        
        all_passed = True
        for validation in validations:
            try:
                if not validation():
                    all_passed = False
            except Exception as e:
                self.errors.append(f"Validation error: {e}")
                all_passed = False
        
        # Print summary
        logger.info(f"\n📊 Validation Summary:")
        logger.info(f"  Checks passed: {self.checks_passed}/{self.total_checks}")
        
        if self.warnings:
            logger.warning("⚠️  Warnings:")
            for warning in self.warnings:
                logger.warning(f"  {warning}")
        
        if self.errors:
            logger.error("❌ Errors:")
            for error in self.errors:
                logger.error(f"  {error}")
            logger.error("\nFix errors above before proceeding with AI visual pipeline implementation.")
            return False
        
        if all_passed:
            logger.info("✅ Environment validation passed! Ready for AI visual pipeline implementation.")
        
        return all_passed


def main():
    """Main entry point"""
    validator = EnvironmentValidator()
    success = validator.run_all_validations()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()