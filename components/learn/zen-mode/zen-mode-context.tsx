'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

interface AdjacentLesson {
  lessonPath: string;
  title: string;
  milestone: string;
}

interface ZenModeContextValue {
  isZenMode: boolean;
  enterZenMode: () => void;
  exitZenMode: () => void;
  toggleZenMode: () => void;
  previousLesson: AdjacentLesson | null;
  nextLesson: AdjacentLesson | null;
  setAdjacentLessons: (prev: AdjacentLesson | null, next: AdjacentLesson | null) => void;
}

const ZenModeContext = createContext<ZenModeContextValue | null>(null);

export function useZenMode() {
  const context = useContext(ZenModeContext);
  if (!context) {
    throw new Error('useZenMode must be used within a ZenModeProvider');
  }
  return context;
}

interface ZenModeProviderProps {
  children: ReactNode;
}

export function ZenModeProvider({ children }: ZenModeProviderProps) {
  const [isZenMode, setIsZenMode] = useState(false);
  const [previousLesson, setPreviousLesson] = useState<AdjacentLesson | null>(null);
  const [nextLesson, setNextLesson] = useState<AdjacentLesson | null>(null);

  const enterZenMode = useCallback(() => {
    setIsZenMode(true);
    // Request fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        // Fullscreen might be blocked, zen mode still works
      });
    }
  }, []);

  const exitZenMode = useCallback(() => {
    setIsZenMode(false);
    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const toggleZenMode = useCallback(() => {
    if (isZenMode) {
      exitZenMode();
    } else {
      enterZenMode();
    }
  }, [isZenMode, enterZenMode, exitZenMode]);

  const setAdjacentLessons = useCallback((prev: AdjacentLesson | null, next: AdjacentLesson | null) => {
    setPreviousLesson(prev);
    setNextLesson(next);
  }, []);

  // Handle escape key and fullscreen change
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZenMode) {
        exitZenMode();
        // Remove zen=true from URL to prevent re-entering
        const url = new URL(window.location.href);
        url.searchParams.delete('zen');
        window.history.replaceState(null, '', url.toString());
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isZenMode) {
        setIsZenMode(false);
        // Remove zen=true from URL to prevent re-entering
        const url = new URL(window.location.href);
        url.searchParams.delete('zen');
        window.history.replaceState(null, '', url.toString());
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isZenMode, exitZenMode]);

  // Prevent body scroll and hide sidebar when in zen mode
  useEffect(() => {
    if (isZenMode) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('zen-mode-active');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('zen-mode-active');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('zen-mode-active');
    };
  }, [isZenMode]);

  return (
    <ZenModeContext.Provider
      value={{
        isZenMode,
        enterZenMode,
        exitZenMode,
        toggleZenMode,
        previousLesson,
        nextLesson,
        setAdjacentLessons,
      }}
    >
      {children}
    </ZenModeContext.Provider>
  );
}
