/**
 * Configuration translator between different bundlers
 * Supports translating common configuration patterns between webpack, vite, and esbuild
 */

import { BundlerName } from './bundler-data';

export interface BundlerConfig {
  bundler: BundlerName;
  entry?: string | string[];
  output?: {
    path?: string;
    filename?: string;
  };
  devServer?: {
    port?: number;
    hot?: boolean;
    open?: boolean;
  };
  resolve?: {
    extensions?: string[];
    alias?: Record<string, string>;
  };
  module?: {
    rules?: Array<{
      test: string;
      loader?: string;
      use?: string | string[];
    }>;
  };
  plugins?: string[];
  mode?: 'development' | 'production';
  optimization?: {
    minimize?: boolean;
    splitChunks?: boolean;
  };
}

export interface TranslationResult {
  config: BundlerConfig;
  notes: string[];
  unsupportedFeatures: string[];
}

/**
 * Translate a bundler configuration to another bundler
 */
export function translateConfig(
  sourceConfig: BundlerConfig,
  targetBundler: BundlerName
): TranslationResult {
  const notes: string[] = [];
  const unsupportedFeatures: string[] = [];

  const targetConfig: BundlerConfig = {
    bundler: targetBundler
  };

  // Translate entry
  if (sourceConfig.entry) {
    targetConfig.entry = sourceConfig.entry;
    if (targetBundler === 'vite' && typeof sourceConfig.entry === 'string') {
      notes.push('Vite uses index.html as entry point. Specified entry will be imported from index.html.');
    }
  }

  // Translate output
  if (sourceConfig.output) {
    targetConfig.output = {};
    
    if (sourceConfig.output.path) {
      targetConfig.output.path = sourceConfig.output.path;
      
      if (targetBundler === 'vite') {
        notes.push(`Output path mapped to Vite's build.outDir: ${sourceConfig.output.path}`);
      } else if (targetBundler === 'esbuild') {
        notes.push(`Output path mapped to esbuild's outdir: ${sourceConfig.output.path}`);
      }
    }
    
    if (sourceConfig.output.filename) {
      targetConfig.output.filename = sourceConfig.output.filename;
      
      if (targetBundler === 'vite') {
        notes.push('Vite uses its own naming convention. Custom filename patterns may need adjustment.');
      }
    }
  }

  // Translate dev server
  if (sourceConfig.devServer) {
    targetConfig.devServer = {};
    
    if (sourceConfig.devServer.port) {
      targetConfig.devServer.port = sourceConfig.devServer.port;
    }
    
    if (sourceConfig.devServer.hot !== undefined) {
      targetConfig.devServer.hot = sourceConfig.devServer.hot;
      
      if (targetBundler === 'esbuild') {
        unsupportedFeatures.push('Hot Module Replacement (esbuild has no built-in dev server)');
      } else if (targetBundler === 'vite') {
        notes.push('Vite has HMR enabled by default');
      }
    }
    
    if (sourceConfig.devServer.open !== undefined) {
      targetConfig.devServer.open = sourceConfig.devServer.open;
    }
  }

  // Translate resolve
  if (sourceConfig.resolve) {
    targetConfig.resolve = {};
    
    if (sourceConfig.resolve.extensions) {
      targetConfig.resolve.extensions = sourceConfig.resolve.extensions;
    }
    
    if (sourceConfig.resolve.alias) {
      targetConfig.resolve.alias = sourceConfig.resolve.alias;
      
      if (targetBundler === 'vite') {
        notes.push('Aliases configured in Vite\'s resolve.alias');
      } else if (targetBundler === 'esbuild') {
        notes.push('Aliases configured in esbuild\'s alias option');
      }
    }
  }

  // Translate module rules (loaders)
  if (sourceConfig.module?.rules) {
    targetConfig.module = { rules: [] };
    
    for (const rule of sourceConfig.module.rules) {
      if (targetBundler === 'vite') {
        // Vite handles most loaders through plugins
        if (rule.test.includes('css')) {
          notes.push('CSS handled natively by Vite');
        } else if (rule.test.includes('ts')) {
          notes.push('TypeScript handled natively by Vite');
        } else {
          targetConfig.module.rules!.push(rule);
          notes.push(`Loader for ${rule.test} may need a Vite plugin`);
        }
      } else if (targetBundler === 'esbuild') {
        // esbuild has limited loader support
        if (rule.test.includes('ts') || rule.test.includes('js')) {
          notes.push('JavaScript/TypeScript handled natively by esbuild');
        } else {
          unsupportedFeatures.push(`Custom loader for ${rule.test} (esbuild has limited loader support)`);
        }
      } else {
        targetConfig.module.rules!.push(rule);
      }
    }
  }

  // Translate plugins
  if (sourceConfig.plugins && sourceConfig.plugins.length > 0) {
    targetConfig.plugins = [];
    
    for (const plugin of sourceConfig.plugins) {
      if (targetBundler === 'vite') {
        notes.push(`Webpack plugin "${plugin}" needs Vite equivalent`);
      } else if (targetBundler === 'esbuild') {
        notes.push(`Webpack plugin "${plugin}" may not have esbuild equivalent`);
      } else if (targetBundler === 'webpack') {
        targetConfig.plugins.push(plugin);
      }
    }
  }

  // Translate mode
  if (sourceConfig.mode) {
    targetConfig.mode = sourceConfig.mode;
    
    if (targetBundler === 'vite') {
      notes.push(`Mode mapped to Vite's command: ${sourceConfig.mode === 'development' ? 'dev' : 'build'}`);
    }
  }

  // Translate optimization
  if (sourceConfig.optimization) {
    targetConfig.optimization = {};
    
    if (sourceConfig.optimization.minimize !== undefined) {
      targetConfig.optimization.minimize = sourceConfig.optimization.minimize;
      
      if (targetBundler === 'vite') {
        notes.push('Minification handled by Vite in production mode');
      } else if (targetBundler === 'esbuild') {
        notes.push('Minification controlled by esbuild\'s minify option');
      }
    }
    
    if (sourceConfig.optimization.splitChunks !== undefined) {
      targetConfig.optimization.splitChunks = sourceConfig.optimization.splitChunks;
      
      if (targetBundler === 'vite') {
        notes.push('Code splitting configured in Vite\'s build.rollupOptions');
      } else if (targetBundler === 'esbuild') {
        notes.push('Code splitting configured in esbuild\'s splitting option');
      }
    }
  }

  return {
    config: targetConfig,
    notes,
    unsupportedFeatures
  };
}

