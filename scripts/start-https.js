#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

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

// Set environment variables for Next.js
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // For development only
process.env.HTTPS = 'true';
process.env.SSL_KEY_FILE = KEY_PATH;
process.env.SSL_CERT_FILE = CERT_PATH;

// Start Next.js with experimental HTTPS
console.log(`Using certificates:\n- Key: ${KEY_PATH}\n- Cert: ${CERT_PATH}`);

// Start Next.js with experimental HTTPS
const nextDev = spawn('next', [
  'dev',
  '--experimental-https',
  '--hostname', HOST,
  '--port', PORT.toString()
], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    HTTPS_KEY: KEY_PATH,
    HTTPS_CERT: CERT_PATH
  },
});

// Handle process exit
nextDev.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Next.js process exited with code ${code}`);
  }
  process.exit(code);
});

// Handle process errors
nextDev.on('error', (err) => {
  console.error('❌ Failed to start Next.js process:', err);
  process.exit(1);
});

// Handle termination signals
['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    nextDev.kill(signal);
  });
});

console.log(`\n🔒 HTTPS development server running at https://${HOST}:${PORT}`);
console.log('⚠️  Note: You may need to accept the self-signed certificate in your browser');
