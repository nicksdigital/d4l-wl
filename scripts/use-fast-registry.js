#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');
const https = require('https');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Finding the fastest npm registry for your location...');

// List of popular npm registries
const registries = [
  { name: 'npm (default)', url: 'https://registry.npmjs.org/' },
  { name: 'Yarn', url: 'https://registry.yarnpkg.com/' },
  { name: 'GitHub Packages', url: 'https://npm.pkg.github.com/' },
  { name: 'Cloudflare', url: 'https://registry.npmjs.cf/' },
  { name: 'Taobao (China)', url: 'https://registry.npmmirror.com/' },
  { name: 'JsDelivr', url: 'https://cdn.jsdelivr.net/npm/' },
];

// Function to measure response time
function measureResponseTime(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = https.get(url, (res) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Consume response data to free up memory
      res.resume();
      
      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve({ url, responseTime, success: true });
      } else {
        resolve({ url, responseTime: 9999, success: false });
      }
    });
    
    req.on('error', () => {
      resolve({ url, responseTime: 9999, success: false });
    });
    
    // Set a timeout
    req.setTimeout(5000, () => {
      req.abort();
      resolve({ url, responseTime: 9999, success: false });
    });
  });
}

// Function to run commands
function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    console.error(`Error running command: ${command}`);
    return '';
  }
}

// Test all registries
async function testRegistries() {
  console.log('Testing registry response times...');
  
  const results = await Promise.all(
    registries.map(async (registry) => {
      const result = await measureResponseTime(registry.url);
      return {
        ...registry,
        responseTime: result.responseTime,
        success: result.success
      };
    })
  );
  
  // Sort by response time (fastest first)
  const sortedResults = results
    .filter(r => r.success)
    .sort((a, b) => a.responseTime - b.responseTime);
  
  console.log('\nResults (fastest to slowest):');
  sortedResults.forEach((registry, index) => {
    console.log(`${index + 1}. ${registry.name}: ${registry.responseTime}ms - ${registry.url}`);
  });
  
  if (sortedResults.length === 0) {
    console.log('❌ No registries responded successfully. Using default npm registry.');
    return registries[0];
  }
  
  return sortedResults[0];
}

// Set the registry
function setRegistry(registry) {
  console.log(`\nSetting npm registry to ${registry.name} (${registry.url})...`);
  runCommand(`npm config set registry ${registry.url}`);
  
  // Update .npmrc file
  const npmrcUpdate = runCommand('npm config get registry');
  console.log(`Registry set to: ${npmrcUpdate.trim()}`);
  
  console.log('\n✅ Registry updated successfully!');
  console.log('To verify, run: npm config get registry');
  console.log('To reset to default, run: npm config set registry https://registry.npmjs.org/');
}

// Main function
async function main() {
  try {
    const fastestRegistry = await testRegistries();
    
    rl.question(`\nDo you want to use ${fastestRegistry.name} (${fastestRegistry.url}) as your npm registry? (y/n) `, (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        setRegistry(fastestRegistry);
      } else {
        console.log('Registry not changed. Using current registry.');
      }
      rl.close();
    });
  } catch (error) {
    console.error('Error testing registries:', error);
    rl.close();
  }
}

main();