/**
 * Generate configuration code string for a bundler
 */
export function generateConfigCode(config: BundlerConfig): string {
  const { bundler } = config;

  switch (bundler) {
    case 'webpack':
      return generateWebpackConfig(config);
    case 'vite':
      return generateViteConfig(config);
    case 'esbuild':
      return generateEsbuildConfig(config);
    case 'rollup':
      return generateRollupConfig(config);
    default:
      return '// Unsupported bundler';
  }
}

/**
 * Generate webpack configuration code
 */
function generateWebpackConfig(config: BundlerConfig): string {
  const lines: string[] = [
    "const path = require('path');",
    '',
    'module.exports = {'
  ];

  if (config.mode) {
    lines.push(`  mode: '${config.mode}',`);
  }

  if (config.entry) {
    const entryValue = typeof config.entry === 'string' 
      ? `'${config.entry}'` 
      : `[${config.entry.map(e => `'${e}'`).join(', ')}]`;
    lines.push(`  entry: ${entryValue},`);
  }

  if (config.output) {
    lines.push('  output: {');
    if (config.output.path) {
      lines.push(`    path: path.resolve(__dirname, '${config.output.path}'),`);
    }
    if (config.output.filename) {
      lines.push(`    filename: '${config.output.filename}',`);
    }
    lines.push('  },');
  }

  if (config.resolve) {
    lines.push('  resolve: {');
    if (config.resolve.extensions) {
      lines.push(`    extensions: [${config.resolve.extensions.map(e => `'${e}'`).join(', ')}],`);
    }
    if (config.resolve.alias) {
      lines.push('    alias: {');
      for (const [key, value] of Object.entries(config.resolve.alias)) {
        lines.push(`      '${key}': path.resolve(__dirname, '${value}'),`);
      }
      lines.push('    },');
    }
    lines.push('  },');
  }

  if (config.devServer) {
    lines.push('  devServer: {');
    if (config.devServer.port) {
      lines.push(`    port: ${config.devServer.port},`);
    }
    if (config.devServer.hot !== undefined) {
      lines.push(`    hot: ${config.devServer.hot},`);
    }
    if (config.devServer.open !== undefined) {
      lines.push(`    open: ${config.devServer.open},`);
    }
    lines.push('  },');
  }

  lines.push('};');

  return lines.join('\n');
}

