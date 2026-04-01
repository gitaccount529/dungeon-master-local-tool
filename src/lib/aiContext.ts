import fs from 'fs';
import path from 'path';
import { loadAdventureData, loadAdventureFile } from './adventures';
import type { Adventure, Zone, Monster, NPC, Scene, ImprovData } from './types';
import type { ZonesFileData } from './adventures';

// ═══════════════════════════════════════════
// AI Generation Context Utilities
// Server-side only — assembles context for external AI consumption
// ═══════════════════════════════════════════

const ADVENTURES_DIR = path.join(process.cwd(), 'data', 'adventures');

export interface GenerationContext {
  adventure: { name: string; description: string; system: string; dmNotes: string };
  referencePdfPaths: string[];
  existingData: {
    zoneCount: number;
    monsterCount: number;
    npcCount: number;
    sceneCount: number;
    zoneNames: string[];
    monsterNames: string[];
    npcNames: string[];
  };
  scope: string;
}

/** Build full adventure context for AI generation */
export function buildAdventureContext(slug: string, scope: string = 'full'): GenerationContext {
  const bundle = loadAdventureData(slug);
  const adventure = bundle.adventure;

  // Resolve reference PDF filesystem paths
  const refDir = path.join(ADVENTURES_DIR, slug, 'reference');
  const pdfPaths: string[] = [];

  // Legacy single PDF
  if (adventure.referencePdf) {
    const legacyPath = path.join(refDir, adventure.referencePdf);
    if (fs.existsSync(legacyPath)) {
      pdfPaths.push(legacyPath);
    }
  }

  // Multiple reference PDFs
  if (adventure.referencePdfs) {
    for (const pdfName of adventure.referencePdfs) {
      const pdfPath = path.join(refDir, pdfName);
      if (fs.existsSync(pdfPath)) {
        pdfPaths.push(pdfPath);
      }
    }
  }

  const allZones = [
    ...(bundle.zones.travelSection ? [bundle.zones.travelSection] : []),
    ...(bundle.zones.zoneOverview ? [bundle.zones.zoneOverview] : []),
    ...bundle.zones.zones,
  ];

  return {
    adventure: {
      name: adventure.name,
      description: adventure.description,
      system: adventure.system ?? 'dnd5e',
      dmNotes: adventure.dmNotes ?? '',
    },
    referencePdfPaths: pdfPaths,
    existingData: {
      zoneCount: allZones.length,
      monsterCount: bundle.monsters.length,
      npcCount: bundle.npcs.length,
      sceneCount: bundle.scenes.length,
      zoneNames: allZones.map(z => z.name),
      monsterNames: bundle.monsters.map(m => m.name),
      npcNames: bundle.npcs.map(n => n.name),
    },
    scope,
  };
}

/** Build context for generating/enhancing a specific item */
export function buildItemContext(
  slug: string,
  itemType: string,
  itemId?: string
): object {
  const bundle = loadAdventureData(slug);
  const adventure = bundle.adventure;

  const base = {
    adventure: {
      name: adventure.name,
      description: adventure.description,
      system: adventure.system ?? 'dnd5e',
      dmNotes: adventure.dmNotes ?? '',
    },
    itemType,
  };

  // Resolve reference PDF paths for context
  const refDir = path.join(ADVENTURES_DIR, slug, 'reference');
  const pdfPaths: string[] = [];
  if (adventure.referencePdf) {
    const p = path.join(refDir, adventure.referencePdf);
    if (fs.existsSync(p)) pdfPaths.push(p);
  }
  if (adventure.referencePdfs) {
    for (const name of adventure.referencePdfs) {
      const p = path.join(refDir, name);
      if (fs.existsSync(p)) pdfPaths.push(p);
    }
  }

  switch (itemType) {
    case 'zones': {
      const allZones = [
        ...(bundle.zones.travelSection ? [bundle.zones.travelSection] : []),
        ...(bundle.zones.zoneOverview ? [bundle.zones.zoneOverview] : []),
        ...bundle.zones.zones,
      ];
      const currentItem = itemId ? allZones.find(z => z.id === itemId) : null;
      return {
        ...base,
        referencePdfPaths: pdfPaths,
        currentItem,
        siblingNames: allZones.map(z => z.name),
        monsterNames: bundle.monsters.map(m => m.name),
        npcNames: bundle.npcs.map(n => n.name),
      };
    }
    case 'monsters': {
      const currentItem = itemId ? bundle.monsters.find(m => m.id === itemId) : null;
      return {
        ...base,
        referencePdfPaths: pdfPaths,
        currentItem,
        siblingNames: bundle.monsters.map(m => m.name),
      };
    }
    case 'npcs': {
      const currentItem = itemId ? bundle.npcs.find(n => n.id === itemId) : null;
      return {
        ...base,
        referencePdfPaths: pdfPaths,
        currentItem,
        siblingNames: bundle.npcs.map(n => n.name),
      };
    }
    case 'scenes': {
      const currentItem = itemId ? bundle.scenes.find(s => s.id === itemId) : null;
      return {
        ...base,
        referencePdfPaths: pdfPaths,
        currentItem,
        siblingNames: bundle.scenes.map(s => s.name),
      };
    }
    case 'improv': {
      return {
        ...base,
        referencePdfPaths: pdfPaths,
        currentItem: bundle.improv,
      };
    }
    default: {
      return {
        ...base,
        referencePdfPaths: pdfPaths,
      };
    }
  }
}
