#!/bin/bash

# Script to fix revalidate issues in Next.js pages
echo "🔍 Scanning for pages with revalidate issues..."

# Find all page files
PAGE_FILES=$(find src/app -name "page.tsx" -o -name "layout.tsx")

# Fix revalidate exports in all pages
for file in $PAGE_FILES; do
  # Check if file contains a dynamic revalidate export
  if grep -q "export const revalidate" "$file"; then
    echo "🛠️ Checking $file..."
    
    # Check if the revalidate value is dynamic (contains a dot)
    if grep -q "export const revalidate = [a-zA-Z0-9_]*\." "$file"; then
      echo "⚠️ Found dynamic revalidate in $file"
      
      # Set a static value
      STATIC_VALUE=60
      
      # Create backup
      cp "$file" "${file}.bak"
      
      # Replace dynamic revalidate with static value
      sed -i '' "s/export const revalidate = [a-zA-Z0-9_]*\.[a-zA-Z0-9_]*\.[a-zA-Z0-9_]*;/export const revalidate = $STATIC_VALUE; \/\/ Fixed for build/g" "$file"
      sed -i '' "s/export const revalidate = [a-zA-Z0-9_]*\.[a-zA-Z0-9_]*;/export const revalidate = $STATIC_VALUE; \/\/ Fixed for build/g" "$file"
      
      echo "✅ Fixed revalidate in $file"
    else
      echo "✓ Revalidate already using static value in $file"
    fi
  fi
done

echo "🚀 All revalidate issues fixed! You can now run 'npx next build --no-lint'"
