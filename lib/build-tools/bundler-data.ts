/**
 * Bundler feature comparison data and use case scenarios
 * for the Build Tools lesson
 */

export type BundlerName = 'webpack' | 'vite' | 'esbuild' | 'rollup';

export type FeatureSupport = 'native' | 'plugin' | 'limited' | 'none';

export interface BundlerFeature {
  name: string;
  description: string;
  webpack: FeatureSupport;
  vite: FeatureSupport;
  esbuild: FeatureSupport;
  rollup?: FeatureSupport;
}

export interface UseCaseScenario {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  recommendedBundler: BundlerName;
  reasoning: string;
}

export interface BundlerInfo {
  name: BundlerName;
  displayName: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  bestFor: string[];
  buildSpeed: 'fast' | 'medium' | 'slow';
  configComplexity: 'simple' | 'moderate' | 'complex';
}

/**
 * Comprehensive bundler information
 */
export const BUNDLER_INFO: Record<BundlerName, BundlerInfo> = {
  webpack: {
    name: 'webpack',
    displayName: 'Webpack',
    description: 'Powerful, highly configurable bundler with extensive plugin ecosystem',
    strengths: [
      'Mature ecosystem with thousands of plugins',
      'Highly configurable for complex projects',
      'Excellent code splitting capabilities',
      'Strong community support',
      'Production-ready optimizations'
    ],
    weaknesses: [
      'Slower build times compared to modern alternatives',
      'Complex configuration',
      'Steeper learning curve',
      'Verbose output'
    ],
    bestFor: [
      'Large enterprise applications',
      'Projects requiring extensive customization',
      'Legacy projects with complex build requirements'
    ],
    buildSpeed: 'slow',
    configComplexity: 'complex'
  },
  vite: {
    name: 'vite',
    displayName: 'Vite',
    description: 'Next-generation frontend tooling with lightning-fast HMR',
    strengths: [
      'Extremely fast dev server with native ESM',
      'Instant hot module replacement',
      'Simple configuration',
      'Built-in TypeScript support',
      'Optimized production builds with Rollup'
    ],
    weaknesses: [
      'Newer ecosystem (fewer plugins than webpack)',
      'May require adjustments for legacy code',
      'Less suitable for non-frontend projects'
    ],
    bestFor: [
      'Modern frontend applications',
      'React, Vue, or Svelte projects',
      'Projects prioritizing developer experience',
      'Rapid prototyping'
    ],
    buildSpeed: 'fast',
    configComplexity: 'simple'
  },
  esbuild: {
    name: 'esbuild',
    displayName: 'esbuild',
    description: 'Extremely fast JavaScript bundler written in Go',
    strengths: [
      'Blazing fast build speeds (10-100x faster)',
      'Built-in TypeScript and JSX support',
      'Minimal configuration needed',
      'Tree shaking and minification',
      'Low memory usage'
    ],
    weaknesses: [
      'Limited plugin ecosystem',
      'Less mature than webpack',
      'Fewer advanced optimization features',
      'No built-in dev server'
    ],
    bestFor: [
      'Library development',
      'Build performance-critical projects',
      'Simple bundling needs',
      'CI/CD pipelines'
    ],
    buildSpeed: 'fast',
    configComplexity: 'simple'
  },
  rollup: {
    name: 'rollup',
    displayName: 'Rollup',
    description: 'Module bundler optimized for libraries and ES modules',
    strengths: [
      'Excellent tree shaking',
      'Clean output code',
      'Great for library development',
      'ES module focused',
      'Plugin-based architecture'
    ],
    weaknesses: [
      'Slower than esbuild',
      'Less suitable for applications',
      'Requires more configuration for apps',
      'Smaller ecosystem than webpack'
    ],
    bestFor: [
      'JavaScript libraries',
      'NPM packages',
      'Projects outputting ES modules',
      'Code that needs to be readable'
    ],
    buildSpeed: 'medium',
    configComplexity: 'moderate'
  }
};

/**
 * Feature comparison matrix
 */
export const BUNDLER_FEATURES: BundlerFeature[] = [
  {
    name: 'Hot Module Replacement',
    description: 'Update modules in the browser without full reload',
    webpack: 'native',
    vite: 'native',
    esbuild: 'none'
  },
  {
    name: 'Code Splitting',
    description: 'Split code into multiple bundles for lazy loading',
    webpack: 'native',
    vite: 'native',
    esbuild: 'native'
  },
  {
    name: 'Tree Shaking',
    description: 'Remove unused code from final bundle',
    webpack: 'native',
    vite: 'native',
    esbuild: 'native'
  },
  {
    name: 'TypeScript Support',
    description: 'Compile TypeScript without additional tools',
    webpack: 'plugin',
    vite: 'native',
    esbuild: 'native'
  },
  {
    name: 'CSS Modules',
    description: 'Scoped CSS with automatic class name generation',
    webpack: 'plugin',
    vite: 'native',
    esbuild: 'plugin'
  },
  {
    name: 'Asset Optimization',
    description: 'Optimize images, fonts, and other assets',
    webpack: 'plugin',
    vite: 'plugin',
    esbuild: 'limited'
  },
  {
    name: 'Dev Server',
    description: 'Built-in development server',
    webpack: 'plugin',
    vite: 'native',
    esbuild: 'none'
  },
  {
    name: 'Source Maps',
    description: 'Generate source maps for debugging',
    webpack: 'native',
    vite: 'native',
    esbuild: 'native'
  },
  {
    name: 'Legacy Browser Support',
    description: 'Transpile for older browsers',
    webpack: 'plugin',
    vite: 'plugin',
    esbuild: 'limited'
  },
  {
    name: 'Watch Mode',
    description: 'Rebuild on file changes',
    webpack: 'native',
    vite: 'native',
    esbuild: 'native'
  }
];

