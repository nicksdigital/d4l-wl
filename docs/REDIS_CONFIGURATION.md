# Redis Configuration for D4L-NEXT-APP

## Overview

This document provides guidelines for configuring Redis for the D4L-NEXT-APP, focusing on security, performance, and reliability. Redis serves as the backbone of our caching system, enabling efficient data retrieval and improved application performance.

## Redis Configuration File

Below is a recommended secure Redis configuration file (`redis.conf`) that should be used in production:

```conf
# Network configuration
bind 127.0.0.1
port 6379
protected-mode yes
timeout 0
tcp-keepalive 300

# General configuration
daemonize yes
supervised auto
pidfile /var/run/redis/redis-server.pid
loglevel notice
logfile /var/log/redis/redis-server.log

# Snapshotting
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /var/lib/redis

# Security
requirepass YOUR_STRONG_PASSWORD_HERE
rename-command FLUSHALL ""
rename-command FLUSHDB ""
rename-command CONFIG ""
rename-command SHUTDOWN ""
rename-command KEYS ""

# Memory management
maxmemory 2gb
maxmemory-policy allkeys-lru
maxmemory-samples 5

# Append only mode
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# Slow log
slowlog-log-slower-than 10000
slowlog-max-len 128

# Latency monitoring
latency-monitor-threshold 100

# Event notification
notify-keyspace-events ""

# Advanced config
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
list-max-ziplist-size -2
list-compress-depth 0
set-max-intset-entries 512
zset-max-ziplist-entries 128
zset-max-ziplist-value 64
hll-sparse-max-bytes 3000
activerehashing yes
client-output-buffer-limit normal 0 0 0
client-output-buffer-limit slave 256mb 64mb 60
client-output-buffer-limit pubsub 32mb 8mb 60
hz 10
aof-rewrite-incremental-fsync yes
```

## Security Recommendations

1. **Strong Password**: Replace `YOUR_STRONG_PASSWORD_HERE` with a complex password (minimum 16 characters, mixed case, numbers, and special characters)
2. **Disabled Commands**: Critical commands are renamed or disabled to prevent unauthorized access
3. **Binding**: Redis only listens on localhost (127.0.0.1) to prevent external access
4. **Protected Mode**: Enabled to reject connections from non-loopback addresses

## Performance Optimization

1. **Memory Management**:
   - `maxmemory` is set to 2GB (adjust based on your server resources)
   - `maxmemory-policy` uses LRU (Least Recently Used) eviction to manage memory
   
2. **Persistence**:
   - AOF (Append Only File) enabled for better durability
   - RDB snapshots configured for backup purposes
   
3. **Connection Settings**:
   - TCP keepalive enabled to detect dead connections
   - Timeout disabled for long-lived connections

## Integration with D4L-NEXT-APP

### Environment Variables

Add these variables to your `.env.local` file:

```
REDIS_URL=redis://127.0.0.1:6379
REDIS_PASSWORD=YOUR_STRONG_PASSWORD_HERE
REDIS_DATABASE=0
REDIS_PREFIX=d4l:
REDIS_DEBUG=false
```

### Connection in Code

The application connects to Redis using the following configuration in `src/lib/redis.ts`:

```typescript
import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const redisPassword = process.env.REDIS_PASSWORD;
const redisDatabase = parseInt(process.env.REDIS_DATABASE || '0', 10);

export const redisClient = createClient({
  url: redisUrl,
  password: redisPassword,
  database: redisDatabase,
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

// Initialize connection
let isConnected = false;
export async function connectToRedis() {
  if (!isConnected) {
    await redisClient.connect();
    isConnected = true;
  }
  return redisClient;
}
```

## Monitoring and Maintenance

### Regular Backups

Configure automatic backups of Redis data:

```bash
# Add to crontab
0 */6 * * * redis-cli -a YOUR_STRONG_PASSWORD_HERE --rdb /backup/redis/redis-$(date +\%Y\%m\%d\%H\%M).rdb
```

### Monitoring

Set up monitoring using Redis INFO command or a monitoring tool like Redis Insight, Prometheus with Redis Exporter, or Datadog.

### Memory Usage Alerts

Configure alerts when Redis memory usage exceeds 80% of the configured maximum.

## Scaling Considerations

1. **Redis Cluster**: For high-volume applications, consider implementing Redis Cluster
2. **Redis Sentinel**: For high-availability, implement Redis Sentinel
3. **Read Replicas**: For read-heavy workloads, set up read replicas

## Conclusion

This Redis configuration provides a secure and optimized foundation for the D4L-NEXT-APP caching system. Regular monitoring and maintenance will ensure optimal performance and reliability.

## References

- [Redis Security Documentation](https://redis.io/topics/security)
- [Redis Persistence Documentation](https://redis.io/topics/persistence)
- [Redis Administration](https://redis.io/topics/admin)
