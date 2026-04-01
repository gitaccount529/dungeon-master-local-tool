import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { bulkImportLibrary } from '@/lib/libraries';
import type { LibraryMonster, AmbiancePreset } from '@/lib/types';

interface MonsterData {
  id: string;
  name: string;
  type: string;
  role: string;
  imageUrl?: string;
  [key: string]: unknown;
}

interface ZoneData {
  id: string;
  name: string;
  ambiance?: {
    music: unknown[];
    sounds: unknown[];
  };
  [key: string]: unknown;
}

const ADVENTURES_DIR = path.join(process.cwd(), 'data', 'adventures');
const LIBRARY_IMAGES_DIR = path.join(process.cwd(), 'data', 'libraries', 'images');

function copyMonsterImage(adventureSlug: string, monster: MonsterData): string | undefined {
  if (!monster.imageUrl) return undefined;

  // Image could be a simple filename (adventure-local) or a path like /images/monsters/foo.png
  const filename = path.basename(monster.imageUrl);
  const adventureImagesDir = path.join(ADVENTURES_DIR, adventureSlug, 'images');
  const sourcePath = path.join(adventureImagesDir, filename);

  if (!fs.existsSync(sourcePath)) return monster.imageUrl; // keep original if can't copy

  fs.mkdirSync(LIBRARY_IMAGES_DIR, { recursive: true });

  // Copy to library images (skip if already exists)
  const destPath = path.join(LIBRARY_IMAGES_DIR, filename);
  if (!fs.existsSync(destPath)) {
    fs.copyFileSync(sourcePath, destPath);
  }

  return `/api/libraries/images/${filename}`;
}

export async function POST() {
  try {
    let totalMonstersImported = 0;
    let totalAmbianceImported = 0;

    // Discover all adventure directories
    const adventureSlugs: string[] = [];
    if (fs.existsSync(ADVENTURES_DIR)) {
      for (const entry of fs.readdirSync(ADVENTURES_DIR, { withFileTypes: true })) {
        if (entry.isDirectory()) {
          adventureSlugs.push(entry.name);
        }
      }
    }

    for (const slug of adventureSlugs) {
      const monstersPath = path.join(ADVENTURES_DIR, slug, 'monsters.json');
      const zonesPath = path.join(ADVENTURES_DIR, slug, 'zones.json');

      // Import monsters
      if (fs.existsSync(monstersPath)) {
        const monstersRaw: MonsterData[] = JSON.parse(fs.readFileSync(monstersPath, 'utf-8'));
        const libraryMonsters: LibraryMonster[] = monstersRaw.map(monster => {
          const imageUrl = copyMonsterImage(slug, monster);
          return {
            ...monster,
            imageUrl,
            source: 'imported' as const,
            tags: [
              monster.type?.toLowerCase(),
              monster.role?.toLowerCase(),
              'mcdm',
              slug,
            ].filter(Boolean) as string[],
            sourceBook: 'MCDM Where Evil Lives',
          };
        }) as unknown as LibraryMonster[];

        totalMonstersImported += bulkImportLibrary('monsters', libraryMonsters);
      }

      // Import ambiance presets from zones
      if (fs.existsSync(zonesPath)) {
        const zonesFile = JSON.parse(fs.readFileSync(zonesPath, 'utf-8'));
        const zonesRaw: ZoneData[] = [
          ...(zonesFile.travelSection ? [zonesFile.travelSection] : []),
          ...(zonesFile.zoneOverview ? [zonesFile.zoneOverview] : []),
          ...(Array.isArray(zonesFile.zones) ? zonesFile.zones : Array.isArray(zonesFile) ? zonesFile : []),
        ];
        const presets: AmbiancePreset[] = zonesRaw
          .filter(zone => zone.ambiance)
          .map(zone => ({
            id: zone.id + '-ambiance',
            name: zone.name + ' Ambiance',
            description: `Ambiance preset from ${zone.name}`,
            environment: 'volcanic',
            music: (zone.ambiance!.music || []) as AmbiancePreset['music'],
            sounds: (zone.ambiance!.sounds || []) as AmbiancePreset['sounds'],
            source: 'imported' as const,
            tags: [slug, 'ambiance'],
          }));

        totalAmbianceImported += bulkImportLibrary('ambiance', presets);
      }
    }

    return NextResponse.json({
      adventures: adventureSlugs,
      monsters: totalMonstersImported,
      ambiance: totalAmbianceImported,
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Seed failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
