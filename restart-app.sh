#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Stopping any running processes...${NC}"
# Find and kill any running Node.js processes for the application
pkill -f "node.*next"

echo -e "${YELLOW}Testing database connection...${NC}"
# Run the database connection test
node test-db-connection.js

# Check if the test was successful
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Database connection test successful!${NC}"
else
  echo -e "${RED}Database connection test failed. Please check your configuration.${NC}"
  exit 1
fi

echo -e "${YELLOW}Starting the application...${NC}"
# Start the application with the updated configuration
npm run dev

# Exit with the same code as npm run dev
exit $?
