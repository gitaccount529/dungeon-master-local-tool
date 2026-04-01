'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  Adventure,
  Zone,
  Monster,
  NPC,
  Scene,
  ImprovData,
  GalleryImage,
  LootEntry,
  Handout,
  ReadAloudText,
} from '@/lib/types';

// ═══════════════════════════════════════════
// Adventure Data Types
// ═══════════════════════════════════════════

export interface ZonesData {
  travelSection: Zone;
  zoneOverview: Zone;
  zones: Zone[];
}

export interface AdventureData {
  adventure: Adventure;
  zones: ZonesData;
  monsters: Monster[];
  npcs: NPC[];
  scenes: Scene[];
  improv: ImprovData;
  images: GalleryImage[];
  loot: LootEntry[];
  handouts: Handout[];
}

export interface UseAdventureReturn {
  data: AdventureData | null;
  loading: boolean;
  error: string | null;
  slug: string | null;
  refetch: () => void;
  // Patch methods for inline editing
  patchAdventure: (updates: Partial<Adventure>) => Promise<void>;
  patchZone: (zoneId: string, updates: Partial<Zone>) => Promise<void>;
  patchMonster: (monsterId: string, updates: Partial<Monster>) => Promise<void>;
  patchNpc: (npcId: string, updates: Partial<NPC>) => Promise<void>;
  patchScene: (sceneId: string, updates: Partial<Scene>) => Promise<void>;
  patchImage: (imageId: string, updates: Partial<GalleryImage>) => Promise<void>;
  addImage: (file: File, title?: string, description?: string) => Promise<GalleryImage | null>;
  deleteImage: (imageId: string) => Promise<void>;
  replaceImage: (imageId: string, file: File) => Promise<void>;
  // Loot & Handout methods
  setLoot: (loot: LootEntry[]) => Promise<void>;
  setHandouts: (handouts: Handout[]) => Promise<void>;
  // Image URL resolver
  resolveImageUrl: (relativePath: string) => string;
}

// ═══════════════════════════════════════════
// Image URL resolver
// ═══════════════════════════════════════════

// Cache-buster increments when images are updated via the edit UI
let imageCacheBuster = Date.now();
export function bustImageCache() { imageCacheBuster = Date.now(); }

