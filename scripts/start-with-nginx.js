#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🚀 Starting Next.js with Nginx for HTTPS on main.d4l.ai...');

// Configuration
const NEXT_PORT = 3000;
const NGINX_CONF_PATH = path.join(process.cwd(), 'nginx.conf');
const CERT_DIR = path.join(process.cwd(), 'certificates');
const KEY_PATH = path.join(CERT_DIR, 'localhost-key.pem');
const CERT_PATH = path.join(CERT_DIR, 'localhost.pem');

// Check if certificates exist
if (!fs.existsSync(KEY_PATH) || !fs.existsSync(CERT_PATH)) {
  console.error('❌ SSL certificates not found. Please run "npm run generate-certs" first.');
  process.exit(1);
}

// Check if nginx is installed
try {
  const nginxVersion = require('child_process').execSync('nginx -v 2>&1').toString();
  console.log(`✅ Nginx detected: ${nginxVersion.trim()}`);
} catch (error) {
  console.error('❌ Nginx not found. Please install Nginx first.');
  console.error('   macOS: brew install nginx');
  console.error('   Ubuntu: sudo apt install nginx');
  console.error('   Windows: Download from http://nginx.org/en/download.html');
  process.exit(1);
}

// Check if nginx.conf exists
if (!fs.existsSync(NGINX_CONF_PATH)) {
  console.error(`❌ Nginx configuration not found at ${NGINX_CONF_PATH}`);
  process.exit(1);
}

// Function to check if a port is in use
function isPortInUse(port) {
  try {
    const netstat = require('child_process').execSync(`lsof -i:${port}`).toString();
    return netstat.length > 0;
  } catch (error) {
    return false;
  }
}

// Check if ports are available
if (isPortInUse(80)) {
  console.error('❌ Port 80 is already in use. Please stop any services using this port.');
  process.exit(1);
}

if (isPortInUse(443)) {
  console.error('❌ Port 443 is already in use. Please stop any services using this port.');
  process.exit(1);
}

if (isPortInUse(NEXT_PORT)) {
  console.error(`❌ Port ${NEXT_PORT} is already in use. Please stop any services using this port.`);
  process.exit(1);
}

// Start Next.js
console.log(`\n📦 Starting Next.js on port ${NEXT_PORT}...`);
const nextProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'pipe',
  env: {
    ...process.env,
    PORT: NEXT_PORT.toString(),
  },
});

// Handle Next.js output
nextProcess.stdout.on('data', (data) => {
  console.log(`[Next.js] ${data.toString().trim()}`);
});

nextProcess.stderr.on('data', (data) => {
  console.error(`[Next.js Error] ${data.toString().trim()}`);
});

// Wait for Next.js to start
setTimeout(() => {
  // Start Nginx
  console.log('\n🌐 Starting Nginx with SSL...');
  
  // Create a temporary nginx.conf with the correct paths
  const tempNginxConfPath = path.join(os.tmpdir(), 'nginx-temp.conf');
  let nginxConf = fs.readFileSync(NGINX_CONF_PATH, 'utf8');
  
  // Replace certificate paths if needed
  nginxConf = nginxConf.replace(/ssl_certificate .*?;/g, `ssl_certificate ${CERT_PATH};`);
  nginxConf = nginxConf.replace(/ssl_certificate_key .*?;/g, `ssl_certificate_key ${KEY_PATH};`);
  
  fs.writeFileSync(tempNginxConfPath, nginxConf);
  
  // Start Nginx with the temporary config
  const nginxProcess = spawn('nginx', ['-c', tempNginxConfPath, '-g', 'daemon off;'], {
    stdio: 'pipe',
  });
  
  // Handle Nginx output
  nginxProcess.stdout.on('data', (data) => {
    console.log(`[Nginx] ${data.toString().trim()}`);
  });
  
  nginxProcess.stderr.on('data', (data) => {
    console.error(`[Nginx Error] ${data.toString().trim()}`);
  });
  
  console.log('\n✅ Setup complete!');
  console.log('🔒 Your application is now running at:');
  console.log('   https://main.d4l.ai');
  console.log('\n⚠️ Note: You may need to accept the self-signed certificate in your browser');
  console.log('⚠️ Make sure main.d4l.ai is added to your hosts file (127.0.0.1 main.d4l.ai)');
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    
    // Stop Nginx
    require('child_process').execSync('nginx -s stop');
    console.log('✅ Nginx stopped');
    
    // Stop Next.js
    nextProcess.kill('SIGINT');
    console.log('✅ Next.js stopped');
    
    // Clean up
    if (fs.existsSync(tempNginxConfPath)) {
      fs.unlinkSync(tempNginxConfPath);
    }
    
    console.log('👋 Goodbye!');
    process.exit(0);
  });
}, 5000); // Wait 5 seconds for Next.js to start
