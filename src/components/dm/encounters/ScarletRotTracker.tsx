'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  SCARLET_ROT_TIERS,
  ROT_MAX_STACKS,
  ROT_SOURCES,
  ROT_REMOVAL,
  getRotTier,
  type ScarletRotPCState,
} from '@/data/encounters/scarletCrow';

interface ScarletRotTrackerProps {
  rotStacks: ScarletRotPCState[];
  onUpdate: (rotStacks: ScarletRotPCState[]) => void;
  onSpotlightRot?: (pcId: string) => void;
}

export default function ScarletRotTracker({ rotStacks, onUpdate, onSpotlightRot }: ScarletRotTrackerProps) {
  const [showRemovalRef, setShowRemovalRef] = useState(false);
  const [flashPcId, setFlashPcId] = useState<string | null>(null);
  const prevStacks = useRef<Record<string, number>>({});

  // Detect tier changes for flash animation
  useEffect(() => {
    for (const pc of rotStacks) {
      const prev = prevStacks.current[pc.pcId] ?? 0;
      const prevTier = getRotTier(prev);
      const newTier = getRotTier(pc.stacks);
      if (prevTier.id !== newTier.id && pc.stacks > prev) {
        setFlashPcId(pc.pcId);
        setTimeout(() => setFlashPcId(null), 1500);
      }
      prevStacks.current[pc.pcId] = pc.stacks;
    }
  }, [rotStacks]);

  const adjustStacks = useCallback((pcId: string, delta: number) => {
    const updated = rotStacks.map(pc => {
      if (pc.pcId !== pcId) return pc;
      const newStacks = Math.max(0, Math.min(ROT_MAX_STACKS, pc.stacks + delta));
      const tier = getRotTier(newStacks);
      const exhaustion = tier.exhaustion ?? 0;
      return { ...pc, stacks: newStacks, exhaustionFromRot: exhaustion };
    });
    onUpdate(updated);
  }, [rotStacks, onUpdate]);

  const applySource = useCallback((pcId: string, sourceKey: string) => {
    const source = ROT_SOURCES[sourceKey];
    if (source) adjustStacks(pcId, source.stacks);
  }, [adjustStacks]);

  const medicineCheck = useCallback((pcId: string) => {
    adjustStacks(pcId, -2);
  }, [adjustStacks]);

  const lesserRestoration = useCallback((pcId: string) => {
    const updated = rotStacks.map(pc => {
      if (pc.pcId !== pcId) return pc;
      return { ...pc, stacks: 0, exhaustionFromRot: 0 };
    });
    onUpdate(updated);
  }, [rotStacks, onUpdate]);

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#8B0000' }}>
          Scarlet Rot Tracker
        </h3>
        <button
          onClick={() => setShowRemovalRef(!showRemovalRef)}
          className="text-xs px-2 py-0.5 rounded border border-border text-muted hover:text-foreground transition-colors"
        >
          {showRemovalRef ? 'Hide' : 'Removal'}
        </button>
      </div>

      {/* Removal reference (collapsible) */}
      {showRemovalRef && (
        <div className="bg-card-alt rounded p-2 text-xs space-y-1 border border-border">
          {ROT_REMOVAL.map((r, i) => (
            <div key={i} className="flex gap-2">
              <span className="font-semibold text-accent-secondary whitespace-nowrap">{r.method}:</span>
              <span className="text-muted">{r.effect}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tier legend (compact) */}
      <div className="flex gap-1 text-[10px]">
        {SCARLET_ROT_TIERS.slice(1).map(tier => (
          <span key={tier.id} className="px-1.5 py-0.5 rounded" style={{ backgroundColor: tier.color + '33', color: tier.color === '#1A0A0A' ? '#ff4444' : tier.color }}>
            {tier.range[0]}-{tier.range[1]} {tier.name}
          </span>
        ))}
      </div>

      {/* PC Cards */}
      {rotStacks.map(pc => {
        const tier = getRotTier(pc.stacks);
        const isFlashing = flashPcId === pc.pcId;
        const isHighTier = pc.stacks >= 7;

        return (
          <div
            key={pc.pcId}
            className={`bg-card rounded-lg p-2 border transition-all duration-300 ${
              isFlashing ? 'ring-2 ring-red-500 animate-pulse' : ''
            } ${isHighTier ? 'border-red-800' : 'border-border'}`}
          >
            {/* Top row: Name + Stack count + Tier badge */}
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-semibold text-sm text-foreground flex-shrink-0">{pc.pcName}</span>
              <div className="flex-1" />

              {/* Stack count */}
              <span
                className="text-xl font-bold tabular-nums min-w-[2ch] text-center"
                style={{ color: tier.color === '#4A5568' ? '#888' : tier.color === '#1A0A0A' ? '#ff4444' : tier.color }}
              >
                {pc.stacks}
              </span>

              {/* Tier badge */}
              <span
                className="text-xs px-1.5 py-0.5 rounded font-semibold"
                style={{
                  backgroundColor: tier.color + '33',
                  color: tier.color === '#1A0A0A' ? '#ff4444' : tier.color === '#4A5568' ? '#888' : tier.color,
                }}
              >
                {tier.name}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-card-alt rounded-full overflow-hidden mb-1.5 flex">
              {Array.from({ length: ROT_MAX_STACKS }, (_, i) => {
                const segmentTier = getRotTier(i + 1);
                const filled = i < pc.stacks;
                return (
                  <div
                    key={i}
                    className="flex-1 transition-all duration-300"
                    style={{
                      backgroundColor: filled ? segmentTier.color : 'transparent',
                      marginRight: i < ROT_MAX_STACKS - 1 ? '1px' : '0',
                    }}
                  />
                );
              })}
            </div>

            {/* Effect line */}
            {pc.stacks > 0 && (
              <div className="text-[11px] text-muted mb-1.5">
                <span className="font-semibold" style={{ color: tier.color === '#1A0A0A' ? '#ff4444' : tier.color }}>
                  {tier.damage} dmg/turn
                </span>
                {' \u2014 '}
                {tier.effect}
              </div>
            )}

            {/* Exhaustion warning */}
            {pc.exhaustionFromRot > 0 && (
              <div className="text-xs font-bold text-danger mb-1.5 flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-danger animate-pulse" />
                Exhaustion {pc.exhaustionFromRot} (from rot)
              </div>
            )}

            {/* Controls row */}
            <div className="flex items-center gap-1 flex-wrap">
              {/* Quick adjustment buttons */}
              <div className="flex gap-0.5">
                <button onClick={() => adjustStacks(pc.pcId, -2)} className="rot-btn rot-btn-remove" title="Remove 2 stacks">-2</button>
                <button onClick={() => adjustStacks(pc.pcId, -1)} className="rot-btn rot-btn-remove" title="Remove 1 stack">-1</button>
                <button onClick={() => adjustStacks(pc.pcId, 1)} className="rot-btn rot-btn-add" title="Add 1 stack">+1</button>
                <button onClick={() => adjustStacks(pc.pcId, 2)} className="rot-btn rot-btn-add" title="Add 2 stacks">+2</button>
                <button onClick={() => adjustStacks(pc.pcId, 3)} className="rot-btn rot-btn-add" title="Add 3 stacks">+3</button>
              </div>

              <div className="flex-1" />

              {/* Source dropdown */}
              <select
                className="text-[10px] bg-card-alt text-muted border border-border rounded px-1 py-0.5"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    applySource(pc.pcId, e.target.value);
                    e.target.value = '';
                  }
                }}
              >
                <option value="" disabled>Source...</option>
                {Object.entries(ROT_SOURCES).map(([key, src]) => (
                  <option key={key} value={key}>+{src.stacks} {src.note}</option>
                ))}
              </select>

              {/* Quick actions */}
              <button
                onClick={() => medicineCheck(pc.pcId)}
                className="text-[10px] px-1.5 py-0.5 rounded bg-card-alt text-success border border-border hover:bg-green-900/30 transition-colors"
                title="DC 15 Medicine check — removes 2 stacks"
              >
                Medicine
              </button>
              <button
                onClick={() => lesserRestoration(pc.pcId)}
                className="text-[10px] px-1.5 py-0.5 rounded bg-card-alt text-info border border-border hover:bg-blue-900/30 transition-colors"
                title="Lesser Restoration — removes ALL stacks + rot exhaustion"
              >
                L.Resto
              </button>
              {onSpotlightRot && (
                <button
                  onClick={() => onSpotlightRot(pc.pcId)}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-card-alt text-accent border border-border hover:bg-accent/20 transition-colors"
                  title="Send rot status to player"
                >
                  Show
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Global styles for rot buttons */}
      <style jsx>{`
        .rot-btn {
          font-size: 11px;
          font-weight: 600;
          width: 24px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          border: 1px solid var(--border);
          transition: all 0.15s;
          cursor: pointer;
        }
        .rot-btn-add {
          background: rgba(139, 0, 0, 0.2);
          color: #C53030;
        }
        .rot-btn-add:hover {
          background: rgba(139, 0, 0, 0.4);
        }
        .rot-btn-remove {
          background: rgba(68, 204, 102, 0.1);
          color: #44cc66;
        }
        .rot-btn-remove:hover {
          background: rgba(68, 204, 102, 0.25);
        }
      `}</style>
    </div>
  );
}
