# Troubleshooting HTTPS Connection Issues

If you're experiencing "Connection Refused" errors when trying to access your site with HTTPS on main.d4l.ai, follow this troubleshooting guide.

## Common Issues and Solutions

### 1. Hosts File Configuration

The most common cause of connection issues is an incorrect hosts file configuration.

**Check your hosts file:**
```bash
npm run check-hosts
```

If this fails, update your hosts file:
```bash
# On macOS/Linux
sudo npm run update-hosts

# On Windows (run as Administrator)
npm run update-hosts
```

### 2. Port Conflicts

Another common issue is that ports 80, 443, or 3000 are already in use.

**Check for port conflicts:**
```bash
# On macOS/Linux
sudo lsof -i:80
sudo lsof -i:443
lsof -i:3000

# On Windows
netstat -ano | findstr :80
netstat -ano | findstr :443
netstat -ano | findstr :3000
```

If any of these ports are in use, stop the services using them or change the ports in your configuration.

### 3. Nginx Configuration

If you're using Nginx, make sure it's properly configured.

**Check Nginx configuration:**
```bash
# On macOS/Linux
nginx -t -c /path/to/your/nginx.conf

# On Windows
nginx -t -c C:\path\to\your\nginx.conf
```

### 4. Certificate Issues

Make sure your SSL certificates are valid and accessible.

**Regenerate certificates:**
```bash
npm run generate-certs
```

Then follow the instructions to trust the certificate in your browser.

### 5. Firewall Issues

Your firewall might be blocking connections to ports 80 or 443.

**Check firewall settings:**
- On macOS: System Preferences > Security & Privacy > Firewall
- On Windows: Control Panel > System and Security > Windows Defender Firewall
- On Linux: Check your distribution's firewall configuration (e.g., ufw, firewalld)

### 6. Browser Cache

Your browser might be caching an old connection attempt.

**Clear browser cache:**
- Chrome: Settings > Privacy and security > Clear browsing data
- Firefox: Options > Privacy & Security > Cookies and Site Data > Clear Data
- Safari: Preferences > Privacy > Manage Website Data > Remove All

### 7. Try Different Approaches

We've provided several methods to run with HTTPS. Try each one to see which works best for you:

```bash
# Method 1: Using Nginx (recommended)
npm run dev:nginx

# Method 2: Using Next.js built-in HTTPS
npm run dev:https:direct

# Method 3: Using a custom server
npm run dev:https

# Method 4: Using a simplified approach
npm run dev:https:simple
```

## Advanced Troubleshooting

### Check if the server is listening

```bash
# On macOS/Linux
netstat -tuln | grep 3000
netstat -tuln | grep 443

# On Windows
netstat -an | findstr :3000
netstat -an | findstr :443
```

### Test with curl

```bash
curl -k https://main.d4l.ai
```

### Check certificate validity

```bash
openssl x509 -in ./certificates/localhost.pem -text -noout
```

## Still Having Issues?

If you're still experiencing connection issues after trying all of these solutions, try the following:

1. Restart your computer
2. Temporarily disable any antivirus or security software
3. Try a different browser
4. Try accessing the site from a different device on the same network

If none of these solutions work, there might be a more complex networking issue specific to your environment.
