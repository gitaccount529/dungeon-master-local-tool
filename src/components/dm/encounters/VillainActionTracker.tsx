'use client';

import { useCallback } from 'react';
import { CROW_VILLAIN_ACTIONS, type VillainActionState } from '@/data/encounters/scarletCrow';

interface VillainActionTrackerProps {
  villainActions: VillainActionState[];
  crowHp: number;
  onUpdate: (actions: VillainActionState[]) => void;
  onSpotlight: (text: string, title?: string) => void;
}

const LABEL_COLORS: Record<string, { bg: string; text: string }> = {
  'Opener': { bg: 'rgba(102,187,255,0.15)', text: '#66bbff' },
  'Crowd Control': { bg: 'rgba(204,102,255,0.15)', text: '#cc66ff' },
  'Ultimate \u2014 Reactive': { bg: 'rgba(255,68,68,0.2)', text: '#ff4444' },
};

export default function VillainActionTracker({ villainActions, crowHp, onUpdate, onSpotlight }: VillainActionTrackerProps) {
  const toggleUsed = useCallback((actionId: string) => {
    onUpdate(villainActions.map(a => a.id === actionId ? { ...a, used: !a.used } : a));
  }, [villainActions, onUpdate]);

  return (
    <div className="space-y-1.5">
      <h3 className="text-sm font-bold uppercase tracking-wider text-danger">Villain Actions</h3>

      <div className="space-y-1.5">
        {CROW_VILLAIN_ACTIONS.map(def => {
          const state = villainActions.find(a => a.id === def.id);
          const used = state?.used ?? false;
          const isDeathThroes = def.autoTrigger;
          const shouldTrigger = isDeathThroes && !used && crowHp <= (def.hpThreshold ?? 0) && crowHp > 0;
          const labelStyle = LABEL_COLORS[def.label] ?? { bg: 'rgba(100,100,100,0.15)', text: '#888' };

          return (
            <div
              key={def.id}
              className={`rounded-lg p-2 border transition-all ${
                shouldTrigger
                  ? 'border-red-500 ring-2 ring-red-500/50 animate-pulse bg-red-900/20'
                  : used
                    ? 'border-border opacity-50 bg-card-alt'
                    : 'border-border bg-card'
              }`}
            >
              {/* Trigger alert */}
              {shouldTrigger && (
                <div className="text-xs font-bold text-danger mb-1 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-danger animate-pulse" />
                  TRIGGER NOW \u2014 Crow at {crowHp} HP
                </div>
              )}

              {/* Header */}
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-xs text-foreground">{def.name}</span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                  style={{ backgroundColor: labelStyle.bg, color: labelStyle.text }}
                >
                  {def.label}
                </span>
                <div className="flex-1" />
                <button
                  onClick={() => toggleUsed(def.id)}
                  className={`text-[10px] px-2 py-0.5 rounded font-bold border transition-colors ${
                    used
                      ? 'bg-card-alt text-muted border-border'
                      : 'bg-success/20 text-success border-success/50 hover:bg-success/30'
                  }`}
                >
                  {used ? 'Used' : 'Available'}
                </button>
              </div>

              {/* Tell (DM read-aloud) */}
              {!used && (
                <>
                  <div className="text-[11px] italic text-accent-secondary mb-1 border-l-2 border-accent pl-2">
                    {def.tell}
                  </div>
                  <p className="text-[10px] text-muted mb-1">{def.effect}</p>
                  {def.dmNote && (
                    <p className="text-[10px] font-semibold text-warning mb-1">{def.dmNote}</p>
                  )}
                  <button
                    onClick={() => onSpotlight(def.spotlightText, def.name)}
                    className="text-[10px] px-2 py-0.5 rounded bg-accent/20 text-accent border border-accent/50 hover:bg-accent/30 transition-colors"
                  >
                    Show to Players
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
