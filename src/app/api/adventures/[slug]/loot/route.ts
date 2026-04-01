import { NextRequest, NextResponse } from 'next/server';
import { loadAdventureFile, adventureExists } from '@/lib/adventures';
import type { LootEntry } from '@/lib/types';
import fs from 'fs';
import path from 'path';

const ADVENTURES_DIR = path.join(process.cwd(), 'data', 'adventures');

function getLootPath(slug: string) {
  return path.join(ADVENTURES_DIR, slug, 'loot.json');
}

function readLoot(slug: string): LootEntry[] {
  const filePath = getLootPath(slug);
  if (!fs.existsSync(filePath)) return [];
  try {
    return loadAdventureFile<LootEntry[]>(slug, 'loot');
  } catch {
    return [];
  }
}

function writeLoot(slug: string, loot: LootEntry[]) {
  fs.writeFileSync(getLootPath(slug), JSON.stringify(loot, null, 2), 'utf-8');
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!adventureExists(slug)) {
    return NextResponse.json({ error: 'Adventure not found' }, { status: 404 });
  }
  return NextResponse.json(readLoot(slug));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!adventureExists(slug)) {
    return NextResponse.json({ error: 'Adventure not found' }, { status: 404 });
  }
  const body = await request.json();

  // If body is an array, replace the whole loot list
  if (Array.isArray(body)) {
    writeLoot(slug, body);
    return NextResponse.json(body);
  }

  // Otherwise add a single entry
  const loot = readLoot(slug);
  loot.push(body as LootEntry);
  writeLoot(slug, loot);
  return NextResponse.json(loot);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  const loot = readLoot(slug);
  const idx = loot.findIndex(l => l.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: 'Loot entry not found' }, { status: 404 });
  }
  loot[idx] = { ...loot[idx], ...updates };
  writeLoot(slug, loot);
  return NextResponse.json(loot[idx]);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id param' }, { status: 400 });
  }
  const loot = readLoot(slug).filter(l => l.id !== id);
  writeLoot(slug, loot);
  return NextResponse.json(loot);
}
