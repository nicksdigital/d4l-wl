#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📊 Analyzing npm dependencies for optimization opportunities...');

// Function to run commands and handle errors
function runCommand(command, silent = false) {
  try {
    return execSync(command, { 
      encoding: 'utf8',
      stdio: silent ? 'pipe' : 'inherit'
    });
  } catch (error) {
    console.error(`Error running command: ${command}`);
    console.error(error.message);
    return '';
  }
}

// Check for duplicate dependencies
console.log('\n🔍 Checking for duplicate dependencies...');
try {
  const dedupe = runCommand('npm dedupe --dry-run', true);
  if (dedupe.includes('would be deduplicated')) {
    console.log('⚠️ Found duplicate dependencies that can be deduplicated.');
    console.log('Run "npm dedupe" to fix these issues.');
  } else {
    console.log('✅ No duplicate dependencies found.');
  }
} catch (error) {
  console.log('⚠️ Could not check for duplicates. Try running "npm dedupe" manually.');
}

// Check for outdated dependencies
console.log('\n🔄 Checking for outdated dependencies...');
try {
  const outdated = runCommand('npm outdated --json', true);
  const outdatedDeps = JSON.parse(outdated || '{}');
  const outdatedCount = Object.keys(outdatedDeps).length;
  
  if (outdatedCount > 0) {
    console.log(`⚠️ Found ${outdatedCount} outdated dependencies.`);
    console.log('Run "npm update" to update to the latest compatible versions.');
    console.log('Or run "npm outdated" to see details.');
  } else {
    console.log('✅ All dependencies are up to date.');
  }
} catch (error) {
  console.log('⚠️ Could not check for outdated packages. Try running "npm outdated" manually.');
}

// Check for unused dependencies
console.log('\n🧹 Checking for potentially unused dependencies...');
try {
  const packageJson = require(path.join(process.cwd(), 'package.json'));
  const dependencies = { 
    ...packageJson.dependencies || {}, 
    ...packageJson.devDependencies || {} 
  };
  
  console.log(`Found ${Object.keys(dependencies).length} total dependencies.`);
  console.log('To check for unused dependencies, consider installing "depcheck" with:');
  console.log('npm install -g depcheck');
  console.log('Then run "depcheck" in your project directory.');
} catch (error) {
  console.log('⚠️ Could not analyze package.json for unused dependencies.');
}

// Check npm cache size
console.log('\n💾 Checking npm cache size...');
try {
  const cacheSize = runCommand('npm cache verify', true);
  console.log('Cache verification complete. Consider running "npm cache clean --force" if needed.');
} catch (error) {
  console.log('⚠️ Could not verify npm cache.');
}

// Provide optimization recommendations
console.log('\n🚀 Dependency Optimization Recommendations:');
console.log('1. Run "npm dedupe" to remove duplicate dependencies');
console.log('2. Run "npm prune" to remove extraneous packages');
console.log('3. Consider using "npm ci" instead of "npm install" for faster, more reliable builds');
console.log('4. Use "npm install --production" when deploying to exclude devDependencies');
console.log('5. Consider using pnpm or yarn for faster package management');

console.log('\n✨ Analysis complete! Follow the recommendations above to optimize your dependencies.');
