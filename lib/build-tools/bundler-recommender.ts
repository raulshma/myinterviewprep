/**
 * Bundler recommendation engine
 * Analyzes use case requirements and recommends the best bundler
 */

import {
  BundlerName,
  UseCaseScenario,
  BundlerInfo,
  BUNDLER_INFO,
  USE_CASE_SCENARIOS,
  getScenarioById
} from './bundler-data';

export interface BundlerRecommendation {
  bundler: BundlerName;
  reasoning: string;
  score: number;
  alternatives: Array<{
    bundler: BundlerName;
    score: number;
    reason: string;
  }>;
}

export interface RequirementWeights {
  buildSpeed: number;
  devExperience: number;
  pluginEcosystem: number;
  configSimplicity: number;
  productionOptimization: number;
}

/**
 * Default requirement weights
 */
const DEFAULT_WEIGHTS: RequirementWeights = {
  buildSpeed: 1,
  devExperience: 1,
  pluginEcosystem: 1,
  configSimplicity: 1,
  productionOptimization: 1
};

/**
 * Recommend a bundler based on a use case scenario
 */
export function recommendBundler(scenario: UseCaseScenario): BundlerRecommendation {
  const bundler = scenario.recommendedBundler;
  const bundlerInfo = BUNDLER_INFO[bundler];

  // Calculate scores for all bundlers
  const scores = calculateScores(scenario);

  // Get alternatives (other bundlers sorted by score)
  const alternatives = Object.entries(scores)
    .filter(([name]) => name !== bundler)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .map(([name, score]) => ({
      bundler: name as BundlerName,
      score,
      reason: generateAlternativeReason(name as BundlerName, scenario)
    }));

  return {
    bundler,
    reasoning: scenario.reasoning,
    score: scores[bundler],
    alternatives
  };
}

/**
 * Recommend a bundler based on custom requirements
 */
export function recommendByRequirements(
  requirements: string[],
  weights: Partial<RequirementWeights> = {}
): BundlerRecommendation {
  const mergedWeights = { ...DEFAULT_WEIGHTS, ...weights };
  
  // Find the best matching scenario
  const matchingScenario = findBestMatchingScenario(requirements);
  
  if (matchingScenario) {
    return recommendBundler(matchingScenario);
  }

  // If no scenario matches, calculate scores directly
  const scores = calculateScoresByRequirements(requirements, mergedWeights);
  const sortedBundlers = Object.entries(scores)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA);

  const [topBundler, topScore] = sortedBundlers[0];
  const bundler = topBundler as BundlerName;

  const alternatives = sortedBundlers
    .slice(1)
    .map(([name, score]) => ({
      bundler: name as BundlerName,
      score,
      reason: generateReasonFromRequirements(name as BundlerName, requirements)
    }));

  return {
    bundler,
    reasoning: generateReasonFromRequirements(bundler, requirements),
    score: topScore,
    alternatives
  };
}

/**
 * Calculate scores for all bundlers based on a scenario
 */
function calculateScores(scenario: UseCaseScenario): Record<BundlerName, number> {
  const scores: Record<BundlerName, number> = {
    webpack: 0,
    vite: 0,
    esbuild: 0,
    rollup: 0
  };

  // Score based on requirements matching
  for (const requirement of scenario.requirements) {
    const reqLower = requirement.toLowerCase();

    // Build speed requirements
    if (reqLower.includes('fast') || reqLower.includes('speed')) {
      scores.esbuild += 3;
      scores.vite += 2;
      scores.rollup += 1;
      scores.webpack += 0;
    }

    // Dev experience requirements
    if (reqLower.includes('dev') || reqLower.includes('hmr') || reqLower.includes('hot')) {
      scores.vite += 3;
      scores.webpack += 2;
      scores.rollup += 1;
      scores.esbuild += 0;
    }

    // Plugin ecosystem requirements
    if (reqLower.includes('plugin') || reqLower.includes('ecosystem') || reqLower.includes('custom')) {
      scores.webpack += 3;
      scores.vite += 2;
      scores.rollup += 2;
      scores.esbuild += 1;
    }

    // Configuration simplicity
    if (reqLower.includes('simple') || reqLower.includes('zero config') || reqLower.includes('minimal')) {
      scores.vite += 3;
      scores.esbuild += 3;
      scores.rollup += 1;
      scores.webpack += 0;
    }

    // Code splitting
    if (reqLower.includes('code splitting') || reqLower.includes('lazy')) {
      scores.webpack += 3;
      scores.vite += 2;
      scores.esbuild += 2;
      scores.rollup += 2;
    }

    // TypeScript
    if (reqLower.includes('typescript')) {
      scores.vite += 3;
      scores.esbuild += 3;
      scores.webpack += 2;
      scores.rollup += 2;
    }

    // Legacy support
    if (reqLower.includes('legacy') || reqLower.includes('old browser')) {
      scores.webpack += 3;
      scores.vite += 2;
      scores.rollup += 1;
      scores.esbuild += 0;
    }

    // Library development
    if (reqLower.includes('library') || reqLower.includes('package')) {
      scores.esbuild += 3;
      scores.rollup += 3;
      scores.vite += 1;
      scores.webpack += 1;
    }

    // SSR
    if (reqLower.includes('ssr') || reqLower.includes('server')) {
      scores.vite += 3;
      scores.webpack += 2;
      scores.rollup += 1;
      scores.esbuild += 0;
    }
  }

  return scores;
}