/**
 * Use case scenarios with recommendations
 */
export const USE_CASE_SCENARIOS: UseCaseScenario[] = [
  {
    id: 'large-spa',
    name: 'Large Single Page Application',
    description: 'Enterprise-scale React/Vue application with complex routing and state management',
    requirements: [
      'Code splitting',
      'Hot module replacement',
      'Advanced optimizations',
      'Plugin ecosystem'
    ],
    recommendedBundler: 'webpack',
    reasoning: 'Webpack excels at handling large, complex applications with its mature plugin ecosystem and advanced code splitting capabilities. While slower, it provides the configurability needed for enterprise requirements.'
  },
  {
    id: 'modern-frontend',
    name: 'Modern Frontend Project',
    description: 'New React, Vue, or Svelte project prioritizing developer experience',
    requirements: [
      'Fast dev server',
      'Hot module replacement',
      'TypeScript support',
      'Simple configuration'
    ],
    recommendedBundler: 'vite',
    reasoning: 'Vite offers the best developer experience with instant server start, lightning-fast HMR, and minimal configuration. Perfect for modern frameworks and rapid development.'
  },
  {
    id: 'library-development',
    name: 'JavaScript Library',
    description: 'NPM package or reusable library for distribution',
    requirements: [
      'Fast builds',
      'Tree shaking',
      'Multiple output formats',
      'Small bundle size'
    ],
    recommendedBundler: 'esbuild',
    reasoning: 'esbuild provides extremely fast build times and excellent tree shaking, making it ideal for library development where build performance matters and configuration needs are simple.'
  },
  {
    id: 'legacy-migration',
    name: 'Legacy Application Migration',
    description: 'Migrating older codebase with custom build requirements',
    requirements: [
      'Extensive plugin support',
      'Legacy browser support',
      'Custom loaders',
      'Gradual migration path'
    ],
    recommendedBundler: 'webpack',
    reasoning: 'Webpack\'s mature ecosystem and extensive plugin support make it the safest choice for migrating legacy applications with complex or unusual build requirements.'
  },
  {
    id: 'rapid-prototype',
    name: 'Rapid Prototyping',
    description: 'Quick proof-of-concept or demo application',
    requirements: [
      'Minimal setup',
      'Fast iteration',
      'Hot reload',
      'Zero config'
    ],
    recommendedBundler: 'vite',
    reasoning: 'Vite\'s zero-config approach and instant dev server make it perfect for rapid prototyping where you want to focus on code, not configuration.'
  },
  {
    id: 'monorepo',
    name: 'Monorepo Build',
    description: 'Multiple packages in a monorepo requiring fast, consistent builds',
    requirements: [
      'Build speed',
      'Consistent output',
      'Minimal overhead',
      'CI/CD friendly'
    ],
    recommendedBundler: 'esbuild',
    reasoning: 'esbuild\'s exceptional speed and low overhead make it ideal for monorepos where you need to build multiple packages quickly and consistently.'
  },
  {
    id: 'ssr-application',
    name: 'Server-Side Rendered App',
    description: 'Application with server-side rendering requirements',
    requirements: [
      'SSR support',
      'Code splitting',
      'Fast dev experience',
      'Production optimizations'
    ],
    recommendedBundler: 'vite',
    reasoning: 'Vite has excellent SSR support with frameworks like Next.js alternatives (Nuxt, SvelteKit) and provides both fast development and optimized production builds.'
  },
  {
    id: 'micro-frontend',
    name: 'Micro-Frontend Architecture',
    description: 'Multiple independent frontend applications composed together',
    requirements: [
      'Module federation',
      'Independent deployments',
      'Shared dependencies',
      'Runtime integration'
    ],
    recommendedBundler: 'webpack',
    reasoning: 'Webpack\'s Module Federation feature is specifically designed for micro-frontend architectures, enabling runtime integration and shared dependencies across independent applications.'
  }
];

/**
 * Get bundler information by name
 */
export function getBundlerInfo(bundler: BundlerName): BundlerInfo {
  return BUNDLER_INFO[bundler];
}

/**
 * Get all bundler features
 */
export function getAllFeatures(): BundlerFeature[] {
  return BUNDLER_FEATURES;
}

/**
 * Get all use case scenarios
 */
export function getAllScenarios(): UseCaseScenario[] {
  return USE_CASE_SCENARIOS;
}

/**
 * Get scenario by ID
 */
export function getScenarioById(id: string): UseCaseScenario | undefined {
  return USE_CASE_SCENARIOS.find(scenario => scenario.id === id);
}

/**
 * Filter features by support level for a specific bundler
 */
export function getFeaturesBySupport(
  bundler: BundlerName,
  supportLevel: FeatureSupport
): BundlerFeature[] {
  return BUNDLER_FEATURES.filter(feature => {
    const featureSupport = feature[bundler as keyof Omit<BundlerFeature, 'name' | 'description'>];
    return featureSupport === supportLevel;
  });
}
