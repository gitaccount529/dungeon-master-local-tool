import { NextRequest, NextResponse } from 'next/server';
import { loadAdventureFile } from '@/lib/adventures';
import type { Monster } from '@/lib/types';
import fs from 'fs';
import path from 'path';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    return NextResponse.json(loadAdventureFile<Monster[]>(slug, 'monsters'));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const monsterId = searchParams.get('id');
  if (!monsterId) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }
  try {
    const monstersPath = path.join(process.cwd(), 'data', 'adventures', slug, 'monsters.json');
    const monsters: Monster[] = JSON.parse(fs.readFileSync(monstersPath, 'utf-8'));
    const filtered = monsters.filter(m => m.id !== monsterId);
    if (filtered.length === monsters.length) {
      return NextResponse.json({ error: 'Monster not found' }, { status: 404 });
    }
    fs.writeFileSync(monstersPath, JSON.stringify(filtered, null, 2));
    return NextResponse.json({ success: true, remaining: filtered.length });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
