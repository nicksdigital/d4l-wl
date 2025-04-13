#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Starting Next.js in debug mode...');

// Configuration
const HOST = 'main.d4l.ai';
const PORT = 3000;
const CERT_DIR = path.join(process.cwd(), 'certificates');
const KEY_PATH = path.join(CERT_DIR, 'localhost-key.pem');
const CERT_PATH = path.join(CERT_DIR, 'localhost.pem');

// Check if certificates exist
if (fs.existsSync(KEY_PATH) && fs.existsSync(CERT_PATH)) {
  console.log('✅ SSL certificates found');
} else {
  console.log('⚠️ SSL certificates not found, running without HTTPS');
}

// Clean .next directory
console.log('🧹 Cleaning .next directory...');
try {
  const nextDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('✅ .next directory removed');
  }
} catch (error) {
  console.error('❌ Error cleaning .next directory:', error.message);
}

// Start Next.js with debugging
console.log('🚀 Starting Next.js...');

const env = {
  ...process.env,
  NODE_OPTIONS: '--inspect',
  NEXT_TELEMETRY_DISABLED: '1',
  DEBUG: '*'
};

// Add HTTPS if certificates exist
if (fs.existsSync(KEY_PATH) && fs.existsSync(CERT_PATH)) {
  env.HTTPS = 'true';
  env.SSL_CRT_FILE = CERT_PATH;
  env.SSL_KEY_FILE = KEY_PATH;
}

const nextDev = spawn('npx', [
  'next',
  'dev',
  '-H', HOST,
  '-p', PORT.toString()
], {
  stdio: 'inherit',
  env
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
