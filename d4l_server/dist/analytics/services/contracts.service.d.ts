import { ContractAnalytics } from '../models';
declare class ContractsService {
    /**
     * Get or create contract analytics
     */
    getOrCreateContractAnalytics(address: string, name?: string, type?: string, deployedAt?: number, deployerAddress?: string, metadata?: Record<string, any>): Promise<ContractAnalytics>;
    /**
     * Update contract analytics
     */
    updateContractAnalytics(address: string, eventName: string, userAddress?: string, gasUsed?: string, metadata?: Record<string, any>): Promise<ContractAnalytics | null>;
    /**
     * Get contract analytics by address
     */
    getContractAnalytics(address: string): Promise<ContractAnalytics | null>;
    /**
     * Get all contract analytics
     */
    getAllContractAnalytics(): Promise<ContractAnalytics[]>;
    /**
     * Get top contracts by interactions
     */
    getTopContractsByInteractions(limit?: number): Promise<ContractAnalytics[]>;
}
declare const _default: ContractsService;
export default _default;
