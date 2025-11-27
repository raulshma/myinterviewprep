import { ObjectId } from 'mongodb';
import {
  getFeedbackEntriesCollection,
  getWeaknessAnalysesCollection,
  getImprovementPlansCollection,
  getProgressHistoryCollection,
} from '../collections';
import {
  FeedbackEntry,
  CreateFeedbackEntry,
  WeaknessAnalysis,
  ImprovementPlan,
  ProgressEntry,
  ProgressHistory,
} from '../schemas/feedback';

/**
 * Normalizes a feedback entry from the database to ensure all optional fields have defaults
 */
function normalizeFeedbackEntry(entry: FeedbackEntry): FeedbackEntry {
  return {
    ...entry,
    topicHints: entry.topicHints ?? [],
    skillClusters: entry.skillClusters ?? [],
  };
}

export interface FeedbackRepository {
  // CRUD operations for feedback entries
  create(data: CreateFeedbackEntry): Promise<FeedbackEntry>;
  findById(id: string): Promise<FeedbackEntry | null>;
  findByInterviewId(interviewId: string): Promise<FeedbackEntry[]>;
  findByUserId(userId: string): Promise<FeedbackEntry[]>;
  update(id: string, data: Partial<FeedbackEntry>): Promise<void>;
  delete(id: string): Promise<void>;

  // Weakness analysis operations
  getAnalysisByUserId(userId: string): Promise<WeaknessAnalysis | null>;
  updateAnalysis(userId: string, analysis: Omit<WeaknessAnalysis, '_id' | 'userId' | 'createdAt'>): Promise<void>;

