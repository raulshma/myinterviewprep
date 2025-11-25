'use server';

import { aiLogRepository, AILogQueryOptions } from '@/lib/db/repositories/ai-log-repository';
import { getUsersCollection, getInterviewsCollection, getAILogsCollection } from '@/lib/db/collections';
import { setSearchEnabled, isSearchEnabled } from '@/lib/services/search-service';
import { AILog, AIAction } from '@/lib/db/schemas/ai-log';

export interface AdminStats {
  totalUsers: number;
  activeThisWeek: number;
  totalInterviews: number;
  totalAIRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  avgLatencyMs: number;
}

export interface AILogWithDetails extends AILog {
  formattedTimestamp: string;
}

/**
 * Get aggregated admin statistics
 * Requirements: 9.1
 */
export async function getAdminStats(): Promise<AdminStats> {
  const usersCollection = await getUsersCollection();
  const interviewsCollection = await getInterviewsCollection();
  
  // Get total users
  const totalUsers = await usersCollection.countDocuments();
  
  // Get users active this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const activeThisWeek = await usersCollection.countDocuments({
    updatedAt: { $gte: oneWeekAgo }
  });
  
  // Get total interviews
  const totalInterviews = await interviewsCollection.countDocuments();
  
  // Get AI stats
  const aiStats = await aiLogRepository.getAggregatedStats();
  
  return {
    totalUsers,
    activeThisWeek,
    totalInterviews,
    totalAIRequests: aiStats.totalRequests,
    totalInputTokens: aiStats.totalInputTokens,
    totalOutputTokens: aiStats.totalOutputTokens,
    avgLatencyMs: aiStats.avgLatencyMs,
  };
}


/**
 * Get AI logs with pagination and filtering
 * Requirements: 9.4
 */
export async function getAILogs(options: {
  action?: AIAction;
  limit?: number;
  skip?: number;
}): Promise<AILogWithDetails[]> {
  const queryOptions: AILogQueryOptions = {
    action: options.action,
    limit: options.limit ?? 50,
    skip: options.skip ?? 0,
  };
  
  const logs = await aiLogRepository.query(queryOptions);
  
  return logs.map((log) => ({
    ...log,
    formattedTimestamp: new Date(log.timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  }));
}

/**
 * Get a single AI log by ID with full trace
 * Requirements: 9.4
 */
export async function getAILogById(id: string): Promise<AILog | null> {
  return aiLogRepository.findById(id);
}

/**
 * Toggle the search tool globally
 * Requirements: 9.3
 */
export async function toggleSearchTool(enabled: boolean): Promise<{ success: boolean; enabled: boolean }> {
  setSearchEnabled(enabled);
  return {
    success: true,
    enabled: isSearchEnabled(),
  };
}

/**
 * Get current search tool status
 * Requirements: 9.3
 */
export async function getSearchToolStatus(): Promise<{ enabled: boolean }> {
  return {
    enabled: isSearchEnabled(),
  };
}

/**
 * Get AI usage statistics by action type
 * Requirements: 9.1
 */
export async function getAIUsageByAction(): Promise<Array<{ action: string; count: number; avgLatency: number }>> {
  const collection = await getAILogsCollection();
  
  const pipeline = [
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        avgLatency: { $avg: '$latencyMs' },
        totalTokens: { $sum: { $add: ['$tokenUsage.input', '$tokenUsage.output'] } },
      },
    },
    {
      $sort: { count: -1 as const },
    },
  ];
  
  const results = await collection.aggregate(pipeline).toArray();
  
  return results.map((r) => ({
    action: r._id as string,
    count: r.count as number,
    avgLatency: Math.round(r.avgLatency as number),
  }));
}

/**
 * Get recent AI activity for the dashboard
 * Requirements: 9.1
 */
export async function getRecentAIActivity(limit: number = 10): Promise<AILogWithDetails[]> {
  const logs = await aiLogRepository.query({ limit });
  
  return logs.map((log) => ({
    ...log,
    formattedTimestamp: new Date(log.timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  }));
}
