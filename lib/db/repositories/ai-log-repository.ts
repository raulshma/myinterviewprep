import { ObjectId } from 'mongodb';
import { getAILogsCollection } from '../collections';
import { AILog, CreateAILog, AIAction } from '../schemas/ai-log';

export interface AILogQueryOptions {
  userId?: string;
  interviewId?: string;
  action?: AIAction;
  limit?: number;
  skip?: number;
}

export interface AILogRepository {
  create(data: CreateAILog): Promise<AILog>;
  findById(id: string): Promise<AILog | null>;
  findByInterviewId(interviewId: string): Promise<AILog[]>;
  findByUserId(userId: string, options?: { limit?: number; skip?: number }): Promise<AILog[]>;
  query(options: AILogQueryOptions): Promise<AILog[]>;
  deleteByInterviewId(interviewId: string): Promise<number>;
  getAggregatedStats(userId?: string): Promise<{
    totalRequests: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    avgLatencyMs: number;
  }>;
}

export const aiLogRepository: AILogRepository = {
  async create(data) {
    const collection = await getAILogsCollection();
    const id = new ObjectId().toString();
    
    const log: AILog = {
      _id: id,
      interviewId: data.interviewId,
      userId: data.userId,
      action: data.action,
      model: data.model,
      prompt: data.prompt,
      response: data.response,
      toolsUsed: data.toolsUsed ?? [],
      searchQueries: data.searchQueries ?? [],
      tokenUsage: data.tokenUsage,
      latencyMs: data.latencyMs,
      timestamp: data.timestamp,
    };

    await collection.insertOne(log);
    return log;
  },

  async findById(id: string) {
    const collection = await getAILogsCollection();
    const log = await collection.findOne({ _id: id });
    return log as AILog | null;
  },

  async findByInterviewId(interviewId: string) {
    const collection = await getAILogsCollection();
    const logs = await collection
      .find({ interviewId })
      .sort({ timestamp: -1 })
      .toArray();
    return logs as AILog[];
  },

  async findByUserId(userId: string, options?: { limit?: number; skip?: number }) {
    const collection = await getAILogsCollection();
    let cursor = collection
      .find({ userId })
      .sort({ timestamp: -1 });
    
    if (options?.skip) {
      cursor = cursor.skip(options.skip);
    }
    if (options?.limit) {
      cursor = cursor.limit(options.limit);
    }
    
    const logs = await cursor.toArray();
    return logs as AILog[];
  },

  async query(options: AILogQueryOptions) {
    const collection = await getAILogsCollection();
    
    const filter: Record<string, unknown> = {};
    if (options.userId) filter.userId = options.userId;
    if (options.interviewId) filter.interviewId = options.interviewId;
    if (options.action) filter.action = options.action;
    
    let cursor = collection.find(filter).sort({ timestamp: -1 });
    
    if (options.skip) {
      cursor = cursor.skip(options.skip);
    }
    if (options.limit) {
      cursor = cursor.limit(options.limit);
    }
    
    const logs = await cursor.toArray();
    return logs as AILog[];
  },

  async deleteByInterviewId(interviewId: string) {
    const collection = await getAILogsCollection();
    const result = await collection.deleteMany({ interviewId });
    return result.deletedCount;
  },

  async getAggregatedStats(userId?: string) {
    const collection = await getAILogsCollection();
    
    const matchStage = userId ? { $match: { userId } } : { $match: {} };
    
    const pipeline = [
      matchStage,
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          totalInputTokens: { $sum: '$tokenUsage.input' },
          totalOutputTokens: { $sum: '$tokenUsage.output' },
          avgLatencyMs: { $avg: '$latencyMs' },
        },
      },
    ];
    
    const results = await collection.aggregate(pipeline).toArray();
    
    if (results.length === 0) {
      return {
        totalRequests: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        avgLatencyMs: 0,
      };
    }
    
    return {
      totalRequests: results[0].totalRequests,
      totalInputTokens: results[0].totalInputTokens,
      totalOutputTokens: results[0].totalOutputTokens,
      avgLatencyMs: Math.round(results[0].avgLatencyMs || 0),
    };
  },
};
