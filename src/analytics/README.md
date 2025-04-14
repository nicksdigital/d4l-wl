# D4L Decentralized Analytics

A custom decentralized analytics system for the D4L platform that can track smart contract interactions and user behavior without relying on third-party services like Google Analytics.

## Features

- **Blockchain Event Tracking**: Listen to and track events from smart contracts
- **User Behavior Tracking**: Track user interactions with the frontend
- **Session Management**: Track user sessions and page views
- **Contract Analytics**: Analyze contract usage and interactions
- **User Analytics**: Analyze user behavior and engagement
- **Real-time Analytics**: Get real-time insights into platform usage
- **Historical Analytics**: Generate and query historical analytics data
- **Privacy-focused**: No third-party tracking, all data stored on your own servers
- **Decentralized**: Can work with or without a traditional database

## Architecture

The analytics system consists of several components:

1. **Models**: Define the data structures for events, sessions, users, contracts, and snapshots
2. **Services**: Provide the business logic for storing and querying analytics data
3. **Controllers**: Handle API requests and responses
4. **Routes**: Define the API endpoints
5. **Listeners**: Listen to blockchain events and frontend events
6. **Utils**: Provide utility functions for database operations
7. **Client**: Provide React components for tracking events from the frontend

## API Endpoints

### Events

- `GET /api/analytics/events`: Query events
- `GET /api/analytics/events/:id`: Get event by ID
- `DELETE /api/analytics/events/:id`: Delete event by ID
- `GET /api/analytics/events/counts/by-type`: Get event counts by type

### Contracts

- `GET /api/analytics/contracts`: Get all contract analytics
- `GET /api/analytics/contracts/top`: Get top contracts by interactions
- `GET /api/analytics/contracts/:address`: Get contract analytics by address
- `POST /api/analytics/contracts/listen`: Add a contract to listen to
- `DELETE /api/analytics/contracts/listen/:address`: Stop listening to a contract
- `GET /api/analytics/contracts/listen/all`: Get all contracts we're listening to

### Users

- `GET /api/analytics/users`: Get all users
- `GET /api/analytics/users/active`: Get active users
- `GET /api/analytics/users/new`: Get new users
- `GET /api/analytics/users/:walletAddress`: Get user by wallet address
- `GET /api/analytics/users/:walletAddress/sessions`: Get sessions by wallet address
- `GET /api/analytics/users/sessions/active`: Get all active sessions
- `GET /api/analytics/users/sessions/:sessionId`: Get session by ID

### Snapshots

- `POST /api/analytics/snapshots/daily`: Create a daily snapshot
- `GET /api/analytics/snapshots/daily/:date`: Get daily snapshot by date
- `GET /api/analytics/snapshots/daily`: Get daily snapshots for a date range
- `GET /api/analytics/snapshots/realtime`: Get real-time analytics

### Tracking

- `POST /api/analytics/track`: Track an event
- `POST /api/analytics/session/start`: Start a session
- `POST /api/analytics/session/end`: End a session

## Frontend Integration

To integrate the analytics system with your frontend, use the `AnalyticsProvider` component:

```jsx
import { AnalyticsProvider, useAnalytics } from './analytics/client';

function App() {
  return (
    <AnalyticsProvider
      apiUrl="/api/analytics"
      walletAddress={connectedWallet}
      chainId={connectedChainId}
    >
      <YourApp />
    </AnalyticsProvider>
  );
}

function YourComponent() {
  const { trackEvent, trackPageView, trackContractInteraction } = useAnalytics();
  
  // Track a page view
  useEffect(() => {
    trackPageView(window.location.pathname);
  }, [trackPageView]);
  
  // Track a button click
  const handleClick = () => {
    trackEvent('button_click', { buttonName: 'submit' });
  };
  
  // Track a contract interaction
  const handleContractCall = async () => {
    // ... contract call logic
    trackContractInteraction(
      contractAddress,
      'myMethod',
      walletAddress,
      chainId,
      { gasUsed, success: true }
    );
  };
  
  return (
    <div>
      <button onClick={handleClick}>Submit</button>
      <button onClick={handleContractCall}>Call Contract</button>
    </div>
  );
}
```

## Database Setup

The analytics system can work with PostgreSQL or fall back to in-memory storage. To use PostgreSQL, set the following environment variables:

```
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_PASSWORD=your_db_password
DB_PORT=5432
DB_SSL=true
```

If these variables are not set, or if the database connection fails, the system will automatically fall back to in-memory storage.

## Blockchain Listener Setup

To listen to blockchain events, set the following environment variables:

```
ETH_MAINNET_RPC=https://mainnet.infura.io/v3/your_infura_key
POLYGON_MAINNET_RPC=https://polygon-rpc.com
BASE_MAINNET_RPC=https://mainnet.base.org

D4L_SOUL_IDENTITY_ADDRESS=0x...
D4L_SOULFLOW_ROUTER_ADDRESS=0x...
```

## License

ISC
