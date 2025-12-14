'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, ArrowRight, Database, Terminal, Play, RotateCcw, ChevronDown, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface Migration {
  id: string;
  name: string;
  timestamp: string;
  changes: string[];
  applied: boolean;
}

export interface MigrationVisualizerProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
  title?: string;
  migrations?: Migration[];
}

const defaultMigrations: Migration[] = [
  {
    id: '001',
    name: 'InitialCreate',
    timestamp: '20241201120000',
    changes: ['CREATE TABLE Blogs (Id, Title, Url)'],
    applied: true,
  },
  {
    id: '002',
    name: 'AddBlogRating',
    timestamp: '20241205140000',
    changes: ['ALTER TABLE Blogs ADD Rating INT'],
    applied: true,
  },
  {
    id: '003',
    name: 'AddPosts',
    timestamp: '20241210160000',
    changes: ['CREATE TABLE Posts (Id, Title, Content, BlogId)', 'ADD FOREIGN KEY (BlogId) REFERENCES Blogs(Id)'],
    applied: false,
  },
];

type StepPhase = 'idle' | 'model-change' | 'add-migration' | 'migration-created' | 'update-database' | 'applied';

export function MigrationVisualizer({
  mode = 'beginner',
  title = 'Code-First Migrations',
  migrations: initialMigrations = defaultMigrations,
}: MigrationVisualizerProps) {
  const [migrations, setMigrations] = useState<Migration[]>(initialMigrations);
  const [phase, setPhase] = useState<StepPhase>('idle');
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentCommand, setCurrentCommand] = useState<string>('');
  const [commandOutput, setCommandOutput] = useState<string[]>([]);

  const runMigrationFlow = useCallback(async () => {
    setIsAnimating(true);
    setCommandOutput([]);

    // Step 1: Model change
    setPhase('model-change');
    await new Promise(r => setTimeout(r, 1500));

    // Step 2: Add-Migration command
    setPhase('add-migration');
    setCurrentCommand('dotnet ef migrations add AddComments');
    await new Promise(r => setTimeout(r, 1000));
    setCommandOutput(['Build started...', 'Build succeeded.', 'Done. To undo this action, use \'ef migrations remove\'']);
    await new Promise(r => setTimeout(r, 1500));

    // Step 3: Migration created
    setPhase('migration-created');
    setMigrations(prev => [...prev, {
      id: '004',
      name: 'AddComments',
      timestamp: '20241214180000',
      changes: ['CREATE TABLE Comments (Id, Text, PostId)', 'ADD FOREIGN KEY (PostId) REFERENCES Posts(Id)'],
      applied: false,
    }]);
    await new Promise(r => setTimeout(r, 1500));

    // Step 4: Update-Database command
    setPhase('update-database');
    setCurrentCommand('dotnet ef database update');
    setCommandOutput([]);
    await new Promise(r => setTimeout(r, 800));
    setCommandOutput(['Build started...', 'Build succeeded.', 'Applying migration \'20241210160000_AddPosts\'...', 'Applying migration \'20241214180000_AddComments\'...', 'Done.']);
    await new Promise(r => setTimeout(r, 1500));

    // Step 5: Applied
    setPhase('applied');
    setMigrations(prev => prev.map(m => ({ ...m, applied: true })));
    setIsAnimating(false);
  }, []);

  const reset = useCallback(() => {
    setMigrations(initialMigrations);
    setPhase('idle');
    setIsAnimating(false);
    setCurrentCommand('');
    setCommandOutput([]);
  }, [initialMigrations]);

  const pendingCount = migrations.filter(m => !m.applied).length;

  return (
    <Card className="my-4 overflow-hidden bg-gray-950 border-gray-800">
      <CardHeader className="pb-2 flex flex-row items-center justify-between bg-gray-900/50">
        <CardTitle className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-orange-400" />
          {title}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={reset} className="text-gray-400 hover:text-white">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Beginner Analogy */}
        {mode === 'beginner' && phase === 'idle' && (
          <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-4">
            <h4 className="font-medium text-orange-300 mb-2">⏰ Migrations are Time Travel for Databases</h4>
            <p className="text-sm text-gray-400">
              Imagine your database is a document. Migrations are like <strong>saved versions</strong> - 
              you can add new changes, go back to old versions, or see the history of all changes. 
              Each migration is a single step forward (or backward) in time!
            </p>
          </div>
        )}

        {/* Start Button */}
        {phase === 'idle' && (
          <div className="text-center">
            <Button onClick={runMigrationFlow} disabled={isAnimating} className="bg-orange-600 hover:bg-orange-700">
              <Play className="h-4 w-4 mr-2" />
              Watch Migration Flow
            </Button>
          </div>
        )}

        {/* Migration Timeline */}
        <div className="space-y-3">
          <div className="text-xs font-medium text-gray-400 flex items-center gap-2">
            <GitBranch className="h-3 w-3" />
            Migration History
            {pendingCount > 0 && (
              <span className="bg-yellow-800 text-yellow-300 px-2 rounded text-xs">
                {pendingCount} pending
              </span>
            )}
          </div>

          <div className="relative pl-4 border-l-2 border-gray-700 space-y-3">
            <AnimatePresence>
              {migrations.map((migration, index) => (
                <motion.div
                  key={migration.id}
                  initial={index >= initialMigrations.length ? { opacity: 0, x: -20 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative"
                >
                  {/* Timeline dot */}
                  <div className={cn(
                    'absolute -left-[21px] w-4 h-4 rounded-full border-2 flex items-center justify-center',
                    migration.applied 
                      ? 'bg-green-900 border-green-500' 
                      : 'bg-yellow-900 border-yellow-500'
                  )}>
                    {migration.applied ? (
                      <Check className="h-2 w-2 text-green-400" />
                    ) : (
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                    )}
                  </div>

                  {/* Migration card */}
                  <div className={cn(
                    'ml-2 p-3 rounded-lg border',
                    migration.applied ? 'border-gray-700 bg-gray-900/50' : 'border-yellow-600 bg-yellow-900/20'
                  )}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm text-gray-200">{migration.name}</span>
                      <span className="text-xs text-gray-500">{migration.timestamp}</span>
                    </div>
                    
                    {mode !== 'beginner' && (
                      <div className="mt-2 space-y-1">
                        {migration.changes.map((change, i) => (
                          <div key={i} className="text-xs font-mono text-cyan-400 flex items-center gap-1">
                            <ChevronDown className="h-3 w-3 text-gray-500" />
                            {change}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Model Change Indicator */}
        <AnimatePresence>
          {phase === 'model-change' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 bg-purple-900/30 border border-purple-600 rounded-lg"
            >
              <div className="flex items-center gap-2 text-purple-300">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Model changed! Adding new Comments table...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Terminal */}
        <AnimatePresence>
          {(phase === 'add-migration' || phase === 'migration-created' || phase === 'update-database' || phase === 'applied') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden"
            >
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 border-b border-gray-700">
                <Terminal className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-400">Package Manager Console</span>
              </div>
              <div className="p-3 font-mono text-xs space-y-1">
                {currentCommand && (
                  <div className="text-green-400">
                    PM&gt; {currentCommand}
                  </div>
                )}
                {commandOutput.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.2 }}
                    className="text-gray-400"
                  >
                    {line}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Database Schema View */}
        {phase === 'applied' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-green-900/20 border border-green-600 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-3">
              <Database className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-green-300">Database Updated Successfully!</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {['Blogs', 'Posts', 'Comments'].map(table => (
                <div key={table} className="p-2 bg-gray-900 rounded border border-gray-700">
                  <div className="font-mono text-cyan-400">{table}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Advanced: Migration file content */}
        {mode === 'advanced' && phase === 'migration-created' && (
          <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
            <div className="text-xs font-medium text-gray-400 mb-2">Generated Migration File:</div>
            <pre className="text-xs font-mono text-gray-300 overflow-x-auto">
{`public partial class AddComments : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Comments",
            columns: table => new
            {
                Id = table.Column<int>(),
                Text = table.Column<string>(),
                PostId = table.Column<int>()
            });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "Comments");
    }
}`}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MigrationVisualizer;
