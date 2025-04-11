# D4L Monitoring and Batch Sync Documentation

## Overview

The D4L-NEXT-APP includes two utility scripts for system monitoring and batch synchronization. These scripts are designed to run as background processes using PM2 and help maintain the health and data integrity of the application.

## Table of Contents

1. [Setup](#setup)
2. [Monitoring Script](#monitoring-script)
3. [Batch Sync Script](#batch-sync-script)
4. [Redis Integration](#redis-integration)
5. [Deployment](#deployment)
6. [Troubleshooting](#troubleshooting)

## Setup

To set up the monitoring and batch sync scripts, follow these steps:

1. Navigate to the scripts directory:
   ```bash
   cd /path/to/d4l-next-app/frontend/scripts
   ```

2. Run the setup script:
   ```bash
   ./setup.sh
   ```

   This script will:
   - Install all required dependencies
   - Create symlinks to the parent .env and .env.local files
   - Make the scripts executable

3. Verify the setup by running each script manually:
   ```bash
   node monitor.js
   node batch-sync.js
   ```

## Monitoring Script

The monitoring script (`monitor.js`) checks the health of the D4L platform and its dependencies, including:

- API endpoints
- Redis cache
- System resources (CPU, memory)
- Blockchain connectivity

### Configuration

Configure the monitoring script through environment variables:

```
# Monitoring Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
ADMIN_API_KEY=your_admin_api_key
MONITOR_CHECK_INTERVAL=60000
CPU_ALERT_THRESHOLD=80
MEMORY_ALERT_THRESHOLD=85
DISK_ALERT_THRESHOLD=90
REDIS_ALERT_THRESHOLD=75
```

### Features

- **Health Checks**: Periodically checks API endpoints and services
- **Resource Monitoring**: Tracks CPU, memory, and disk usage
- **Cache Statistics**: Monitors Redis cache size and performance
- **Alerting**: Sends alerts when thresholds are exceeded
- **Logging**: Maintains detailed logs of system status

### Running with PM2

```bash
pm2 start monitor.js --name d4l-monitor
```

## Batch Sync Script

The batch sync script (`batch-sync.js`) handles scheduled synchronization tasks between the D4L platform and blockchain, including:

- Processing pending airdrop claims
- Syncing user profiles to the blockchain
- Updating token balances
- Validating on-chain data

### Configuration

Configure the batch sync script through environment variables:

```
# Batch Sync Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
ADMIN_API_KEY=your_admin_api_key
BATCH_SIZE=10
SYNC_INTERVAL=300000
```

### Features

- **Batch Processing**: Processes transactions in configurable batch sizes
- **Error Handling**: Implements retry logic for failed transactions
- **Cache Invalidation**: Automatically invalidates affected cache entries
- **Logging**: Maintains detailed logs of sync operations

### Running with PM2

```bash
pm2 start batch-sync.js --name d4l-batch-sync
```

## Redis Integration

Both scripts integrate with Redis for cache management and performance monitoring:

- **Cache Statistics**: Track the size and composition of the cache
- **Cache Invalidation**: Selectively invalidate cache entries after updates
- **Performance Metrics**: Monitor Redis memory usage and operation latency

The Redis client configuration is shared between the scripts and uses the same environment variables as the main application:

```
REDIS_URL=redis://127.0.0.1:6379
REDIS_PASSWORD=your_secure_redis_password
REDIS_DATABASE=0
REDIS_PREFIX=d4l:
REDIS_DEBUG=false
```

## Deployment

In production environments, deploy these scripts using PM2 with the following recommended configuration:

```json
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "d4l-monitor",
      script: "./scripts/monitor.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "200M",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "d4l-batch-sync",
      script: "./scripts/batch-sync.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
```

Deploy with:
```bash
pm2 start ecosystem.config.js
```

## Troubleshooting

### Common Issues

1. **Module Not Found Errors**:
   - Run `./setup.sh` to ensure all dependencies are installed
   - Check that the symlinks to .env and .env.local files exist

2. **Redis Connection Errors**:
   - Verify Redis is running: `redis-cli ping`
   - Check Redis credentials in .env.local
   - Ensure Redis port is accessible

3. **API Connection Errors**:
   - Verify the API server is running
   - Check NEXT_PUBLIC_API_BASE_URL in environment variables
   - Ensure ADMIN_API_KEY is correctly set

### Logs

Logs are stored in the following locations when running with PM2:

- Monitor logs: `~/.pm2/logs/d4l-monitor-out.log` and `~/.pm2/logs/d4l-monitor-error.log`
- Batch sync logs: `~/.pm2/logs/d4l-batch-sync-out.log` and `~/.pm2/logs/d4l-batch-sync-error.log`

View logs with:
```bash
pm2 logs d4l-monitor
pm2 logs d4l-batch-sync
```

### Restarting Services

If issues persist, restart the services:
```bash
pm2 restart d4l-monitor
pm2 restart d4l-batch-sync
```
