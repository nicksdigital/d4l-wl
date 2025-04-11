#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * 
 * This script validates that all required environment variables are present
 * before building or serving the application.
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Define required environment variables by category
const requiredEnvVars = {
  // Core application settings
  core: [
    'NEXT_PUBLIC_DEPLOYED_DOMAIN',
    'NEXT_PUBLIC_API_BASE_URL',
  ],
  
  // Authentication
  auth: [
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
  ],
  
  // Database
  database: [
    'DATABASE_URL',
    // Individual DB params as fallback if DATABASE_URL is not set
    ['DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_SSL_MODE'],
  ],
  
  // Redis (optional if using in-memory cache)
  redis: [
    // Redis is optional if NEXT_PUBLIC_USE_IN_MEMORY_CACHE is true
  ],
  
  // Blockchain
  blockchain: [
    'NEXT_PUBLIC_RPC_URL',
    'NEXT_PUBLIC_WISHLIST_REGISTRY_ADDRESS',
    'NEXT_PUBLIC_SOULBOUND_PROFILE_ADDRESS',
    'NEXT_PUBLIC_AIRDROP_CONTROLLER_ADDRESS',
    'NEXT_PUBLIC_TOKEN_ADDRESS',
    'NEXT_PUBLIC_REWARD_REGISTRY_ADDRESS',
    'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
    'NEXT_PUBLIC_REOWN_PROJECT_ID',
  ],
  
  // Admin API
  admin: [
    'ADMIN_API_KEY',
    'ADMIN_PRIVATE_KEY',
  ],
  
  // Cache settings
  cache: [
    'NEXT_PUBLIC_USE_IN_MEMORY_CACHE',
    'CACHE_MAX_AGE',
    'STALE_WHILE_REVALIDATE',
  ],
};

// Environment-specific validations
const envSpecificVars = {
  production: [
    'NEXTAUTH_URL', // Must be the production URL
    'NEXT_PUBLIC_CSP_CONNECT_SOURCES', // Security headers for production
  ],
  development: [],
};

// Check if a variable or a set of alternative variables are defined
function checkVarOrAlternatives(varOrArray) {
  if (Array.isArray(varOrArray)) {
    // If any of the alternatives are defined, that's sufficient
    return varOrArray.some(v => process.env[v] !== undefined);
  } else {
    return process.env[varOrArray] !== undefined;
  }
}

// Get the current environment
const nodeEnv = process.env.NODE_ENV || 'development';
console.log(`Validating environment variables for ${nodeEnv} environment...`);

// Track missing variables
const missingVars = [];

// Check all required variables
Object.entries(requiredEnvVars).forEach(([category, vars]) => {
  console.log(`\nChecking ${category} variables:`);
  
  vars.forEach(varOrArray => {
    const isPresent = checkVarOrAlternatives(varOrArray);
    
    if (Array.isArray(varOrArray)) {
      if (!isPresent) {
        console.log(`❌ Missing: At least one of [${varOrArray.join(', ')}] is required`);
        missingVars.push(`At least one of [${varOrArray.join(', ')}]`);
      } else {
        console.log(`✅ Found: At least one of [${varOrArray.join(', ')}] is present`);
      }
    } else {
      if (!isPresent) {
        console.log(`❌ Missing: ${varOrArray}`);
        missingVars.push(varOrArray);
      } else {
        console.log(`✅ Found: ${varOrArray}`);
      }
    }
  });
});

// Check environment-specific variables
if (envSpecificVars[nodeEnv]) {
  console.log(`\nChecking ${nodeEnv}-specific variables:`);
  
  envSpecificVars[nodeEnv].forEach(varName => {
    if (process.env[varName] === undefined) {
      console.log(`❌ Missing: ${varName}`);
      missingVars.push(varName);
    } else {
      console.log(`✅ Found: ${varName}`);
    }
  });
}

// Special case for Redis
console.log('\nChecking Redis configuration:');
const useInMemoryCache = process.env.NEXT_PUBLIC_USE_IN_MEMORY_CACHE === 'true';
const hasRedisHost = process.env.REDIS_HOST && process.env.REDIS_HOST.trim() !== '';
const hasRedisPort = process.env.REDIS_PORT && process.env.REDIS_PORT.trim() !== '';

if (!useInMemoryCache && (!hasRedisHost || !hasRedisPort)) {
  console.log('❌ Warning: Redis configuration incomplete and in-memory cache is disabled');
  console.log('   Either set REDIS_HOST and REDIS_PORT or enable NEXT_PUBLIC_USE_IN_MEMORY_CACHE');
} else if (useInMemoryCache && !hasRedisHost) {
  console.log('✅ Using in-memory cache (Redis not configured)');
} else if (hasRedisHost && hasRedisPort) {
  console.log(`✅ Redis configured at ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
}

// Report results
console.log('\n--- Environment Validation Summary ---');
if (missingVars.length > 0) {
  console.error(`❌ Missing ${missingVars.length} required environment variables:`);
  missingVars.forEach(v => console.error(`   - ${v}`));
  console.error('\nPlease add these variables to your .env file or environment before building/serving.');
  process.exit(1);
} else {
  console.log('✅ All required environment variables are present!');
  process.exit(0);
}
