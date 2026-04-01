import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const LIBRARIES_IMAGES_DIR = path.join(process.cwd(), 'data', 'libraries', 'images');

export async function POST(request: NextRequest) {
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

    fs.mkdirSync(LIBRARIES_IMAGES_DIR, { recursive: true });

    // Sanitize filename
    const rawName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(rawName);
    const base = path.basename(rawName, ext);
    let filename = rawName;
    let counter = 1;
    while (fs.existsSync(path.join(LIBRARIES_IMAGES_DIR, filename))) {
      filename = `${base}-${counter}${ext}`;
      counter++;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(LIBRARIES_IMAGES_DIR, filename), buffer);

    return NextResponse.json({ filename });
  } catch (err) {
    return NextResponse.json(
      { error: `Upload failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
