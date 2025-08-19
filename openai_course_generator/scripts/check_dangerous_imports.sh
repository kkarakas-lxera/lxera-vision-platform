#!/bin/bash
# CI/CD Guard Script - Prevent Dangerous Imports
# Prevents legacy and dangerous imports that could break the AI visual pipeline

set -e

echo "🔍 Checking for dangerous imports in multimedia pipeline..."

DANGEROUS_PATTERNS=(
    "from remotion"
    "import remotion"
    "from motion_canvas"
    "import motion_canvas"
    "direct_multimedia_processor"
    "educational_slide_generator"
    "video_assembly_service"
    "from ..broken_components"
    "from ..legacy"
)

MULTIMEDIA_DIR="$(dirname "$0")/../multimedia"
FOUND_ISSUES=false

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
    echo "Checking for: $pattern"
    
    # Search for pattern in Python files, excluding validation and script files
    if grep -r "$pattern" "$MULTIMEDIA_DIR" --include="*.py" --exclude-dir=".git" --exclude-dir="__pycache__" --exclude="validate_environment.py" --exclude="*discovery.py"; then
        echo "❌ Found dangerous import: $pattern"
        FOUND_ISSUES=true
    fi
done

# Check for specific broken files that should not exist
BLOCKED_FILES=(
    "direct_multimedia_processor.py"
    "educational_slide_generator.py" 
    "video_assembly_service.py"
    "remotion_video_generator.py"
    "motion_canvas_video_generator.py"
)

for file in "${BLOCKED_FILES[@]}"; do
    if find "$MULTIMEDIA_DIR" -name "$file" | grep -q .; then
        echo "❌ Found blocked file: $file"
        FOUND_ISSUES=true
    fi
done

if [ "$FOUND_ISSUES" = true ]; then
    echo ""
    echo "❌ CI/CD Check Failed: Dangerous imports or files detected"
    echo "Remove the above imports/files before continuing"
    exit 1
else
    echo "✅ No dangerous imports found - CI/CD check passed"
    exit 0
fi