/**
 * Command parser for package managers (npm, yarn, pnpm)
 * Supports parsing and executing simulated commands
 */

export type PackageManager = 'npm' | 'yarn' | 'pnpm';

export type CommandType = 'install' | 'uninstall' | 'update' | 'init' | 'run';

export interface ParsedCommand {
  manager: PackageManager;
  type: CommandType;
  packages: string[];
  flags: string[];
  script?: string;
}

export interface CommandError {
  error: true;
  message: string;
  suggestion?: string;
}

export interface CommandResult {
  success: boolean;
  output: string[];
  duration: number;
  filesChanged?: string[];
}

/**
 * Parse a package manager command string into structured format
 */
export function parseCommand(input: string): ParsedCommand | CommandError {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return {
      error: true,
      message: 'Command cannot be empty',
      suggestion: 'Try: npm install <package-name>',
    };
  }

  const parts = trimmed.split(/\s+/);
  const manager = parts[0] as PackageManager;

  // Validate package manager
  if (!['npm', 'yarn', 'pnpm'].includes(manager)) {
    return {
      error: true,
      message: `Unknown package manager: ${manager}`,
      suggestion: 'Supported package managers: npm, yarn, pnpm',
    };
  }

  if (parts.length < 2) {
    return {
      error: true,
      message: 'Command requires an action',
      suggestion: `Try: ${manager} install <package-name>`,
    };
  }

  const action = parts[1];
  const args = parts.slice(2);

  // Parse based on command type
  switch (action) {
    case 'install':
    case 'i':
    case 'add': {
      const { packages, flags } = separatePackagesAndFlags(args);
      return {
        manager,
        type: 'install',
        packages,
        flags,
      };
    }

    case 'uninstall':
    case 'remove':
    case 'rm':
    case 'un': {
      const { packages, flags } = separatePackagesAndFlags(args);
      if (packages.length === 0) {
        return {
          error: true,
          message: 'Uninstall requires at least one package name',
          suggestion: `Try: ${manager} uninstall <package-name>`,
        };
      }
      return {
        manager,
        type: 'uninstall',
        packages,
        flags,
      };
    }

    case 'update':
    case 'upgrade':
    case 'up': {
      const { packages, flags } = separatePackagesAndFlags(args);
      return {
        manager,
        type: 'update',
        packages,
        flags,
      };
    }

    case 'init': {
      const { flags } = separatePackagesAndFlags(args);
      return {
        manager,
        type: 'init',
        packages: [],
        flags,
      };
    }

    case 'run': {
      if (args.length === 0) {
        return {
          error: true,
          message: 'Run command requires a script name',
          suggestion: `Try: ${manager} run <script-name>`,
        };
      }
      const script = args[0];
      const flags = args.slice(1).filter((arg) => arg.startsWith('-'));
      return {
        manager,
        type: 'run',
        packages: [],
        flags,
        script,
      };
    }

    default:
      return {
        error: true,
        message: `Unknown command: ${action}`,
        suggestion: 'Supported commands: install, uninstall, update, init, run',
      };
  }
}

/**
 * Separate packages from flags in command arguments
 */
function separatePackagesAndFlags(args: string[]): {
  packages: string[];
  flags: string[];
} {
  const packages: string[] = [];
  const flags: string[] = [];

  for (const arg of args) {
    if (arg.startsWith('-')) {
      flags.push(arg);
    } else {
      packages.push(arg);
    }
  }

  return { packages, flags };
}

/**
 * Execute a parsed command (simulated)
 */
export function executeCommand(command: ParsedCommand): CommandResult {
  const startTime = Date.now();
  const output: string[] = [];
  const filesChanged: string[] = [];

  switch (command.type) {
    case 'install': {
      if (command.packages.length === 0) {
        output.push(`Installing dependencies from package.json...`);
        output.push('');
        output.push('✓ Dependencies installed successfully');
        filesChanged.push('node_modules/', 'package-lock.json');
      } else {
        command.packages.forEach((pkg) => {
          output.push(`+ ${pkg}@latest`);
        });
        output.push('');
        output.push(`Added ${command.packages.length} package(s)`);
        filesChanged.push('node_modules/', 'package.json', 'package-lock.json');
      }
      break;
    }

    case 'uninstall': {
      command.packages.forEach((pkg) => {
        output.push(`- ${pkg}`);
      });
      output.push('');
      output.push(`Removed ${command.packages.length} package(s)`);
      filesChanged.push('node_modules/', 'package.json', 'package-lock.json');
      break;
    }

    case 'update': {
      if (command.packages.length === 0) {
        output.push('Checking for updates...');
        output.push('All packages are up to date');
      } else {
        command.packages.forEach((pkg) => {
          output.push(`↑ ${pkg}: 1.0.0 → 1.1.0`);
        });
        output.push('');
        output.push(`Updated ${command.packages.length} package(s)`);
      }
      filesChanged.push('node_modules/', 'package-lock.json');
      break;
    }

    case 'init': {
      output.push('Initializing new project...');
      output.push('');
      output.push('Created package.json');
      filesChanged.push('package.json');
      break;
    }

    case 'run': {
      output.push(`> ${command.script}`);
      output.push('');
      output.push(`Running script: ${command.script}`);
      output.push('✓ Script completed successfully');
      break;
    }
  }

  const duration = Date.now() - startTime;

  return {
    success: true,
    output,
    duration: Math.max(duration, 100), // Minimum 100ms for realism
    filesChanged: filesChanged.length > 0 ? filesChanged : undefined,
  };
}

/**
 * Check if a string is a valid command
 */
export function isValidCommand(input: string): boolean {
  const result = parseCommand(input);
  return !('error' in result);
}

/**
 * Command equivalence mappings between package managers
 */
const COMMAND_EQUIVALENTS: Record<
  PackageManager,
  Record<CommandType, string>
> = {
  npm: {
    install: 'install',
    uninstall: 'uninstall',
    update: 'update',
    init: 'init',
    run: 'run',
  },
  yarn: {
    install: 'add',
    uninstall: 'remove',
    update: 'upgrade',
    init: 'init',
    run: 'run',
  },
  pnpm: {
    install: 'add',
    uninstall: 'remove',
    update: 'update',
    init: 'init',
    run: 'run',
  },
};

/**
 * Get the equivalent command for a different package manager
 */
export function getEquivalentCommand(
  command: ParsedCommand,
  targetManager: PackageManager
): string {
  const targetAction = COMMAND_EQUIVALENTS[targetManager][command.type];
  
  const parts: string[] = [targetManager, targetAction];

  // Add script name for run commands
  if (command.type === 'run' && command.script) {
    parts.push(command.script);
  }

  // Add packages
  if (command.packages.length > 0) {
    parts.push(...command.packages);
  }

  // Add flags
  if (command.flags.length > 0) {
    parts.push(...command.flags);
  }

  return parts.join(' ');
}

/**
 * Get equivalent commands for all package managers
 */
export function getAllEquivalents(
  command: ParsedCommand
): Record<PackageManager, string> {
  return {
    npm: getEquivalentCommand(command, 'npm'),
    yarn: getEquivalentCommand(command, 'yarn'),
    pnpm: getEquivalentCommand(command, 'pnpm'),
  };
}

/**
 * Convert a command string to its equivalent in another package manager
 */
export function convertCommand(
  input: string,
  targetManager: PackageManager
): string | CommandError {
  const parsed = parseCommand(input);
  
  if ('error' in parsed) {
    return parsed;
  }

  return getEquivalentCommand(parsed, targetManager);
}
