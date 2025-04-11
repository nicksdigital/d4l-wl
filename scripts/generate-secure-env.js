#!/usr/bin/env node

/**
 * Secure Environment Variable Generator
 * 
 * This script generates secure random values for sensitive environment variables
 * and updates the .env.production file with these values.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

// Path to .env.production file
const ENV_FILE_PATH = path.join(__dirname, '..', '.env.production');

// Generate a secure random string of specified length
function generateSecureString(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Generate a secure API key (base64 format)
function generateApiKey() {
  return crypto.randomBytes(32).toString('base64');
}

// Generate a secure private key for Ethereum (64 hex chars without 0x prefix)
function generatePrivateKey() {
  return crypto.randomBytes(32).toString('hex');
}

// Read the current .env.production file
function readEnvFile() {
  try {
    return fs.readFileSync(ENV_FILE_PATH, 'utf8');
  } catch (error) {
    console.error('Error reading .env.production file:', error.message);
    process.exit(1);
  }
}

// Write the updated content back to the .env.production file
function writeEnvFile(content) {
  try {
    fs.writeFileSync(ENV_FILE_PATH, content, 'utf8');
    console.log('Successfully updated .env.production file');
  } catch (error) {
    console.error('Error writing to .env.production file:', error.message);
    process.exit(1);
  }
}

// Create a backup of the original file
function createBackup() {
  const backupPath = `${ENV_FILE_PATH}.backup-${Date.now()}`;
  try {
    fs.copyFileSync(ENV_FILE_PATH, backupPath);
    console.log(`Created backup at ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error('Error creating backup:', error.message);
    process.exit(1);
  }
}

// Main function to update the .env.production file
function updateEnvFile() {
  console.log('Generating secure random values for .env.production...');
  
  // Create a backup first
  const backupPath = createBackup();
  
  // Read the current file
  let envContent = readEnvFile();
  
  // Define the replacements to make
  const replacements = [
    {
      placeholder: 'NEXTAUTH_SECRET=replace_with_secure_random_string',
      replacement: `NEXTAUTH_SECRET=${generateSecureString(64)}`
    },
    {
      placeholder: 'REVALIDATION_SECRET=replace_with_secure_random_string',
      replacement: `REVALIDATION_SECRET=${generateSecureString(32)}`
    },
    {
      placeholder: 'ADMIN_API_KEY=replace_with_secure_api_key',
      replacement: `ADMIN_API_KEY=${generateApiKey()}`
    },
    {
      placeholder: 'ADMIN_PRIVATE_KEY=replace_with_secure_private_key',
      replacement: `ADMIN_PRIVATE_KEY=${generatePrivateKey()}`
    }
  ];
  
  // Apply each replacement
  replacements.forEach(({ placeholder, replacement }) => {
    if (envContent.includes(placeholder)) {
      envContent = envContent.replace(placeholder, replacement);
      console.log(`✅ Generated: ${replacement.split('=')[0]}`);
    } else {
      console.log(`⚠️ Placeholder not found: ${placeholder.split('=')[0]}`);
    }
  });
  
  // Write the updated content back
  writeEnvFile(envContent);
  
  console.log('\nSecurity Notice:');
  console.log('----------------');
  console.log('1. These values are cryptographically secure, but should still be kept private');
  console.log('2. Do not commit the .env.production file to version control');
  console.log('3. In production, consider using a secrets manager instead of environment files');
  console.log(`4. A backup of the original file was created at ${backupPath}`);
}

// Execute the main function
updateEnvFile();
