/**
 * Feedback Formatter Utility
 * Implements pretty-print and parse functions for feedback analysis data.
 * Supports round-trip conversion: prettyPrint -> parse -> original data
 * Requirements: 6.1, 6.2, 6.3
 */

import type { 
  FeedbackEntry, 
  WeaknessAnalysis, 
  SkillGap 
} from '@/lib/db/schemas/feedback';
import type { SkillCluster } from '@/lib/db/schemas/learning-path';
import { 
  FeedbackEntrySchema, 
  WeaknessAnalysisSchema, 
  SkillGapSchema 
} from '@/lib/db/schemas/feedback';
import { SkillClusterSchema } from '@/lib/db/schemas/learning-path';

// ============================================================================
// Section Markers for Parsing
// ============================================================================

const SECTION_MARKERS = {
  HEADER: '# Interview Feedback Analysis',
  ANALYSIS_INFO: '## Analysis Information',
  SKILL_GAPS: '## Skill Gaps',
  FEEDBACK_ENTRIES: '## Feedback Entries',
  ENTRY_SEPARATOR: '---',
  FIELD_PREFIX: '- ',
} as const;

// ============================================================================
// Pretty Print Functions
// ============================================================================

/**
 * Format a date to ISO string for consistent serialization
 */
function formatDate(date: Date): string {
  return date.toISOString();
}

/**
 * Parse a date string back to Date object
 */
function parseDate(dateStr: string): Date {
  return new Date(dateStr);
}

/**
 * Pretty-print a single skill gap
 */
function formatSkillGap(gap: SkillGap, index: number): string {
  const lines: string[] = [
    `### Gap ${index + 1}: ${gap.skillCluster}`,
    `- Skill Cluster: ${gap.skillCluster}`,
    `- Gap Score: ${gap.gapScore}`,
    `- Frequency: ${gap.frequency}`,
    `- Confidence: ${gap.confidence}`,
    `- Related Feedback IDs: ${gap.relatedFeedbackIds.join(', ') || 'none'}`,
  ];
  return lines.join('\n');
}

/**
 * Pretty-print a single feedback entry
 */
function formatFeedbackEntry(entry: FeedbackEntry): string {
  const lines: string[] = [
    `### Entry: ${entry._id}`,
    `- ID: ${entry._id}`,
    `- Interview ID: ${entry.interviewId}`,
    `- User ID: ${entry.userId}`,
    `- Question: ${entry.question}`,
    `- Attempted Answer: ${entry.attemptedAnswer || '(none)'}`,
    `- Difficulty Rating: ${entry.difficultyRating}`,
    `- Topic Hints: ${entry.topicHints.join(', ') || '(none)'}`,
    `- Skill Clusters: ${entry.skillClusters.join(', ') || '(none)'}`,
    `- Analysis Confidence: ${entry.analysisConfidence ?? '(not analyzed)'}`,
    `- Created At: ${formatDate(entry.createdAt)}`,
    `- Updated At: ${formatDate(entry.updatedAt)}`,
  ];
  return lines.join('\n');
}


/**
 * Combined data structure for pretty-printing
 */
export interface FeedbackAnalysisExport {
  analysis: WeaknessAnalysis;
  entries: FeedbackEntry[];
}

/**
 * Pretty-print feedback analysis data to a formatted text representation.
 * The output format is designed to be human-readable and parseable.
 * 
 * @param data - The feedback analysis data to format
 * @returns Formatted text representation
 */
export function prettyPrint(data: FeedbackAnalysisExport): string {
  const { analysis, entries } = data;
  
  const sections: string[] = [
    SECTION_MARKERS.HEADER,
    '',
    SECTION_MARKERS.ANALYSIS_INFO,
    `- Analysis ID: ${analysis._id}`,
    `- User ID: ${analysis.userId}`,
    `- Total Feedback Count: ${analysis.totalFeedbackCount}`,
    `- Last Analyzed At: ${formatDate(analysis.lastAnalyzedAt)}`,
    `- Created At: ${formatDate(analysis.createdAt)}`,
    `- Updated At: ${formatDate(analysis.updatedAt)}`,
    '',
    SECTION_MARKERS.SKILL_GAPS,
  ];

  // Add skill gaps
  if (analysis.skillGaps.length === 0) {
    sections.push('No skill gaps identified.');
  } else {
    analysis.skillGaps.forEach((gap, index) => {
      sections.push('');
      sections.push(formatSkillGap(gap, index));
    });
  }

  sections.push('');
  sections.push(SECTION_MARKERS.FEEDBACK_ENTRIES);

  // Add feedback entries
  if (entries.length === 0) {
    sections.push('No feedback entries.');
  } else {
    entries.forEach((entry, index) => {
      sections.push('');
      sections.push(formatFeedbackEntry(entry));
      if (index < entries.length - 1) {
        sections.push('');
        sections.push(SECTION_MARKERS.ENTRY_SEPARATOR);
      }
    });
  }

  return sections.join('\n');
}

// ============================================================================
// Parse Functions
// ============================================================================

/**
 * Extract a field value from a line with format "- Field Name: value"
 */
