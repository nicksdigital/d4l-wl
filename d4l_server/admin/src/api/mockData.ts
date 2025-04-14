/**
 * Mock data for the admin dashboard
 */

// Mock analytics dashboard stats
export const mockAnalyticsDashboardStats = {
  success: true,
  data: {
    activeUsers: 1245,
    newUsers: 87,
    totalSessions: 3567,
    totalTransactions: 892,
    totalGasUsed: '12500000000',
    topContracts: [
      {
        address: '0x80AF6A596Ab08AE6C7B2A7fC31d131cf97444Da9',
        name: 'D4LSoulIdentity',
        interactions: 456
      },
      {
        address: '0x80E5B7b84Ef130908eD78E4EffB6A54De1EabBAf',
        name: 'D4LSoulflowRouter',
        interactions: 324
      },
      {
        address: '0x4e569c16220c734484BE84430A995A33d3543e0d',
        name: 'D4LToken',
        interactions: 213
      },
      {
        address: '0xC669B4Cc448b8b53f5D5Bcd60198c9c7bf6f346c',
        name: 'D4LAirdropController',
        interactions: 156
      },
      {
        address: '0x3F84a5bD492841fa9c9aECFB751129F0f1b7059d',
        name: 'D4LRewardRegistry',
        interactions: 98
      }
    ],
    topEvents: [
      {
        eventType: 'ASSET_LINKED',
        count: 345
      },
      {
        eventType: 'TOKEN_TRANSFER',
        count: 287
      },
      {
        eventType: 'ROUTE_EXECUTED',
        count: 198
      },
      {
        eventType: 'USER_REGISTERED',
        count: 87
      },
      {
        eventType: 'AIRDROP_CLAIMED',
        count: 65
      }
    ],
    recentEvents: [
      {
        eventType: 'ASSET_LINKED',
        timestamp: Date.now() - 1000 * 60 * 5,
        walletAddress: '0x1234567890123456789012345678901234567890'
      },
      {
        eventType: 'TOKEN_TRANSFER',
        timestamp: Date.now() - 1000 * 60 * 10,
        walletAddress: '0x2345678901234567890123456789012345678901'
      },
      {
        eventType: 'ROUTE_EXECUTED',
        timestamp: Date.now() - 1000 * 60 * 15,
        walletAddress: '0x3456789012345678901234567890123456789012'
      },
      {
        eventType: 'USER_REGISTERED',
        timestamp: Date.now() - 1000 * 60 * 20,
        walletAddress: '0x4567890123456789012345678901234567890123'
      },
      {
        eventType: 'AIRDROP_CLAIMED',
        timestamp: Date.now() - 1000 * 60 * 25,
        walletAddress: '0x5678901234567890123456789012345678901234'
      }
    ]
  }
};

