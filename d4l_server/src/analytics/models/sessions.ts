/**
 * Session models for the analytics system
 */

// Session interface
export interface AnalyticsSession {
  id: string;
  userId?: string;
  walletAddress?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  isActive: boolean;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  entryPage?: string;
  exitPage?: string;
  pageViews?: number;
  interactions?: number;
  chainId?: number;
}

// Factory function to create a new session
export function createSession(
  id: string,
  walletAddress?: string,
  userAgent?: string,
  ipAddress?: string,
  referrer?: string,
  entryPage?: string,
  chainId?: number
): AnalyticsSession {
  return {
    id,
    walletAddress,
    startTime: Date.now(),
    isActive: true,
    userAgent,
    ipAddress,
    referrer,
    entryPage,
    pageViews: 1,
    interactions: 0,
    chainId
  };
}

// Function to end a session
export function endSession(session: AnalyticsSession, exitPage?: string): AnalyticsSession {
  const endTime = Date.now();
  return {
    ...session,
    endTime,
    duration: endTime - session.startTime,
    isActive: false,
    exitPage: exitPage || session.exitPage
  };
}

// Function to update session stats
export function updateSessionStats(
  session: AnalyticsSession,
  pageView: boolean = false,
  interaction: boolean = false,
  currentPage?: string
): AnalyticsSession {
  return {
    ...session,
    pageViews: pageView ? (session.pageViews || 0) + 1 : session.pageViews,
    interactions: interaction ? (session.interactions || 0) + 1 : session.interactions,
    exitPage: currentPage || session.exitPage
  };
}
