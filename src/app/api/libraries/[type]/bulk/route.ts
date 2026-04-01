import { NextRequest, NextResponse } from 'next/server';
import { bulkImportLibrary } from '@/lib/libraries';
import type { LibraryType } from '@/lib/types';

const VALID_TYPES: LibraryType[] = ['monsters', 'treasures', 'locations', 'challenges', 'ambiance', 'classes', 'parties'];

function isValidType(type: string): type is LibraryType {
  return VALID_TYPES.includes(type as LibraryType);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  if (!isValidType(type)) {
    return NextResponse.json({ error: `Invalid library type: ${type}` }, { status: 400 });
  }
  try {
    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Body must be an array of items' }, { status: 400 });
    }
    const imported = bulkImportLibrary(type, body);
    return NextResponse.json({ imported });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
