import { NextRequest, NextResponse } from 'next/server';
import { loadAdventureFile, adventureExists } from '@/lib/adventures';
import type { Handout } from '@/lib/types';
import fs from 'fs';
import path from 'path';

const ADVENTURES_DIR = path.join(process.cwd(), 'data', 'adventures');

function getHandoutsPath(slug: string) {
  return path.join(ADVENTURES_DIR, slug, 'handouts.json');
}

function readHandouts(slug: string): Handout[] {
  const filePath = getHandoutsPath(slug);
  if (!fs.existsSync(filePath)) return [];
  try {
    return loadAdventureFile<Handout[]>(slug, 'handouts');
  } catch {
    return [];
  }
}

function writeHandouts(slug: string, handouts: Handout[]) {
  fs.writeFileSync(getHandoutsPath(slug), JSON.stringify(handouts, null, 2), 'utf-8');
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!adventureExists(slug)) {
    return NextResponse.json({ error: 'Adventure not found' }, { status: 404 });
  }
  return NextResponse.json(readHandouts(slug));
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

  if (Array.isArray(body)) {
    writeHandouts(slug, body);
    return NextResponse.json(body);
  }

  const handouts = readHandouts(slug);
  handouts.push(body as Handout);
  writeHandouts(slug, handouts);
  return NextResponse.json(handouts);
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
  const handouts = readHandouts(slug);
  const idx = handouts.findIndex(h => h.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: 'Handout not found' }, { status: 404 });
  }
  handouts[idx] = { ...handouts[idx], ...updates };
  writeHandouts(slug, handouts);
  return NextResponse.json(handouts[idx]);
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
  const handouts = readHandouts(slug).filter(h => h.id !== id);
  writeHandouts(slug, handouts);
  return NextResponse.json(handouts);
}
