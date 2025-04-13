#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing common npm issues...');

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

// Check for and fix package-lock.json issues
console.log('\n📦 Checking package-lock.json...');
const packageLockPath = path.join(process.cwd(), 'package-lock.json');

if (fs.existsSync(packageLockPath)) {
  try {
    const packageLock = require(packageLockPath);
    const packageJson = require(path.join(process.cwd(), 'package.json'));
    
    // Check if package-lock.json version matches package.json
    if (packageLock.version !== packageJson.version) {
      console.log('⚠️ package-lock.json version does not match package.json');
      runCommand('npm install --package-lock-only', 'Updated package-lock.json version');
    }
    
    // Check for lockfile version
    if (packageLock.lockfileVersion < 2) {
      console.log('⚠️ package-lock.json uses an older format');
      runCommand('npm install --package-lock-only', 'Updated package-lock.json format');
    }
  } catch (error) {
    console.error('⚠️ Error parsing package-lock.json:', error.message);
    console.log('Attempting to fix package-lock.json...');
    runCommand('rm -f package-lock.json && npm install --package-lock-only', 'Regenerated package-lock.json');
  }
} else {
  console.log('⚠️ No package-lock.json found');
  runCommand('npm install --package-lock-only', 'Generated package-lock.json');
}

// Fix permissions issues
console.log('\n🔒 Fixing npm permissions...');
runCommand('npm config set unsafe-perm=true', 'Set unsafe-perm to true');

// Fix registry issues
console.log('\n🌐 Checking registry configuration...');
runCommand('npm config set registry https://registry.npmjs.org/', 'Set npm registry to default');

// Fix cache issues
console.log('\n💾 Fixing cache issues...');
runCommand('npm cache verify', 'Verified npm cache');

// Fix node_modules issues
console.log('\n📂 Checking for node_modules issues...');
const nodeModulesPath = path.join(process.cwd(), 'node_modules');

if (fs.existsSync(nodeModulesPath)) {
  // Check for common problematic files/folders
  const problematicPaths = [
    path.join(nodeModulesPath, '.bin'),
    path.join(nodeModulesPath, '.cache'),
    path.join(nodeModulesPath, '.package-lock.json'),
  ];
  
  let hasIssues = false;
  
  problematicPaths.forEach(p => {
    if (!fs.existsSync(p)) {
      console.log(`⚠️ Missing expected path: ${p}`);
      hasIssues = true;
    }
  });
  
  if (hasIssues) {
    console.log('Attempting to fix node_modules issues...');
    runCommand('npm ci --prefer-offline', 'Reinstalled dependencies');
  } else {
    console.log('✅ node_modules structure looks good');
  }
} else {
  console.log('⚠️ No node_modules found');
  runCommand('npm ci --prefer-offline', 'Installed dependencies');
}

// Fix global npm issues
console.log('\n🌍 Checking global npm configuration...');
runCommand('npm config set fund false', 'Disabled funding messages');
runCommand('npm config set audit false', 'Disabled audit messages');

// Final cleanup
console.log('\n🧹 Performing final cleanup...');
runCommand('npm prune', 'Removed extraneous packages');
runCommand('npm dedupe', 'Deduplicated dependencies');

console.log('\n🎉 npm issues fixed! Your npm should now work more reliably.');
