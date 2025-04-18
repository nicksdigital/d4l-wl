# Reputation Tier Badge Component

## Description
A badge component that displays a user's reputation tier with appropriate styling based on the tier level.

## Properties
- `soulId`: The Soul Identity address
- `assetAddress`: The reputation asset address
- `size`: Size of the badge (small, medium, large)
- `showLabel`: Boolean to toggle tier label display

## Example Implementation
```jsx
import React from 'react';
import { useReputationScore } from '../hooks/useReputationScore';

const tierColors = {
  1: { background: '#E0E0E0', text: '#757575' },
  2: { background: '#BBDEFB', text: '#1976D2' },
  3: { background: '#C8E6C9', text: '#388E3C' },
  4: { background: '#FFECB3', text: '#FFA000' },
  5: { background: '#FFCDD2', text: '#D32F2F' },
};

const tierLabels = {
  1: 'Novice',
  2: 'Apprentice',
  3: 'Expert',
  4: 'Master',
  5: 'Legend',
};

const ReputationTierBadge = ({ 
  soulId, 
  assetAddress, 
  size = 'medium',
  showLabel = true 
}) => {
  const { tier, loading, error } = useReputationScore(soulId, assetAddress);
  
  if (loading || error) return null;
  
  const sizeClass = {
    small: 'reputation-badge--small',
    medium: 'reputation-badge--medium',
    large: 'reputation-badge--large',
  }[size];
  
  const colors = tierColors[tier] || tierColors[1];
  const label = tierLabels[tier] || 'Unknown';
  
  return (
    <div 
      className={`reputation-badge ${sizeClass}`}
      style={{ 
        backgroundColor: colors.background,
        color: colors.text
      }}
    >
      <span className="reputation-badge__tier">{tier}</span>
      {showLabel && (
        <span className="reputation-badge__label">{label}</span>
      )}
    </div>
  );
};

export default ReputationTierBadge;
```

## Styling
```css
.reputation-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 16px;
  padding: 4px 12px;
  font-weight: 600;
}

.reputation-badge--small {
  font-size: 12px;
  padding: 2px 8px;
}

.reputation-badge--medium {
  font-size: 14px;
  padding: 4px 12px;
}

.reputation-badge--large {
  font-size: 16px;
  padding: 6px 16px;
}

.reputation-badge__tier {
  margin-right: 4px;
}

.reputation-badge__label {
  font-weight: 500;
}
```

## Usage Example
```jsx
// In a user list component
import ReputationTierBadge from '../components/ReputationTierBadge';

const UserListItem = ({ user }) => {
  return (
    <div className="user-list-item">
      <div className="user-list-item__avatar">
        <img src={user.avatarUrl} alt={user.username} />
      </div>
      
      <div className="user-list-item__info">
        <div className="user-list-item__name">{user.username}</div>
        <div className="user-list-item__soul-id">{user.soulId}</div>
      </div>
      
      <div className="user-list-item__badge">
        <ReputationTierBadge 
          soulId={user.soulId}
          assetAddress={REPUTATION_ASSET_ADDRESS}
          size="small"
          showLabel={true}
        />
      </div>
    </div>
  );
};
```

## Customization Options

### Custom Tier Colors
You can customize the tier colors by modifying the `tierColors` object:

```jsx
// Custom tier colors for a gaming application
const tierColors = {
  1: { background: '#E0E0E0', text: '#757575' }, // Bronze
  2: { background: '#C0C0C0', text: '#424242' }, // Silver
  3: { background: '#FFD700', text: '#5D4037' }, // Gold
  4: { background: '#B9F2FF', text: '#0D47A1' }, // Diamond
  5: { background: '#FF9E80', text: '#BF360C' }, // Legendary
};
```

### Custom Tier Labels
You can customize the tier labels by modifying the `tierLabels` object:

```jsx
// Custom tier labels for a community forum
const tierLabels = {
  1: 'Newcomer',
  2: 'Regular',
  3: 'Contributor',
  4: 'Moderator',
  5: 'Leader',
};
```

## Accessibility Considerations
- Ensure sufficient color contrast between background and text
- Use appropriate font sizes for readability
- Include proper ARIA attributes for screen readers
- Consider adding tooltips for additional context

## Responsive Design
The badge adapts to different screen sizes through the size prop:
- `small`: Useful for compact UI elements like tables or lists
- `medium`: Default size, suitable for most contexts
- `large`: Provides emphasis in profile headers or achievement displays

## Animation Options
You can add animations to make the badge more engaging:

```css
/* Add to the CSS */
.reputation-badge {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.reputation-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
```

## Integration with Other Components
The Reputation Tier Badge works well with:
- User profiles
- Leaderboards
- Comment sections
- Forum posts
- Activity feeds

It provides a quick visual indicator of a user's standing in the community without taking up much space.
