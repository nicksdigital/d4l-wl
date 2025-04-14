/**
 * Event models for the analytics system
 */
import { AnalyticsEvent, AnalyticsEventType } from './types';
export interface ContractEvent extends AnalyticsEvent {
    contractAddress: string;
    eventName: string;
    transactionHash: string;
    blockNumber: number;
    logIndex: number;
    returnValues: Record<string, any>;
    gasUsed?: number;
    gasPrice?: string;
}
export interface UIEvent extends AnalyticsEvent {
    url?: string;
    referrer?: string;
    userAgent?: string;
    ipAddress?: string;
    element?: string;
    action?: string;
    value?: string;
}
export declare function createContractEvent(contractAddress: string, eventName: string, transactionHash: string, blockNumber: number, logIndex: number, returnValues: Record<string, any>, walletAddress?: string, chainId?: number, gasUsed?: number, gasPrice?: string, metadata?: Record<string, any>): ContractEvent;
export declare function createUIEvent(eventType: AnalyticsEventType, walletAddress?: string, sessionId?: string, url?: string, referrer?: string, userAgent?: string, ipAddress?: string, element?: string, action?: string, value?: string, metadata?: Record<string, any>): UIEvent;
