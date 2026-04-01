import { NextRequest, NextResponse } from 'next/server';
import { loadAdventureFile, adventureExists, patchAdventureMeta, deleteAdventure } from '@/lib/adventures';
import type { Adventure } from '@/lib/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!adventureExists(slug)) {
    return NextResponse.json({ error: 'Adventure not found' }, { status: 404 });
  }
  try {
    return NextResponse.json(loadAdventureFile<Adventure>(slug, 'adventure'));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!adventureExists(slug)) {
    return NextResponse.json({ error: 'Adventure not found' }, { status: 404 });
  }
  try {
    const updates = await request.json();
    const result = patchAdventureMeta(slug, updates);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!adventureExists(slug)) {
    return NextResponse.json({ error: 'Adventure not found' }, { status: 404 });
  }
  try {
    deleteAdventure(slug);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
