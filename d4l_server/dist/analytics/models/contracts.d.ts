/**
 * Contract models for the analytics system
 */
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
export declare function createContractAnalytics(address: string, name?: string, type?: string, deployedAt?: number, deployerAddress?: string, metadata?: Record<string, any>): ContractAnalytics;
export declare function updateContractAnalytics(contract: ContractAnalytics, eventName: string, userAddress?: string, gasUsed?: string, metadata?: Record<string, any>): ContractAnalytics;
