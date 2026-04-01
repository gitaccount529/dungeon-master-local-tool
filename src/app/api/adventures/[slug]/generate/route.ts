import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { adventureExists, loadAdventureFile } from '@/lib/adventures';
import { buildAdventureContext } from '@/lib/aiContext';
import type { ZonesFileData } from '@/lib/adventures';
import type { Monster, NPC, Scene, ImprovData } from '@/lib/types';

const ADVENTURES_DIR = path.join(process.cwd(), 'data', 'adventures');

const VALID_SCOPES = ['full', 'zones', 'monsters', 'npcs', 'scenes', 'improv'] as const;
type Scope = typeof VALID_SCOPES[number];

const VALID_TYPES = ['zones', 'monsters', 'npcs', 'scenes', 'improv'] as const;
type DataType = typeof VALID_TYPES[number];

/** POST — Returns generation context for external AI consumption */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!adventureExists(slug)) {
    return NextResponse.json({ error: 'Adventure not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const scope: Scope = VALID_SCOPES.includes(body.scope) ? body.scope : 'full';
    const context = buildAdventureContext(slug, scope);
    return NextResponse.json(context);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/** PUT — Accepts generated content and writes it to the appropriate JSON file */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!adventureExists(slug)) {
    return NextResponse.json({ error: 'Adventure not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { type, data } = body as { type: DataType; data: unknown };

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: 'Missing data field' }, { status: 400 });
    }

    const filePath = path.join(ADVENTURES_DIR, slug, `${type}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({ success: true, type, file: `${type}.json` });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
