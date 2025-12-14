'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Server, 
  Database, 
  Terminal, 
  Code, 
  Settings, 
  Play, 
  RotateCcw,
  FileCode,
  Key,
  Table2,
  Folder,
  ChevronRight,
  ChevronDown,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface SqlServerExplorerProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
  title?: string;
}

interface TreeNode {
  id: string;
  name: string;
  type: 'server' | 'database' | 'folder' | 'table' | 'view' | 'procedure' | 'column';
  children?: TreeNode[];
  expanded?: boolean;
  dataType?: string;
  isPrimaryKey?: boolean;
}

const sqlServerTree: TreeNode = {
  id: 'server',
  name: 'LOCALHOST\\SQLEXPRESS',
  type: 'server',
  expanded: true,
  children: [
    {
      id: 'db-myapp',
      name: 'MyAppDb',
      type: 'database',
      expanded: true,
      children: [
        {
          id: 'tables',
          name: 'Tables',
          type: 'folder',
          expanded: true,
          children: [
            {
              id: 'users-table',
              name: 'dbo.Users',
              type: 'table',
              children: [
                { id: 'users-id', name: 'Id', type: 'column', dataType: 'int', isPrimaryKey: true },
                { id: 'users-name', name: 'Name', type: 'column', dataType: 'nvarchar(100)' },
                { id: 'users-email', name: 'Email', type: 'column', dataType: 'nvarchar(255)' },
                { id: 'users-created', name: 'CreatedAt', type: 'column', dataType: 'datetime2' },
              ],
            },
            {
              id: 'orders-table',
              name: 'dbo.Orders',
              type: 'table',
              children: [
                { id: 'orders-id', name: 'Id', type: 'column', dataType: 'int', isPrimaryKey: true },
                { id: 'orders-userid', name: 'UserId', type: 'column', dataType: 'int' },
                { id: 'orders-total', name: 'Total', type: 'column', dataType: 'decimal(18,2)' },
                { id: 'orders-date', name: 'OrderDate', type: 'column', dataType: 'datetime2' },
              ],
            },
          ],
        },
        {
          id: 'views',
          name: 'Views',
          type: 'folder',
          children: [
            { id: 'view-orders', name: 'vw_UserOrders', type: 'view' },
          ],
        },
        {
          id: 'procedures',
          name: 'Stored Procedures',
          type: 'folder',
          children: [
            { id: 'sp-getusers', name: 'sp_GetActiveUsers', type: 'procedure' },
            { id: 'sp-createorder', name: 'sp_CreateOrder', type: 'procedure' },
          ],
        },
      ],
    },
  ],
};

const dataTypes: { name: string; category: string; description: string; example: string }[] = [
  { name: 'int', category: 'Numeric', description: '32-bit integer', example: '42, -100' },
  { name: 'bigint', category: 'Numeric', description: '64-bit integer', example: '9223372036854775807' },
  { name: 'decimal(p,s)', category: 'Numeric', description: 'Fixed precision number', example: 'decimal(18,2) for money' },
  { name: 'nvarchar(n)', category: 'String', description: 'Unicode variable-length', example: "N'Hello World'" },
  { name: 'varchar(n)', category: 'String', description: 'Non-Unicode variable-length', example: "'ASCII text'" },
  { name: 'datetime2', category: 'Date/Time', description: 'Date and time with precision', example: "'2024-01-15 10:30:00'" },
  { name: 'bit', category: 'Boolean', description: 'True/False (1/0)', example: '1, 0' },
  { name: 'uniqueidentifier', category: 'Other', description: 'GUID/UUID', example: 'NEWID()' },
];

const connectionStringTemplate = `Server=localhost\\SQLEXPRESS;Database=MyAppDb;
Trusted_Connection=True;TrustServerCertificate=True;`;

const connectionStringWithCredentials = `Server=myserver.database.windows.net;Database=MyAppDb;
User Id=myuser;Password=mypassword;Encrypt=True;`;

