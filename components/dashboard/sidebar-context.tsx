"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface SidebarData {
  isAdmin: boolean;
  usage: {
    iterations: { count: number; limit: number };
    interviews: { count: number; limit: number };
    plan: string;
    isByok: boolean;
  };
}

interface SidebarContextValue {
  data: SidebarData | null;
  isLoaded: boolean;
  updateData: (newData: SidebarData) => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SidebarData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const updateData = useCallback((newData: SidebarData) => {
    setData(prev => {
      // Only update if data actually changed
      if (!prev) {
        setIsLoaded(true);
        return newData;
      }
      
      const hasChanged = 
        prev.isAdmin !== newData.isAdmin ||
        prev.usage.iterations.count !== newData.usage.iterations.count ||
        prev.usage.iterations.limit !== newData.usage.iterations.limit ||
        prev.usage.interviews.count !== newData.usage.interviews.count ||
        prev.usage.interviews.limit !== newData.usage.interviews.limit ||
        prev.usage.plan !== newData.usage.plan ||
        prev.usage.isByok !== newData.usage.isByok;
      
      return hasChanged ? newData : prev;
    });
  }, []);

  return (
    <SidebarContext.Provider value={{ data, isLoaded, updateData }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarContext must be used within SidebarProvider");
  }
  return context;
}

// Hook for components that may be outside the provider (returns null safely)
export function useSidebarContextSafe() {
  return useContext(SidebarContext);
}
