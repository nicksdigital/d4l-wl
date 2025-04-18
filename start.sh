#!/bin/bash

# Start Hardhat node and deploy contracts
echo "Starting Hardhat node in the background..."
npx hardhat node > hardhat.log 2>&1 &
HARDHAT_PID=$!
echo "Hardhat node started with PID: $HARDHAT_PID"

# Wait for node to be ready
sleep 5
echo "Deploying contracts to local Hardhat network..."
npx hardhat run scripts/run-local.js --network localhost

# Run tests
echo "Running contract tests..."
npx hardhat test

# Start the frontend development server
echo "Starting Next.js development server..."
npm run dev

# Cleanup function
cleanup() {
  echo "Stopping Hardhat node (PID: $HARDHAT_PID)..."
  kill $HARDHAT_PID
  exit 0
}

# Register the cleanup function to be called on script termination
trap cleanup SIGINT SIGTERM

# Keep script running until user interrupts
echo "Everything is running. Press Ctrl+C to stop all services."
wait
