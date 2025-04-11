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
      
      # Determine appropriate static value based on file path
      if [[ "$file" == *"/claim/"* ]]; then
        STATIC_VALUE=0
        echo "  Setting to $STATIC_VALUE (no cache for user content)"
      elif [[ "$file" == *"/rewards/"* ]]; then
        STATIC_VALUE=0
        echo "  Setting to $STATIC_VALUE (no cache for user content)"
      elif [[ "$file" == *"/profile/"* ]]; then
        STATIC_VALUE=0
        echo "  Setting to $STATIC_VALUE (no cache for user content)"
      elif [[ "$file" == *"/admin/"* ]]; then
        STATIC_VALUE=60
        echo "  Setting to $STATIC_VALUE (short cache for admin)"
      elif [[ "$file" == *"/layout.tsx" ]]; then
        STATIC_VALUE=3600
        echo "  Setting to $STATIC_VALUE (1 hour for layout)"
      else
        STATIC_VALUE=60
        echo "  Setting to $STATIC_VALUE (1 minute default)"
      fi
      
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
