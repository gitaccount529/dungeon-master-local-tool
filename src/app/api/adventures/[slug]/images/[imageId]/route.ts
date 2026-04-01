import { NextRequest, NextResponse } from 'next/server';
import { loadAdventureFile } from '@/lib/adventures';
import type { GalleryImage } from '@/lib/types';
import fs from 'fs';
import path from 'path';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; imageId: string }> }
) {
  const { slug, imageId } = await params;
  try {
    const updates = await request.json();
    const images = loadAdventureFile<GalleryImage[]>(slug, 'images');
    const idx = images.findIndex(i => i.id === imageId);
    if (idx === -1) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }
    images[idx] = { ...images[idx], ...updates };

    const filePath = path.join(process.cwd(), 'data', 'adventures', slug, 'images.json');
    fs.writeFileSync(filePath, JSON.stringify(images, null, 2), 'utf-8');

    return NextResponse.json(images[idx]);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; imageId: string }> }
) {
  const { slug, imageId } = await params;
  try {
    const images = loadAdventureFile<GalleryImage[]>(slug, 'images');
    const idx = images.findIndex(i => i.id === imageId);
    if (idx === -1) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const removed = images[idx];

    // Delete the image file from disk
    const imagesDir = path.join(process.cwd(), 'data', 'adventures', slug, 'images');
    const filePath = path.join(imagesDir, removed.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from images.json
    images.splice(idx, 1);
    const jsonPath = path.join(process.cwd(), 'data', 'adventures', slug, 'images.json');
    fs.writeFileSync(jsonPath, JSON.stringify(images, null, 2), 'utf-8');

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
