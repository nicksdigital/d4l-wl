#!/usr/bin/env node

/**
 * Script to build only the frontend, excluding d4l_server and hydra_admin
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Building frontend only (excluding d4l_server and hydra_admin)...');

// Check if d4l_server and hydra_admin directories exist
const d4lServerPath = path.join(process.cwd(), 'd4l_server');
const hydraAdminPath = path.join(process.cwd(), 'hydra_admin');

const d4lServerExists = fs.existsSync(d4lServerPath);
const hydraAdminExists = fs.existsSync(hydraAdminPath);

// Temporarily rename directories if they exist
if (d4lServerExists) {
  console.log('📁 Temporarily renaming d4l_server directory...');
  fs.renameSync(d4lServerPath, `${d4lServerPath}_temp`);
}

if (hydraAdminExists) {
  console.log('📁 Temporarily renaming hydra_admin directory...');
  fs.renameSync(hydraAdminPath, `${hydraAdminPath}_temp`);
}

try {
  // Build the frontend
  console.log('🏗️ Building frontend...');
  execSync('npm run build:frontend-only', { stdio: 'inherit' });
  console.log('✅ Frontend built successfully!');
} catch (error) {
  console.error('❌ Error building frontend:', error.message);
} finally {
  // Restore directories
  if (d4lServerExists) {
    console.log('📁 Restoring d4l_server directory...');
    fs.renameSync(`${d4lServerPath}_temp`, d4lServerPath);
  }

  if (hydraAdminExists) {
    console.log('📁 Restoring hydra_admin directory...');
    fs.renameSync(`${hydraAdminPath}_temp`, hydraAdminPath);
  }
}

console.log('🚀 Build process completed!');
