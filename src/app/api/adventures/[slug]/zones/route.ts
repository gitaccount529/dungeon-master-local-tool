import { NextRequest, NextResponse } from 'next/server';
import { loadAdventureFile } from '@/lib/adventures';
import type { ZonesFileData } from '@/lib/adventures';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    return NextResponse.json(loadAdventureFile<ZonesFileData>(slug, 'zones'));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
