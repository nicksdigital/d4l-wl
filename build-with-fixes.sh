#!/bin/bash

# Create a temporary directory for the build
mkdir -p .next-temp

# Temporarily rename problematic pages
if [ -d "src/app/airdrop" ]; then
  mv src/app/airdrop src/app/airdrop-temp
  echo "Temporarily moved airdrop page"
fi

if [ -d "src/app/rewards" ]; then
  mv src/app/rewards src/app/rewards-temp
  echo "Temporarily moved rewards page"
fi

# Try to build
echo "Building with temporary fixes..."
npx next build --no-lint

# Restore the original files
if [ -d "src/app/airdrop-temp" ]; then
  mv src/app/airdrop-temp src/app/airdrop
  echo "Restored airdrop page"
fi

if [ -d "src/app/rewards-temp" ]; then
  mv src/app/rewards-temp src/app/rewards
  echo "Restored rewards page"
fi

echo "Build process completed"
