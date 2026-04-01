import { NextRequest, NextResponse } from 'next/server';
import { loadLibrary, patchLibraryItem, deleteLibraryItem } from '@/lib/libraries';
import type { LibraryType } from '@/lib/types';

const VALID_TYPES: LibraryType[] = ['monsters', 'treasures', 'locations', 'challenges', 'ambiance', 'classes', 'parties'];

function isValidType(type: string): type is LibraryType {
  return VALID_TYPES.includes(type as LibraryType);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ type: string; itemId: string }> }
) {
  const { type, itemId } = await params;
  if (!isValidType(type)) {
    return NextResponse.json({ error: `Invalid library type: ${type}` }, { status: 400 });
  }
  try {
    const items = loadLibrary(type);
    const item = items.find(i => (i as unknown as Record<string, unknown>).id === itemId);
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; itemId: string }> }
) {
  const { type, itemId } = await params;
  if (!isValidType(type)) {
    return NextResponse.json({ error: `Invalid library type: ${type}` }, { status: 400 });
  }
  try {
    const body = await request.json();
    const result = patchLibraryItem(type, itemId, body);
    if (!result) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ type: string; itemId: string }> }
) {
  const { type, itemId } = await params;
  if (!isValidType(type)) {
    return NextResponse.json({ error: `Invalid library type: ${type}` }, { status: 400 });
  }
  try {
    const deleted = deleteLibraryItem(type, itemId);
    if (!deleted) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
