'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { LibraryType } from '@/lib/types';

// ═══════════════════════════════════════════
// Library Hook Types
// ═══════════════════════════════════════════

export interface UseLibraryReturn<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  searchTags: string[];
  setSearch: (query: string, tags?: string[]) => void;
  addItem: (item: T) => Promise<void>;
  patchItem: (id: string, updates: Partial<T>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  importToAdventure: (id: string, adventureSlug: string) => Promise<void>;
  bulkImport: (items: T[]) => Promise<number>;
  refetch: () => void;
}

// ═══════════════════════════════════════════
// useLibrary Hook
// ═══════════════════════════════════════════

export function useLibrary<T extends { id: string }>(type: LibraryType): UseLibraryReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const fetchRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchItems = useCallback(async (query: string, tags: string[]) => {
    const fetchId = ++fetchRef.current;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (tags.length > 0) params.set('tags', tags.join(','));
      const qs = params.toString();
      const url = `/api/libraries/${type}${qs ? `?${qs}` : ''}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch ${type}: ${res.statusText}`);
      const data = await res.json();

      // Only update if this is still the latest fetch
      if (fetchId === fetchRef.current) {
        setItems(data);
        setError(null);
      }
    } catch (err) {
      if (fetchId === fetchRef.current) {
        setError(err instanceof Error ? err.message : String(err));
      }
    } finally {
      if (fetchId === fetchRef.current) {
        setLoading(false);
      }
    }
  }, [type]);

  // Initial fetch
  useEffect(() => {
    fetchItems(searchQuery, searchTags);
  }, [fetchItems, searchQuery, searchTags]);

  const setSearch = useCallback((query: string, tags?: string[]) => {
    // Debounce search by 300ms
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(query);
      if (tags !== undefined) setSearchTags(tags);
    }, 300);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const refetch = useCallback(() => {
    fetchItems(searchQuery, searchTags);
  }, [fetchItems, searchQuery, searchTags]);

  // ── Mutations with optimistic updates ──

  const addItem = useCallback(async (item: T) => {
    // Optimistic push
    setItems(prev => [...prev, item]);

    try {
      const res = await fetch(`/api/libraries/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error(`Failed to add item: ${res.statusText}`);
      // Replace optimistic item with server response
      const saved = await res.json();
      setItems(prev => prev.map(i => i.id === item.id ? saved : i));
    } catch (err) {
      // Rollback optimistic update
      setItems(prev => prev.filter(i => i.id !== item.id));
      throw err;
    }
  }, [type]);

  const patchItem = useCallback(async (id: string, updates: Partial<T>) => {
    // Optimistic update
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));

    try {
      const res = await fetch(`/api/libraries/${type}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error(`Failed to update item: ${res.statusText}`);
    } catch (err) {
      // Rollback: refetch on error
      refetch();
      throw err;
    }
  }, [type, refetch]);

  const deleteItem = useCallback(async (id: string) => {
    // Optimistic filter
    const prevItems = items;
    setItems(prev => prev.filter(i => i.id !== id));

    try {
      const res = await fetch(`/api/libraries/${type}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`Failed to delete item: ${res.statusText}`);
    } catch (err) {
      // Rollback optimistic update
      setItems(prevItems);
      throw err;
    }
  }, [type, items]);

  const importToAdventure = useCallback(async (id: string, adventureSlug: string) => {
    const res = await fetch(`/api/libraries/${type}/${id}/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: adventureSlug }),
    });
    if (!res.ok) throw new Error(`Failed to import item: ${res.statusText}`);
  }, [type]);

  const bulkImport = useCallback(async (newItems: T[]): Promise<number> => {
    const res = await fetch(`/api/libraries/${type}/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItems),
    });
    if (!res.ok) throw new Error(`Failed to bulk import: ${res.statusText}`);
    const result = await res.json();
    // Refetch to get the updated list
    refetch();
    return result.count ?? newItems.length;
  }, [type, refetch]);

  return {
    items,
    loading,
    error,
    searchQuery,
    searchTags,
    setSearch,
    addItem,
    patchItem,
    deleteItem,
    importToAdventure,
    bulkImport,
    refetch,
  };
}