/**
 * Generate Vite configuration code
 */
function generateViteConfig(config: BundlerConfig): string {
  const lines: string[] = [
    "import { defineConfig } from 'vite';",
    '',
    'export default defineConfig({'
  ];

  if (config.output?.path) {
    lines.push('  build: {');
    lines.push(`    outDir: '${config.output.path}',`);
    lines.push('  },');
  }

  if (config.devServer?.port) {
    lines.push('  server: {');
    lines.push(`    port: ${config.devServer.port},`);
    if (config.devServer.open !== undefined) {
      lines.push(`    open: ${config.devServer.open},`);
    }
    lines.push('  },');
  }

  if (config.resolve) {
    lines.push('  resolve: {');
    if (config.resolve.extensions) {
      lines.push(`    extensions: [${config.resolve.extensions.map(e => `'${e}'`).join(', ')}],`);
    }
    if (config.resolve.alias) {
      lines.push('    alias: {');
      for (const [key, value] of Object.entries(config.resolve.alias)) {
        lines.push(`      '${key}': '${value}',`);
      }
      lines.push('    },');
    }
    lines.push('  },');
  }

  lines.push('});');

  return lines.join('\n');
}

/**
 * Generate esbuild configuration code
 */
function generateEsbuildConfig(config: BundlerConfig): string {
  const lines: string[] = [
    "const esbuild = require('esbuild');",
    '',
    'esbuild.build({'
  ];

  if (config.entry) {
    const entryValue = typeof config.entry === 'string' 
      ? `['${config.entry}']` 
      : `[${config.entry.map(e => `'${e}'`).join(', ')}]`;
    lines.push(`  entryPoints: ${entryValue},`);
  }

  if (config.output?.path) {
    lines.push(`  outdir: '${config.output.path}',`);
  }

  lines.push('  bundle: true,');

  if (config.mode === 'production') {
    lines.push('  minify: true,');
  }

  if (config.resolve?.alias) {
    lines.push('  alias: {');
    for (const [key, value] of Object.entries(config.resolve.alias)) {
      lines.push(`    '${key}': '${value}',`);
    }
    lines.push('  },');
  }

  lines.push('}).catch(() => process.exit(1));');

  return lines.join('\n');
}

/**
 * Generate Rollup configuration code
 */
function generateRollupConfig(config: BundlerConfig): string {
  const lines: string[] = [
    "export default {",
  ];

  if (config.entry) {
    const entryValue = typeof config.entry === 'string' 
      ? `'${config.entry}'` 
      : `[${config.entry.map(e => `'${e}'`).join(', ')}]`;
    lines.push(`  input: ${entryValue},`);
  }

  if (config.output) {
    lines.push('  output: {');
    if (config.output.path) {
      lines.push(`    dir: '${config.output.path}',`);
    }
    if (config.output.filename) {
      lines.push(`    entryFileNames: '${config.output.filename}',`);
    }
    lines.push("    format: 'es',");
    lines.push('  },');
  }

  lines.push('};');

  return lines.join('\n');
}

/**
 * Translate and generate configuration code in one step
 */
export function translateAndGenerate(
  sourceConfig: BundlerConfig,
  targetBundler: BundlerName
): {
  code: string;
  notes: string[];
  unsupportedFeatures: string[];
} {
  const translation = translateConfig(sourceConfig, targetBundler);
  const code = generateConfigCode(translation.config);

  return {
    code,
    notes: translation.notes,
    unsupportedFeatures: translation.unsupportedFeatures
  };
}

/**
 * Check if a feature is supported by a bundler
 */
export function isFeatureSupported(
  feature: string,
  bundler: BundlerName
): boolean {
  const supportMatrix: Record<string, BundlerName[]> = {
    'hmr': ['webpack', 'vite'],
    'devServer': ['webpack', 'vite'],
    'cssModules': ['webpack', 'vite'],
    'typescript': ['webpack', 'vite', 'esbuild', 'rollup'],
    'codeSplitting': ['webpack', 'vite', 'esbuild', 'rollup'],
    'treeshaking': ['webpack', 'vite', 'esbuild', 'rollup'],
    'minification': ['webpack', 'vite', 'esbuild', 'rollup'],
    'sourceMaps': ['webpack', 'vite', 'esbuild', 'rollup']
  };

  const supportedBundlers = supportMatrix[feature.toLowerCase()];
  return supportedBundlers ? supportedBundlers.includes(bundler) : false;
}
