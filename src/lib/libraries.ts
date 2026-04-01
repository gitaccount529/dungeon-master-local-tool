import fs from 'fs';
import path from 'path';
import { deepMerge } from './adventures';
import type {
  LibraryType, LibraryMonster, TreasureItem, LocationTemplate,
  ChallengeTemplate, AmbiancePreset, CharacterClass, LibraryParty,
} from './types';

// ═══════════════════════════════════════════
// Global Library File Utilities
// Server-side only — reads/writes JSON files in data/libraries/
// ═══════════════════════════════════════════

const LIBRARIES_DIR = path.join(process.cwd(), 'data', 'libraries');

type LibraryItemMap = {
  monsters: LibraryMonster;
  treasures: TreasureItem;
  locations: LocationTemplate;
  challenges: ChallengeTemplate;
  ambiance: AmbiancePreset;
  classes: CharacterClass;
  parties: LibraryParty;
};

export type LibraryItem<T extends LibraryType> = LibraryItemMap[T];

// ── Helpers ──

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJson(filePath: string, data: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function libraryFilePath(type: LibraryType): string {
  return path.join(LIBRARIES_DIR, `${type}.json`);
}

// ═══════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════

/** Ensure all library JSON files exist with empty arrays */
export function ensureLibraryFiles() {
  ensureDir(LIBRARIES_DIR);
  const types: LibraryType[] = ['monsters', 'treasures', 'locations', 'challenges', 'ambiance', 'classes', 'parties'];
  for (const type of types) {
    const fp = libraryFilePath(type);
    if (!fs.existsSync(fp)) {
      writeJson(fp, []);
    }
  }
}

/** Load all items from a library */
export function loadLibrary<T extends LibraryType>(type: T): LibraryItem<T>[] {
  ensureLibraryFiles();
  const fp = libraryFilePath(type);
  try {
    return readJson<LibraryItem<T>[]>(fp);
  } catch {
    return [];
  }
}

/** Search library items by query string and optional tags */
export function searchLibrary<T extends LibraryType>(
  type: T,
  query?: string,
  tags?: string[]
): LibraryItem<T>[] {
  let items = loadLibrary(type);

  if (query) {
    const q = query.toLowerCase();
    items = items.filter(item => {
      const searchable = `${(item as unknown as Record<string, unknown>).name} ${(item as unknown as Record<string, unknown>).description ?? ''}`.toLowerCase();
      return searchable.includes(q);
    });
  }

  if (tags && tags.length > 0) {
    items = items.filter(item => {
      const itemTags = (item as unknown as Record<string, unknown>).tags as string[] | undefined;
      return itemTags && tags.some(t => itemTags.includes(t));
    });
  }

  return items;
}

/** Add a new item to a library */
export function addLibraryItem<T extends LibraryType>(
  type: T,
  item: LibraryItem<T>
): LibraryItem<T> {
  const items = loadLibrary(type);
  items.push(item);
  writeJson(libraryFilePath(type), items);
  return item;
}

/** Patch an existing item by ID (deep merge) */
export function patchLibraryItem<T extends LibraryType>(
  type: T,
  itemId: string,
  updates: Record<string, unknown>
): LibraryItem<T> | null {
  const items = loadLibrary(type);
  const idx = items.findIndex(i => (i as unknown as Record<string, unknown>).id === itemId);
  if (idx === -1) return null;

  const current = items[idx] as unknown as Record<string, unknown>;
  deepMerge(current, updates);
  items[idx] = current as unknown as LibraryItem<T>;
  writeJson(libraryFilePath(type), items);
  return items[idx];
}

/** Delete an item from a library */
export function deleteLibraryItem(type: LibraryType, itemId: string): boolean {
  const items = loadLibrary(type);
  const filtered = items.filter(i => (i as unknown as Record<string, unknown>).id !== itemId);
  if (filtered.length === items.length) return false;
  writeJson(libraryFilePath(type), filtered);
  return true;
}

/** Bulk import items into a library */
export function bulkImportLibrary<T extends LibraryType>(
  type: T,
  newItems: LibraryItem<T>[]
): number {
  const items = loadLibrary(type);
  const existingIds = new Set(items.map(i => (i as unknown as Record<string, unknown>).id as string));
  let imported = 0;
  for (const item of newItems) {
    const id = (item as unknown as Record<string, unknown>).id as string;
    if (!existingIds.has(id)) {
      items.push(item);
      existingIds.add(id);
      imported++;
    }
  }
  writeJson(libraryFilePath(type), items);
  return imported;
}

/** Import a library item into an adventure's corresponding data file */
export function importToAdventure<T extends LibraryType>(
  type: T,
  itemId: string,
  adventureSlug: string
): boolean {
  const items = loadLibrary(type);
  const item = items.find(i => (i as unknown as Record<string, unknown>).id === itemId);
  if (!item) return false;

  // Strip library metadata fields
  const cleaned = { ...(item as unknown as Record<string, unknown>) };
  delete cleaned.source;
  delete cleaned.tags;
  delete cleaned.sourceBook;

  // Map library type → adventure file
  const fileMap: Record<LibraryType, string> = {
    monsters: 'monsters.json',
    treasures: 'monsters.json', // treasures don't have their own file yet — add to monsters for now
    locations: 'zones.json',
    challenges: 'scenes.json',
    ambiance: 'zones.json', // ambiance presets applied to zones
    classes: 'party.json', // class info linked to party members
    parties: 'party.json',
  };

  const advDir = path.join(process.cwd(), 'data', 'adventures', adventureSlug);
  const targetFile = path.join(advDir, fileMap[type]);

  if (!fs.existsSync(targetFile)) return false;

  if (type === 'monsters') {
    // Append to monsters array
    const monsters = readJson<Record<string, unknown>[]>(targetFile);
    const exists = monsters.some(m => m.id === cleaned.id);
    if (!exists) {
      monsters.push(cleaned);
      writeJson(targetFile, monsters);
    }
    return true;
  }

  if (type === 'challenges') {
    // Append to scenes array
    const scenes = readJson<Record<string, unknown>[]>(targetFile);
    const exists = scenes.some(s => s.id === cleaned.id);
    if (!exists) {
      scenes.push(cleaned);
      writeJson(targetFile, scenes);
    }
    return true;
  }

  // For locations and ambiance — these need more complex handling
  // (locations become zones, ambiance presets get applied to zones)
  // For now, return the data and let the UI handle placement
  return true;
}
