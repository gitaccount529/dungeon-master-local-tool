import { NextRequest, NextResponse } from 'next/server';
import { getSessionValue, setSessionValue } from '@/lib/db';

const KEY_PREFIX = 'encounter_';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 });

  const value = getSessionValue(KEY_PREFIX + key);
  if (value === null) return NextResponse.json({ key, value: null });

  try {
    return NextResponse.json({ key, value: JSON.parse(value) });
  } catch {
    return NextResponse.json({ key, value });
  }
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { key, value } = body;
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 });

  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  setSessionValue(KEY_PREFIX + key, serialized);
  return NextResponse.json({ key, value });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (key) {
    // Delete specific key
    setSessionValue(KEY_PREFIX + key, '');
  } else {
    // Delete all encounter keys — we can't easily enumerate session_state keys,
    // so delete the known encounter keys
    const knownKeys = ['crow_state'];
    for (const k of knownKeys) {
      setSessionValue(KEY_PREFIX + k, '');
    }
  }

  return NextResponse.json({ success: true });
}
