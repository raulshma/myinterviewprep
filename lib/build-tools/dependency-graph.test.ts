import { describe, it, expect } from 'vitest';
import { createDependencyGraph, type ModuleDefinition } from './dependency-graph';

describe('DependencyGraph', () => {
  describe('Graph Construction', () => {
    it('should create an empty graph', () => {
      const graph = createDependencyGraph();
      const result = graph.getGraph();
      
      expect(result.nodes).toHaveLength(0);
      expect(result.edges).toHaveLength(0);
      expect(result.hasCycles).toBe(false);
    });

    it('should create a graph with initial modules', () => {
      const modules: ModuleDefinition[] = [
        { id: 'a', name: 'Module A', imports: ['b'], exports: ['funcA'] },
        { id: 'b', name: 'Module B', imports: [], exports: ['funcB'] }
      ];
      
      const graph = createDependencyGraph(modules);
      const result = graph.getGraph();
      
      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toHaveLength(1);
      expect(result.edges[0]).toEqual({ from: 'a', to: 'b' });
    });
  });

  describe('addModule', () => {
    it('should add a new module to the graph', () => {
      const graph = createDependencyGraph();
      const moduleA: ModuleDefinition = {
        id: 'a',
        name: 'Module A',
        imports: [],
        exports: ['funcA']
      };
      
      const result = graph.addModule(moduleA);
      
      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].id).toBe('a');
    });

    it('should update an existing module', () => {
      const modules: ModuleDefinition[] = [
        { id: 'a', name: 'Module A', imports: [], exports: ['funcA'] }
      ];
      const graph = createDependencyGraph(modules);
      
      const updated: ModuleDefinition = {
        id: 'a',
        name: 'Module A Updated',
        imports: ['b'],
        exports: ['funcA', 'funcA2']
      };
      
      const result = graph.addModule(updated);
      
      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].name).toBe('Module A Updated');
      expect(result.edges).toHaveLength(1);
    });
  });

  describe('removeModule', () => {
    it('should remove a module and its edges', () => {
      const modules: ModuleDefinition[] = [
        { id: 'a', name: 'Module A', imports: ['b'], exports: ['funcA'] },
        { id: 'b', name: 'Module B', imports: [], exports: ['funcB'] }
      ];
      const graph = createDependencyGraph(modules);
      
      const result = graph.removeModule('a');
      
      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].id).toBe('b');
      expect(result.edges).toHaveLength(0);
    });
  });

  describe('addDependency', () => {
    it('should add a dependency edge between modules', () => {
      const modules: ModuleDefinition[] = [
        { id: 'a', name: 'Module A', imports: [], exports: ['funcA'] },
        { id: 'b', name: 'Module B', imports: [], exports: ['funcB'] }
      ];
      const graph = createDependencyGraph(modules);
      
      const result = graph.addDependency('a', 'b');
      
      expect(result.edges).toHaveLength(1);
      expect(result.edges[0]).toEqual({ from: 'a', to: 'b' });
    });

    it('should not add duplicate edges', () => {
      const modules: ModuleDefinition[] = [
        { id: 'a', name: 'Module A', imports: ['b'], exports: ['funcA'] },
        { id: 'b', name: 'Module B', imports: [], exports: ['funcB'] }
      ];
      const graph = createDependencyGraph(modules);
      
      graph.addDependency('a', 'b');
      const result = graph.getGraph();
      
      expect(result.edges).toHaveLength(1);
    });
  });

  describe('findDependents', () => {
    it('should find direct dependents', () => {
      const modules: ModuleDefinition[] = [
        { id: 'a', name: 'Module A', imports: ['b'], exports: ['funcA'] },
        { id: 'b', name: 'Module B', imports: [], exports: ['funcB'] }
      ];
      const graph = createDependencyGraph(modules);
      
      const dependents = graph.findDependents('b');
      
      expect(dependents).toEqual(['a']);
    });

    it('should find transitive dependents', () => {
      const modules: ModuleDefinition[] = [
        { id: 'a', name: 'Module A', imports: ['b'], exports: ['funcA'] },
        { id: 'b', name: 'Module B', imports: ['c'], exports: ['funcB'] },
        { id: 'c', name: 'Module C', imports: [], exports: ['funcC'] }
      ];
      const graph = createDependencyGraph(modules);
      
      const dependents = graph.findDependents('c');
      
      expect(dependents).toContain('b');
      expect(dependents).toContain('a');
      expect(dependents).toHaveLength(2);
    });
  });

  describe('findDependencies', () => {
    it('should find direct dependencies', () => {
      const modules: ModuleDefinition[] = [
        { id: 'a', name: 'Module A', imports: ['b'], exports: ['funcA'] },
        { id: 'b', name: 'Module B', imports: [], exports: ['funcB'] }
      ];
      const graph = createDependencyGraph(modules);
      
      const dependencies = graph.findDependencies('a');
      
      expect(dependencies).toEqual(['b']);
    });

    it('should find transitive dependencies', () => {
      const modules: ModuleDefinition[] = [
        { id: 'a', name: 'Module A', imports: ['b'], exports: ['funcA'] },
        { id: 'b', name: 'Module B', imports: ['c'], exports: ['funcB'] },
        { id: 'c', name: 'Module C', imports: [], exports: ['funcC'] }
      ];
      const graph = createDependencyGraph(modules);
      
      const dependencies = graph.findDependencies('a');
      
      expect(dependencies).toContain('b');
      expect(dependencies).toContain('c');
      expect(dependencies).toHaveLength(2);
    });
  });

  describe('detectCycles', () => {
    it('should detect no cycles in acyclic graph', () => {
      const modules: ModuleDefinition[] = [
        { id: 'a', name: 'Module A', imports: ['b'], exports: ['funcA'] },
        { id: 'b', name: 'Module B', imports: [], exports: ['funcB'] }
      ];
      const graph = createDependencyGraph(modules);
      
      const result = graph.getGraph();
      
      expect(result.hasCycles).toBe(false);
      expect(result.cycles).toHaveLength(0);
    });

    it('should detect a simple cycle', () => {
      const modules: ModuleDefinition[] = [
        { id: 'a', name: 'Module A', imports: ['b'], exports: ['funcA'] },
        { id: 'b', name: 'Module B', imports: ['a'], exports: ['funcB'] }
      ];
      const graph = createDependencyGraph(modules);
      
      const result = graph.getGraph();
      
      expect(result.hasCycles).toBe(true);
      expect(result.cycles.length).toBeGreaterThan(0);
    });

    it('should detect a longer cycle', () => {
      const modules: ModuleDefinition[] = [
        { id: 'a', name: 'Module A', imports: ['b'], exports: ['funcA'] },
        { id: 'b', name: 'Module B', imports: ['c'], exports: ['funcB'] },
        { id: 'c', name: 'Module C', imports: ['a'], exports: ['funcC'] }
      ];
      const graph = createDependencyGraph(modules);
      
      const result = graph.getGraph();
      
      expect(result.hasCycles).toBe(true);
      expect(result.cycles.length).toBeGreaterThan(0);
    });
  });
});
