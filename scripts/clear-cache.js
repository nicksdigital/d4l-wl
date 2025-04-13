const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directories to clear
const directoriesToClear = [
  '.next',
  'node_modules/.cache',
];

console.log('🧹 Clearing Next.js cache...');

// Clear directories
directoriesToClear.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    try {
      if (process.platform === 'win32') {
        // Windows requires a different command
        execSync(`rmdir /s /q "${dirPath}"`);
      } else {
        // Unix-based systems
        execSync(`rm -rf "${dirPath}"`);
      }
      console.log(`✅ Cleared ${dir}`);
    } catch (error) {
      console.error(`❌ Error clearing ${dir}:`, error.message);
    }
  } else {
    console.log(`⚠️ Directory not found: ${dir}`);
  }
});

// Clear Next.js cache
try {
  execSync('npx next telemetry disable');
  console.log('✅ Disabled Next.js telemetry');
} catch (error) {
  console.error('❌ Error disabling Next.js telemetry:', error.message);
}

console.log('🚀 Cache clearing complete!');
