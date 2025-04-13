#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ports to check
const ports = [80, 443, 3000];

console.log('🔍 Checking for processes using ports 80, 443, and 3000...');

// Function to run commands
function runCommand(command, silent = false) {
  try {
    return execSync(command, { 
      encoding: 'utf8',
      stdio: silent ? 'pipe' : 'inherit'
    });
  } catch (error) {
    if (!silent) {
      console.error(`Error running command: ${command}`);
      console.error(error.message);
    }
    return '';
  }
}

// Function to find processes using a port
function findProcessesUsingPort(port) {
  const platform = process.platform;
  let command;
  let processIds = [];
  
  try {
    if (platform === 'darwin' || platform === 'linux') {
      // macOS or Linux
      command = `lsof -i :${port} -t`;
      const output = runCommand(command, true);
      processIds = output.trim().split('\n').filter(Boolean);
    } else if (platform === 'win32') {
      // Windows
      command = `netstat -ano | findstr :${port}`;
      const output = runCommand(command, true);
      const lines = output.trim().split('\n').filter(Boolean);
      
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length > 4) {
          const pid = parts[parts.length - 1];
          if (!processIds.includes(pid)) {
            processIds.push(pid);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error finding processes for port ${port}: ${error.message}`);
  }
  
  return processIds;
}

// Function to get process details
function getProcessDetails(pid) {
  const platform = process.platform;
  let command;
  
  try {
    if (platform === 'darwin' || platform === 'linux') {
      // macOS or Linux
      command = `ps -p ${pid} -o pid,user,command`;
    } else if (platform === 'win32') {
      // Windows
      command = `tasklist /fi "PID eq ${pid}" /fo list`;
    }
    
    return runCommand(command, true);
  } catch (error) {
    return `Error getting process details: ${error.message}`;
  }
}

// Function to kill a process
function killProcess(pid, force = false) {
  const platform = process.platform;
  let command;
  
  try {
    if (platform === 'darwin' || platform === 'linux') {
      // macOS or Linux
      command = force ? `kill -9 ${pid}` : `kill ${pid}`;
    } else if (platform === 'win32') {
      // Windows
      command = force ? `taskkill /F /PID ${pid}` : `taskkill /PID ${pid}`;
    }
    
    runCommand(command);
    return true;
  } catch (error) {
    console.error(`Error killing process ${pid}: ${error.message}`);
    return false;
  }
}

// Check each port
async function checkPorts() {
  let foundProcesses = false;
  
  for (const port of ports) {
    const processIds = findProcessesUsingPort(port);
    
    if (processIds.length > 0) {
      foundProcesses = true;
      console.log(`\n🔴 Found ${processIds.length} process(es) using port ${port}:`);
      
      for (const pid of processIds) {
        const details = getProcessDetails(pid);
        console.log(`\nProcess ID: ${pid}`);
        console.log(details);
      }
      
      const answer = await new Promise(resolve => {
        rl.question(`Do you want to kill the process(es) using port ${port}? (y/n/f for force kill): `, resolve);
      });
      
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        for (const pid of processIds) {
          if (killProcess(pid)) {
            console.log(`✅ Killed process ${pid}`);
          }
        }
      } else if (answer.toLowerCase() === 'f') {
        for (const pid of processIds) {
          if (killProcess(pid, true)) {
            console.log(`✅ Force killed process ${pid}`);
          }
        }
      } else {
        console.log(`⏭️ Skipped killing processes on port ${port}`);
      }
    } else {
      console.log(`✅ No processes found using port ${port}`);
    }
  }
  
  if (!foundProcesses) {
    console.log('\n🎉 All ports are free and ready to use!');
  }
  
  rl.close();
}

// Run the port check
checkPorts().catch(error => {
  console.error('Error:', error);
  rl.close();
});
