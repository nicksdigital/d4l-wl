#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const HOST = 'main.d4l.ai';
const PORT = 3000;
const CERT_DIR = path.join(process.cwd(), 'certificates');
const KEY_PATH = path.join(CERT_DIR, 'localhost-key.pem');
const CERT_PATH = path.join(CERT_DIR, 'localhost.pem');

console.log(`🚀 Starting Next.js development server with HTTPS on ${HOST}:${PORT}...`);

// Check if certificates exist
if (!fs.existsSync(KEY_PATH) || !fs.existsSync(CERT_PATH)) {
  console.error('❌ SSL certificates not found. Please run "npm run generate-certs" first.');
  process.exit(1);
}

// Create a simple command to run Next.js with HTTPS
const command = `HTTPS=true SSL_CRT_FILE=${CERT_PATH} SSL_KEY_FILE=${KEY_PATH} npx next dev -H ${HOST} -p ${PORT}`;

console.log(`Running command: ${command}`);

try {
  // Execute the command
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Error starting Next.js with HTTPS:', error.message);
  process.exit(1);
}
