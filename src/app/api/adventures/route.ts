import { NextRequest, NextResponse } from 'next/server';
import { listAdventures, createAdventure } from '@/lib/adventures';

export async function GET() {
  try {
    return NextResponse.json(listAdventures());
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { id, name, description } = await request.json();
    if (!id || !name) {
      return NextResponse.json({ error: 'id and name required' }, { status: 400 });
    }
    const slug = id.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    const adventure = createAdventure(slug, name, description || '');
    return NextResponse.json(adventure, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
