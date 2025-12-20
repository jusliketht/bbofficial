#!/bin/bash
# =====================================================
# VERIFY UNUSED FILES SCRIPT
# Checks if files are imported/required anywhere in codebase
# =====================================================

echo "🔍 Verifying unused files..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if file is used
check_file_usage() {
    local file_path=$1
    local file_name=$(basename "$file_path" .js)
    local file_name_no_ext=$(basename "$file_path")
    
    echo "Checking: $file_path"
    
    # Search in backend
    if [ -d "backend/src" ]; then
        backend_matches=$(grep -r "$file_name\|$file_name_no_ext" backend/src --exclude-dir=node_modules 2>/dev/null | grep -v "$file_path" | wc -l)
        if [ "$backend_matches" -gt 0 ]; then
            echo -e "${YELLOW}  ⚠️  Found $backend_matches references in backend${NC}"
            grep -r "$file_name\|$file_name_no_ext" backend/src --exclude-dir=node_modules 2>/dev/null | grep -v "$file_path" | head -5
        else
            echo -e "${GREEN}  ✅ No references in backend${NC}"
        fi
    fi
    
    # Search in frontend
    if [ -d "frontend/src" ]; then
        frontend_matches=$(grep -r "$file_name\|$file_name_no_ext" frontend/src --exclude-dir=node_modules 2>/dev/null | grep -v "$file_path" | wc -l)
        if [ "$frontend_matches" -gt 0 ]; then
            echo -e "${YELLOW}  ⚠️  Found $frontend_matches references in frontend${NC}"
            grep -r "$file_name\|$file_name_no_ext" frontend/src --exclude-dir=node_modules 2>/dev/null | grep -v "$file_path" | head -5
        else
            echo -e "${GREEN}  ✅ No references in frontend${NC}"
        fi
    fi
    
    echo ""
}

# Files to check
echo "=== Checking Legacy Files ==="
echo ""

# Backend files
if [ -f "backend/src/controllers/ITRController.js" ]; then
    echo "Checking generateGovernmentJson usage..."
    grep -r "generateGovernmentJson" backend/src --exclude-dir=node_modules | grep -v "@deprecated" | wc -l
    echo ""
fi

# Frontend files
check_file_usage "frontend/src/pages/ITR/ITRFiling.js"
check_file_usage "frontend/src/components/ITR/ITRFilingStepper.js"

echo "=== Verification Complete ==="

