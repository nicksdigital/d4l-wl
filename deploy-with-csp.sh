#!/bin/bash

# Deploy script with CSP configuration
# This script deploys the Next.js application and configures Nginx with proper CSP headers

echo "Starting deployment with CSP configuration..."

# Build the Next.js application
echo "Building Next.js application..."
npm run build

# Copy Nginx configuration
echo "Configuring Nginx with CSP headers..."
if [ -d "/etc/nginx/sites-available" ]; then
  # Debian/Ubuntu style Nginx config
  sudo cp ./nginx.conf /etc/nginx/sites-available/d4l
  
  # Create symlink if it doesn't exist
  if [ ! -f "/etc/nginx/sites-enabled/d4l" ]; then
    sudo ln -s /etc/nginx/sites-available/d4l /etc/nginx/sites-enabled/
  fi
elif [ -d "/etc/nginx/conf.d" ]; then
  # CentOS/RHEL/Amazon Linux style Nginx config
  sudo cp ./nginx.conf /etc/nginx/conf.d/d4l.conf
else
  echo "Could not find Nginx configuration directory. Please manually copy nginx.conf to your Nginx configuration."
fi

# Test Nginx configuration
echo "Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
  # Reload Nginx if test is successful
  echo "Nginx configuration test successful. Reloading Nginx..."
  sudo systemctl reload nginx
else
  echo "Nginx configuration test failed. Please check the nginx.conf file."
  exit 1
fi

# Start or restart the Next.js application
echo "Starting Next.js application..."
pm2 restart d4l-next-app || pm2 start npm --name "d4l-next-app" -- start

echo "Deployment with CSP configuration completed successfully!"
echo "Please check your browser console for any remaining CSP violations."
