/**
 * Migration Script: Convert hardcoded .ts data files to JSON adventure files
 * Run with: npx tsx scripts/migrate-to-adventures.ts
 */

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'src', 'data');
const DEST = path.join(ROOT, 'data', 'adventures', 'molten-enclave');
const PUBLIC_IMAGES = path.join(ROOT, 'public', 'images');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeJson(filePath: string, data: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`  ✓ ${path.relative(ROOT, filePath)}`);
}

function copyDir(src: string, dest: string) {
  if (!fs.existsSync(src)) {
    console.log(`  ⚠ Source not found: ${path.relative(ROOT, src)}`);
    return;
  }
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  ✓ Copied ${entry.name}`);
    }
  }
}

// ── Strip /images/ prefix from imageUrl fields ──
function cleanImageUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  return url.replace(/^\/images\//, '');
}

async function main() {
  console.log('\n═══════════════════════════════════════');
  console.log(' Migrating to Adventure System');
  console.log('═══════════════════════════════════════\n');

  // 1. Create directory structure
  console.log('Creating directories...');
  ensureDir(DEST);
  ensureDir(path.join(DEST, 'images', 'monsters'));
  ensureDir(path.join(DEST, 'images', 'scenes'));
  ensureDir(path.join(DEST, 'images', 'gallery'));
  ensureDir(path.join(DEST, 'reference'));
  console.log('  ✓ Directory structure created\n');

  // 2. Load data from .ts files using dynamic require with ts path resolution
  console.log('Loading data from TypeScript files...');

  // On Windows, dynamic import() needs file:// URLs
  const toUrl = (p: string) => pathToFileURL(p).href;
  const { travelSection, zoneOverview, zones } = await import(toUrl(path.join(DATA_DIR, 'zones.ts')));
  const { monsters } = await import(toUrl(path.join(DATA_DIR, 'monsters.ts')));
  const { npcs } = await import(toUrl(path.join(DATA_DIR, 'npcs.ts')));
  const { scenes } = await import(toUrl(path.join(DATA_DIR, 'scenes.ts')));
  const { improvData } = await import(toUrl(path.join(DATA_DIR, 'improv.ts')));
  const { galleryImages } = await import(toUrl(path.join(DATA_DIR, 'images.ts')));
  console.log('  ✓ All data loaded\n');

  // 3. Write adventure.json
  console.log('Writing JSON files...');
  writeJson(path.join(DEST, 'adventure.json'), {
    id: 'molten-enclave',
    name: 'The Molten Enclave',
    description: 'A fire giant stronghold beneath Roaring Peak. The Sunlight Legion guards the Crater of the Core where Zenith Aastrika meditates with the Crown of Flame.',
    headerTitle: { primary: 'MOLTEN', secondary: 'ENCLAVE' },
    referencePdf: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // 4. Write zones.json
  writeJson(path.join(DEST, 'zones.json'), {
    travelSection,
    zoneOverview,
    zones,
  });

  // 5. Write monsters.json (clean imageUrl paths)
  const cleanedMonsters = monsters.map((m: Record<string, unknown>) => ({
    ...m,
    imageUrl: cleanImageUrl(m.imageUrl as string),
  }));
  writeJson(path.join(DEST, 'monsters.json'), cleanedMonsters);

  // 6. Write npcs.json
  writeJson(path.join(DEST, 'npcs.json'), npcs);

  // 7. Write scenes.json (clean imageUrl paths)
  const cleanedScenes = scenes.map((s: Record<string, unknown>) => ({
    ...s,
    imageUrl: cleanImageUrl(s.imageUrl as string),
  }));
  writeJson(path.join(DEST, 'scenes.json'), cleanedScenes);

  // 8. Write improv.json
  writeJson(path.join(DEST, 'improv.json'), improvData);

  // 9. Write images.json (filenames are already relative)
  writeJson(path.join(DEST, 'images.json'), galleryImages);
  console.log('');

  // 10. Copy images
  console.log('Copying images...');
  copyDir(path.join(PUBLIC_IMAGES, 'monsters'), path.join(DEST, 'images', 'monsters'));
  copyDir(path.join(PUBLIC_IMAGES, 'scenes'), path.join(DEST, 'images', 'scenes'));
  copyDir(path.join(PUBLIC_IMAGES, 'gallery'), path.join(DEST, 'images', 'gallery'));
  console.log('');

  // 11. Copy PDF if available
  const pdfSource = 'D:\\Downloads\\Where Evil Lives the MCDM Book of Boss Battles v1.1_pages_117-127.pdf';
  if (fs.existsSync(pdfSource)) {
    console.log('Copying reference PDF...');
    fs.copyFileSync(pdfSource, path.join(DEST, 'reference', 'where-evil-lives.pdf'));
    console.log('  ✓ PDF copied\n');
  } else {
    console.log('  ⚠ Reference PDF not found at expected location, skipping\n');
  }

  // 12. Rename DB if needed
  const oldDb = path.join(ROOT, 'data', 'molten-enclave.db');
  const newDb = path.join(ROOT, 'data', 'session.db');
  if (fs.existsSync(oldDb) && !fs.existsSync(newDb)) {
    console.log('Renaming database...');
    fs.copyFileSync(oldDb, newDb);
    // Also copy WAL and SHM files if they exist
    for (const ext of ['-wal', '-shm']) {
      if (fs.existsSync(oldDb + ext)) {
        fs.copyFileSync(oldDb + ext, newDb + ext);
      }
    }
    console.log('  ✓ molten-enclave.db → session.db\n');
  }

  console.log('═══════════════════════════════════════');
  console.log(' Migration complete!');
  console.log(`  Adventure: ${DEST}`);
  console.log('═══════════════════════════════════════\n');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
