#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Starting with a clean environment...');

// Configuration
const HOST = 'main.d4l.ai';
const PORT = 3000;

// Clean .next directory
console.log('Removing .next directory...');
try {
  const nextDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('✅ .next directory removed');
  }
} catch (error) {
  console.error('❌ Error cleaning .next directory:', error.message);
}

// Create a temporary next.config.js
console.log('Creating minimal next.config.js...');
const originalConfigPath = path.join(process.cwd(), 'next.config.js');
const backupConfigPath = path.join(process.cwd(), 'next.config.js.backup');
const minimalConfig = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true
  }
};

module.exports = nextConfig;
`;

// Backup original config
if (fs.existsSync(originalConfigPath)) {
  fs.copyFileSync(originalConfigPath, backupConfigPath);
  console.log('✅ Original next.config.js backed up');
}

// Write minimal config
fs.writeFileSync(originalConfigPath, minimalConfig);
console.log('✅ Minimal next.config.js created');

// Start Next.js
console.log('🚀 Starting Next.js...');
try {
  execSync(`npx next dev -H ${HOST} -p ${PORT}`, { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: '1'
    }
  });
} catch (error) {
  console.error('❌ Error running Next.js:', error.message);
} finally {
  // Restore original config
  if (fs.existsSync(backupConfigPath)) {
    fs.copyFileSync(backupConfigPath, originalConfigPath);
    fs.unlinkSync(backupConfigPath);
    console.log('✅ Original next.config.js restored');
  }
}
