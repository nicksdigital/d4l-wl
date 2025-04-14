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
  gasUsed?: string,
  metadata?: Record<string, any>
): ContractAnalytics {
  // Update events count
  const events = { ...contract.events };
  events[eventName] = (events[eventName] || 0) + 1;
  
  // Calculate new gas used
  let totalGasUsed = contract.gasUsed;
  if (gasUsed) {
    const currentGas = BigInt(contract.gasUsed || '0');
    const newGas = BigInt(gasUsed);
    totalGasUsed = (currentGas + newGas).toString();
  }
  
  return {
    ...contract,
    totalInteractions: contract.totalInteractions + 1,
    uniqueUsers: userAddress ? contract.uniqueUsers + 1 : contract.uniqueUsers, // This is simplified, in a real app we'd check if the user is new
    lastInteraction: Date.now(),
    gasUsed: totalGasUsed,
    events,
    metadata: metadata ? { ...contract.metadata, ...metadata } : contract.metadata
  };
}

// Contract interaction summary
export interface ContractInteractionSummary {
  address: string;
  name?: string;
  totalInteractions: number;
  uniqueUsers: number;
  lastInteraction: number;
}
