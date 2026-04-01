'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { SpotlightEvent } from '@/lib/types';

interface UseSocketOptions {
  role: 'dm' | 'player';
}

export function useSocket({ role }: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);
  const [spotlight, setSpotlight] = useState<SpotlightEvent | null>(null);

  useEffect(() => {
    const socket = io({
      path: '/api/socket',
      query: { role },
    });

    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('player:count', (count: number) => setPlayerCount(count));
    socket.on('spotlight:update', (event: SpotlightEvent) => setSpotlight(event));
    socket.on('spotlight:clear', () => setSpotlight(null));

    return () => {
      socket.disconnect();
    };
  }, [role]);

  const sendSpotlight = useCallback((event: SpotlightEvent) => {
    socketRef.current?.emit('spotlight:update', event);
  }, []);

  const clearSpotlight = useCallback(() => {
    socketRef.current?.emit('spotlight:clear');
  }, []);

  const sendCombatUpdate = useCallback((state: unknown) => {
    socketRef.current?.emit('combat:update', state);
  }, []);

  const sendNarrativeUpdate = useCallback((data: unknown) => {
    socketRef.current?.emit('narrative:update', data);
  }, []);

  return {
    connected,
    playerCount,
    spotlight,
    sendSpotlight,
    clearSpotlight,
    sendCombatUpdate,
    sendNarrativeUpdate,
    socket: socketRef.current,
  };
}
