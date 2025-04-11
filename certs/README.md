# PostgreSQL CA Certificate

Place your PostgreSQL CA certificate file in this directory.

## Instructions

1. Save your CA certificate as `ca.crt` in this directory
2. Make sure the file has proper permissions (readable by the application)
3. The application will automatically use this certificate for SSL verification

## Example

If you received a CA certificate from your database provider (like DigitalOcean), save it as:

```
/Volumes/BIGCODE/D4L-NEXT-APP/frontend/certs/ca.crt
```

In production environments, this would be:

```
/data/d4l/frontend/certs/ca.crt
```
