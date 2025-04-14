# D4L Admin Frontend

This is the admin frontend for the D4L platform. It's built with React, TypeScript, and Vite, and is designed to be served by the Fastify backend.

## Features

- Dashboard with key metrics
- User management
- Airdrop management
- Content management
- Settings management
- Cache management
- Authentication with JWT

## Project Structure

```
admin/
├── public/           # Static assets
├── src/
│   ├── api/          # API client and utilities
│   ├── assets/       # Images, fonts, etc.
│   ├── components/   # Reusable components
│   │   ├── common/   # Common components
│   │   └── layout/   # Layout components
│   ├── contexts/     # React contexts
│   ├── hooks/        # Custom hooks
│   ├── pages/        # Page components
│   ├── styles/       # Global styles and theme
│   ├── utils/        # Utility functions
│   ├── App.tsx       # Main App component
│   └── main.tsx      # Entry point
├── index.html        # HTML template
├── package.json      # Dependencies and scripts
├── tsconfig.json     # TypeScript configuration
└── vite.config.ts    # Vite configuration
```

## Development

To start the development server:

```bash
npm run dev
```

This will start the Vite development server on port 3001.

## Building for Production

To build the admin frontend for production:

```bash
npm run build
```

This will create a production build in the `dist` directory, which will be served by the Fastify backend.

## Authentication

The admin frontend uses JWT for authentication. The token is stored in localStorage and is sent with each API request.

## API Integration

The admin frontend communicates with the Fastify backend through the API client in `src/api/api.ts`. All API requests are made to the `/api/admin` endpoint.

## Styling

The admin frontend uses styled-components for styling, with a custom theme defined in `src/styles/theme.ts`.

## Deployment

The admin frontend is built and served by the Fastify backend. When you run `npm run build` in the root directory, it will build both the backend and the admin frontend.

## License

ISC
