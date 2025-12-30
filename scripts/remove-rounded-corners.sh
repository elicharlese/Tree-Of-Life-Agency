#!/bin/bash

# Script to remove all rounded corner classes from TSX/JSX files
# This implements the squared professional design requirement

echo "Removing rounded corners from all components and pages..."

# Find all TSX and JSX files and replace rounded classes
find /Users/elicharlese/CascadeProjects/Tree-Of-Life-Agency -type f \( -name "*.tsx" -o -name "*.jsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/dist/*" \
  -exec sed -i '' \
    -e 's/rounded-full//g' \
    -e 's/rounded-3xl//g' \
    -e 's/rounded-2xl//g' \
    -e 's/rounded-xl//g' \
    -e 's/rounded-lg//g' \
    -e 's/rounded-md//g' \
    -e 's/rounded-sm//g' \
    -e 's/rounded-t-lg//g' \
    -e 's/rounded-b-lg//g' \
    -e 's/rounded-l-lg//g' \
    -e 's/rounded-r-lg//g' \
    -e 's/rounded-tl-lg//g' \
    -e 's/rounded-tr-lg//g' \
    -e 's/rounded-bl-lg//g' \
    -e 's/rounded-br-lg//g' \
    -e 's/rounded-organic//g' \
    -e 's/rounded-branch//g' \
    {} \;

echo "Rounded corners removed successfully!"
echo "All components now use squared design."
