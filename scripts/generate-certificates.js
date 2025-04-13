#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔒 Generating self-signed certificates for HTTPS development...');

// Create certificates directory if it doesn't exist
const certsDir = path.join(process.cwd(), 'certificates');
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
  console.log('✅ Created certificates directory');
}

// Check if OpenSSL is installed
try {
  execSync('openssl version', { stdio: 'pipe' });
  console.log('✅ OpenSSL is installed');
} catch (error) {
  console.error('❌ OpenSSL is not installed. Please install OpenSSL to generate certificates.');
  process.exit(1);
}

// Generate certificates
const keyPath = path.join(certsDir, 'localhost-key.pem');
const certPath = path.join(certsDir, 'localhost.pem');
const domain = 'main.d4l.ai';

try {
  // Generate a private key
  console.log('Generating private key...');
  execSync(`openssl genrsa -out "${keyPath}" 2048`, { stdio: 'inherit' });
  
  // Create a configuration file for the certificate
  const configPath = path.join(certsDir, 'openssl.cnf');
  const configContent = `
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
CN = ${domain}

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = ${domain}
DNS.2 = *.${domain}
DNS.3 = localhost
DNS.4 = 127.0.0.1
  `;
  
  fs.writeFileSync(configPath, configContent);
  console.log('✅ Created OpenSSL configuration');
  
  // Generate a certificate signing request and self-signed certificate
  console.log('Generating self-signed certificate...');
  execSync(`openssl req -new -x509 -key "${keyPath}" -out "${certPath}" -days 365 -config "${configPath}"`, { stdio: 'inherit' });
  
  console.log(`\n✅ Successfully generated certificates in ${certsDir}:`);
  console.log(`   - Private key: ${keyPath}`);
  console.log(`   - Certificate: ${certPath}`);
  
  // Instructions for trusting the certificate
  console.log('\n🔐 To trust this certificate in your browser:');
  
  if (process.platform === 'darwin') {
    console.log('   macOS: Add the certificate to your keychain and trust it:');
    console.log(`   1. Open Keychain Access`);
    console.log(`   2. Import the certificate: ${certPath}`);
    console.log(`   3. Double-click the imported certificate`);
    console.log(`   4. Expand the "Trust" section`);
    console.log(`   5. Set "When using this certificate" to "Always Trust"`);
  } else if (process.platform === 'win32') {
    console.log('   Windows: Add the certificate to your trusted certificates:');
    console.log(`   1. Double-click the certificate: ${certPath}`);
    console.log(`   2. Click "Install Certificate"`);
    console.log(`   3. Select "Local Machine" and click "Next"`);
    console.log(`   4. Select "Place all certificates in the following store"`);
    console.log(`   5. Click "Browse" and select "Trusted Root Certification Authorities"`);
    console.log(`   6. Click "Next" and then "Finish"`);
  } else {
    console.log('   Linux: Add the certificate to your browser\'s trusted certificates');
  }
  
  // Add hosts entry instructions
  console.log('\n🌐 Add the following entry to your hosts file:');
  console.log(`   127.0.0.1 ${domain}`);
  
  if (process.platform === 'darwin' || process.platform === 'linux') {
    console.log('   Edit /etc/hosts with: sudo nano /etc/hosts');
  } else if (process.platform === 'win32') {
    console.log('   Edit C:\\Windows\\System32\\drivers\\etc\\hosts as Administrator');
  }
  
  console.log('\n🚀 Now you can run the development server with HTTPS:');
  console.log('   npm run dev:https');
} catch (error) {
  console.error('❌ Error generating certificates:', error.message);
  process.exit(1);
}
