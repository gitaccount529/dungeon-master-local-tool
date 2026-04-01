'use client';

import { useState, useCallback } from 'react';
import type { KenkuRecallState } from '@/data/encounters/scarletCrow';

interface KenkuRecallTrackerProps {
  recall: KenkuRecallState;
  partyMembers: { id: string; name: string }[];
  onUpdate: (recall: KenkuRecallState) => void;
}

export default function KenkuRecallTracker({ recall, partyMembers, onUpdate }: KenkuRecallTrackerProps) {
  const [inputPcId, setInputPcId] = useState('');
  const [inputAttack, setInputAttack] = useState('');

  const addAttack = useCallback((pcId: string, attack: string) => {
    if (!pcId || !attack.trim()) return;
    const current = { ...recall.currentRound };
    current[pcId] = [...(current[pcId] || []), attack.trim()];
    onUpdate({ ...recall, currentRound: current });
  }, [recall, onUpdate]);

  const removeAttack = useCallback((pcId: string, index: number) => {
    const current = { ...recall.currentRound };
    current[pcId] = [...(current[pcId] || [])];
    current[pcId].splice(index, 1);
    onUpdate({ ...recall, currentRound: current });
  }, [recall, onUpdate]);

  const nextRound = useCallback(() => {
    onUpdate({
      round: recall.round + 1,
      previousRound: { ...recall.currentRound },
      currentRound: {},
    });
  }, [recall, onUpdate]);

  const isRepeated = useCallback((pcId: string, attack: string): boolean => {
    const prev = recall.previousRound[pcId] || [];
    return prev.some(a => a.toLowerCase() === attack.toLowerCase());
  }, [recall.previousRound]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-warning">Kenku Recall</h3>
        <span className="text-[10px] text-muted">Round {recall.round}</span>
        <div className="flex-1" />
        <button
          onClick={nextRound}
          className="text-[10px] px-2 py-0.5 rounded bg-card-alt text-warning border border-border hover:bg-yellow-900/30 transition-colors"
        >
          Next Round
        </button>
      </div>

      <p className="text-[10px] text-muted">Repeated attacks from previous round get disadvantage.</p>

      {/* Input row */}
      <div className="flex gap-1">
        <select
          className="text-[10px] bg-card-alt text-foreground border border-border rounded px-1 py-0.5 flex-shrink-0"
          value={inputPcId}
          onChange={(e) => setInputPcId(e.target.value)}
        >
          <option value="">PC...</option>
          {partyMembers.map(pc => (
            <option key={pc.id} value={pc.id}>{pc.name}</option>
          ))}
        </select>
        <input
          className="text-[10px] bg-card-alt text-foreground border border-border rounded px-1.5 py-0.5 flex-1 min-w-0"
          placeholder="Attack name..."
          value={inputAttack}
          onChange={(e) => setInputAttack(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && inputPcId && inputAttack.trim()) {
              addAttack(inputPcId, inputAttack);
              setInputAttack('');
            }
          }}
        />
        <button
          onClick={() => {
            if (inputPcId && inputAttack.trim()) {
              addAttack(inputPcId, inputAttack);
              setInputAttack('');
            }
          }}
          className="text-[10px] px-1.5 py-0.5 rounded bg-card-alt text-accent border border-border hover:bg-accent/20 transition-colors flex-shrink-0"
        >
          Add
        </button>
      </div>

      {/* Per-PC attack display */}
      <div className="space-y-1">
        {partyMembers.map(pc => {
          const currentAttacks = recall.currentRound[pc.id] || [];
          const prevAttacks = recall.previousRound[pc.id] || [];
          if (currentAttacks.length === 0 && prevAttacks.length === 0) return null;

          return (
            <div key={pc.id} className="bg-card-alt rounded p-1.5 border border-border">
              <span className="text-[11px] font-semibold text-foreground">{pc.name}</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {/* Current round attacks */}
                {currentAttacks.map((attack, i) => {
                  const repeated = isRepeated(pc.id, attack);
                  return (
                    <span
                      key={`c-${i}`}
                      className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 ${
                        repeated
                          ? 'bg-red-900/40 text-danger border border-red-700 font-bold'
                          : 'bg-card text-foreground border border-border'
                      }`}
                    >
                      {attack}
                      {repeated && <span className="text-[9px] font-bold">DISADV</span>}
                      <button
                        onClick={() => removeAttack(pc.id, i)}
                        className="text-muted hover:text-danger ml-0.5"
                      >\u00d7</button>
                    </span>
                  );
                })}
                {/* Previous round (faded) */}
                {prevAttacks.length > 0 && (
                  <span className="text-[9px] text-muted opacity-50 self-center">
                    prev: {prevAttacks.join(', ')}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
