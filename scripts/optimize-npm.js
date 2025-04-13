#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🚀 Optimizing npm for maximum speed...');

// Function to run commands and handle errors
function runCommand(command, message) {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${message}`);
    return true;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return false;
  }
}

// Verify npm cache
console.log('\n📦 Verifying npm cache...');
runCommand('npm cache verify', 'npm cache verified');

// Clean npm cache
console.log('\n🧹 Cleaning npm cache...');
runCommand('npm cache clean --force', 'npm cache cleaned');

// Set npm configurations for speed
console.log('\n⚙️ Setting npm configurations for speed...');
const npmConfigs = [
  'npm config set fund false',
  'npm config set audit false',
  'npm config set loglevel error',
  'npm config set prefer-offline true',
  'npm config set progress false',
  'npm config set fetch-retries 5',
  'npm config set fetch-retry-mintimeout 20000',
  'npm config set fetch-retry-maxtimeout 120000',
  'npm config set cache-max Infinity',
  'npm config set update-notifier false',
  'npm config set ignore-scripts true',
  'npm config set no-optional true',
];

npmConfigs.forEach(config => {
  runCommand(config, `Set ${config.split(' ')[2]}`);
});

// Set npm cache location to a faster drive if available
console.log('\n💾 Setting optimal npm cache location...');
const tmpDir = os.tmpdir();
const npmCacheDir = path.join(tmpDir, 'npm-cache');

if (!fs.existsSync(npmCacheDir)) {
  fs.mkdirSync(npmCacheDir, { recursive: true });
}

runCommand(`npm config set cache "${npmCacheDir}"`, 'Set npm cache to faster location');

// Install faster npm dependencies
console.log('\n📚 Installing performance-enhancing npm packages...');
runCommand('npm install -g npm-fast-install', 'Installed npm-fast-install');

// Final optimizations
console.log('\n🔧 Performing final optimizations...');
runCommand('npm config set registry https://registry.npmjs.org/', 'Set npm registry');

console.log('\n🎉 npm optimization complete! Your npm operations should now be much faster.');
console.log('\nRecommended usage:');
console.log('- Use "npm ci" instead of "npm install" when possible');
console.log('- Use "npm install --prefer-offline" to use cached packages');
console.log('- Use "npm run clean:deps" to clean dependencies when needed');

// Create a timestamp file to track when optimization was last run
fs.writeFileSync(
  path.join(process.cwd(), '.npm-optimized'),
  new Date().toISOString()
);

console.log('\n⏱️ Optimization timestamp saved. You\'re all set!');
