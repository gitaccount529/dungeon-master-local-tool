'use client';

import { useCallback } from 'react';
import { CROW_TRINKETS, type TrinketState } from '@/data/encounters/scarletCrow';

interface TrinketTrackerProps {
  trinkets: TrinketState[];
  partyMembers: { id: string; name: string }[];
  onUpdate: (trinkets: TrinketState[]) => void;
}

const STATUS_COLORS = {
  active: { bg: 'rgba(255,215,0,0.15)', border: '#B8860B', text: '#FFD700', label: 'Active' },
  stolen: { bg: 'rgba(68,204,102,0.15)', border: '#44cc66', text: '#44cc66', label: 'Stolen' },
  destroyed: { bg: 'rgba(100,100,100,0.15)', border: '#555', text: '#888', label: 'Destroyed' },
};

export default function TrinketTracker({ trinkets, partyMembers, onUpdate }: TrinketTrackerProps) {
  const updateTrinket = useCallback((trinketId: string, updates: Partial<TrinketState>) => {
    onUpdate(trinkets.map(t => t.id === trinketId ? { ...t, ...updates } : t));
  }, [trinkets, onUpdate]);

  return (
    <div className="space-y-1.5">
      <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#B8860B' }}>
        Shiny Trophies
      </h3>
      <p className="text-[10px] text-muted">DC 19 Athletics/Sleight of Hand to steal. AC 18, 15 HP to destroy.</p>

      <div className="grid grid-cols-1 gap-1.5">
        {trinkets.map(t => {
          const def = CROW_TRINKETS.find(d => d.id === t.id);
          if (!def) return null;
          const style = STATUS_COLORS[t.status];

          return (
            <div
              key={t.id}
              className="rounded-lg p-2 border transition-all"
              style={{ backgroundColor: style.bg, borderColor: style.border }}
            >
              {/* Name + effect + status */}
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-xs" style={{ color: style.text }}>{def.name}</span>
                <span className="text-[10px] text-muted">({def.effect})</span>
                <div className="flex-1" />
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: style.bg, color: style.text, border: `1px solid ${style.border}` }}>
                  {style.label}
                </span>
              </div>

              {/* Description */}
              <p className="text-[10px] text-muted mb-1.5">{def.description}</p>

              {/* Controls */}
              <div className="flex items-center gap-1 flex-wrap">
                {/* Status toggles */}
                {(['active', 'stolen', 'destroyed'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => updateTrinket(t.id, {
                      status,
                      holderPcId: status === 'stolen' ? t.holderPcId : undefined,
                      currentHp: status === 'active' ? def.destroyHP : t.currentHp,
                    })}
                    className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                      t.status === status
                        ? 'font-bold'
                        : 'opacity-50 hover:opacity-80'
                    }`}
                    style={{
                      borderColor: STATUS_COLORS[status].border,
                      color: STATUS_COLORS[status].text,
                      backgroundColor: t.status === status ? STATUS_COLORS[status].bg : 'transparent',
                    }}
                  >
                    {STATUS_COLORS[status].label}
                  </button>
                ))}

                {/* HP tracker (for targeting the trinket) */}
                {t.status === 'active' && (
                  <div className="flex items-center gap-1 ml-2">
                    <span className="text-[10px] text-muted">HP:</span>
                    <button
                      onClick={() => updateTrinket(t.id, { currentHp: Math.max(0, t.currentHp - 1) })}
                      className="text-[10px] w-4 h-4 rounded bg-card-alt text-danger border border-border flex items-center justify-center"
                    >-</button>
                    <span className="text-[10px] font-bold tabular-nums" style={{ color: t.currentHp <= 5 ? '#ff4444' : style.text }}>
                      {t.currentHp}/{def.destroyHP}
                    </span>
                    <button
                      onClick={() => updateTrinket(t.id, { currentHp: Math.min(def.destroyHP, t.currentHp + 1) })}
                      className="text-[10px] w-4 h-4 rounded bg-card-alt text-success border border-border flex items-center justify-center"
                    >+</button>
                  </div>
                )}

                {/* Holder dropdown (if stolen) */}
                {t.status === 'stolen' && (
                  <select
                    className="text-[10px] bg-card-alt text-foreground border border-border rounded px-1 py-0.5 ml-2"
                    value={t.holderPcId || ''}
                    onChange={(e) => updateTrinket(t.id, { holderPcId: e.target.value || undefined })}
                  >
                    <option value="">Holder...</option>
                    {partyMembers.map(pc => (
                      <option key={pc.id} value={pc.id}>{pc.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
