#!/bin/bash

# Script to load environment variables from .env file and then run npm run dev
# Usage: ./start-dev.sh

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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
  echo -e "Create the ${ENV_FILE} file or specify a different one: ./start-dev.sh path/to/env/file"
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

echo -e "${GREEN}Environment variables loaded successfully!${NC}"
echo -e "${YELLOW}Starting development server...${NC}"

# Run npm run dev
npm run dev

# Exit with the same code as npm run dev
exit $?