// Mock daily snapshots
export const mockDailySnapshots = {
  success: true,
  data: [
    {
      date: '2023-10-01',
      newUsers: 12,
      activeUsers: 156,
      totalSessions: 423,
      averageSessionDuration: 345,
      totalTransactions: 98,
      totalGasUsed: '1500000000',
      topContracts: [
        { address: '0x80AF6A596Ab08AE6C7B2A7fC31d131cf97444Da9', interactions: 45 },
        { address: '0x80E5B7b84Ef130908eD78E4EffB6A54De1EabBAf', interactions: 32 }
      ],
      topEvents: [
        { eventType: 'ASSET_LINKED', count: 34 },
        { eventType: 'TOKEN_TRANSFER', count: 28 }
      ]
    },
    {
      date: '2023-10-02',
      newUsers: 15,
      activeUsers: 178,
      totalSessions: 456,
      averageSessionDuration: 356,
      totalTransactions: 112,
      totalGasUsed: '1700000000',
      topContracts: [
        { address: '0x80AF6A596Ab08AE6C7B2A7fC31d131cf97444Da9', interactions: 48 },
        { address: '0x80E5B7b84Ef130908eD78E4EffB6A54De1EabBAf', interactions: 35 }
      ],
      topEvents: [
        { eventType: 'ASSET_LINKED', count: 38 },
        { eventType: 'TOKEN_TRANSFER', count: 31 }
      ]
    },
    {
      date: '2023-10-03',
      newUsers: 18,
      activeUsers: 192,
      totalSessions: 489,
      averageSessionDuration: 367,
      totalTransactions: 126,
      totalGasUsed: '1900000000',
      topContracts: [
        { address: '0x80AF6A596Ab08AE6C7B2A7fC31d131cf97444Da9', interactions: 51 },
        { address: '0x80E5B7b84Ef130908eD78E4EffB6A54De1EabBAf', interactions: 38 }
      ],
      topEvents: [
        { eventType: 'ASSET_LINKED', count: 42 },
        { eventType: 'TOKEN_TRANSFER', count: 34 }
      ]
    },
    {
      date: '2023-10-04',
      newUsers: 14,
      activeUsers: 187,
      totalSessions: 478,
      averageSessionDuration: 362,
      totalTransactions: 119,
      totalGasUsed: '1800000000',
      topContracts: [
        { address: '0x80AF6A596Ab08AE6C7B2A7fC31d131cf97444Da9', interactions: 49 },
        { address: '0x80E5B7b84Ef130908eD78E4EffB6A54De1EabBAf', interactions: 36 }
      ],
      topEvents: [
        { eventType: 'ASSET_LINKED', count: 40 },
        { eventType: 'TOKEN_TRANSFER', count: 32 }
      ]
    },
    {
      date: '2023-10-05',
      newUsers: 16,
      activeUsers: 195,
      totalSessions: 498,
      averageSessionDuration: 371,
      totalTransactions: 129,
      totalGasUsed: '1950000000',
      topContracts: [
        { address: '0x80AF6A596Ab08AE6C7B2A7fC31d131cf97444Da9', interactions: 52 },
        { address: '0x80E5B7b84Ef130908eD78E4EffB6A54De1EabBAf', interactions: 39 }
      ],
      topEvents: [
        { eventType: 'ASSET_LINKED', count: 43 },
        { eventType: 'TOKEN_TRANSFER', count: 35 }
      ]
    },
    {
      date: '2023-10-06',
      newUsers: 19,
      activeUsers: 203,
      totalSessions: 512,
      averageSessionDuration: 378,
      totalTransactions: 135,
      totalGasUsed: '2050000000',
      topContracts: [
        { address: '0x80AF6A596Ab08AE6C7B2A7fC31d131cf97444Da9', interactions: 54 },
        { address: '0x80E5B7b84Ef130908eD78E4EffB6A54De1EabBAf', interactions: 41 }
      ],
      topEvents: [
        { eventType: 'ASSET_LINKED', count: 45 },
        { eventType: 'TOKEN_TRANSFER', count: 37 }
      ]
    },
    {
      date: '2023-10-07',
      newUsers: 21,
      activeUsers: 215,
      totalSessions: 532,
      averageSessionDuration: 385,
      totalTransactions: 142,
      totalGasUsed: '2150000000',
      topContracts: [
        { address: '0x80AF6A596Ab08AE6C7B2A7fC31d131cf97444Da9', interactions: 57 },
        { address: '0x80E5B7b84Ef130908eD78E4EffB6A54De1EabBAf', interactions: 43 }
      ],
      topEvents: [
        { eventType: 'ASSET_LINKED', count: 48 },
        { eventType: 'TOKEN_TRANSFER', count: 39 }
      ]
    }
  ]
};

// Mock contracts
export const mockContracts = {
  success: true,
  data: [
    {
      address: '0x80AF6A596Ab08AE6C7B2A7fC31d131cf97444Da9',
      name: 'D4LSoulIdentity',
      type: 'Identity',
      totalInteractions: 456,
      uniqueUsers: 234,
      lastInteraction: Date.now() - 1000 * 60 * 5,
      gasUsed: '7500000000',
      events: {
        'IdentityCreated': 87,
        'IdentityLinked': 123,
        'IdentityUnlinked': 45,
        'IdentityUpdated': 201
      }
    },
    {
      address: '0x80E5B7b84Ef130908eD78E4EffB6A54De1EabBAf',
      name: 'D4LSoulflowRouter',
      type: 'Router',
      totalInteractions: 324,
      uniqueUsers: 187,
      lastInteraction: Date.now() - 1000 * 60 * 10,
      gasUsed: '5200000000',
      events: {
        'RouteRegistered': 56,
        'RouteExecuted': 198,
        'RouteUpdated': 34,
        'RouteDeleted': 36
      }
    },
    {
      address: '0x4e569c16220c734484BE84430A995A33d3543e0d',
      name: 'D4LToken',
      type: 'Token',
      totalInteractions: 213,
      uniqueUsers: 156,
      lastInteraction: Date.now() - 1000 * 60 * 15,
      gasUsed: '3800000000',
      events: {
        'Transfer': 156,
        'Approval': 57
      }
    },
    {
      address: '0xC669B4Cc448b8b53f5D5Bcd60198c9c7bf6f346c',
      name: 'D4LAirdropController',
      type: 'Airdrop',
      totalInteractions: 156,
      uniqueUsers: 132,
      lastInteraction: Date.now() - 1000 * 60 * 20,
      gasUsed: '2800000000',
      events: {
        'AirdropCreated': 12,
        'AirdropClaimed': 65,
        'AirdropUpdated': 23,
        'AirdropCancelled': 5,
        'AirdropCompleted': 51
      }
    },
    {
      address: '0x3F84a5bD492841fa9c9aECFB751129F0f1b7059d',
      name: 'D4LRewardRegistry',
      type: 'Rewards',
      totalInteractions: 98,
      uniqueUsers: 87,
      lastInteraction: Date.now() - 1000 * 60 * 25,
      gasUsed: '1800000000',
      events: {
        'RewardCreated': 23,
        'RewardClaimed': 45,
        'RewardUpdated': 18,
        'RewardDeleted': 12
      }
    }
  ]
};
