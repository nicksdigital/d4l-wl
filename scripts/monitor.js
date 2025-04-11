#!/usr/bin/env node

/**
 * D4L System Monitoring Script
 * This script monitors the health of the D4L platform and its dependencies
 * It sends alerts when issues are detected and logs system metrics
 */

const axios = require('axios');
const os = require('os');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { connectToRedis, getCacheStats, disconnectFromRedis } = require('./redis-client');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
const API_KEY = process.env.ADMIN_API_KEY;
const CHECK_INTERVAL = parseInt(process.env.MONITOR_CHECK_INTERVAL || '60000', 10); // default: 1 minute
const ALERT_THRESHOLD = {
  cpu: parseFloat(process.env.CPU_ALERT_THRESHOLD || '80'),
  memory: parseFloat(process.env.MEMORY_ALERT_THRESHOLD || '85'),
  diskSpace: parseFloat(process.env.DISK_ALERT_THRESHOLD || '90')
};

// Notification configuration
const NOTIFICATION_ENDPOINT = process.env.NOTIFICATION_ENDPOINT;
const NOTIFICATION_TOKEN = process.env.NOTIFICATION_TOKEN;

// Log setup
const log = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
};

// Error handling
const handleError = (error, context) => {
  log(`ERROR in ${context}: ${error.message}`);
  if (error.response) {
    log(`Response data: ${JSON.stringify(error.response.data)}`);
    log(`Response status: ${error.response.status}`);
  }
};

/**
 * Send notification when issues are detected
 * @param {string} type - Type of alert
 * @param {string} message - Alert message
 * @param {Object} data - Additional data
 */
async function sendAlert(type, message, data = {}) {
  if (!NOTIFICATION_ENDPOINT) return;
  
  try {
    await axios.post(NOTIFICATION_ENDPOINT, {
      type,
      message,
      data,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Authorization': `Bearer ${NOTIFICATION_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    log(`Alert sent: ${type} - ${message}`);
  } catch (error) {
    handleError(error, 'sendAlert');
  }
}

/**
 * Check if the D4L API is responsive
 */
async function checkApiHealth() {
  try {
    const startTime = Date.now();
    const response = await axios.get(`${BASE_URL}/api/health`, {
      headers: { 'x-api-key': API_KEY }
    });
    const responseTime = Date.now() - startTime;
    
    if (response.data.status === 'ok') {
      log(`API Health: OK (${responseTime}ms)`);
      return true;
    } else {
      log(`API Health: Issues detected - ${response.data.message}`);
      await sendAlert('api_health', `API health check failed: ${response.data.message}`, response.data);
      return false;
    }
  } catch (error) {
    handleError(error, 'checkApiHealth');
    await sendAlert('api_health', `API not responding: ${error.message}`);
    return false;
  }
}

/**
 * Check database connection health
 */
async function checkDatabaseHealth() {
  try {
    const response = await axios.get(`${BASE_URL}/api/health/database`, {
      headers: { 'x-api-key': API_KEY }
    });
    
    if (response.data.status === 'ok') {
      log('Database Health: OK');
      return true;
    } else {
      log(`Database Health: Issues detected - ${response.data.message}`);
      await sendAlert('database_health', `Database health check failed: ${response.data.message}`, response.data);
      return false;
    }
  } catch (error) {
    handleError(error, 'checkDatabaseHealth');
    await sendAlert('database_health', `Database health check failed: ${error.message}`);
    return false;
  }
}

/**
 * Check blockchain connection health
 */
async function checkBlockchainHealth() {
  try {
    const response = await axios.get(`${BASE_URL}/api/health/blockchain`, {
      headers: { 'x-api-key': API_KEY }
    });
    
    if (response.data.status === 'ok') {
      log(`Blockchain Health: OK (Height: ${response.data.blockHeight})`);
      return true;
    } else {
      log(`Blockchain Health: Issues detected - ${response.data.message}`);
      await sendAlert('blockchain_health', `Blockchain health check failed: ${response.data.message}`, response.data);
      return false;
    }
  } catch (error) {
    handleError(error, 'checkBlockchainHealth');
    await sendAlert('blockchain_health', `Blockchain health check failed: ${error.message}`);
    return false;
  }
}

/**
 * Monitor system resources
 */
function checkSystemResources() {
  try {
    // CPU usage (average load)
    const cpuCount = os.cpus().length;
    const loadAvg = os.loadavg()[0];
    const cpuUsagePercent = (loadAvg / cpuCount) * 100;
    
    // Memory usage
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemoryPercent = ((totalMemory - freeMemory) / totalMemory) * 100;
    
    // Disk space (for the application directory)
    let diskSpacePercent = 0;
    
    // Log metrics
    log(`System Resources: CPU: ${cpuUsagePercent.toFixed(2)}%, Memory: ${usedMemoryPercent.toFixed(2)}%`);
    
    // Check thresholds and send alerts
    if (cpuUsagePercent > ALERT_THRESHOLD.cpu) {
      sendAlert('high_cpu', `High CPU usage: ${cpuUsagePercent.toFixed(2)}%`, { cpuUsagePercent });
    }
    
    if (usedMemoryPercent > ALERT_THRESHOLD.memory) {
      sendAlert('high_memory', `High memory usage: ${usedMemoryPercent.toFixed(2)}%`, { 
        usedMemoryPercent,
        freeMemory: (freeMemory / 1024 / 1024).toFixed(2) + ' MB',
        totalMemory: (totalMemory / 1024 / 1024).toFixed(2) + ' MB'
      });
    }
    
    return {
      cpuUsagePercent,
      usedMemoryPercent,
      diskSpacePercent
    };
  } catch (error) {
    handleError(error, 'checkSystemResources');
    return null;
  }
}

/**
 * Collect PM2 process metrics
 */
async function checkProcessStatus() {
  try {
    // This would typically use the pm2 module to get process statistics
    // For simplicity, we're checking if processes are running via their ports
    const services = [
      { name: 'd4l-next-app', port: 3000 }
    ];
    
    for (const service of services) {
      try {
        await axios.get(`http://localhost:${service.port}/api/health`);
        log(`Process ${service.name}: Running`);
      } catch (error) {
        log(`Process ${service.name}: Not responding`);
        await sendAlert('process_down', `Service ${service.name} is not responding`, { service });
      }
    }
  } catch (error) {
    handleError(error, 'checkProcessStatus');
  }
}

/**
 * Main monitoring loop
 */
async function runMonitoring() {
  log('Running health checks...');
  
  // Check API health
  const apiHealthy = await checkApiHealth();
  
  // Only run other checks if API is responding
  if (apiHealthy) {
    await checkDatabaseHealth();
    await checkBlockchainHealth();
  }
  
  // Check system resources (runs regardless of API health)
  checkSystemResources();
  
  // Check process status
  await checkProcessStatus();
  
  log('Health checks completed');
}

/**
 * Main function
 */
async function main() {
  log('D4L System Monitor Started');
  
  // Run immediately on startup
  await runMonitoring();
  
  // Then schedule regular checks
  setInterval(runMonitoring, CHECK_INTERVAL);
}

// Execute main function
main().catch(error => {
  console.error('Unhandled error in monitor script:', error);
  // Don't exit - we want the monitor to keep running even if there's an error
});
