# Analytics Module

This module provides a comprehensive analytics system for the D4L platform, designed to track and analyze user behavior, contract interactions, and platform performance.

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
3. **Hooks**: React hooks for tracking events and sessions in the frontend
4. **Components**: React components for displaying analytics data
5. **Utils**: Utility functions for data processing and visualization

## Models

The models directory contains the following files:

- **types.ts**: Base types and interfaces for the analytics system
- **events.ts**: Event models and factory functions
- **sessions.ts**: Session models and factory functions
- **users.ts**: User models and factory functions
- **contracts.ts**: Contract models and factory functions
- **snapshots.ts**: Snapshot models and factory functions
- **index.ts**: Exports all models

## Integration with Backend

The analytics module integrates with the D4L server's analytics API endpoints:

- `/api/admin/analytics/dashboard/stats`: Get dashboard statistics
- `/api/admin/analytics/snapshots/daily`: Get daily snapshots
- `/api/admin/analytics/contracts/:address`: Get contract analytics

## Usage

### Tracking Events

```typescript
import { createUIEvent, AnalyticsEventType } from '@/analytics/models';
import { trackEvent } from '@/analytics/services';

// Track a button click
const event = createUIEvent(
  AnalyticsEventType.BUTTON_CLICK,
  window.location.href,
  'submit-button',
  'click',
  undefined,
  walletAddress
);

trackEvent(event);
```

### Displaying Analytics

```typescript
import { useAnalytics } from '@/analytics/hooks';

function AnalyticsDashboard() {
  const { stats, isLoading } = useAnalytics();
  
  if (isLoading) {
    return <Loading />;
  }
  
  return (
    <div>
      <h1>Analytics Dashboard</h1>
      <p>Total Users: {stats.totalUsers}</p>
      <p>Active Users: {stats.activeUsers}</p>
      {/* ... */}
    </div>
  );
}
```

## Future Improvements

- Add more visualization components (charts, graphs, etc.)
- Implement real-time analytics with WebSockets
- Add more granular filtering options
- Implement export functionality for analytics data
- Add machine learning for predictive analytics
