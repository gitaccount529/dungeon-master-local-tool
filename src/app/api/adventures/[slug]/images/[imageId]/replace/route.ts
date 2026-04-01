import { NextRequest, NextResponse } from 'next/server';
import { loadAdventureFile } from '@/lib/adventures';
import type { GalleryImage } from '@/lib/types';
import fs from 'fs';
import path from 'path';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; imageId: string }> }
) {
  const { slug, imageId } = await params;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: `Invalid file type: ${file.type}` }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image exceeds 10MB size limit' }, { status: 400 });
    }

    const images = loadAdventureFile<GalleryImage[]>(slug, 'images');
    const idx = images.findIndex(i => i.id === imageId);
    if (idx === -1) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const imagesDir = path.join(process.cwd(), 'data', 'adventures', slug, 'images');
    fs.mkdirSync(imagesDir, { recursive: true });

    // Delete old file if it exists
    const oldPath = path.join(imagesDir, images[idx].filename);
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }

    // Sanitize and deduplicate new filename
    const rawName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    let filename = rawName;
    const ext = path.extname(rawName);
    const base = path.basename(rawName, ext);
    let counter = 1;
    while (fs.existsSync(path.join(imagesDir, filename))) {
      filename = `${base}-${counter}${ext}`;
      counter++;
    }

    // Write new file
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(imagesDir, filename), buffer);

    // Update images.json
    images[idx] = { ...images[idx], filename };
    const jsonPath = path.join(process.cwd(), 'data', 'adventures', slug, 'images.json');
    fs.writeFileSync(jsonPath, JSON.stringify(images, null, 2), 'utf-8');

    return NextResponse.json(images[idx]);
  } catch (err) {
    return NextResponse.json(
      { error: `Replace failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
