/**
 * Contract models for the analytics system
 */

// Contract analytics
export interface ContractAnalytics {
  address: string;
  name?: string;
  type?: string;
  deployedAt?: number;
  deployerAddress?: string;
  totalInteractions: number;
  uniqueUsers: number;
  lastInteraction: number;
  gasUsed: string;
  events: Record<string, number>;
  metadata?: Record<string, any>;
}

// Factory function to create contract analytics
export function createContractAnalytics(
  address: string,
  name?: string,
  type?: string,
  deployedAt?: number,
  deployerAddress?: string,
  metadata?: Record<string, any>
): ContractAnalytics {
  return {
    address,
    name,
    type,
    deployedAt,
    deployerAddress,
    totalInteractions: 0,
    uniqueUsers: 0,
    lastInteraction: Date.now(),
    gasUsed: '0',
    events: {},
    metadata
  };
}

// Function to update contract analytics
export function updateContractAnalytics(
  contract: ContractAnalytics,
  eventName: string,
  userAddress?: string,
  gasUsed: string = '0',
  metadata?: Record<string, any>
): ContractAnalytics {
  // Create a copy of the events object
  const updatedEvents = { ...contract.events };
  
  // Increment the count for this event
  updatedEvents[eventName] = (updatedEvents[eventName] || 0) + 1;
  
  return {
    ...contract,
    totalInteractions: contract.totalInteractions + 1,
    // We would need to check if this is a new user in the actual implementation
    uniqueUsers: userAddress ? contract.uniqueUsers + 1 : contract.uniqueUsers,
    lastInteraction: Date.now(),
    gasUsed: addBigNumbers(contract.gasUsed, gasUsed),
    events: updatedEvents,
    metadata: { ...contract.metadata, ...metadata }
  };
}

// Helper function to add big numbers as strings
function addBigNumbers(a: string, b: string): string {
  const aBigInt = BigInt(a);
  const bBigInt = BigInt(b);
  return (aBigInt + bBigInt).toString();
}
