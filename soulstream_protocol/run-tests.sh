#!/bin/bash

# Clean the cache and artifacts
echo "Cleaning cache and artifacts..."
npx hardhat clean

# Compile the contracts
echo "Compiling contracts..."
npx hardhat compile

# Run the focused test first
echo "Running D4LAssetFactoryTest.js..."
npx hardhat test test/D4LAssetFactoryTest.js

# Run the full test suite if the focused test passes
if [ $? -eq 0 ]; then
  echo "Running D4LAssetTest.js..."
  npx hardhat test test/D4LAssetTest.js
else
  echo "D4LAssetFactoryTest.js failed. Skipping D4LAssetTest.js."
  exit 1
fi
