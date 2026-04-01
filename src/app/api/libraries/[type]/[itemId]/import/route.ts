import { NextRequest, NextResponse } from 'next/server';
import { importToAdventure } from '@/lib/libraries';
import type { LibraryType } from '@/lib/types';

const VALID_TYPES: LibraryType[] = ['monsters', 'treasures', 'locations', 'challenges', 'ambiance', 'classes', 'parties'];

function isValidType(type: string): type is LibraryType {
  return VALID_TYPES.includes(type as LibraryType);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; itemId: string }> }
) {
  const { type, itemId } = await params;
  if (!isValidType(type)) {
    return NextResponse.json({ error: `Invalid library type: ${type}` }, { status: 400 });
  }
  try {
    const body = await request.json();
    if (!body.slug) {
      return NextResponse.json({ error: 'Missing required field: slug' }, { status: 400 });
    }
    const result = importToAdventure(type, itemId, body.slug);
    if (!result) {
      return NextResponse.json({ error: 'Item not found or import failed' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
