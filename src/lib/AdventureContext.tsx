'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAdventure, type AdventureData, type UseAdventureReturn } from '@/hooks/useAdventure';
import type { Adventure } from '@/lib/types';

// ═══════════════════════════════════════════
// Adventure Context
// Provides adventure data + management to the entire app
// ═══════════════════════════════════════════

interface AdventureContextValue extends UseAdventureReturn {
  // Adventure management
  activeSlug: string | null;
  setActiveAdventure: (slug: string | null) => void;
  adventures: Adventure[];
  adventuresLoading: boolean;
  refreshAdventures: () => void;
  deleteAdventure: (slug: string) => Promise<boolean>;
}

const AdventureContext = createContext<AdventureContextValue | null>(null);

// ── Hook for consuming adventure data ──
export function useAdventureContext(): AdventureContextValue {
  const ctx = useContext(AdventureContext);
  if (!ctx) {
    throw new Error('useAdventureContext must be used within an AdventureProvider');
  }
  return ctx;
}

// ── Optional hook that returns null outside provider (for shared components) ──
export function useOptionalAdventureContext(): AdventureContextValue | null {
  return useContext(AdventureContext);
}

// ── Provider ──
export function AdventureProvider({ children }: { children: ReactNode }) {
  const [activeSlug, setActiveSlugState] = useState<string | null>(null);
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [adventuresLoading, setAdventuresLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Load the active adventure slug from session state on mount
  useEffect(() => {
    async function loadInitial() {
      try {
        // Load active adventure from session
        const sessionRes = await fetch('/api/session?key=active_adventure');
        if (sessionRes.ok) {
          const { value } = await sessionRes.json();
          if (value) {
            setActiveSlugState(value);
          }
        }

        // Load adventure list
        const adventuresRes = await fetch('/api/adventures');
        if (adventuresRes.ok) {
          const list = await adventuresRes.json();
          setAdventures(list);
          // If no active adventure but adventures exist, auto-select the first one
          const sessionCheck = await fetch('/api/session?key=active_adventure');
          const { value: currentActive } = sessionCheck.ok ? await sessionCheck.json() : { value: null };
          if (!currentActive && list.length > 0) {
            setActiveSlugState(list[0].id);
            await fetch('/api/session', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ key: 'active_adventure', value: list[0].id }),
            });
          }
        }
      } catch (err) {
        console.error('Failed to load initial adventure state:', err);
      } finally {
        setAdventuresLoading(false);
        setInitialLoadDone(true);
      }
    }
    loadInitial();
  }, []);

  // Set active adventure and persist to session
  const setActiveAdventure = useCallback(async (slug: string | null) => {
    setActiveSlugState(slug);
    await fetch('/api/session', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'active_adventure', value: slug ?? '' }),
    });
  }, []);

  // Refresh adventures list
  const refreshAdventures = useCallback(async () => {
    setAdventuresLoading(true);
    try {
      const res = await fetch('/api/adventures');
      if (res.ok) {
        setAdventures(await res.json());
      }
    } finally {
      setAdventuresLoading(false);
    }
  }, []);

  // Delete an adventure
  const deleteAdventure = useCallback(async (slug: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/adventures/${slug}`, { method: 'DELETE' });
      if (!res.ok) return false;
      // If we deleted the active adventure, switch away
      if (slug === activeSlug) {
        const remaining = adventures.filter(a => a.id !== slug);
        const next = remaining.length > 0 ? remaining[0].id : null;
        await setActiveAdventure(next);
      }
      setAdventures(prev => prev.filter(a => a.id !== slug));
      return true;
    } catch {
      return false;
    }
  }, [activeSlug, adventures, setActiveAdventure]);

  // Load adventure data via the hook
  const adventureHook = useAdventure(initialLoadDone ? activeSlug : null);

  const value: AdventureContextValue = {
    ...adventureHook,
    activeSlug,
    setActiveAdventure,
    adventures,
    adventuresLoading,
    refreshAdventures,
    deleteAdventure,
  };

  return (
    <AdventureContext.Provider value={value}>
      {children}
    </AdventureContext.Provider>
  );
}