  // Improvement plan operations
  getImprovementPlanByUserId(userId: string): Promise<ImprovementPlan | null>;
  createImprovementPlan(userId: string, plan: Omit<ImprovementPlan, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ImprovementPlan>;
  updateImprovementPlan(userId: string, plan: Partial<Omit<ImprovementPlan, '_id' | 'userId' | 'createdAt'>>): Promise<void>;
  
  // Progress history operations
  getProgressHistory(userId: string): Promise<ProgressHistory | null>;
  addProgressEntry(userId: string, entry: ProgressEntry): Promise<void>;
}

export const feedbackRepository: FeedbackRepository = {
  async create(data: CreateFeedbackEntry): Promise<FeedbackEntry> {
    const collection = await getFeedbackEntriesCollection();
    const now = new Date();
    const id = new ObjectId().toString();

    const entry: FeedbackEntry = {
      _id: id,
      interviewId: data.interviewId,
      userId: data.userId,
      question: data.question,
      attemptedAnswer: data.attemptedAnswer,
      difficultyRating: data.difficultyRating,
      topicHints: data.topicHints ?? [],
      skillClusters: [],
      analysisConfidence: undefined,
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(entry);
    return entry;
  },


  async findById(id: string): Promise<FeedbackEntry | null> {
    const collection = await getFeedbackEntriesCollection();
    const entry = await collection.findOne({ _id: id });
    if (!entry) return null;
    return normalizeFeedbackEntry(entry as FeedbackEntry);
  },

  async findByInterviewId(interviewId: string): Promise<FeedbackEntry[]> {
    const collection = await getFeedbackEntriesCollection();
    const entries = await collection
      .find({ interviewId })
      .sort({ createdAt: 1 }) // Chronological order (oldest first)
      .toArray();
    return (entries as FeedbackEntry[]).map(normalizeFeedbackEntry);
  },

  async findByUserId(userId: string): Promise<FeedbackEntry[]> {
    const collection = await getFeedbackEntriesCollection();
    const entries = await collection
      .find({ userId })
      .sort({ createdAt: 1 }) // Chronological order (oldest first)
      .toArray();
    return (entries as FeedbackEntry[]).map(normalizeFeedbackEntry);
  },

  async update(id: string, data: Partial<FeedbackEntry>): Promise<void> {
    const collection = await getFeedbackEntriesCollection();
    const now = new Date();

    // Remove fields that shouldn't be updated directly
    const { _id, createdAt, ...updateData } = data;
    void _id;
    void createdAt;

    await collection.updateOne(
      { _id: id },
      {
        $set: {
          ...updateData,
          updatedAt: now,
        },
      }
    );
  },

  async delete(id: string): Promise<void> {
    const collection = await getFeedbackEntriesCollection();
    await collection.deleteOne({ _id: id });
  },

  async getAnalysisByUserId(userId: string): Promise<WeaknessAnalysis | null> {
    const collection = await getWeaknessAnalysesCollection();
    const analysis = await collection.findOne({ userId });
    if (!analysis) return null;
    return analysis as WeaknessAnalysis;
  },

  async updateAnalysis(
    userId: string,
    analysis: Omit<WeaknessAnalysis, '_id' | 'userId' | 'createdAt'>
  ): Promise<void> {
    const collection = await getWeaknessAnalysesCollection();
    const now = new Date();

    await collection.updateOne(
      { userId },
      {
        $set: {
          skillGaps: analysis.skillGaps,
          lastAnalyzedAt: analysis.lastAnalyzedAt,
          totalFeedbackCount: analysis.totalFeedbackCount,
          updatedAt: now,
        },
        $setOnInsert: {
          _id: new ObjectId().toString(),
          userId,
          createdAt: now,
        },
      },
      { upsert: true }
    );
  },

  // ============================================================================
  // Improvement Plan Operations
  // ============================================================================

  async getImprovementPlanByUserId(userId: string): Promise<ImprovementPlan | null> {
    const collection = await getImprovementPlansCollection();
    const plan = await collection.findOne({ userId });
    if (!plan) return null;
    return plan as unknown as ImprovementPlan;
  },

  async createImprovementPlan(
    userId: string,
    plan: Omit<ImprovementPlan, '_id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<ImprovementPlan> {
    const collection = await getImprovementPlansCollection();
    const now = new Date();
    const id = new ObjectId().toString();

    const newPlan: ImprovementPlan = {
      _id: id,
      userId,
      skillGaps: plan.skillGaps,
      activities: plan.activities,
      progress: plan.progress,
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(newPlan as unknown as Parameters<typeof collection.insertOne>[0]);
    return newPlan;
  },

  async updateImprovementPlan(
    userId: string,
    plan: Partial<Omit<ImprovementPlan, '_id' | 'userId' | 'createdAt'>>
  ): Promise<void> {
    const collection = await getImprovementPlansCollection();
    const now = new Date();

    const updateData: Record<string, unknown> = { updatedAt: now };
    
    if (plan.skillGaps !== undefined) {
      updateData.skillGaps = plan.skillGaps;
    }
    if (plan.activities !== undefined) {
      updateData.activities = plan.activities;
    }
    if (plan.progress !== undefined) {
      updateData.progress = plan.progress;
    }

    await collection.updateOne(
      { userId },
      { $set: updateData }
    );
  },

  // ============================================================================
  // Progress History Operations
  // ============================================================================

  async getProgressHistory(userId: string): Promise<ProgressHistory | null> {
    const collection = await getProgressHistoryCollection();
    const history = await collection.findOne({ userId });
    if (!history) return null;
    return {
      userId: history.userId,
      entries: history.entries as ProgressEntry[],
    };
  },

  async addProgressEntry(userId: string, entry: ProgressEntry): Promise<void> {
    const collection = await getProgressHistoryCollection();
    const now = new Date();

    // Use type assertion to handle MongoDB's strict typing for $push
    await collection.updateOne(
      { userId },
      {
        $push: { entries: entry as unknown as Parameters<typeof collection.updateOne>[1] extends { $push?: infer P } ? P extends { entries: infer E } ? E : never : never },
        $set: { updatedAt: now },
        $setOnInsert: {
          _id: new ObjectId().toString(),
          userId,
          createdAt: now,
        },
      } as Parameters<typeof collection.updateOne>[1],
      { upsert: true }
    );
  },
};
