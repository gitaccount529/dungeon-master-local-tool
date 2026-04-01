import { NextRequest, NextResponse } from 'next/server';
import { getSessionValue, setSessionValue, addSpotlightHistory, getSpotlightHistory } from '@/lib/db';

// Track connected players via heartbeat timestamps
const playerHeartbeats = new Map<string, number>();
const HEARTBEAT_TIMEOUT = 10_000; // 10 seconds without heartbeat = disconnected

function cleanStaleHeartbeats() {
  const now = Date.now();
  for (const [id, ts] of playerHeartbeats) {
    if (now - ts > HEARTBEAT_TIMEOUT) playerHeartbeats.delete(id);
  }
}

// GET — fetch current spotlight state (players call this on poll)
export async function GET(request: NextRequest) {
  // Player heartbeat: if ?playerId= param present, record heartbeat
  const playerId = request.nextUrl.searchParams.get('playerId');
  if (playerId) {
    playerHeartbeats.set(playerId, Date.now());
  }

  // If DM is asking for player count
  const countOnly = request.nextUrl.searchParams.get('playerCount');
  if (countOnly !== null) {
    cleanStaleHeartbeats();
    return NextResponse.json({ playerCount: playerHeartbeats.size });
  }

  // If requesting spotlight history
  const historyLimit = request.nextUrl.searchParams.get('history');
  if (historyLimit !== null) {
    const limit = parseInt(historyLimit) || 10;
    const history = getSpotlightHistory(limit);
    return NextResponse.json(history);
  }

  const raw = getSessionValue('spotlight_content');
  if (!raw) return NextResponse.json(null);
  try {
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json(null);
  }
}

// PUT — update spotlight (called by DM)
export async function PUT(request: NextRequest) {
  const body = await request.json();
  setSessionValue('spotlight_content', JSON.stringify(body));
  addSpotlightHistory(body.type, body.content);
  return NextResponse.json(body);
}

// DELETE — clear spotlight
export async function DELETE() {
  setSessionValue('spotlight_content', '');
  return NextResponse.json({ cleared: true });
}
