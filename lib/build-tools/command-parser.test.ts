import { describe, it, expect } from 'vitest';
import {
  parseCommand,
  executeCommand,
  getEquivalentCommand,
  getAllEquivalents,
  convertCommand,
  isValidCommand,
} from './command-parser';

describe('Command Parser', () => {
  describe('parseCommand', () => {
    it('should parse npm install command', () => {
      const result = parseCommand('npm install react');
      expect(result).toEqual({
        manager: 'npm',
        type: 'install',
        packages: ['react'],
        flags: [],
      });
    });

    it('should parse yarn add command', () => {
      const result = parseCommand('yarn add react redux');
      expect(result).toEqual({
        manager: 'yarn',
        type: 'install',
        packages: ['react', 'redux'],
        flags: [],
      });
    });

    it('should parse pnpm remove command', () => {
      const result = parseCommand('pnpm remove lodash');
      expect(result).toEqual({
        manager: 'pnpm',
        type: 'uninstall',
        packages: ['lodash'],
        flags: [],
      });
    });

    it('should parse command with flags', () => {
      const result = parseCommand('npm install react --save-dev');
      expect(result).toEqual({
        manager: 'npm',
        type: 'install',
        packages: ['react'],
        flags: ['--save-dev'],
      });
    });

    it('should parse init command', () => {
      const result = parseCommand('npm init');
      expect(result).toEqual({
        manager: 'npm',
        type: 'init',
        packages: [],
        flags: [],
      });
    });

    it('should parse run command', () => {
      const result = parseCommand('npm run build');
      expect(result).toEqual({
        manager: 'npm',
        type: 'run',
        packages: [],
        flags: [],
        script: 'build',
      });
    });

    it('should return error for empty command', () => {
      const result = parseCommand('');
      expect(result).toHaveProperty('error', true);
      expect(result).toHaveProperty('message');
    });

    it('should return error for unknown package manager', () => {
      const result = parseCommand('pip install react');
      expect(result).toHaveProperty('error', true);
    });

    it('should return error for unknown action', () => {
      const result = parseCommand('npm foo');
      expect(result).toHaveProperty('error', true);
    });

    it('should return error for uninstall without package', () => {
      const result = parseCommand('npm uninstall');
      expect(result).toHaveProperty('error', true);
    });

    it('should return error for run without script', () => {
      const result = parseCommand('npm run');
      expect(result).toHaveProperty('error', true);
    });
  });

  describe('executeCommand', () => {
    it('should execute install command', () => {
      const parsed = parseCommand('npm install react');
      if ('error' in parsed) throw new Error('Parse failed');
      
      const result = executeCommand(parsed);
      expect(result.success).toBe(true);
      expect(result.output.length).toBeGreaterThan(0);
      expect(result.filesChanged).toBeDefined();
    });

    it('should execute uninstall command', () => {
      const parsed = parseCommand('npm uninstall lodash');
      if ('error' in parsed) throw new Error('Parse failed');
      
      const result = executeCommand(parsed);
      expect(result.success).toBe(true);
      expect(result.output).toContain('- lodash');
    });

    it('should execute init command', () => {
      const parsed = parseCommand('npm init');
      if ('error' in parsed) throw new Error('Parse failed');
      
      const result = executeCommand(parsed);
      expect(result.success).toBe(true);
      expect(result.filesChanged).toContain('package.json');
    });
  });

  describe('Command Equivalence', () => {
    it('should convert npm install to yarn add', () => {
      const parsed = parseCommand('npm install react');
      if ('error' in parsed) throw new Error('Parse failed');
      
      const equivalent = getEquivalentCommand(parsed, 'yarn');
      expect(equivalent).toBe('yarn add react');
    });

    it('should convert yarn remove to npm uninstall', () => {
      const parsed = parseCommand('yarn remove lodash');
      if ('error' in parsed) throw new Error('Parse failed');
      
      const equivalent = getEquivalentCommand(parsed, 'npm');
      expect(equivalent).toBe('npm uninstall lodash');
    });

    it('should convert pnpm update to yarn upgrade', () => {
      const parsed = parseCommand('pnpm update react');
      if ('error' in parsed) throw new Error('Parse failed');
      
      const equivalent = getEquivalentCommand(parsed, 'yarn');
      expect(equivalent).toBe('yarn upgrade react');
    });

    it('should get all equivalents', () => {
      const parsed = parseCommand('npm install react');
      if ('error' in parsed) throw new Error('Parse failed');
      
      const equivalents = getAllEquivalents(parsed);
      expect(equivalents.npm).toBe('npm install react');
      expect(equivalents.yarn).toBe('yarn add react');
      expect(equivalents.pnpm).toBe('pnpm add react');
    });

    it('should convert command string directly', () => {
      const result = convertCommand('npm install react', 'yarn');
      expect(result).toBe('yarn add react');
    });

    it('should preserve flags in conversion', () => {
      const parsed = parseCommand('npm install react --save-dev');
      if ('error' in parsed) throw new Error('Parse failed');
      
      const equivalent = getEquivalentCommand(parsed, 'yarn');
      expect(equivalent).toBe('yarn add react --save-dev');
    });
  });

  describe('isValidCommand', () => {
    it('should return true for valid commands', () => {
      expect(isValidCommand('npm install react')).toBe(true);
      expect(isValidCommand('yarn add lodash')).toBe(true);
      expect(isValidCommand('pnpm remove express')).toBe(true);
    });

    it('should return false for invalid commands', () => {
      expect(isValidCommand('')).toBe(false);
      expect(isValidCommand('pip install react')).toBe(false);
      expect(isValidCommand('npm foo')).toBe(false);
    });
  });
});
