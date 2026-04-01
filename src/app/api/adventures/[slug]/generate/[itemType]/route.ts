import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { adventureExists, loadAdventureFile, deepMerge } from '@/lib/adventures';
import { buildItemContext } from '@/lib/aiContext';
import type { ZonesFileData } from '@/lib/adventures';
import type { Monster, NPC, Scene, ImprovData } from '@/lib/types';

const ADVENTURES_DIR = path.join(process.cwd(), 'data', 'adventures');

const VALID_ITEM_TYPES = ['zones', 'monsters', 'npcs', 'scenes', 'improv'] as const;
type ItemType = typeof VALID_ITEM_TYPES[number];

/** POST — Returns item context for AI to generate/enhance a single item */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; itemType: string }> }
) {
  const { slug, itemType } = await params;

  if (!adventureExists(slug)) {
    return NextResponse.json({ error: 'Adventure not found' }, { status: 404 });
  }

  if (!VALID_ITEM_TYPES.includes(itemType as ItemType)) {
    return NextResponse.json(
      { error: `Invalid item type. Must be one of: ${VALID_ITEM_TYPES.join(', ')}` },
      { status: 400 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { itemId, prompt } = body as { itemId?: string; prompt?: string };
    const context = buildItemContext(slug, itemType, itemId);
    return NextResponse.json({ ...context, prompt: prompt ?? null });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/** PUT — Writes generated item data (patch existing or add new) */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; itemType: string }> }
) {
  const { slug, itemType } = await params;

  if (!adventureExists(slug)) {
    return NextResponse.json({ error: 'Adventure not found' }, { status: 404 });
  }

  if (!VALID_ITEM_TYPES.includes(itemType as ItemType)) {
    return NextResponse.json(
      { error: `Invalid item type. Must be one of: ${VALID_ITEM_TYPES.join(', ')}` },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { itemId, data } = body as { itemId?: string; data: Record<string, unknown> };

    if (!data) {
      return NextResponse.json({ error: 'Missing data field' }, { status: 400 });
    }

    const filePath = path.join(ADVENTURES_DIR, slug, `${itemType}.json`);

    if (itemType === 'zones') {
      // Zones file has a special structure: { travelSection, zoneOverview, zones[] }
      const zonesData = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as ZonesFileData;

      if (itemId) {
        // Patch existing zone
        let found = false;
        if (zonesData.travelSection && zonesData.travelSection.id === itemId) {
          deepMerge(zonesData.travelSection as unknown as Record<string, unknown>, data);
          found = true;
        } else if (zonesData.zoneOverview && zonesData.zoneOverview.id === itemId) {
          deepMerge(zonesData.zoneOverview as unknown as Record<string, unknown>, data);
          found = true;
        } else {
          const idx = zonesData.zones.findIndex(z => z.id === itemId);
          if (idx !== -1) {
            deepMerge(zonesData.zones[idx] as unknown as Record<string, unknown>, data);
            found = true;
          }
        }
        if (!found) {
          return NextResponse.json({ error: `Zone ${itemId} not found` }, { status: 404 });
        }
      } else {
        // Add new zone
        zonesData.zones.push(data as unknown as ZonesFileData['zones'][number]);
      }

      fs.writeFileSync(filePath, JSON.stringify(zonesData, null, 2), 'utf-8');
      return NextResponse.json({ success: true, itemType, itemId: itemId ?? data.id });
    }

    if (itemType === 'improv') {
      // Improv is a single object, not an array — merge into it
      const improvData = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as ImprovData;
      deepMerge(improvData as unknown as Record<string, unknown>, data);
      fs.writeFileSync(filePath, JSON.stringify(improvData, null, 2), 'utf-8');
      return NextResponse.json({ success: true, itemType });
    }

    // Array-based types: monsters, npcs, scenes
    const items = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Array<Record<string, unknown>>;

    if (itemId) {
      // Patch existing item
      const idx = items.findIndex(item => item.id === itemId);
      if (idx === -1) {
        return NextResponse.json({ error: `${itemType} item ${itemId} not found` }, { status: 404 });
      }
      deepMerge(items[idx], data);
    } else {
      // Add new item
      items.push(data);
    }

    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf-8');
    return NextResponse.json({ success: true, itemType, itemId: itemId ?? data.id });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
