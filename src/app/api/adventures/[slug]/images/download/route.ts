import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const body = await request.json();
    const { url, filename: providedFilename } = body as { url: string; filename?: string };

    // Validate URL
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      return NextResponse.json(
        { error: 'URL must start with http:// or https://' },
        { status: 400 }
      );
    }

    // Fetch the image
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${res.status} ${res.statusText}` },
        { status: 502 }
      );
    }

    // Validate Content-Type
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      return NextResponse.json(
        { error: `Invalid content type: ${contentType}. Expected image/*` },
        { status: 400 }
      );
    }

    // Check size (10MB max)
    const contentLength = res.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image exceeds 10MB size limit' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await res.arrayBuffer());

    // Double-check size after download
    if (buffer.length > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image exceeds 10MB size limit' },
        { status: 400 }
      );
    }

    // Determine filename
    let filename: string;
    if (providedFilename) {
      filename = providedFilename;
    } else {
      // Extract from URL
      const urlPath = new URL(url).pathname;
      const urlFilename = path.basename(urlPath);
      if (urlFilename && urlFilename.includes('.')) {
        filename = urlFilename;
      } else {
        // Determine extension from content type
        const ext = contentType.split('/')[1]?.split(';')[0] || 'png';
        filename = `download-${Date.now()}.${ext}`;
      }
    }

    // Ensure directory exists
    const imagesDir = path.join(process.cwd(), 'data', 'adventures', slug, 'images');
    fs.mkdirSync(imagesDir, { recursive: true });

    // Write file
    const filePath = path.join(imagesDir, filename);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ success: true, filename });
  } catch (err) {
    return NextResponse.json(
      { error: `Download failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
