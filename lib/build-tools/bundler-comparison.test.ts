/**
 * Unit tests for bundler comparison utilities
 */

import { describe, it, expect } from 'vitest';
import {
  BUNDLER_INFO,
  BUNDLER_FEATURES,
  USE_CASE_SCENARIOS,
  getBundlerInfo,
  getAllFeatures,
  getAllScenarios,
  getScenarioById,
  getFeaturesBySupport
} from './bundler-data';
import {
  recommendBundler,
  recommendByRequirements,
  recommendByScenarioId,
  compareBundlers
} from './bundler-recommender';
import {
  translateConfig,
  generateConfigCode,
  translateAndGenerate,
  isFeatureSupported
} from './config-translator';

describe('Bundler Data', () => {
  it('should have info for all bundlers', () => {
    expect(BUNDLER_INFO.webpack).toBeDefined();
    expect(BUNDLER_INFO.vite).toBeDefined();
    expect(BUNDLER_INFO.esbuild).toBeDefined();
    expect(BUNDLER_INFO.rollup).toBeDefined();
  });

  it('should get bundler info by name', () => {
    const webpackInfo = getBundlerInfo('webpack');
    expect(webpackInfo.name).toBe('webpack');
    expect(webpackInfo.displayName).toBe('Webpack');
  });

  it('should return all features', () => {
    const features = getAllFeatures();
    expect(features.length).toBeGreaterThan(0);
    expect(features[0]).toHaveProperty('name');
    expect(features[0]).toHaveProperty('webpack');
  });

  it('should return all scenarios', () => {
    const scenarios = getAllScenarios();
    expect(scenarios.length).toBeGreaterThan(0);
    expect(scenarios[0]).toHaveProperty('id');
    expect(scenarios[0]).toHaveProperty('recommendedBundler');
  });

  it('should get scenario by ID', () => {
    const scenario = getScenarioById('modern-frontend');
    expect(scenario).toBeDefined();
    expect(scenario?.name).toBe('Modern Frontend Project');
  });

  it('should filter features by support level', () => {
    const nativeFeatures = getFeaturesBySupport('vite', 'native');
    expect(nativeFeatures.length).toBeGreaterThan(0);
    nativeFeatures.forEach(feature => {
      expect(feature.vite).toBe('native');
    });
  });
});

describe('Bundler Recommender', () => {
  it('should recommend bundler for a scenario', () => {
    const scenario = USE_CASE_SCENARIOS[0];
    const recommendation = recommendBundler(scenario);
    
    expect(recommendation.bundler).toBe(scenario.recommendedBundler);
    expect(recommendation.reasoning).toBe(scenario.reasoning);
    expect(recommendation.score).toBeGreaterThan(0);
    expect(recommendation.alternatives.length).toBeGreaterThan(0);
  });

  it('should recommend bundler by scenario ID', () => {
    const recommendation = recommendByScenarioId('library-development');
    
    expect(recommendation).toBeDefined();
    expect(recommendation?.bundler).toBe('esbuild');
  });

  it('should recommend bundler by custom requirements', () => {
    const requirements = ['fast builds', 'TypeScript support', 'simple configuration'];
    const recommendation = recommendByRequirements(requirements);
    
    expect(recommendation.bundler).toBeDefined();
    expect(recommendation.reasoning).toBeDefined();
    expect(recommendation.alternatives.length).toBeGreaterThan(0);
  });

  it('should compare multiple bundlers for a scenario', () => {
    const scenario = USE_CASE_SCENARIOS[0];
    const comparison = compareBundlers(scenario, ['webpack', 'vite', 'esbuild']);
    
    expect(comparison.length).toBe(3);
    expect(comparison[0].score).toBeGreaterThanOrEqual(comparison[1].score);
    expect(comparison[1].score).toBeGreaterThanOrEqual(comparison[2].score);
  });
});

describe('Config Translator', () => {
  it('should translate webpack config to vite', () => {
    const webpackConfig = {
      bundler: 'webpack' as const,
      entry: './src/index.js',
      output: {
        path: 'dist',
        filename: 'bundle.js'
      },
      devServer: {
        port: 3000,
        hot: true
      }
    };

    const result = translateConfig(webpackConfig, 'vite');
    
    expect(result.config.bundler).toBe('vite');
    expect(result.config.entry).toBe('./src/index.js');
    expect(result.config.output?.path).toBe('dist');
    expect(result.config.devServer?.port).toBe(3000);
    expect(result.notes.length).toBeGreaterThan(0);
  });

  it('should translate webpack config to esbuild', () => {
    const webpackConfig = {
      bundler: 'webpack' as const,
      entry: './src/index.ts',
      output: {
        path: 'build'
      },
      mode: 'production' as const
    };

    const result = translateConfig(webpackConfig, 'esbuild');
    
    expect(result.config.bundler).toBe('esbuild');
    expect(result.config.entry).toBe('./src/index.ts');
    expect(result.config.output?.path).toBe('build');
  });

  it('should generate webpack config code', () => {
    const config = {
      bundler: 'webpack' as const,
      entry: './src/index.js',
      output: {
        path: 'dist',
        filename: 'bundle.js'
      },
      mode: 'production' as const
    };

    const code = generateConfigCode(config);
    
    expect(code).toContain('module.exports');
    expect(code).toContain("mode: 'production'");
    expect(code).toContain("entry: './src/index.js'");
  });

  it('should generate vite config code', () => {
    const config = {
      bundler: 'vite' as const,
      output: {
        path: 'dist'
      },
      devServer: {
        port: 3000
      }
    };

    const code = generateConfigCode(config);
    
    expect(code).toContain('defineConfig');
    expect(code).toContain('outDir');
    expect(code).toContain('port: 3000');
  });

  it('should generate esbuild config code', () => {
    const config = {
      bundler: 'esbuild' as const,
      entry: './src/index.ts',
      output: {
        path: 'dist'
      },
      mode: 'production' as const
    };

    const code = generateConfigCode(config);
    
    expect(code).toContain('esbuild.build');
    expect(code).toContain('entryPoints');
    expect(code).toContain('minify: true');
  });

  it('should translate and generate in one step', () => {
    const webpackConfig = {
      bundler: 'webpack' as const,
      entry: './src/main.js',
      output: {
        path: 'dist'
      }
    };

    const result = translateAndGenerate(webpackConfig, 'vite');
    
    expect(result.code).toContain('defineConfig');
    expect(result.notes.length).toBeGreaterThan(0);
  });

  it('should check feature support', () => {
    expect(isFeatureSupported('hmr', 'webpack')).toBe(true);
    expect(isFeatureSupported('hmr', 'vite')).toBe(true);
    expect(isFeatureSupported('hmr', 'esbuild')).toBe(false);
    
    expect(isFeatureSupported('typescript', 'esbuild')).toBe(true);
    expect(isFeatureSupported('devServer', 'esbuild')).toBe(false);
  });

  it('should handle unsupported features', () => {
    const webpackConfig = {
      bundler: 'webpack' as const,
      devServer: {
        hot: true
      },
      plugins: ['HtmlWebpackPlugin', 'MiniCssExtractPlugin']
    };

    const result = translateConfig(webpackConfig, 'esbuild');
    
    expect(result.unsupportedFeatures.length).toBeGreaterThan(0);
    expect(result.unsupportedFeatures.some(f => f.includes('Hot Module Replacement'))).toBe(true);
  });
});
