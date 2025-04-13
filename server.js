const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Get SSL certificate paths from environment variables or use default paths
const keyPath = process.env.SSL_KEY_FILE || path.join(__dirname, 'certificates', 'localhost-key.pem');
const certPath = process.env.SSL_CERT_FILE || path.join(__dirname, 'certificates', 'localhost.pem');

// Configuration
const host = process.env.HOST || 'main.d4l.ai';
const port = parseInt(process.env.PORT || '3000', 10);

// Check if certificates exist
console.log(`Looking for SSL certificates at:\n- Key: ${keyPath}\n- Cert: ${certPath}`);

if (!fs.existsSync(keyPath)) {
  console.error(`❌ SSL key not found at ${keyPath}`);
  console.error('Please run "npm run generate-certs" first.');
  process.exit(1);
}

if (!fs.existsSync(certPath)) {
  console.error(`❌ SSL certificate not found at ${certPath}`);
  console.error('Please run "npm run generate-certs" first.');
  process.exit(1);
}

console.log('✅ SSL certificates found');

try {
  // Test reading the files
  fs.readFileSync(keyPath);
  fs.readFileSync(certPath);
  console.log('✅ SSL certificates read successfully');
} catch (error) {
  console.error(`❌ Error reading SSL certificates: ${error.message}`);
  process.exit(1);
}

const httpsOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, host, (err) => {
    if (err) throw err;
    console.log(`> Ready on https://${host}:${port}`);
    console.log('⚠️  Note: You may need to accept the self-signed certificate in your browser');
  });
});