function extractField(line: string, fieldName: string): string | null {
  const prefix = `- ${fieldName}: `;
  if (line.startsWith(prefix)) {
    return line.slice(prefix.length);
  }
  return null;
}

/**
 * Parse a comma-separated list, handling empty cases
 */
function parseList(value: string): string[] {
  if (value === '(none)' || value === 'none' || value.trim() === '') {
    return [];
  }
  return value.split(', ').map(s => s.trim()).filter(s => s.length > 0);
}

/**
 * Parse skill clusters from a comma-separated string
 */
function parseSkillClusters(value: string): SkillCluster[] {
  const list = parseList(value);
  return list.filter(s => {
    const result = SkillClusterSchema.safeParse(s);
    return result.success;
  }) as SkillCluster[];
}

/**
 * Parse a skill gap section
 */
function parseSkillGapSection(lines: string[]): SkillGap | null {
  let skillCluster: SkillCluster | null = null;
  let gapScore = 0;
  let frequency = 1;
  let confidence = 0;
  let relatedFeedbackIds: string[] = [];

  for (const line of lines) {
    const clusterVal = extractField(line, 'Skill Cluster');
    if (clusterVal) {
      const parsed = SkillClusterSchema.safeParse(clusterVal);
      if (parsed.success) {
        skillCluster = parsed.data;
      }
      continue;
    }

    const gapVal = extractField(line, 'Gap Score');
    if (gapVal) {
      gapScore = parseFloat(gapVal);
      continue;
    }

    const freqVal = extractField(line, 'Frequency');
    if (freqVal) {
      frequency = parseInt(freqVal, 10);
      continue;
    }

    const confVal = extractField(line, 'Confidence');
    if (confVal) {
      confidence = parseFloat(confVal);
      continue;
    }

    const idsVal = extractField(line, 'Related Feedback IDs');
    if (idsVal) {
      relatedFeedbackIds = parseList(idsVal);
      continue;
    }
  }

  if (!skillCluster) {
    return null;
  }

  const gap: SkillGap = {
    skillCluster,
    gapScore,
    frequency,
    confidence,
    relatedFeedbackIds,
  };

  const result = SkillGapSchema.safeParse(gap);
  return result.success ? result.data : null;
}


/**
 * Parse a feedback entry section
 */
function parseFeedbackEntrySection(lines: string[]): FeedbackEntry | null {
  let _id = '';
  let interviewId = '';
  let userId = '';
  let question = '';
  let attemptedAnswer: string | undefined;
  let difficultyRating = 1;
  let topicHints: string[] = [];
  let skillClusters: SkillCluster[] = [];
  let analysisConfidence: number | undefined;
  let createdAt = new Date();
  let updatedAt = new Date();

  for (const line of lines) {
    const idVal = extractField(line, 'ID');
    if (idVal) {
      _id = idVal;
      continue;
    }

    const interviewVal = extractField(line, 'Interview ID');
    if (interviewVal) {
      interviewId = interviewVal;
      continue;
    }

    const userVal = extractField(line, 'User ID');
    if (userVal) {
      userId = userVal;
      continue;
    }

    const questionVal = extractField(line, 'Question');
    if (questionVal) {
      question = questionVal;
      continue;
    }

    const answerVal = extractField(line, 'Attempted Answer');
    if (answerVal) {
      attemptedAnswer = answerVal === '(none)' ? undefined : answerVal;
      continue;
    }

    const diffVal = extractField(line, 'Difficulty Rating');
    if (diffVal) {
      difficultyRating = parseInt(diffVal, 10);
      continue;
    }

    const hintsVal = extractField(line, 'Topic Hints');
    if (hintsVal) {
      topicHints = parseList(hintsVal);
      continue;
    }

    const clustersVal = extractField(line, 'Skill Clusters');
    if (clustersVal) {
      skillClusters = parseSkillClusters(clustersVal);
      continue;
    }

    const confVal = extractField(line, 'Analysis Confidence');
    if (confVal) {
      analysisConfidence = confVal === '(not analyzed)' ? undefined : parseFloat(confVal);
      continue;
    }

    const createdVal = extractField(line, 'Created At');
    if (createdVal) {
      createdAt = parseDate(createdVal);
      continue;
    }

    const updatedVal = extractField(line, 'Updated At');
    if (updatedVal) {
      updatedAt = parseDate(updatedVal);
      continue;
    }
  }

  if (!_id || !interviewId || !userId || !question) {
    return null;
  }

  const entry: FeedbackEntry = {
    _id,
    interviewId,
    userId,
    question,
    attemptedAnswer,
    difficultyRating,
    topicHints,
    skillClusters,
    analysisConfidence,
    createdAt,
    updatedAt,
  };

  const result = FeedbackEntrySchema.safeParse(entry);
  return result.success ? result.data : null;
}

/**
 * Parse formatted text back to feedback analysis data structure.
 * This is the inverse of prettyPrint for round-trip support.
 * 
 * @param text - The formatted text to parse
 * @returns Parsed feedback analysis data, or null if parsing fails
 */
