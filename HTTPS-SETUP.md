# Running the Application with HTTPS

This guide explains how to run the application with HTTPS on the custom domain `main.d4l.ai`.

## Prerequisites

- Node.js and npm installed
- OpenSSL installed (for certificate generation)
- Administrator/sudo privileges (for hosts file modification)

## Setup Steps

### 1. Generate SSL Certificates

Run the following command to generate self-signed SSL certificates:

```bash
npm run generate-certs
```

This will:
- Create a `certificates` directory
- Generate a private key and certificate for `main.d4l.ai`
- Provide instructions for trusting the certificate in your browser

### 2. Update Hosts File

Run the following command to add `main.d4l.ai` to your hosts file:

```bash
# On macOS/Linux
sudo npm run update-hosts

# On Windows (run as Administrator)
npm run update-hosts
```

This will map `main.d4l.ai` to `127.0.0.1` in your hosts file.

### 3. Trust the Certificate

Follow the instructions provided after running `npm run generate-certs` to trust the certificate in your browser.

### 4. Run the Application with HTTPS

```bash
npm run dev:https
```

This will start the Next.js development server with HTTPS on `https://main.d4l.ai:3000`.

## All-in-One Setup

To perform all setup steps at once (except trusting the certificate):

```bash
# On macOS/Linux
sudo npm run setup-https

# On Windows (run as Administrator)
npm run setup-https
```

Then run the application:

```bash
npm run dev:https
```

## Troubleshooting

### Certificate Not Trusted

If your browser shows a certificate warning:
1. Click "Advanced" or "Details"
2. Click "Proceed to main.d4l.ai (unsafe)" or similar option
3. Follow the instructions to trust the certificate permanently

### Hosts File Permission Denied

If you get a permission error when updating the hosts file:
- On macOS/Linux: Use `sudo npm run update-hosts`
- On Windows: Run the command prompt as Administrator

### Port Already in Use

If port 3000 is already in use:
1. Edit `.env.local` and change the PORT value
2. Edit `scripts/start-https.js` and update the PORT constant

## Notes

- The self-signed certificate is valid for 365 days
- This setup is for development purposes only
- For production, use a proper SSL certificate from a trusted certificate authority
