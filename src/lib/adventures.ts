import fs from 'fs';
import path from 'path';
import type { Adventure, Zone, Monster, NPC, Scene, ImprovData, GalleryImage, LootEntry, Handout } from './types';

// ═══════════════════════════════════════════
// Adventure File Utilities
// Server-side only — reads/writes JSON files
// ═══════════════════════════════════════════

const ADVENTURES_DIR = path.join(process.cwd(), 'data', 'adventures');

export interface ZonesFileData {
  travelSection: Zone | null;
  zoneOverview: Zone | null;
  zones: Zone[];
}

export interface AdventureDataBundle {
  adventure: Adventure;
  zones: ZonesFileData;
  monsters: Monster[];
  npcs: NPC[];
  scenes: Scene[];
  improv: ImprovData;
  images: GalleryImage[];
  loot: LootEntry[];
  handouts: Handout[];
}

// ── Ensure directory exists ──
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ── Read a JSON file ──
function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// ── Read a JSON file with fallback (for optional files) ──
function readJsonSafe<T>(filePath: string, fallback: T): T {
  if (!fs.existsSync(filePath)) return fallback;
  try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')); } catch { return fallback; }
}

// ── Write a JSON file ──
function writeJson(filePath: string, data: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ── Deep merge (for PATCH operations) ──
export function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = target[key];
    if (sv && typeof sv === 'object' && !Array.isArray(sv) && tv && typeof tv === 'object' && !Array.isArray(tv)) {
      deepMerge(tv as Record<string, unknown>, sv as Record<string, unknown>);
    } else {
      target[key] = sv;
    }
  }
  return target;
}

// ═══════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════

/** List all adventures (reads adventure.json from each subdirectory) */
export function listAdventures(): Adventure[] {
  ensureDir(ADVENTURES_DIR);
  const entries = fs.readdirSync(ADVENTURES_DIR, { withFileTypes: true });
  const adventures: Adventure[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const metaPath = path.join(ADVENTURES_DIR, entry.name, 'adventure.json');
    if (fs.existsSync(metaPath)) {
      try {
        adventures.push(readJson<Adventure>(metaPath));
      } catch { /* skip malformed */ }
    }
  }
  return adventures.sort((a, b) => a.name.localeCompare(b.name));
}

/** Load all data for an adventure */
export function loadAdventureData(slug: string): AdventureDataBundle {
  const dir = path.join(ADVENTURES_DIR, slug);
  return {
    adventure: readJson<Adventure>(path.join(dir, 'adventure.json')),
    zones: readJson<ZonesFileData>(path.join(dir, 'zones.json')),
    monsters: readJson<Monster[]>(path.join(dir, 'monsters.json')),
    npcs: readJson<NPC[]>(path.join(dir, 'npcs.json')),
    scenes: readJson<Scene[]>(path.join(dir, 'scenes.json')),
    improv: readJson<ImprovData>(path.join(dir, 'improv.json')),
    images: readJson<GalleryImage[]>(path.join(dir, 'images.json')),
    loot: readJsonSafe<LootEntry[]>(path.join(dir, 'loot.json'), []),
    handouts: readJsonSafe<Handout[]>(path.join(dir, 'handouts.json'), []),
  };
}

/** Load a single JSON file for an adventure */
export function loadAdventureFile<T>(slug: string, file: string): T {
  return readJson<T>(path.join(ADVENTURES_DIR, slug, `${file}.json`));
}

/** Patch a single item in a JSON array file (monsters.json, npcs.json, scenes.json, images.json) */
export function patchAdventureItem(
  slug: string,
  file: string,
  itemId: string,
  updates: Record<string, unknown>
): unknown {
  const filePath = path.join(ADVENTURES_DIR, slug, `${file}.json`);
  const data = readJson<Array<Record<string, unknown>>>(filePath);
  const idx = data.findIndex((item) => item.id === itemId);
  if (idx === -1) return null;
  deepMerge(data[idx], updates);
  writeJson(filePath, data);
  return data[idx];
}

