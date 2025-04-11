#!/bin/bash

# Deployment script for D4L Next.js application
# This script handles the deployment process including dependency installation
# and environment variable validation

set -e  # Exit immediately if a command exits with a non-zero status

echo "Starting deployment process for D4L Next.js application..."

# Step 1: Install dependencies
echo "Installing dependencies..."
npm install

# Step 2: Validate environment variables
echo "Validating environment variables..."
node scripts/validate-env.js

if [ $? -ne 0 ]; then
  echo "Environment validation failed. Please fix the issues and try again."
  exit 1
fi

# Step 3: Build the application
echo "Building the application..."
NODE_ENV=production npm run build

# Step 4: Start the application
echo "Starting the application..."
NODE_ENV=production npm run start
