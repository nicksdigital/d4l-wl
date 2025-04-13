#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Next.js configuration...');

// Read next.config.js
const nextConfigPath = path.join(process.cwd(), 'next.config.js');
let nextConfigContent;

try {
  nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
  console.log('✅ Found next.config.js');
} catch (error) {
  console.error('❌ Could not read next.config.js:', error.message);
  process.exit(1);
}

// Check for common issues
const issues = [];

// Check for duplicate swcMinify
const swcMinifyCount = (nextConfigContent.match(/swcMinify/g) || []).length;
if (swcMinifyCount > 1) {
  issues.push('- Duplicate swcMinify option found. It should only appear once in the config.');
}

// Check for serverComponentsExternalPackages
if (nextConfigContent.includes('serverComponentsExternalPackages')) {
  issues.push('- serverComponentsExternalPackages should be moved to serverExternalPackages in Next.js 15.');
}

// Check for experimental options
const experimentalOptions = [
  'optimizePackageImports',
  'optimizeCss',
  'serverActions',
  'serverComponents',
  'appDir',
];

experimentalOptions.forEach(option => {
  if (nextConfigContent.includes(`experimental: {`) && nextConfigContent.includes(option)) {
    console.log(`ℹ️ Found experimental option: ${option}`);
  }
});

// Check for Babel configuration
const babelrcPath = path.join(process.cwd(), '.babelrc');
const hasBabelrc = fs.existsSync(babelrcPath);

if (hasBabelrc) {
  console.log('⚠️ Found .babelrc file. This will disable SWC in Next.js 15.');
  
  try {
    const babelrcContent = fs.readFileSync(babelrcPath, 'utf8');
    const babelConfig = JSON.parse(babelrcContent);
    
    // Check if it's a complex Babel config
    const hasComplexConfig = 
      (babelConfig.presets && babelConfig.presets.some(preset => typeof preset === 'object')) ||
      (babelConfig.plugins && babelConfig.plugins.length > 1) ||
      babelConfig.env;
    
    if (hasComplexConfig) {
      issues.push('- Complex Babel configuration may cause conflicts with Next.js 15 optimizations.');
    }
  } catch (error) {
    console.error('❌ Could not parse .babelrc:', error.message);
  }
}

// Check webpack configuration
if (nextConfigContent.includes('webpack') && nextConfigContent.includes('devtool')) {
  issues.push('- Changing webpack devtool in development mode will cause severe performance regressions.');
}

// Report findings
if (issues.length > 0) {
  console.log('\n⚠️ Found potential issues in Next.js configuration:');
  issues.forEach(issue => console.log(issue));
  console.log('\nPlease fix these issues to ensure compatibility with Next.js 15.');
} else {
  console.log('\n✅ No major issues found in Next.js configuration!');
}

console.log('\nRecommendations for Next.js 15:');
console.log('1. Use serverExternalPackages instead of serverComponentsExternalPackages');
console.log('2. Remove duplicate configuration options');
console.log('3. Consider using SWC instead of Babel for better performance');
console.log('4. Do not modify webpack devtool in development mode');

console.log('\n🎉 Validation complete!');
