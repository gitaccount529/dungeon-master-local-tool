import { NextRequest, NextResponse } from 'next/server';
import { patchZone } from '@/lib/adventures';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; zoneId: string }> }
) {
  const { slug, zoneId } = await params;
  try {
    const updates = await request.json();
    const result = patchZone(slug, zoneId, updates);
    if (!result) {
      return NextResponse.json({ error: 'Zone not found' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
