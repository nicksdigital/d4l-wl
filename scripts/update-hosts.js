#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const HOST = 'main.d4l.ai';
const IP = '127.0.0.1';

console.log(`🌐 Updating hosts file to map ${HOST} to ${IP}...`);

// Determine hosts file path based on OS
let hostsPath;
if (process.platform === 'win32') {
  hostsPath = 'C:\\Windows\\System32\\drivers\\etc\\hosts';
} else {
  hostsPath = '/etc/hosts';
}

// Check if we have permission to modify the hosts file
try {
  fs.accessSync(hostsPath, fs.constants.W_OK);
  console.log('✅ You have write permission to the hosts file');
} catch (error) {
  console.error(`❌ You don't have permission to modify the hosts file at ${hostsPath}`);
  console.error('Please run this script with administrator/sudo privileges');
  
  if (process.platform !== 'win32') {
    console.log('\nTry running:');
    console.log(`sudo node ${path.basename(__filename)}`);
  } else {
    console.log('\nPlease run this script as Administrator');
  }
  
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

// Check if the entry already exists
const entryRegex = new RegExp(`^\\s*${IP.replace(/\./g, '\\.')}\\s+${HOST}\\s*$`, 'm');
if (entryRegex.test(hostsContent)) {
  console.log(`✅ Hosts entry for ${HOST} already exists`);
  process.exit(0);
}

// Add the entry to the hosts file
const newEntry = `${IP} ${HOST}`;
const newHostsContent = hostsContent.trim() + `\n${newEntry}\n`;

try {
  fs.writeFileSync(hostsPath, newHostsContent);
  console.log(`✅ Successfully added ${HOST} to hosts file`);
} catch (error) {
  console.error(`❌ Error writing to hosts file: ${error.message}`);
  process.exit(1);
}

console.log(`\n🎉 Hosts file updated successfully!`);
console.log(`You can now access your site at https://${HOST}:3000`);
