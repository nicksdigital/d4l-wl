#!/bin/bash

# Script for faster development server startup
# Usage: ./fast-dev.sh

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default .env file path
ENV_FILE=".env"

# Check if a specific .env file was provided as argument
if [ "$1" != "" ]; then
  ENV_FILE=$1
  echo -e "${YELLOW}Using custom .env file: ${ENV_FILE}${NC}"
fi

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${RED}Error: ${ENV_FILE} file not found!${NC}"
  echo -e "Create the ${ENV_FILE} file or specify a different one: ./fast-dev.sh path/to/env/file"
  exit 1
fi

echo -e "${GREEN}Loading environment variables from ${ENV_FILE}...${NC}"

# Read .env file line by line
while IFS= read -r line || [[ -n "$line" ]]; do
  # Skip empty lines and comments
  if [[ -z "$line" || "$line" =~ ^# ]]; then
    continue
  fi
  
  # Export the variable
  export "$line"
  
  # Print the variable name (without the value for security)
  VAR_NAME=$(echo "$line" | cut -d= -f1)
  echo -e "${GREEN}Exported:${NC} $VAR_NAME"
done < "$ENV_FILE"

# Set performance-focused environment variables
export NEXT_TELEMETRY_DISABLED=1
export NODE_ENV=development
export NEXT_WEBPACK_USEPOLLING=1
export WATCHPACK_POLLING=true
export CHOKIDAR_USEPOLLING=true
# Skip type checking during development
export NEXT_SKIP_TYPESCRIPT_CHECK=1

echo -e "${CYAN}Setting performance optimizations for development...${NC}"
echo -e "${YELLOW}Starting faster development server...${NC}"

# Run next dev with optimized settings - turbo is now configured in next.config.mjs
NODE_OPTIONS="--max-old-space-size=8192" npx next dev

# Exit with the same code as npm run dev
exit $?
