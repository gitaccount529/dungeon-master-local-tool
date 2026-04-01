import { NextRequest, NextResponse } from 'next/server';
import { loadAdventureFile } from '@/lib/adventures';
import type { GalleryImage } from '@/lib/types';
import fs from 'fs';
import path from 'path';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    return NextResponse.json(loadAdventureFile<GalleryImage[]>(slug, 'images'));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string) || '';
    const description = (formData.get('description') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Expected image/*` },
        { status: 400 }
      );
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image exceeds 10MB size limit' },
        { status: 400 }
      );
    }

    // Sanitize filename: keep alphanumeric, hyphens, underscores, dots
    const rawName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    // Deduplicate if file already exists
    const imagesDir = path.join(process.cwd(), 'data', 'adventures', slug, 'images');
    fs.mkdirSync(imagesDir, { recursive: true });

    let filename = rawName;
    const ext = path.extname(rawName);
    const base = path.basename(rawName, ext);
    let counter = 1;
    while (fs.existsSync(path.join(imagesDir, filename))) {
      filename = `${base}-${counter}${ext}`;
      counter++;
    }

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(imagesDir, filename), buffer);

    // Add entry to images.json
    const images = loadAdventureFile<GalleryImage[]>(slug, 'images');
    const id = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `img-${Date.now()}`;
    // Ensure unique id
    let uniqueId = id;
    let idCounter = 1;
    while (images.some(i => i.id === uniqueId)) {
      uniqueId = `${id}-${idCounter}`;
      idCounter++;
    }

    const newImage: GalleryImage = {
      id: uniqueId,
      filename,
      title: title || base.replace(/[-_]/g, ' '),
      description,
    };
    images.push(newImage);

    const jsonPath = path.join(process.cwd(), 'data', 'adventures', slug, 'images.json');
    fs.writeFileSync(jsonPath, JSON.stringify(images, null, 2), 'utf-8');

    return NextResponse.json(newImage);
  } catch (err) {
    return NextResponse.json(
      { error: `Upload failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
