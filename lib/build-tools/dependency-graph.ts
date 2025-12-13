/**
 * Dependency Graph utilities for visualizing and analyzing module dependencies
 * in build tools lesson
 */

export interface ModuleDefinition {
  id: string;
  name: string;
  imports: string[];
  exports: string[];
  size?: number;
}

export interface ModuleNode {
  id: string;
  name: string;
  imports: string[];
  exports: string[];
  size?: number;
}

export interface DependencyEdge {
  from: string;
  to: string;
}

export interface DependencyGraph {
  nodes: ModuleNode[];
  edges: DependencyEdge[];
  hasCycles: boolean;
  cycles: string[][];
}

export class GraphOperations {
  private graph: DependencyGraph;

  constructor(initialModules: ModuleDefinition[] = []) {
    this.graph = {
      nodes: initialModules.map(m => ({ ...m })),
      edges: [],
      hasCycles: false,
      cycles: []
    };

    // Build initial edges from module imports
    for (const moduleDefinition of initialModules) {
      for (const importedModule of moduleDefinition.imports) {
        this.graph.edges.push({
          from: moduleDefinition.id,
          to: importedModule
        });
      }
    }

    // Update cycle detection
    this.updateCycleDetection();
  }

  /**
   * Add a module to the graph
   */
  addModule(moduleDefinition: ModuleDefinition): DependencyGraph {
    // Check if module already exists
    const existingIndex = this.graph.nodes.findIndex(n => n.id === moduleDefinition.id);
    
    if (existingIndex >= 0) {
      // Update existing module
      this.graph.nodes[existingIndex] = { ...moduleDefinition };
      
      // Remove old edges from this module
      this.graph.edges = this.graph.edges.filter(e => e.from !== moduleDefinition.id);
    } else {
      // Add new module
      this.graph.nodes.push({ ...moduleDefinition });
    }

    // Add edges for imports
    for (const importedModule of moduleDefinition.imports) {
      this.graph.edges.push({
        from: moduleDefinition.id,
        to: importedModule
      });
    }

    this.updateCycleDetection();
    return this.getGraph();
  }

  /**
   * Remove a module from the graph
   */
  removeModule(moduleId: string): DependencyGraph {
    // Remove the node
    this.graph.nodes = this.graph.nodes.filter(n => n.id !== moduleId);
    
    // Remove all edges involving this module
    this.graph.edges = this.graph.edges.filter(
      e => e.from !== moduleId && e.to !== moduleId
    );

    this.updateCycleDetection();
    return this.getGraph();
  }

  /**
   * Add a dependency edge between two modules
   */
  addDependency(from: string, to: string): DependencyGraph {
    // Check if edge already exists
    const edgeExists = this.graph.edges.some(
      e => e.from === from && e.to === to
    );

    if (!edgeExists) {
      this.graph.edges.push({ from, to });
      
      // Update the imports array of the from module
      const fromNode = this.graph.nodes.find(n => n.id === from);
      if (fromNode && !fromNode.imports.includes(to)) {
        fromNode.imports.push(to);
      }
    }

    this.updateCycleDetection();
    return this.getGraph();
  }

  /**
   * Find all modules that depend on the given module (direct and transitive)
   */
  findDependents(moduleId: string): string[] {
    const dependents = new Set<string>();
    const visited = new Set<string>();

    const traverse = (currentId: string) => {
      if (visited.has(currentId)) return;
      visited.add(currentId);

      // Find all modules that import currentId
      const directDependents = this.graph.edges
        .filter(e => e.to === currentId)
        .map(e => e.from);

      for (const dependent of directDependents) {
        dependents.add(dependent);
        traverse(dependent);
      }
    };

    traverse(moduleId);
    return Array.from(dependents);
  }

  /**
   * Find all modules that the given module depends on (direct and transitive)
   */
  findDependencies(moduleId: string): string[] {
    const dependencies = new Set<string>();
    const visited = new Set<string>();

    const traverse = (currentId: string) => {
      if (visited.has(currentId)) return;
      visited.add(currentId);

      // Find all modules that currentId imports
      const directDependencies = this.graph.edges
        .filter(e => e.from === currentId)
        .map(e => e.to);

      for (const dependency of directDependencies) {
        dependencies.add(dependency);
        traverse(dependency);
      }
    };

    traverse(moduleId);
    return Array.from(dependencies);
  }

  /**
   * Detect all cycles in the dependency graph using DFS
   */
  detectCycles(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const currentPath: string[] = [];

    const dfs = (nodeId: string): void => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      currentPath.push(nodeId);

      // Get all nodes this node depends on
      const dependencies = this.graph.edges
        .filter(e => e.from === nodeId)
        .map(e => e.to);

      for (const depId of dependencies) {
        if (!visited.has(depId)) {
          dfs(depId);
        } else if (recursionStack.has(depId)) {
          // Found a cycle - extract the cycle from currentPath
          const cycleStartIndex = currentPath.indexOf(depId);
          if (cycleStartIndex >= 0) {
            const cycle = currentPath.slice(cycleStartIndex);
            cycle.push(depId); // Complete the cycle
            cycles.push(cycle);
          }
        }
      }

      currentPath.pop();
      recursionStack.delete(nodeId);
    };

    // Run DFS from each unvisited node
    for (const node of this.graph.nodes) {
      if (!visited.has(node.id)) {
        dfs(node.id);
      }
    }

    return cycles;
  }

  /**
   * Update cycle detection status
   */
  private updateCycleDetection(): void {
    this.graph.cycles = this.detectCycles();
    this.graph.hasCycles = this.graph.cycles.length > 0;
  }

  /**
   * Get the current graph state
   */
  getGraph(): DependencyGraph {
    return {
      nodes: [...this.graph.nodes],
      edges: [...this.graph.edges],
      hasCycles: this.graph.hasCycles,
      cycles: this.graph.cycles.map(cycle => [...cycle])
    };
  }
}

/**
 * Create a new dependency graph from module definitions
 */
export function createDependencyGraph(modules: ModuleDefinition[] = []): GraphOperations {
  return new GraphOperations(modules);
}