export function parse(text: string): FeedbackAnalysisExport | null {
  const lines = text.split('\n');
  
  // Find section boundaries
  let analysisInfoStart = -1;
  let skillGapsStart = -1;
  let feedbackEntriesStart = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === SECTION_MARKERS.ANALYSIS_INFO) {
      analysisInfoStart = i;
    } else if (line === SECTION_MARKERS.SKILL_GAPS) {
      skillGapsStart = i;
    } else if (line === SECTION_MARKERS.FEEDBACK_ENTRIES) {
      feedbackEntriesStart = i;
    }
  }

  if (analysisInfoStart === -1 || skillGapsStart === -1 || feedbackEntriesStart === -1) {
    return null;
  }

  // Parse analysis info
  const analysisLines = lines.slice(analysisInfoStart + 1, skillGapsStart);
  let analysisId = '';
  let userId = '';
  let totalFeedbackCount = 0;
  let lastAnalyzedAt = new Date();
  let createdAt = new Date();
  let updatedAt = new Date();

  for (const line of analysisLines) {
    const idVal = extractField(line, 'Analysis ID');
    if (idVal) {
      analysisId = idVal;
      continue;
    }

    const userVal = extractField(line, 'User ID');
    if (userVal) {
      userId = userVal;
      continue;
    }

    const countVal = extractField(line, 'Total Feedback Count');
    if (countVal) {
      totalFeedbackCount = parseInt(countVal, 10);
      continue;
    }

    const lastVal = extractField(line, 'Last Analyzed At');
    if (lastVal) {
      lastAnalyzedAt = parseDate(lastVal);
      continue;
    }

    const createdVal = extractField(line, 'Created At');
    if (createdVal) {
      createdAt = parseDate(createdVal);
      continue;
    }

    const updatedVal = extractField(line, 'Updated At');
    if (updatedVal) {
      updatedAt = parseDate(updatedVal);
      continue;
    }
  }

  // Parse skill gaps
  const skillGapsLines = lines.slice(skillGapsStart + 1, feedbackEntriesStart);
  const skillGaps: SkillGap[] = [];
  
  let currentGapLines: string[] = [];
  for (const line of skillGapsLines) {
    if (line.startsWith('### Gap ')) {
      if (currentGapLines.length > 0) {
        const gap = parseSkillGapSection(currentGapLines);
        if (gap) {
          skillGaps.push(gap);
        }
      }
      currentGapLines = [];
    } else if (line.trim()) {
      currentGapLines.push(line);
    }
  }
  // Don't forget the last gap
  if (currentGapLines.length > 0) {
    const gap = parseSkillGapSection(currentGapLines);
    if (gap) {
      skillGaps.push(gap);
    }
  }


  // Parse feedback entries
  const entriesLines = lines.slice(feedbackEntriesStart + 1);
  const entries: FeedbackEntry[] = [];
  
  let currentEntryLines: string[] = [];
  for (const line of entriesLines) {
    if (line.startsWith('### Entry: ')) {
      if (currentEntryLines.length > 0) {
        const entry = parseFeedbackEntrySection(currentEntryLines);
        if (entry) {
          entries.push(entry);
        }
      }
      currentEntryLines = [];
    } else if (line.trim() === SECTION_MARKERS.ENTRY_SEPARATOR) {
      // Entry separator, process current entry
      if (currentEntryLines.length > 0) {
        const entry = parseFeedbackEntrySection(currentEntryLines);
        if (entry) {
          entries.push(entry);
        }
      }
      currentEntryLines = [];
    } else if (line.trim()) {
      currentEntryLines.push(line);
    }
  }
  // Don't forget the last entry
  if (currentEntryLines.length > 0) {
    const entry = parseFeedbackEntrySection(currentEntryLines);
    if (entry) {
      entries.push(entry);
    }
  }

  // Construct the analysis object
  const analysis: WeaknessAnalysis = {
    _id: analysisId,
    userId,
    skillGaps,
    lastAnalyzedAt,
    totalFeedbackCount,
    createdAt,
    updatedAt,
  };

  // Validate the analysis
  const analysisResult = WeaknessAnalysisSchema.safeParse(analysis);
  if (!analysisResult.success) {
    return null;
  }

  return {
    analysis: analysisResult.data,
    entries,
  };
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Pretty-print just a weakness analysis (without entries)
 */
export function prettyPrintAnalysis(analysis: WeaknessAnalysis): string {
  return prettyPrint({ analysis, entries: [] });
}

/**
 * Pretty-print just feedback entries (creates a minimal analysis wrapper)
 */
export function prettyPrintEntries(entries: FeedbackEntry[], userId: string): string {
  const now = new Date();
  const analysis: WeaknessAnalysis = {
    _id: 'export',
    userId,
    skillGaps: [],
    lastAnalyzedAt: now,
    totalFeedbackCount: entries.length,
    createdAt: now,
    updatedAt: now,
  };
  return prettyPrint({ analysis, entries });
}

/**
 * Validate that a string can be parsed as feedback analysis
 */
export function isValidFeedbackFormat(text: string): boolean {
  return parse(text) !== null;
}
