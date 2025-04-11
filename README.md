# D4L Airdrop Frontend

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) for the D4L token airdrop. The application features a modern glassmorphism design with animated transitions and a sophisticated Redis caching system.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# Reown AppKit Project ID (required)
PROJECT_ID=your_reown_project_id

# RPC URLs
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/your_api_key
NEXT_PUBLIC_BASE_MAINNET_RPC_URL=https://base-mainnet.g.alchemy.com/v2/your_api_key

# Contract Addresses
NEXT_PUBLIC_TOKEN_ADDRESS=0x58fC2712D6f7ebD02a3A1d777827f4C10aC63b26
NEXT_PUBLIC_VAULT_ADDRESS=0xaaDfc70b93E4ED2Eba3da19e51FE25C41411fdb3
NEXT_PUBLIC_MERKLE_DISTRIBUTOR_ADDRESS=0x4726Ad8E817bf21A334497AD171766bcB493E18C
NEXT_PUBLIC_ADMIN_ADDRESS=0xDe43d4FaAC1e6F0d6484215dfEEA1270a5A3A9be

# Merkle Root
NEXT_PUBLIC_MERKLE_ROOT=0x8a29648bed032bf77f4ab0da8b6f9599f3c5b1726bb5169767ee9165f7cf7b50

# Default Claim Amount (200 tokens with 18 decimals)
NEXT_PUBLIC_DEFAULT_CLAIM_AMOUNT=200000000000000000000
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Redis Caching System

This application implements a sophisticated Redis-based caching system to optimize performance and user experience. Key features include:

- Content-based tagging for granular cache invalidation
- User-specific and dynamic content caching strategies
- Admin dashboard for cache management
- Automatic cache invalidation for admin routes

For detailed documentation, see the following files:

- [Caching Documentation](./docs/CACHING.md) - Overview of the caching architecture
- [Redis Configuration](./docs/REDIS_CONFIGURATION.md) - Guide for secure Redis setup
- [Admin Cache Management](./docs/ADMIN_CACHE_MANAGEMENT.md) - How to use the admin cache tools

## Redis Configuration

Add these Redis-specific environment variables to your `.env.local` file:

```
REDIS_URL=redis://127.0.0.1:6379
REDIS_PASSWORD=your_secure_redis_password
REDIS_DATABASE=0
REDIS_PREFIX=d4l:
REDIS_DEBUG=false
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