/** Patch a zone (handles travelSection, zoneOverview, or zones[] array) */
export function patchZone(
  slug: string,
  zoneId: string,
  updates: Record<string, unknown>
): unknown {
  const filePath = path.join(ADVENTURES_DIR, slug, 'zones.json');
  const data = readJson<ZonesFileData>(filePath);

  let target: Record<string, unknown> | null = null;
  if (data.travelSection && (data.travelSection as unknown as Record<string, unknown>).id === zoneId) {
    target = data.travelSection as unknown as Record<string, unknown>;
  } else if (data.zoneOverview && (data.zoneOverview as unknown as Record<string, unknown>).id === zoneId) {
    target = data.zoneOverview as unknown as Record<string, unknown>;
  } else {
    const zone = data.zones.find(z => z.id === zoneId);
    if (zone) target = zone as unknown as Record<string, unknown>;
  }

  if (!target) return null;
  deepMerge(target, updates);
  writeJson(filePath, data);
  return target;
}

/** Create a new adventure with skeleton files */
export function createAdventure(id: string, name: string, description: string): Adventure {
  const dir = path.join(ADVENTURES_DIR, id);
  ensureDir(dir);
  ensureDir(path.join(dir, 'images', 'monsters'));
  ensureDir(path.join(dir, 'images', 'scenes'));
  ensureDir(path.join(dir, 'images', 'gallery'));
  ensureDir(path.join(dir, 'reference'));

  const words = name.split(/\s+/);
  const adventure: Adventure = {
    id,
    name,
    description,
    headerTitle: {
      primary: (words[0] || name).toUpperCase(),
      secondary: words.slice(1).join(' ').toUpperCase() || '',
    },
    referencePdf: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  writeJson(path.join(dir, 'adventure.json'), adventure);
  writeJson(path.join(dir, 'zones.json'), { travelSection: null, zoneOverview: null, zones: [] });
  writeJson(path.join(dir, 'monsters.json'), []);
  writeJson(path.join(dir, 'npcs.json'), []);
  writeJson(path.join(dir, 'scenes.json'), []);
  writeJson(path.join(dir, 'improv.json'), { giantNames: [], personalityQuirks: [], battleCries: [], environmentalEvents: [], flavorText: [] });
  writeJson(path.join(dir, 'images.json'), []);
  writeJson(path.join(dir, 'loot.json'), []);
  writeJson(path.join(dir, 'handouts.json'), []);

  return adventure;
}

/** Resolve an adventure-relative image path to an API URL */
export function resolveImageUrl(slug: string, relativePath: string): string {
  if (!relativePath) return '';
  if (relativePath.startsWith('http') || relativePath.startsWith('/api/')) return relativePath;
  const cleaned = relativePath.replace(/^\/images\//, '');
  return `/api/adventures/${slug}/images/file/${cleaned}`;
}

/** Get the filesystem path for an adventure's image */
export function getAdventureImagePath(slug: string, relativePath: string): string {
  return path.join(ADVENTURES_DIR, slug, 'images', relativePath);
}

/** Patch an adventure's adventure.json metadata */
export function patchAdventureMeta(
  slug: string,
  updates: Record<string, unknown>
): Adventure {
  const filePath = path.join(ADVENTURES_DIR, slug, 'adventure.json');
  const data = readJson<Record<string, unknown>>(filePath);
  deepMerge(data, { ...updates, updatedAt: new Date().toISOString() });
  writeJson(filePath, data);
  return data as unknown as Adventure;
}

/** Delete an adventure and all its data */
export function deleteAdventure(slug: string): boolean {
  const dir = path.join(ADVENTURES_DIR, slug);
  if (!fs.existsSync(dir)) return false;
  fs.rmSync(dir, { recursive: true, force: true });
  return true;
}

/** Check if an adventure exists */
export function adventureExists(slug: string): boolean {
  return fs.existsSync(path.join(ADVENTURES_DIR, slug, 'adventure.json'));
}
