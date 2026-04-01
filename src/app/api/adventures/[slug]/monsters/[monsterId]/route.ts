import { NextRequest, NextResponse } from 'next/server';
import { patchAdventureItem } from '@/lib/adventures';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; monsterId: string }> }
) {
  const { slug, monsterId } = await params;
  try {
    const updates = await request.json();
    const result = patchAdventureItem(slug, 'monsters', monsterId, updates);
    if (!result) {
      return NextResponse.json({ error: 'Monster not found' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
