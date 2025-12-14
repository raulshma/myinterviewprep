import { ObjectId } from 'mongodb';
import { cache } from 'react';
import { getInterviewsCollection } from '../collections';
import { 
  Interview, 
  CreateInterview, 
  ModuleType,
  OpeningBrief,
  MCQ,
  RevisionTopic,
  RapidFire,
  TopicStatus,
  TopicStyleCache,
} from '../schemas/interview';

/**
 * Lightweight interview data for dashboard listing
 */
export interface InterviewSummary {
  _id: string;
  userId: string;
  isPublic: boolean;
  jobDetails: {
    title: string;
    company: string;
    description: string;
    programmingLanguage?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  // Computed fields for dashboard
  hasOpeningBrief: boolean;
  topicCount: number;
  mcqCount: number;
  rapidFireCount: number;
  topicTitles: string[];
  keySkills: string[];
}

/**
 * Ensures interview modules have default empty arrays to prevent undefined errors
 */
function normalizeInterview(interview: Interview): Interview {
  return {
    ...interview,
    modules: {
      openingBrief: interview.modules?.openingBrief,
      revisionTopics: interview.modules?.revisionTopics ?? [],
      mcqs: interview.modules?.mcqs ?? [],
      rapidFire: interview.modules?.rapidFire ?? [],
    },
    excludedModules: interview.excludedModules ?? [],
  };
}

export interface InterviewRepository {
  create(data: CreateInterview): Promise<Interview>;
  findById(id: string): Promise<Interview | null>;
  findByUserId(userId: string): Promise<Interview[]>;
  findSummariesByUserId(
    userId: string, 
    page?: number, 
    limit?: number, 
    search?: string, 
    status?: 'active' | 'completed' | 'all'
  ): Promise<{ interviews: InterviewSummary[]; total: number }>;
  updateModule(id: string, module: 'openingBrief', content: OpeningBrief): Promise<void>;
  updateModule(id: string, module: 'revisionTopics', content: RevisionTopic[]): Promise<void>;
  updateModule(id: string, module: 'mcqs', content: MCQ[]): Promise<void>;
  updateModule(id: string, module: 'rapidFire', content: RapidFire[]): Promise<void>;
  appendToModule(id: string, module: 'mcqs', items: MCQ[]): Promise<void>;
  appendToModule(id: string, module: 'revisionTopics', items: RevisionTopic[]): Promise<void>;
  appendToModule(id: string, module: 'rapidFire', items: RapidFire[]): Promise<void>;
  updateTopicStyle(id: string, topicId: string, content: string, style: RevisionTopic['style']): Promise<void>;
  updateTopicStatus(id: string, topicId: string, status: TopicStatus): Promise<void>;
  updateTopicStyleCache(id: string, topicId: string, style: RevisionTopic['style'], content: string): Promise<void>;
  getTopicStyleCache(id: string, topicId: string): Promise<TopicStyleCache | null>;
  updateCustomInstructions(id: string, instructions: string | undefined): Promise<void>;
  setPublic(id: string, isPublic: boolean): Promise<void>;
  delete(id: string): Promise<void>;
}

/**
 * Cached findById - deduplicates DB calls within a single request
 */
const findByIdCached = cache(async (id: string): Promise<Interview | null> => {
  const collection = await getInterviewsCollection();
  const interview = await collection.findOne({ _id: id });
  if (!interview) return null;
  return normalizeInterview(interview as Interview);
});

export const interviewRepository: InterviewRepository = {
  async create(data) {
    const collection = await getInterviewsCollection();
    const now = new Date();
    const id = new ObjectId().toString();
    
    const interview: Interview = {
      _id: id,
      userId: data.userId,
      isPublic: data.isPublic ?? false,
      jobDetails: data.jobDetails,
      resumeContext: data.resumeContext,
      modules: {
        openingBrief: data.modules.openingBrief,
        revisionTopics: data.modules.revisionTopics ?? [],
        mcqs: data.modules.mcqs ?? [],
        rapidFire: data.modules.rapidFire ?? [],
      },
      excludedModules: data.excludedModules ?? [],
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(interview);
    return interview;
  },

  async findById(id: string) {
    return findByIdCached(id);
  },

  async findByUserId(userId: string) {
    const collection = await getInterviewsCollection();
    const interviews = await collection
      .find({ userId })
      .sort({ updatedAt: -1 })
      .toArray();
    return (interviews as Interview[]).map(normalizeInterview);
  },

  /**
   * Optimized query for dashboard - uses aggregation to compute summary fields
   * and avoids fetching full module content
   */
  async findSummariesByUserId(
    userId: string, 
    page: number = 1, 
    limit: number = 9,
    search?: string,
    status?: 'active' | 'completed' | 'all'
  ): Promise<{ interviews: InterviewSummary[]; total: number }> {
    const collection = await getInterviewsCollection();
    
    // Build match query
    const match: any = { userId };
    
    if (search) {
      match.$or = [
        { 'jobDetails.title': { $regex: search, $options: 'i' } },
        { 'jobDetails.company': { $regex: search, $options: 'i' } },
      ];
    }

    // Status filtering is tricky because status is computed. 
    // However, we can approximate it or filter after match if dataset is small, 
    // BUT for scalability we should try to match on module counts if possible, 
    // or better yet, just accept that 'status' filter might be best done in aggregation or 
    // we just fetch all matches and paginate in memory if the result set is small?
    // User requested "performant", so we should ideally do it in DB.
    // The previous implementation computed status based on module counts.
    // Let's replicate that logic in the query if possible, or just doing the text search in DB 
    // and rely on client/server to filter status? 
    // Actually, status filter was: 
    // completed = all 4 modules > 0
    // active = some modules > 0
    // upcoming = 0 modules
    
    // Constructing complex $match for 'status' based on computed fields is verbose but possible.
    // For now, let's prioritize the Search and Pagination. Status filtering is often less used 
    // or can be done with a slightly more complex query phase.
    
    // Let's implement the basic aggregation pipeline first.
    
    const pipeline: any[] = [
      { $match: match },
      { $sort: { updatedAt: -1 } },
      {
        $project: {
          _id: 1,
          userId: 1,
          isPublic: 1,
          jobDetails: 1,
          createdAt: 1,
          updatedAt: 1,
          hasOpeningBrief: { $cond: [{ $ifNull: ['$modules.openingBrief', false] }, true, false] },
          topicCount: { $size: { $ifNull: ['$modules.revisionTopics', []] } },
          mcqCount: { $size: { $ifNull: ['$modules.mcqs', []] } },
          rapidFireCount: { $size: { $ifNull: ['$modules.rapidFire', []] } },
          // Get first 4 topic titles
          topicTitles: {
            $slice: [
              { $map: { input: { $ifNull: ['$modules.revisionTopics', []] }, as: 't', in: '$$t.title' } },
              4
            ]
          },
          // Get key skills from opening brief (first 4)
          keySkills: {
            $slice: [{ $ifNull: ['$modules.openingBrief.keySkills', []] }, 4]
          },
        },
      },
      // Status filtering stage (if requested)
      ...(status && status !== 'all' ? [
        {
          $addFields: {
             // Compute status for filtering
             computedStatus: {
                $switch: {
                   branches: [
                      { 
                        case: { 
                          $and: [
                             { $eq: ['$hasOpeningBrief', true] }, 
                             { $gt: ['$topicCount', 0] },
                             { $gt: ['$mcqCount', 0] },
                             { $gt: ['$rapidFireCount', 0] }
                          ]
                        }, 
                        then: 'completed' 
                      },
                      {
                        case: {
                           $or: [
                             { $eq: ['$hasOpeningBrief', true] }, 
                             { $gt: ['$topicCount', 0] },
                             { $gt: ['$mcqCount', 0] },
                             { $gt: ['$rapidFireCount', 0] }
                           ]
                        },
                        then: 'active'
                      }
                   ],
                   default: 'upcoming'
                }
             }
          }
        },
        { 
           $match: { 
              computedStatus: status === 'active' ? { $in: ['active', 'upcoming'] } : status 
           } 
        }
      ] : []),
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      },
    ];

    const result = await collection.aggregate(pipeline).toArray();
    
    const total = result[0]?.metadata[0]?.total ?? 0;
    const summaries = result[0]?.data ?? [];

    return { interviews: summaries, total };
  },

  async updateModule(id: string, module: ModuleType, content: unknown) {
    const collection = await getInterviewsCollection();
    const now = new Date();
    
    await collection.updateOne(
      { _id: id },
      {
        $set: {
          [`modules.${module}`]: content,
          updatedAt: now,
        },
      }
    );
  },

  async appendToModule(id: string, module: 'mcqs' | 'revisionTopics' | 'rapidFire', items: unknown[]) {
    const collection = await getInterviewsCollection();
    const now = new Date();
    
    const pushUpdate = {
      [`modules.${module}`]: { $each: items },
    };
    
    await collection.updateOne(
      { _id: id },
      {
         
        $push: pushUpdate as any,
        $set: { updatedAt: now },
      }
    );
  },

  async updateTopicStyle(id: string, topicId: string, content: string, style: RevisionTopic['style']) {
    const collection = await getInterviewsCollection();
    const now = new Date();
    
    await collection.updateOne(
      { _id: id, 'modules.revisionTopics.id': topicId },
      {
        $set: {
          'modules.revisionTopics.$.content': content,
          'modules.revisionTopics.$.style': style,
          updatedAt: now,
        },
      }
    );
  },

  async updateTopicStatus(id: string, topicId: string, status: TopicStatus) {
    const collection = await getInterviewsCollection();
    const now = new Date();
    
    await collection.updateOne(
      { _id: id, 'modules.revisionTopics.id': topicId },
      {
        $set: {
          'modules.revisionTopics.$.status': status,
          updatedAt: now,
        },
      }
    );
  },

  async updateTopicStyleCache(id: string, topicId: string, style: RevisionTopic['style'], content: string) {
    const collection = await getInterviewsCollection();
    const now = new Date();
    
    await collection.updateOne(
      { _id: id, 'modules.revisionTopics.id': topicId },
      {
        $set: {
          [`modules.revisionTopics.$.styleCache.${style}`]: content,
          updatedAt: now,
        },
      }
    );
  },

  async getTopicStyleCache(id: string, topicId: string): Promise<TopicStyleCache | null> {
    const collection = await getInterviewsCollection();
    
    const result = await collection.findOne(
      { _id: id, 'modules.revisionTopics.id': topicId },
      { projection: { 'modules.revisionTopics.$.styleCache': 1 } }
    ) as any;

    if (!result || !result.modules?.revisionTopics?.[0]?.styleCache) {
      return null;
    }

    return result.modules.revisionTopics[0].styleCache as TopicStyleCache;
  },

  async updateCustomInstructions(id: string, instructions: string | undefined) {
    const collection = await getInterviewsCollection();
    const now = new Date();
    
    if (instructions === undefined) {
      // Remove custom instructions
      await collection.updateOne(
        { _id: id },
        {
          $unset: { customInstructions: '' },
          $set: { updatedAt: now },
        }
      );
    } else {
      // Set custom instructions
      await collection.updateOne(
        { _id: id },
        {
          $set: {
            customInstructions: instructions,
            updatedAt: now,
          },
        }
      );
    }
  },

  async setPublic(id: string, isPublic: boolean) {
    const collection = await getInterviewsCollection();
    const now = new Date();
    
    await collection.updateOne(
      { _id: id },
      {
        $set: {
          isPublic,
          updatedAt: now,
        },
      }
    );
  },

  async delete(id: string) {
    const collection = await getInterviewsCollection();
    await collection.deleteOne({ _id: id });
  },
};