export function makeImageResolver(slug: string | null) {
  return (relativePath: string): string => {
    if (!slug || !relativePath) return '';
    // If it's already an absolute URL or API path, return as-is
    if (relativePath.startsWith('http') || relativePath.startsWith('/api/')) return relativePath;
    // Strip leading /images/ if present (legacy format)
    const cleaned = relativePath.replace(/^\/images\//, '');
    return `/api/adventures/${slug}/images/file/${cleaned}?v=${imageCacheBuster}`;
  };
}

// ═══════════════════════════════════════════
// useAdventure Hook
// ═══════════════════════════════════════════

export function useAdventure(slug: string | null): UseAdventureReturn {
  const [data, setData] = useState<AdventureData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchRef = useRef(0);

  const fetchData = useCallback(async () => {
    if (!slug) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchId = ++fetchRef.current;
    setLoading(true);
    setError(null);

    try {
      const base = `/api/adventures/${slug}`;
      const [adventure, zones, monsters, npcs, scenes, improv, images, loot, handouts] = await Promise.all([
        fetch(base).then(r => r.ok ? r.json() : Promise.reject(`Adventure not found: ${slug}`)),
        fetch(`${base}/zones`).then(r => r.json()),
        fetch(`${base}/monsters`).then(r => r.json()),
        fetch(`${base}/npcs`).then(r => r.json()),
        fetch(`${base}/scenes`).then(r => r.json()),
        fetch(`${base}/improv`).then(r => r.json()),
        fetch(`${base}/images`).then(r => r.json()),
        fetch(`${base}/loot`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${base}/handouts`).then(r => r.ok ? r.json() : []).catch(() => []),
      ]);

      // Only update if this is still the latest fetch
      if (fetchId === fetchRef.current) {
        setData({ adventure, zones, monsters, npcs, scenes, improv, images, loot, handouts });
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
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Patch helpers with optimistic updates ──

  const patchAdventure = useCallback(async (updates: Partial<Adventure>) => {
    if (!slug || !data) return;
    setData(prev => prev ? {
      ...prev,
      adventure: { ...prev.adventure, ...updates },
    } : prev);
    await fetch(`/api/adventures/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  }, [slug, data]);

  const patchZone = useCallback(async (zoneId: string, updates: Partial<Zone>) => {
    if (!slug || !data) return;

    // Optimistic update
    setData(prev => {
      if (!prev) return prev;
      const newZones = { ...prev.zones };
      if (newZones.travelSection?.id === zoneId) {
        newZones.travelSection = { ...newZones.travelSection, ...updates } as Zone;
      } else if (newZones.zoneOverview?.id === zoneId) {
        newZones.zoneOverview = { ...newZones.zoneOverview, ...updates } as Zone;
      } else {
        newZones.zones = newZones.zones.map(z =>
          z.id === zoneId ? { ...z, ...updates } : z
        );
      }
      return { ...prev, zones: newZones };
    });

    // Persist to server
    await fetch(`/api/adventures/${slug}/zones/${zoneId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  }, [slug, data]);

  const patchMonster = useCallback(async (monsterId: string, updates: Partial<Monster>) => {
    if (!slug || !data) return;
    setData(prev => prev ? {
      ...prev,
      monsters: prev.monsters.map(m => m.id === monsterId ? { ...m, ...updates } : m),
    } : prev);
    await fetch(`/api/adventures/${slug}/monsters/${monsterId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  }, [slug, data]);

  const patchNpc = useCallback(async (npcId: string, updates: Partial<NPC>) => {
    if (!slug || !data) return;
    setData(prev => prev ? {
      ...prev,
      npcs: prev.npcs.map(n => n.id === npcId ? { ...n, ...updates } : n),
    } : prev);
    await fetch(`/api/adventures/${slug}/npcs/${npcId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  }, [slug, data]);

  const patchScene = useCallback(async (sceneId: string, updates: Partial<Scene>) => {
    if (!slug || !data) return;
    setData(prev => prev ? {
      ...prev,
      scenes: prev.scenes.map(s => s.id === sceneId ? { ...s, ...updates } : s),
    } : prev);
    await fetch(`/api/adventures/${slug}/scenes/${sceneId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  }, [slug, data]);

  const patchImage = useCallback(async (imageId: string, updates: Partial<GalleryImage>) => {
    if (!slug || !data) return;
    bustImageCache(); // Force browser to re-fetch images
    setData(prev => prev ? {
      ...prev,
      images: prev.images.map(i => i.id === imageId ? { ...i, ...updates } : i),
    } : prev);
    await fetch(`/api/adventures/${slug}/images/${imageId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  }, [slug, data]);

  const addImage = useCallback(async (file: File, title?: string, description?: string): Promise<GalleryImage | null> => {
    if (!slug) return null;
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (description) formData.append('description', description);

    const res = await fetch(`/api/adventures/${slug}/images`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) return null;
    const newImage = await res.json() as GalleryImage;
    bustImageCache();
    setData(prev => prev ? { ...prev, images: [...prev.images, newImage] } : prev);
    return newImage;
  }, [slug]);

  const deleteImage = useCallback(async (imageId: string) => {
    if (!slug) return;
    setData(prev => prev ? { ...prev, images: prev.images.filter(i => i.id !== imageId) } : prev);
    await fetch(`/api/adventures/${slug}/images/${imageId}`, { method: 'DELETE' });
  }, [slug]);

  const replaceImage = useCallback(async (imageId: string, file: File) => {
    if (!slug) return;
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`/api/adventures/${slug}/images/${imageId}/replace`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) return;
    const updated = await res.json() as GalleryImage;
    bustImageCache();
    setData(prev => prev ? {
      ...prev,
      images: prev.images.map(i => i.id === imageId ? updated : i),
    } : prev);
  }, [slug]);

  const setLoot = useCallback(async (loot: LootEntry[]) => {
    if (!slug) return;
    setData(prev => prev ? { ...prev, loot } : prev);
    await fetch(`/api/adventures/${slug}/loot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loot),
    });
  }, [slug]);

  const setHandouts = useCallback(async (handouts: Handout[]) => {
    if (!slug) return;
    setData(prev => prev ? { ...prev, handouts } : prev);
    await fetch(`/api/adventures/${slug}/handouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(handouts),
    });
  }, [slug]);

  const resolveImageUrl = useCallback(
    makeImageResolver(slug),
    [slug]
  );

  return {
    data,
    loading,
    error,
    slug,
    refetch: fetchData,
    patchAdventure,
    patchZone,
    patchMonster,
    patchNpc,
    patchScene,
    patchImage,
    addImage,
    deleteImage,
    replaceImage,
    setLoot,
    setHandouts,
    resolveImageUrl,
  };
}
