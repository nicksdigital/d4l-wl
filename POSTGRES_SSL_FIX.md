# PostgreSQL SSL Certificate Fix

This document explains how to fix the "self-signed certificate in certificate chain" error when connecting to PostgreSQL.

## The Problem

When connecting to a PostgreSQL database with SSL enabled, you may encounter the following error:

```
Database connection test failed: self-signed certificate in certificate chain
```

This happens because the PostgreSQL server is using a self-signed certificate, but the client is configured to verify certificates against trusted certificate authorities.

## The Solution

There are several ways to fix this issue:

### Option 1: Disable Certificate Verification (Recommended for Development)

Add the following to your `.env.local` file:

```
# PostgreSQL SSL Configuration
# Set to 'no-verify' to disable certificate verification
POSTGRES_SSL_MODE=no-verify
# Alternative option to allow self-signed certificates
POSTGRES_ALLOW_SELF_SIGNED=true
```

This tells the PostgreSQL client to accept self-signed certificates without verification.

### Option 2: Disable SSL Completely (Not Recommended for Production)

If you're in a secure development environment and don't need SSL:

```
# PostgreSQL SSL Configuration
# Disable SSL completely
POSTGRES_SSL_MODE=disable
```

### Option 3: Provide a CA Certificate (Recommended for Production)

For production environments, it's better to provide a CA certificate:

1. Save your CA certificate as `certs/ca.crt` in the project root
2. The application will automatically use this certificate for SSL verification

Alternatively, you can provide the CA certificate as an environment variable:

```
# PostgreSQL SSL Configuration
# Provide the CA certificate as an environment variable
POSTGRES_CA_CERT=-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----
```

## Testing the Connection

You can test the database connection with the provided script:

```bash
node test-db-connection.js
```

## Restarting the Application

After making these changes, restart the application:

```bash
./restart-app.sh
```

This script will:
1. Stop any running Node.js processes
2. Test the database connection
3. Start the application with the updated configuration

## Security Considerations

- For development environments, disabling certificate verification is acceptable
- For production environments, always use a proper CA certificate
- Never disable SSL completely in production environments
