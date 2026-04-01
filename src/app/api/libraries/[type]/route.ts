import { NextRequest, NextResponse } from 'next/server';
import { searchLibrary, addLibraryItem } from '@/lib/libraries';
import type { LibraryType } from '@/lib/types';

const VALID_TYPES: LibraryType[] = ['monsters', 'treasures', 'locations', 'challenges', 'ambiance', 'classes', 'parties'];

function isValidType(type: string): type is LibraryType {
  return VALID_TYPES.includes(type as LibraryType);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  if (!isValidType(type)) {
    return NextResponse.json({ error: `Invalid library type: ${type}` }, { status: 400 });
  }
  try {
    const url = request.nextUrl;
    const q = url.searchParams.get('q') ?? undefined;
    const tagsParam = url.searchParams.get('tags');
    const tags = tagsParam ? tagsParam.split(',') : undefined;
    const results = searchLibrary(type, q, tags);
    return NextResponse.json(results);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
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
    if (!body.id || !body.name) {
      return NextResponse.json({ error: 'Missing required fields: id, name' }, { status: 400 });
    }
    const result = addLibraryItem(type, body);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