/**
 * Calculate scores based on custom requirements and weights
 */
function calculateScoresByRequirements(
  requirements: string[],
  weights: RequirementWeights
): Record<BundlerName, number> {
  const baseScores = calculateScores({
    id: 'custom',
    name: 'Custom',
    description: 'Custom requirements',
    requirements,
    recommendedBundler: 'webpack',
    reasoning: ''
  });

  // Apply weights based on bundler characteristics
  const bundlers: BundlerName[] = ['webpack', 'vite', 'esbuild', 'rollup'];
  
  for (const bundler of bundlers) {
    const info = BUNDLER_INFO[bundler];
    
    // Apply build speed weight
    if (info.buildSpeed === 'fast') {
      baseScores[bundler] += weights.buildSpeed * 2;
    } else if (info.buildSpeed === 'medium') {
      baseScores[bundler] += weights.buildSpeed * 1;
    }

    // Apply config complexity weight (inverse - simpler is better)
    if (info.configComplexity === 'simple') {
      baseScores[bundler] += weights.configSimplicity * 2;
    } else if (info.configComplexity === 'moderate') {
      baseScores[bundler] += weights.configSimplicity * 1;
    }

    // Apply plugin ecosystem weight (webpack has the largest)
    if (bundler === 'webpack') {
      baseScores[bundler] += weights.pluginEcosystem * 2;
    } else if (bundler === 'vite' || bundler === 'rollup') {
      baseScores[bundler] += weights.pluginEcosystem * 1;
    }
  }

  return baseScores;
}

/**
 * Find the best matching predefined scenario for given requirements
 */
function findBestMatchingScenario(requirements: string[]): UseCaseScenario | null {
  let bestMatch: UseCaseScenario | null = null;
  let bestScore = 0;

  for (const scenario of USE_CASE_SCENARIOS) {
    let matchScore = 0;
    
    for (const requirement of requirements) {
      const reqLower = requirement.toLowerCase();
      
      // Check if any scenario requirement matches
      for (const scenarioReq of scenario.requirements) {
        if (scenarioReq.toLowerCase().includes(reqLower) || 
            reqLower.includes(scenarioReq.toLowerCase())) {
          matchScore++;
        }
      }
    }

    if (matchScore > bestScore) {
      bestScore = matchScore;
      bestMatch = scenario;
    }
  }

  // Only return a match if at least 2 requirements match
  return bestScore >= 2 ? bestMatch : null;
}

/**
 * Generate reasoning for an alternative bundler
 */
function generateAlternativeReason(bundler: BundlerName, scenario: UseCaseScenario): string {
  const info = BUNDLER_INFO[bundler];
  
  // Find relevant strengths based on scenario requirements
  const relevantStrengths = info.strengths.slice(0, 2);
  
  return `${info.displayName} could work with ${relevantStrengths.join(' and ').toLowerCase()}, but may not be optimal for this specific use case.`;
}

/**
 * Generate reasoning based on requirements
 */
function generateReasonFromRequirements(bundler: BundlerName, requirements: string[]): string {
  const info = BUNDLER_INFO[bundler];
  
  const relevantStrengths: string[] = [];
  
  for (const requirement of requirements) {
    const reqLower = requirement.toLowerCase();
    
    if (reqLower.includes('fast') || reqLower.includes('speed')) {
      if (info.buildSpeed === 'fast') {
        relevantStrengths.push('exceptional build speed');
      }
    }
    
    if (reqLower.includes('simple') || reqLower.includes('config')) {
      if (info.configComplexity === 'simple') {
        relevantStrengths.push('minimal configuration');
      }
    }
    
    if (reqLower.includes('plugin') || reqLower.includes('ecosystem')) {
      if (bundler === 'webpack') {
        relevantStrengths.push('extensive plugin ecosystem');
      }
    }
  }

  if (relevantStrengths.length === 0) {
    relevantStrengths.push(...info.strengths.slice(0, 2).map(s => s.toLowerCase()));
  }

  return `${info.displayName} is recommended for its ${relevantStrengths.slice(0, 2).join(' and ')}.`;
}

/**
 * Get recommendation for a predefined scenario by ID
 */
export function recommendByScenarioId(scenarioId: string): BundlerRecommendation | null {
  const scenario = getScenarioById(scenarioId);
  
  if (!scenario) {
    return null;
  }

  return recommendBundler(scenario);
}

/**
 * Compare multiple bundlers for a scenario
 */
export function compareBundlers(
  scenario: UseCaseScenario,
  bundlers: BundlerName[]
): Array<{
  bundler: BundlerName;
  score: number;
  info: BundlerInfo;
}> {
  const scores = calculateScores(scenario);
  
  return bundlers
    .map(bundler => ({
      bundler,
      score: scores[bundler],
      info: BUNDLER_INFO[bundler]
    }))
    .sort((a, b) => b.score - a.score);
}
