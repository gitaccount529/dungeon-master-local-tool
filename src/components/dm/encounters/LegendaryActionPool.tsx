'use client';

import { useCallback } from 'react';
import { CROW_LEGENDARY_OPTIONS, LEGENDARY_ACTIONS_PER_ROUND, type LegendaryPoolState } from '@/data/encounters/scarletCrow';

interface LegendaryActionPoolProps {
  pool: LegendaryPoolState;
  onUpdate: (pool: LegendaryPoolState) => void;
}

export default function LegendaryActionPool({ pool, onUpdate }: LegendaryActionPoolProps) {
  const spend = useCallback((cost: number) => {
    if (cost > pool.remaining) return;
    onUpdate({ ...pool, remaining: pool.remaining - cost });
  }, [pool, onUpdate]);

  const reset = useCallback(() => {
    onUpdate({ ...pool, remaining: pool.max });
  }, [pool, onUpdate]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-magic">Legendary Actions</h3>
        <div className="flex-1" />
        <span className="text-xs font-bold tabular-nums" style={{ color: pool.remaining === 0 ? '#ff4444' : '#cc66ff' }}>
          {pool.remaining}/{pool.max}
        </span>
        <button
          onClick={reset}
          className="text-[10px] px-1.5 py-0.5 rounded bg-card-alt text-magic border border-border hover:bg-purple-900/30 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Pips */}
      <div className="flex gap-1.5">
        {Array.from({ length: pool.max }, (_, i) => (
          <div
            key={i}
            className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
              i < pool.remaining
                ? 'bg-magic border-magic shadow-[0_0_6px_rgba(204,102,255,0.4)]'
                : 'bg-transparent border-border'
            }`}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-1">
        {CROW_LEGENDARY_OPTIONS.map(opt => {
          const disabled = opt.cost > pool.remaining;
          return (
            <button
              key={opt.name}
              onClick={() => spend(opt.cost)}
              disabled={disabled}
              className={`text-left p-1.5 rounded border transition-all text-[11px] ${
                disabled
                  ? 'opacity-30 cursor-not-allowed border-border bg-card-alt'
                  : 'border-border bg-card hover:bg-magic/10 hover:border-magic cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="font-semibold text-foreground">{opt.name}</span>
                <span className="ml-auto text-[10px] font-bold text-magic">{opt.cost}</span>
              </div>
              <p className="text-[10px] text-muted mt-0.5 line-clamp-2">{opt.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
