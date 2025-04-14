/**
 * Event models for the analytics system
 */

import { AnalyticsEvent, AnalyticsEventType } from './types';

// Contract event interface
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

// User interface event interface
export interface UIEvent extends AnalyticsEvent {
  url?: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  element?: string;
  action?: string;
  value?: string;
}

// Factory function to create a contract event
export function createContractEvent(
  contractAddress: string,
  eventName: string,
  transactionHash: string,
  blockNumber: number,
  logIndex: number,
  returnValues: Record<string, any>,
  walletAddress?: string,
  chainId?: number,
  gasUsed?: number,
  gasPrice?: string,
  metadata?: Record<string, any>
): ContractEvent {
  return {
    eventType: AnalyticsEventType.CONTRACT_INTERACTION,
    timestamp: Date.now(),
    walletAddress,
    chainId,
    contractAddress,
    eventName,
    transactionHash,
    blockNumber,
    logIndex,
    returnValues,
    gasUsed,
    gasPrice,
    metadata
  };
}

// Factory function to create a UI event
export function createUIEvent(
  eventType: AnalyticsEventType,
  walletAddress?: string,
  sessionId?: string,
  url?: string,
  referrer?: string,
  userAgent?: string,
  ipAddress?: string,
  element?: string,
  action?: string,
  value?: string,
  metadata?: Record<string, any>
): UIEvent {
  return {
    eventType,
    timestamp: Date.now(),
    walletAddress,
    sessionId,
    url,
    referrer,
    userAgent,
    ipAddress,
    element,
    action,
    value,
    metadata
  };
}
