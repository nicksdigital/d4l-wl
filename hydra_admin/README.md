# D4L Admin Dashboard

A modern, high-end admin dashboard for the D4L platform, built with Next.js 15, Turbopack, and TailwindCSS. The design is inspired by Mercedes' 2026 prototypes and luxury design language, focusing on sleek aesthetics, intuitive usability, and cutting-edge functionality.

## Features

- **Modern UI**: Sleek, Mercedes-inspired design with glassmorphism effects and subtle animations
- **Responsive Design**: Fully responsive with mobile-friendly navigation
- **Dashboard Analytics**: Comprehensive analytics and statistics
- **User Management**: Manage user accounts and permissions
- **Airdrop Management**: Handle token airdrops and claims
- **Content Management**: Create and manage website content
- **Settings Management**: Configure platform settings
- **Cache Management**: Control application caching
- **JWT Authentication**: Secure authentication with JWT tokens
- **API Integration**: Seamless integration with the Fastify backend

## Tech Stack

- **Next.js 15**: Latest version of the React framework with App Router
- **Turbopack**: Fast, incremental bundler for improved development experience
- **TailwindCSS**: Utility-first CSS framework for rapid UI development
- **TypeScript**: Type-safe JavaScript for better developer experience
- **React Icons**: Comprehensive icon library
- **Axios**: Promise-based HTTP client for API requests
- **JWT Decode**: Decode JWT tokens for authentication

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
cd hydra_admin
npm install
# or
yarn install
```

### Development

Start the development server with Turbopack:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

Build the application for production:

```bash
npm run build
# or
yarn build
```

Start the production server:

```bash
npm run start
# or
yarn start
```

## Project Structure

```
hydra_admin/
├── public/           # Static assets
├── src/
│   ├── app/          # App Router pages
│   │   ├── dashboard/    # Dashboard page
│   │   ├── users/        # Users management page
│   │   ├── airdrop/      # Airdrop management page
│   │   ├── content/      # Content management page
│   │   ├── settings/     # Settings page
│   │   ├── cache/        # Cache management page
│   │   ├── analytics/    # Analytics page
│   │   ├── login/        # Login page
│   │   └── layout.tsx    # Root layout with AuthProvider
│   ├── components/   # Reusable components
│   │   └── layout/       # Layout components
│   ├── contexts/     # React contexts
│   ├── lib/          # Utility functions and API client
│   └── types/        # TypeScript type definitions
├── next.config.ts    # Next.js configuration
├── tailwind.config.js # TailwindCSS configuration
├── postcss.config.mjs # PostCSS configuration
└── tsconfig.json     # TypeScript configuration
```

## Authentication

The admin dashboard uses JWT authentication to secure access. The authentication flow is as follows:

1. User enters credentials on the login page
2. Credentials are sent to the Fastify backend
3. Backend validates credentials and returns a JWT token
4. Token is stored in localStorage and included in subsequent API requests
5. Token is validated on each request to protected routes

## API Integration

The admin dashboard communicates with the Fastify backend through the API client in `src/lib/api.ts`. All API requests are proxied through Next.js rewrites to avoid CORS issues.

## Design Inspiration

The design is inspired by Mercedes' 2026 prototypes and luxury design language, focusing on:

- **Sleek Aesthetics**: Clean, minimalist design with attention to detail
- **Intuitive Usability**: User-friendly interface with clear navigation
- **Cutting-Edge Functionality**: Modern features and interactions
- **Glassmorphism Effects**: Subtle glass-like UI elements for depth
- **Subtle Animations**: Smooth transitions and micro-interactions
- **Dark Mode**: Elegant dark theme for reduced eye strain
