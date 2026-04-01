'use client';

import { useEffect, useState } from 'react';
import type { EncounterOverlay } from '@/lib/types';

interface RotStackDisplayProps {
  overlay: EncounterOverlay;
  playerId?: string;
}

export default function RotStackDisplay({ overlay, playerId }: RotStackDisplayProps) {
  const [prevStacks, setPrevStacks] = useState<Record<string, number>>({});
  const [flashPcId, setFlashPcId] = useState<string | null>(null);

  const rotStacks = overlay.rotStacks || [];

  // Flash animation on stack change
  useEffect(() => {
    for (const pc of rotStacks) {
      const prev = prevStacks[pc.pcId] ?? 0;
      if (pc.stacks !== prev && pc.stacks > prev) {
        setFlashPcId(pc.pcId);
        setTimeout(() => setFlashPcId(null), 2000);
      }
    }
    setPrevStacks(Object.fromEntries(rotStacks.map(pc => [pc.pcId, pc.stacks])));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotStacks]);

  if (rotStacks.length === 0) return null;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 spotlight-transition ${
      overlay.darkness ? 'bg-black' : ''
    }`}
      style={{
        background: overlay.darkness
          ? '#000'
          : 'linear-gradient(135deg, #1A0A0A 0%, #2a0e0e 25%, #1a0505 50%, #2a0e0e 75%, #1A0A0A 100%)',
        backgroundSize: '400% 400%',
        animation: overlay.darkness ? 'none' : 'lava-flow 8s ease infinite',
      }}
    >
      {/* Darkness overlay text */}
      {overlay.darkness && (
        <div className="text-center mb-8 animate-pulse">
          <p className="text-xl font-bold text-gray-500 tracking-widest uppercase">
            Darkness
          </p>
          <p className="text-sm text-gray-700 mt-2">You cannot see.</p>
        </div>
      )}

      {/* Title */}
      {!overlay.darkness && (
        <h2 className="text-lg font-bold tracking-widest uppercase mb-6" style={{ color: '#8B0000' }}>
          Scarlet Rot
        </h2>
      )}

      {/* PC rot cards */}
      <div className="w-full max-w-md space-y-3">
        {rotStacks.map(pc => {
          const isFlashing = flashPcId === pc.pcId;
          const isHighTier = pc.stacks >= 7;

          return (
            <div
              key={pc.pcId}
              className={`rounded-xl p-4 border backdrop-blur-sm transition-all duration-500 ${
                isFlashing ? 'ring-2 ring-red-500 scale-[1.02]' : ''
              } ${isHighTier ? 'border-red-700 bg-red-900/30' : 'border-red-900/50 bg-black/40'}`}
              style={{
                animation: isFlashing ? 'rot-pulse 0.5s ease-in-out 3' : 'none',
              }}
            >
              {/* Name + Stack count */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-lg" style={{ color: '#F5F0E8' }}>
                  {pc.pcName}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className="text-3xl font-bold tabular-nums"
                    style={{ color: pc.tierColor === '#4A5568' ? '#888' : pc.tierColor === '#1A0A0A' ? '#ff4444' : pc.tierColor }}
                  >
                    {pc.stacks}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: pc.tierColor === '#4A5568' ? '#888' : pc.tierColor === '#1A0A0A' ? '#ff4444' : pc.tierColor }}>
                    /10
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden flex mb-2">
                {Array.from({ length: 10 }, (_, i) => (
                  <div
                    key={i}
                    className="flex-1 transition-all duration-500"
                    style={{
                      backgroundColor: i < pc.stacks ? pc.tierColor : 'transparent',
                      marginRight: i < 9 ? '2px' : '0',
                    }}
                  />
                ))}
              </div>

              {/* Tier + Damage */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-sm font-bold px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: (pc.tierColor === '#4A5568' ? '#888' : pc.tierColor) + '33',
                    color: pc.tierColor === '#1A0A0A' ? '#ff4444' : pc.tierColor === '#4A5568' ? '#888' : pc.tierColor,
                  }}
                >
                  {pc.tier}
                </span>
                {pc.stacks > 0 && (
                  <span className="text-sm font-bold" style={{ color: pc.tierColor === '#1A0A0A' ? '#ff4444' : pc.tierColor }}>
                    {pc.damage} dmg/turn
                  </span>
                )}
              </div>

              {/* Effects */}
              {pc.effects.length > 0 && pc.effects[0] !== 'No effect.' && (
                <ul className="text-xs space-y-0.5 mt-2" style={{ color: '#F5F0E8' }}>
                  {pc.effects.map((effect, i) => (
                    <li key={i} className="flex gap-1.5 opacity-80">
                      <span style={{ color: '#8B0000' }}>&bull;</span>
                      <span>{effect}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Exhaustion warning */}
              {pc.stacks >= 7 && (
                <div className="mt-2 p-2 rounded bg-red-900/40 border border-red-700">
                  <p className="text-xs font-bold text-red-400 text-center animate-pulse">
                    EXHAUSTION {pc.stacks >= 9 ? '2' : '1'} FROM ROT
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Removal reference */}
      {!overlay.darkness && (
        <div className="mt-6 w-full max-w-md bg-black/30 rounded-lg p-3 border border-red-900/30">
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#8B0000' }}>
            How to Remove Stacks
          </p>
          <div className="text-xs space-y-1" style={{ color: '#F5F0E8' }}>
            <p><span className="text-blue-400">Lesser Restoration</span> — removes all stacks + rot exhaustion</p>
            <p><span className="text-green-400">DC 15 Medicine</span> (action) — removes 2 stacks</p>
            <p><span className="text-blue-400">20+ HP magical healing</span> — removes 1 stack</p>
          </div>
        </div>
      )}

      {/* Pulse animation */}
      <style jsx>{`
        @keyframes rot-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(139, 0, 0, 0); }
          50% { box-shadow: 0 0 20px 4px rgba(139, 0, 0, 0.6); }
        }
      `}</style>
    </div>
  );
}
