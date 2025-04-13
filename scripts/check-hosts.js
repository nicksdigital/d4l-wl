#!/usr/bin/env node

const fs = require('fs');
const os = require('os');

const HOST = 'main.d4l.ai';
const IP = '127.0.0.1';

console.log(`🔍 Checking if ${HOST} is properly configured in your hosts file...`);

// Determine hosts file path based on OS
let hostsPath;
if (process.platform === 'win32') {
  hostsPath = 'C:\\Windows\\System32\\drivers\\etc\\hosts';
} else {
  hostsPath = '/etc/hosts';
}

// Check if we can read the hosts file
try {
  fs.accessSync(hostsPath, fs.constants.R_OK);
  console.log(`✅ Can read hosts file at ${hostsPath}`);
} catch (error) {
  console.error(`❌ Cannot read hosts file at ${hostsPath}: ${error.message}`);
  console.error('Please run the hosts check with administrator/sudo privileges');
  process.exit(1);
}

// Read the hosts file
let hostsContent;
try {
  hostsContent = fs.readFileSync(hostsPath, 'utf8');
  console.log('✅ Successfully read hosts file');
} catch (error) {
  console.error(`❌ Error reading hosts file: ${error.message}`);
  process.exit(1);
}

// Check if the entry exists
const entryRegex = new RegExp(`^\\s*${IP.replace(/\./g, '\\.')}\\s+${HOST}\\s*$`, 'm');
if (entryRegex.test(hostsContent)) {
  console.log(`✅ Hosts entry for ${HOST} exists and is correctly configured`);
} else {
  console.error(`❌ Hosts entry for ${HOST} not found or incorrectly configured`);
  console.error(`Please add the following line to your hosts file (${hostsPath}):`);
  console.error(`${IP} ${HOST}`);
  
  if (process.platform !== 'win32') {
    console.log('\nYou can add it by running:');
    console.log(`sudo sh -c 'echo "${IP} ${HOST}" >> ${hostsPath}'`);
    console.log('\nOr use our script:');
    console.log('sudo npm run update-hosts');
  } else {
    console.log('\nOn Windows, you need to edit the hosts file as Administrator');
    console.log('Or use our script (run as Administrator):');
    console.log('npm run update-hosts');
  }
  
  process.exit(1);
}

// Check if we can ping the host
console.log(`\n🌐 Testing connection to ${HOST}...`);
const { execSync } = require('child_process');

try {
  const pingCommand = process.platform === 'win32' ? `ping -n 1 ${HOST}` : `ping -c 1 ${HOST}`;
  const pingResult = execSync(pingCommand, { stdio: 'pipe' }).toString();
  
  if (pingResult.includes('Reply from') || pingResult.includes('bytes from')) {
    console.log(`✅ Successfully pinged ${HOST}`);
  } else {
    console.error(`❌ Could not ping ${HOST}`);
    console.error('There might be an issue with your hosts file configuration');
    process.exit(1);
  }
} catch (error) {
  console.error(`❌ Error pinging ${HOST}: ${error.message}`);
  console.error('There might be an issue with your hosts file configuration');
  process.exit(1);
}

console.log('\n🎉 Hosts file is correctly configured!');
console.log(`You should be able to access your site at https://${HOST}`);
console.log('⚠️ Note: You may need to accept the self-signed certificate in your browser');