export function SqlServerExplorer({
  mode = 'beginner',
  title = 'SQL Server Explorer',
}: SqlServerExplorerProps) {
  const [tree, setTree] = useState<TreeNode>(sqlServerTree);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [activeTab, setActiveTab] = useState<'explorer' | 'datatypes' | 'connection'>('explorer');
  const [copiedString, setCopiedString] = useState(false);
  const [queryOutput, setQueryOutput] = useState<string[]>([]);
  const [isRunningQuery, setIsRunningQuery] = useState(false);

  const toggleNode = useCallback((nodeId: string) => {
    const toggleInTree = (node: TreeNode): TreeNode => {
      if (node.id === nodeId) {
        return { ...node, expanded: !node.expanded };
      }
      if (node.children) {
        return { ...node, children: node.children.map(toggleInTree) };
      }
      return node;
    };
    setTree(toggleInTree(tree));
  }, [tree]);

  const selectNode = useCallback((node: TreeNode) => {
    setSelectedNode(node);
  }, []);

  const runSampleQuery = useCallback(async () => {
    setIsRunningQuery(true);
    setQueryOutput([]);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    setQueryOutput(prev => [...prev, 'Connecting to LOCALHOST\\SQLEXPRESS...']);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    setQueryOutput(prev => [...prev, 'Connected successfully.']);
    
    await new Promise(resolve => setTimeout(resolve, 400));
    setQueryOutput(prev => [...prev, 'Executing: SELECT TOP 5 * FROM dbo.Users']);
    
    await new Promise(resolve => setTimeout(resolve, 600));
    setQueryOutput(prev => [...prev, '', '| Id | Name          | Email              |', '|----|---------------|--------------------| ', '| 1  | Alice Johnson | alice@email.com    |', '| 2  | Bob Smith     | bob@email.com      |', '| 3  | Charlie Brown | charlie@email.com  |', '', '(3 rows affected)']);
    
    setIsRunningQuery(false);
  }, []);

  const copyConnectionString = useCallback(async (str: string) => {
    await navigator.clipboard.writeText(str);
    setCopiedString(true);
    setTimeout(() => setCopiedString(false), 2000);
  }, []);

  const reset = useCallback(() => {
    setTree(sqlServerTree);
    setSelectedNode(null);
    setQueryOutput([]);
  }, []);

  const getNodeIcon = (node: TreeNode) => {
    switch (node.type) {
      case 'server': return <Server className="h-4 w-4 text-gray-400" />;
      case 'database': return <Database className="h-4 w-4 text-blue-400" />;
      case 'folder': return <Folder className="h-4 w-4 text-yellow-400" />;
      case 'table': return <Table2 className="h-4 w-4 text-green-400" />;
      case 'view': return <FileCode className="h-4 w-4 text-purple-400" />;
      case 'procedure': return <Code className="h-4 w-4 text-orange-400" />;
      case 'column': return node.isPrimaryKey 
        ? <Key className="h-3 w-3 text-yellow-400" />
        : <div className="w-3 h-3 rounded-full border border-gray-500 bg-gray-700" />;
      default: return null;
    }
  };

  const renderTreeNode = (node: TreeNode, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = node.expanded;

    return (
      <div key={node.id}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
            'flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-gray-800 rounded text-sm',
            selectedNode?.id === node.id && 'bg-blue-900/30 border-l-2 border-blue-400'
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            if (hasChildren) toggleNode(node.id);
            selectNode(node);
          }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-3 w-3 text-gray-500" />
            ) : (
              <ChevronRight className="h-3 w-3 text-gray-500" />
            )
          ) : (
            <span className="w-3" />
          )}
          {getNodeIcon(node)}
          <span className="text-gray-300">{node.name}</span>
          {node.dataType && (
            <span className="text-xs text-gray-500 ml-2">({node.dataType})</span>
          )}
        </motion.div>
        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              {node.children!.map(child => renderTreeNode(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <Card className="my-4 overflow-hidden bg-gray-950 border-gray-800">
      <CardHeader className="pb-2 flex flex-row items-center justify-between bg-gray-900/50">
        <CardTitle className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <Server className="h-4 w-4 text-red-400" />
          {title}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={reset} className="text-gray-400 hover:text-white">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Beginner Analogy */}
        {mode === 'beginner' && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
            <h4 className="font-medium text-red-300 mb-2">🏢 SQL Server as an Office Building</h4>
            <p className="text-sm text-gray-400">
              Think of SQL Server as an office building. The <strong>server</strong> is the building itself, 
              <strong> databases</strong> are different floors, <strong>tables</strong> are filing cabinets on each floor, 
              and <strong>columns</strong> are the labels on each drawer.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-800 pb-2">
          {[
            { id: 'explorer', label: 'Object Explorer', icon: <Database className="h-3 w-3" /> },
            { id: 'datatypes', label: 'Data Types', icon: <Settings className="h-3 w-3" /> },
            { id: 'connection', label: 'Connection Strings', icon: <Terminal className="h-3 w-3" /> },
          ].map(tab => (
            <Button
              key={tab.id}
              size="sm"
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              className={cn(
                'text-xs flex items-center gap-1',
                activeTab === tab.id && 'bg-gray-800'
              )}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Explorer Tab */}
        {activeTab === 'explorer' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tree View */}
            <div className="border border-gray-700 rounded-lg bg-gray-900/50 overflow-hidden">
              <div className="px-3 py-2 bg-gray-800/50 border-b border-gray-700 text-xs font-medium text-gray-400">
                Object Explorer
              </div>
              <div className="p-2 max-h-64 overflow-y-auto">
                {renderTreeNode(tree)}
              </div>
            </div>

            {/* Details Panel */}
            <div className="border border-gray-700 rounded-lg bg-gray-900/50 overflow-hidden">
              <div className="px-3 py-2 bg-gray-800/50 border-b border-gray-700 text-xs font-medium text-gray-400">
                Details
              </div>
              <div className="p-3">
                {selectedNode ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {getNodeIcon(selectedNode)}
                      <span className="text-gray-200 font-medium">{selectedNode.name}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Type: <span className="text-gray-300">{selectedNode.type}</span>
                    </div>
                    {selectedNode.dataType && (
                      <div className="text-xs text-gray-500">
                        Data Type: <span className="text-cyan-400">{selectedNode.dataType}</span>
                      </div>
                    )}
                    {selectedNode.isPrimaryKey && (
                      <div className="text-xs text-yellow-400 flex items-center gap-1">
                        <Key className="h-3 w-3" /> Primary Key
                      </div>
                    )}
                    {selectedNode.type === 'table' && (
                      <Button size="sm" onClick={runSampleQuery} disabled={isRunningQuery} className="mt-2 bg-blue-600 hover:bg-blue-700">
                        <Play className="h-3 w-3 mr-1" />
                        {isRunningQuery ? 'Running...' : 'Query Table'}
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Select an object to view details</p>
                )}
              </div>
            </div>

            {/* Query Output */}
            {queryOutput.length > 0 && (
              <div className="md:col-span-2 border border-gray-700 rounded-lg bg-black p-3 font-mono text-xs">
                {queryOutput.map((line, i) => (
                  <div key={i} className="text-green-400">{line || '\u00A0'}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Data Types Tab */}
        {activeTab === 'datatypes' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-400">
              SQL Server provides a rich set of data types. Here are the most commonly used ones:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {dataTypes.map(dt => (
                <div key={dt.name} className="p-3 bg-gray-900 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-sm text-cyan-400">{dt.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-gray-800 rounded text-gray-400">{dt.category}</span>
                  </div>
                  <p className="text-xs text-gray-400">{dt.description}</p>
                  <p className="text-xs text-gray-500 mt-1">Example: <code className="text-green-400">{dt.example}</code></p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connection Strings Tab */}
        {activeTab === 'connection' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              Connection strings tell your .NET app how to connect to SQL Server:
            </p>
            
            <div className="space-y-3">
              <div className="bg-gray-900 rounded-lg border border-gray-700 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-400">Windows Authentication (Local)</span>
                  <Button size="sm" variant="ghost" onClick={() => copyConnectionString(connectionStringTemplate)}>
                    {copiedString ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap">{connectionStringTemplate}</pre>
              </div>

              {mode !== 'beginner' && (
                <div className="bg-gray-900 rounded-lg border border-gray-700 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-400">SQL Authentication (Azure)</span>
                    <Button size="sm" variant="ghost" onClick={() => copyConnectionString(connectionStringWithCredentials)}>
                      {copiedString ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                  <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap">{connectionStringWithCredentials}</pre>
                </div>
              )}

              {mode === 'advanced' && (
                <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-yellow-300 mb-2">🔐 Security Best Practices</h4>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Never hardcode credentials - use Azure Key Vault or User Secrets</li>
                    <li>• Use Managed Identity in Azure for passwordless auth</li>
                    <li>• Always enable encryption (Encrypt=True)</li>
                    <li>• Use connection pooling (enabled by default)</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SqlServerExplorer;
