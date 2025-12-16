// MDX Components for Interactive Learning
// Export all custom components used in MDX lesson content
// All interactive components are wrapped with error boundaries (Requirements 11.5, 10.5)

import { withErrorBoundary } from '@/components/learn/shared';
import { InfoBox as InfoBoxBase } from './info-box';
import { Quiz as QuizBase, Question, Answer } from './quiz';
import { AnimatedDiagram as AnimatedDiagramBase } from './animated-diagram';
import { InteractiveDemo as InteractiveDemoBase } from './interactive-demo';
import { ProgressCheckpoint as ProgressCheckpointBase } from './progress-checkpoint';
import { KeyConcept as KeyConceptBase } from './key-concept';
import { Comparison as ComparisonBase } from './comparison';
import { CodeExample as CodeExampleBase } from './code-example';
import { EnhancedCodeBlock as EnhancedCodeBlockBase } from './enhanced-code-block';

// EF Core specific components (Requirements 4.3, 4.4, 9.1, 9.2, 9.3, 9.4)
import { DotnetCodePreview as DotnetCodePreviewBase } from './ef-core/dotnet-code-preview';
import { DbContextVisualizer as DbContextVisualizerBase } from './ef-core/dbcontext-visualizer';
import { ChangeTrackingVisualizer as ChangeTrackingVisualizerBase } from './ef-core/change-tracking-visualizer';
import { RelationshipDiagram as RelationshipDiagramBase } from './ef-core/relationship-diagram';
import { QueryExecutionVisualizer as QueryExecutionVisualizerBase } from './ef-core/query-execution-visualizer';
import { MigrationFlowDiagram as MigrationFlowDiagramBase } from './ef-core/migration-flow-diagram';
import { EntityConfigVisualizer as EntityConfigVisualizerBase } from './ef-core/entity-config-visualizer';
import { AnnotationBuilder as AnnotationBuilderBase } from './ef-core/annotation-builder';
import { FluentApiBuilder as FluentApiBuilderBase } from './ef-core/fluent-api-builder';
import { KeyIndexVisualizer as KeyIndexVisualizerBase } from './ef-core/key-index-visualizer';

// Wrap interactive components with error boundaries
export const InfoBox = withErrorBoundary(InfoBoxBase, 'InfoBox');
export const Quiz = withErrorBoundary(QuizBase, 'Quiz');
export const AnimatedDiagram = withErrorBoundary(AnimatedDiagramBase, 'AnimatedDiagram');
export const InteractiveDemo = withErrorBoundary(InteractiveDemoBase, 'InteractiveDemo');
export const ProgressCheckpoint = withErrorBoundary(ProgressCheckpointBase, 'ProgressCheckpoint');
export const KeyConcept = withErrorBoundary(KeyConceptBase, 'KeyConcept');
export const Comparison = withErrorBoundary(ComparisonBase, 'Comparison');
export const CodeExample = withErrorBoundary(CodeExampleBase, 'CodeExample');
export const EnhancedCodeBlock = withErrorBoundary(EnhancedCodeBlockBase, 'EnhancedCodeBlock');

// EF Core components wrapped with error boundaries (Requirements 1.2)
export const DotnetCodePreview = withErrorBoundary(DotnetCodePreviewBase, 'DotnetCodePreview');
export const DbContextVisualizer = withErrorBoundary(DbContextVisualizerBase, 'DbContextVisualizer');
export const ChangeTrackingVisualizer = withErrorBoundary(ChangeTrackingVisualizerBase, 'ChangeTrackingVisualizer');
export const RelationshipDiagram = withErrorBoundary(RelationshipDiagramBase, 'RelationshipDiagram');
export const QueryExecutionVisualizer = withErrorBoundary(QueryExecutionVisualizerBase, 'QueryExecutionVisualizer');
export const MigrationFlowDiagram = withErrorBoundary(MigrationFlowDiagramBase, 'MigrationFlowDiagram');
export const EntityConfigVisualizer = withErrorBoundary(EntityConfigVisualizerBase, 'EntityConfigVisualizer');
export const AnnotationBuilder = withErrorBoundary(AnnotationBuilderBase, 'AnnotationBuilder');
export const FluentApiBuilder = withErrorBoundary(FluentApiBuilderBase, 'FluentApiBuilder');
export const KeyIndexVisualizer = withErrorBoundary(KeyIndexVisualizerBase, 'KeyIndexVisualizer');

// Re-export non-wrapped components
export { Question, Answer };
