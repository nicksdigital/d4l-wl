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
  url?: string,
  element?: string,
  action?: string,
  value?: string,
  walletAddress?: string,
  sessionId?: string,
  userId?: string,
  metadata?: Record<string, any>
): UIEvent {
  return {
    eventType,
    timestamp: Date.now(),
    sessionId,
    userId,
    walletAddress,
    url,
    element,
    action,
    value,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    metadata
  };
}

// Event counts by type
export interface EventCountsByType {
  [key in AnalyticsEventType]?: number;
}

// Event counts by date
export interface EventCountsByDate {
  [date: string]: number;
}
