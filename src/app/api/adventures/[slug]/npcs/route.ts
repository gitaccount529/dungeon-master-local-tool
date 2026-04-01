import { NextRequest, NextResponse } from 'next/server';
import { loadAdventureFile } from '@/lib/adventures';
import type { NPC } from '@/lib/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    return NextResponse.json(loadAdventureFile<NPC[]>(slug, 'npcs'));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
