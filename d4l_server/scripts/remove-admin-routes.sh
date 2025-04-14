#!/bin/bash

# This script removes the admin routes from the Next.js app
# Run this script from the root of the project

# Path to the Next.js app
NEXTJS_APP_PATH="../src"

# Remove admin pages
rm -rf $NEXTJS_APP_PATH/app/admin

# Remove admin components
rm -rf $NEXTJS_APP_PATH/components/admin

echo "Admin routes removed from Next.js app"
