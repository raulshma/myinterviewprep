'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Trash2, Edit2 } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  periodStart: string;
  periodEnd: string;
}

interface HistoryProduct extends Product {
  historyId: string;
}

export const TemporalTablesIntro: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<number>(1);
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: 'Laptop', price: 999, periodStart: 'T1', periodEnd: 'Max' },
    { id: 2, name: 'Mouse', price: 25, periodStart: 'T1', periodEnd: 'Max' },
  ]);
  const [history, setHistory] = useState<HistoryProduct[]>([]);

  const advanceTime = () => `T${currentTime + 1}`;

  const updatePrice = (id: number) => {
    const time = advanceTime();
    setCurrentTime((t) => t + 1);

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          // Add old version to history
          const historyItem: HistoryProduct = {
            ...p,
            historyId: `${p.id}-${currentTime}`, // unique key
            periodEnd: time,
          };
          setHistory((h) => [historyItem, ...h]);

          // Update current version
          return {
            ...p,
            price: Math.floor(p.price * 1.1), // Increase price by 10%
            periodStart: time,
          };
        }
        return p;
      })
    );
  };

  const deleteProduct = (id: number) => {
    const time = advanceTime();
    setCurrentTime((t) => t + 1);

    const product = products.find((p) => p.id === id);
    if (product) {
      // Add to history
      const historyItem: HistoryProduct = {
        ...product,
        historyId: `${product.id}-${currentTime}`,
        periodEnd: time,
      };
      setHistory((h) => [historyItem, ...h]);

      // Remove from current
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const reset = () => {
    setCurrentTime(1);
    setProducts([
      { id: 1, name: 'Laptop', price: 999, periodStart: 'T1', periodEnd: 'Max' },
      { id: 2, name: 'Mouse', price: 25, periodStart: 'T1', periodEnd: 'Max' },
    ]);
    setHistory([]);
  };

  return (
    <div className="space-y-6 my-8">
      <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
        <div className="text-sm font-medium">
          Current DB Transaction Time: <Badge variant="outline" className="ml-2 font-mono">T{currentTime}</Badge>
        </div>
        <Button size="sm" variant="ghost" onClick={reset} className="text-muted-foreground hover:text-foreground">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset Demo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Table */}
        <Card className="border-blue-500/20 shadow-sm overflow-hidden">
          <CardHeader className="bg-blue-500/10 pb-3">
            <CardTitle className="text-blue-600 dark:text-blue-400 text-base flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Current Table (Products)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="p-3 font-medium">ID</th>
                    <th className="p-3 font-medium">Name</th>
                    <th className="p-3 font-medium">Price</th>
                    <th className="p-3 font-medium text-xs text-muted-foreground">Start</th>
                    <th className="p-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode='popLayout'>
                    {products.map((p) => (
                      <motion.tr
                        key={p.id}
                        layoutId={`row-${p.id}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-3 font-mono text-xs">{p.id}</td>
                        <td className="p-3 font-medium">{p.name}</td>
                        <td className="p-3 text-green-600 dark:text-green-400 font-mono">${p.price}</td>
                        <td className="p-3 text-xs font-mono text-muted-foreground">{p.periodStart}</td>
                        <td className="p-3 text-right space-x-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => updatePrice(p.id)}
                            title="Update Price"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => deleteProduct(p.id)}
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground text-sm">
                        All items deleted. Check History!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* History Table */}
        <Card className="border-amber-500/20 shadow-sm overflow-hidden bg-amber-50/30 dark:bg-amber-950/10">
          <CardHeader className="bg-amber-500/10 pb-3">
            <CardTitle className="text-amber-600 dark:text-amber-500 text-base flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              History Table (ProductsHistory)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm opacity-90">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="p-3 font-medium">ID</th>
                    <th className="p-3 font-medium">Name</th>
                    <th className="p-3 font-medium">Price</th>
                    <th className="p-3 font-medium text-xs text-muted-foreground">Start</th>
                    <th className="p-3 font-medium text-xs text-muted-foreground">End</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {history.map((h) => (
                      <motion.tr
                        key={h.historyId}
                        initial={{ opacity: 0, height: 0, backgroundColor: "rgba(245, 158, 11, 0.2)" }}
                        animate={{ opacity: 1, height: "auto", backgroundColor: "transparent" }}
                        transition={{ duration: 0.5 }}
                        className="border-b last:border-0"
                      >
                        <td className="p-3 font-mono text-xs text-muted-foreground">{h.id}</td>
                        <td className="p-3 text-muted-foreground">{h.name}</td>
                        <td className="p-3 text-muted-foreground font-mono strike-through decorations-destructive/50">${h.price}</td>
                        <td className="p-3 text-xs font-mono text-muted-foreground">{h.periodStart}</td>
                        <td className="p-3 text-xs font-mono font-bold text-amber-600 dark:text-amber-500">{h.periodEnd}</td>
                      </motion.tr>
                    ))}
                    {history.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground text-sm italic">
                          No history yet. Update or delete items to see records move here.
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
