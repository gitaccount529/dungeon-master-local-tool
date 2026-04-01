'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { SpotlightEvent, AdventureTheme } from '@/lib/types';
import SpotlightDisplay from '@/components/player/SpotlightDisplay';
import { applyTheme, resetTheme } from '@/lib/theme';

const POLL_INTERVAL = 2000; // 2 seconds

export default function PlayerView() {
  const [connected, setConnected] = useState(false);
  const [spotlight, setSpotlight] = useState<SpotlightEvent | null>(null);
  const lastTimestamp = useRef<number>(0);
  const playerIdRef = useRef<string>('');
  const [headerTitle, setHeaderTitle] = useState<{ primary: string; secondary: string }>({
    primary: 'MOLTEN',
    secondary: 'ENCLAVE',
  });

  // Generate a stable player ID for this session
  useEffect(() => {
    playerIdRef.current = `player-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }, []);

  // Fetch the active adventure title for the idle screen
  useEffect(() => {
    async function fetchAdventureTitle() {
      try {
        const sessionRes = await fetch('/api/session?key=active_adventure');
        const sessionData = await sessionRes.json();
        const slug = sessionData?.value;
        if (!slug) return;

        const advRes = await fetch(`/api/adventures/${slug}`);
        if (!advRes.ok) return;
        const adventure = await advRes.json();
        if (adventure?.headerTitle?.primary && adventure?.headerTitle?.secondary) {
          setHeaderTitle({
            primary: adventure.headerTitle.primary,
            secondary: adventure.headerTitle.secondary,
          });
        }
        if (adventure?.theme) {
          applyTheme(adventure.theme as AdventureTheme);
        }
      } catch {
        // Keep fallback title on error
      }
    }
    fetchAdventureTitle();
    return () => { resetTheme(); };
  }, []);

  // Poll for spotlight updates (works without Socket.IO)
  const pollSpotlight = useCallback(async () => {
    try {
      const res = await fetch(`/api/spotlight?playerId=${playerIdRef.current}`);
      const data = await res.json();
      if (data && data.timestamp !== lastTimestamp.current) {
        lastTimestamp.current = data.timestamp;
        setSpotlight(data);
        setConnected(true);
      } else if (!data || data === '') {
        if (spotlight !== null) setSpotlight(null);
        setConnected(true);
      }
    } catch {
      setConnected(false);
    }
  }, [spotlight]);

  useEffect(() => {
    // Initial fetch
    pollSpotlight();

    // Start polling
    const interval = setInterval(pollSpotlight, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [pollSpotlight]);

  // Render spotlight content or idle screen
  if (spotlight && spotlight.type !== 'clear') {
    return <SpotlightDisplay event={spotlight} />;
  }

  // Idle state — Adventure title with ambient animation
  return (
    <div className="min-h-screen flex items-center justify-center lava-ambient">
      <div className="text-center spotlight-transition">
        <div className="space-y-6">
          <div className="relative">
            <div className="absolute inset-0 blur-3xl opacity-20 bg-accent rounded-full" />
            <h1 className="relative text-5xl md:text-7xl font-bold tracking-widest">
              <span className="text-accent">{headerTitle.primary}</span>
              <br />
              <span className="text-accent-secondary">{headerTitle.secondary}</span>
            </h1>
          </div>

          <div className="space-y-2">
            <p className="text-muted text-sm uppercase tracking-[0.3em]">
              Awaiting the Dungeon Master
            </p>
            <div className="flex items-center justify-center gap-2">
              <span
                className={`inline-block w-2 h-2 rounded-full transition-colors ${
                  connected ? 'bg-success animate-pulse' : 'bg-muted'
                }`}
              />
              <span className="text-xs text-muted">
                {connected ? 'Connected' : 'Connecting...'}
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-1 mt-8">
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="w-1 h-8 bg-accent/30 rounded-full"
                style={{
                  animation: `lava-pulse 2s ease-in-out ${i * 0.3}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
