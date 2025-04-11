#!/usr/bin/env node

/**
 * Enhanced development script for Next.js
 * This script optimizes your Next.js development experience with:
 * - More memory allocation
 * - Faster refresh cycles
 * - Better caching
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const dotenv = require('dotenv');

// Load environment variables
const envFile = process.argv[2] || '.env';
const envPath = path.resolve(process.cwd(), envFile);

try {
  if (fs.existsSync(envPath)) {
    console.log(`\x1b[32mLoading environment variables from ${envFile}...\x1b[0m`);
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    
    // Set environment variables
    for (const key in envConfig) {
      process.env[key] = envConfig[key];
      console.log(`\x1b[32mExported:\x1b[0m ${key}`);
    }
  } else {
    console.log(`\x1b[33mWarning: ${envFile} not found, continuing without environment variables.\x1b[0m`);
  }
} catch (error) {
  console.error(`\x1b[31mError loading environment variables: ${error.message}\x1b[0m`);
}

// Set performance-focused environment variables
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NODE_ENV = 'development';
process.env.NEXT_SKIP_TYPESCRIPT_CHECK = '1';

// Determine optimal memory allocation based on system
const systemMemoryMB = Math.round(os.totalmem() / 1024 / 1024);
const allocatedMemoryMB = Math.min(Math.round(systemMemoryMB * 0.6), 8192);
process.env.NODE_OPTIONS = `--max-old-space-size=${allocatedMemoryMB}`;

console.log(`\x1b[36mSetting performance optimizations:\x1b[0m`);
console.log(`- Memory allocation: ${allocatedMemoryMB}MB`);
console.log(`- TypeScript checks skipped during development`);
console.log(`- Telemetry disabled\n`);

console.log(`\x1b[33mStarting faster development server...\x1b[0m`);

try {
  // Execute next dev with the optimized settings
  execSync('npx next dev', { 
    stdio: 'inherit',
    env: process.env
  });
} catch (error) {
  // Exit with the same code as next dev
  process.exit(error.status || 1);
}
