import { NextResponse } from 'next/server';
import os from 'os';

export async function GET() {
  const interfaces = os.networkInterfaces();
  const addresses: { name: string; address: string }[] = [];

  for (const [name, nets] of Object.entries(interfaces)) {
    if (!nets) continue;
    for (const net of nets) {
      // Skip internal/loopback and IPv6
      if (net.internal) continue;
      if (net.family === 'IPv4') {
        addresses.push({ name, address: net.address });
      }
    }
  }

  return NextResponse.json({ addresses });
}
