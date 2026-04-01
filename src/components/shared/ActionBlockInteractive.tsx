'use client';

import { useState } from 'react';
import { parseActionText } from '@/lib/diceRoller';
import DiceRollButton from './DiceRollButton';

interface ActionBlockInteractiveProps {
  action: { name: string; description: string };
  interactive?: boolean;
  combatParticipants?: Array<{ id: string; name: string; hp_current: number; hp_max: number }>;
  onApplyDamage?: (targetId: string, amount: number) => void;
}

export default function ActionBlockInteractive({
  action,
  interactive = true,
  combatParticipants,
  onApplyDamage,
}: ActionBlockInteractiveProps) {
  const [lastDamageRoll, setLastDamageRoll] = useState<{ total: number; type: string } | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [appliedFlash, setAppliedFlash] = useState(false);

  // AoE state
  const [aoeMode, setAoeMode] = useState(false);
  const [selectedTargets, setSelectedTargets] = useState<Set<string>>(new Set());
  const [halfDamage, setHalfDamage] = useState(false);
  const [aoeAppliedFlash, setAoeAppliedFlash] = useState(false);

  // Non-interactive: plain text rendering
  if (!interactive) {
    return (
      <div className="mb-2">
        <p className="text-sm">
          <span className="font-semibold text-accent-secondary italic">{action.name}.</span>{' '}
          <span className="text-body">{action.description}</span>
        </p>
      </div>
    );
  }

  const segments = parseActionText(action.description);

  const handleRollResult = (result: { type: 'attack' | 'damage' | 'save'; total: number; details: string }) => {
    if (result.type === 'damage') {
      const parts = result.details.split(' ');
      const total = parseInt(parts[0]);
      const damageType = parts.slice(1).join(' ');
      setLastDamageRoll({ total, type: damageType });
      setAppliedFlash(false);
      setAoeAppliedFlash(false);
      // Auto-select first participant if none selected (single target mode)
      if (!selectedTarget && combatParticipants && combatParticipants.length > 0) {
        setSelectedTarget(combatParticipants[0].id);
      }
    }
  };

  const handleApplyDamage = () => {
    if (!lastDamageRoll || !selectedTarget || !onApplyDamage) return;
    onApplyDamage(selectedTarget, -lastDamageRoll.total);
    setAppliedFlash(true);
    setTimeout(() => {
      setLastDamageRoll(null);
      setAppliedFlash(false);
    }, 1200);
  };

  const toggleTarget = (id: string) => {
    setSelectedTargets(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (!combatParticipants) return;
    setSelectedTargets(new Set(combatParticipants.map(p => p.id)));
  };

  const clearAll = () => {
    setSelectedTargets(new Set());
  };

  const applyAoE = () => {
    if (!lastDamageRoll || !onApplyDamage || selectedTargets.size === 0) return;
    const dmg = halfDamage ? Math.floor(lastDamageRoll.total / 2) : lastDamageRoll.total;
    selectedTargets.forEach(targetId => {
      onApplyDamage(targetId, -dmg);
    });
    setAoeAppliedFlash(true);
    setTimeout(() => {
      setLastDamageRoll(null);
      setAoeAppliedFlash(false);
      setSelectedTargets(new Set());
      setHalfDamage(false);
    }, 1200);
  };

  return (
    <div className="mb-2">
      <div className="text-sm">
        <span className="font-semibold text-accent-secondary italic">{action.name}.</span>{' '}
        {segments.map((seg, i) => {
          if (seg.type === 'text') {
            return <span key={i} className="text-body">{seg.content}</span>;
          }
          if (seg.type === 'attack') {
            return (
              <DiceRollButton
                key={i}
                type="attack"
                label={seg.content}
                attackBonus={seg.attackBonus}
                onRollResult={handleRollResult}
              />
            );
          }
          if (seg.type === 'damage' && seg.damage) {
            return (
              <DiceRollButton
                key={i}
                type="damage"
                label={seg.content}
                damage={seg.damage}
                onRollResult={handleRollResult}
              />
            );
          }
          if (seg.type === 'save') {
            return (
              <DiceRollButton
                key={i}
                type="save"
                label={seg.content}
                saveDC={seg.saveDC}
                saveAbility={seg.saveAbility}
                onRollResult={handleRollResult}
              />
            );
          }
          return <span key={i} className="text-body">{seg.content}</span>;
        })}
      </div>

      {/* Apply Damage bar */}
      {combatParticipants && combatParticipants.length > 0 && onApplyDamage && lastDamageRoll && (
        <div className="mt-1.5 text-xs bg-card-alt border border-border rounded px-2 py-1.5">
          {appliedFlash || aoeAppliedFlash ? (
            <span className="text-green-400 font-semibold">Applied!</span>
          ) : (
            <>
              {/* Mode toggle: Single / AoE */}
              <div className="flex items-center gap-2 mb-1.5">
                <button
                  onClick={() => setAoeMode(false)}
                  className={`px-2 py-0.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
                    !aoeMode ? 'bg-accent/20 text-accent border border-accent/40' : 'text-muted hover:text-body'
                  }`}
                >
                  Single
                </button>
                <button
                  onClick={() => setAoeMode(true)}
                  className={`px-2 py-0.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
                    aoeMode ? 'bg-danger/20 text-danger border border-danger/40' : 'text-muted hover:text-body'
                  }`}
                >
                  AoE
                </button>
                <span className="text-muted ml-auto">
                  {lastDamageRoll.total} {lastDamageRoll.type}
                </span>
                <button
                  onClick={() => setLastDamageRoll(null)}
                  className="text-muted hover:text-body cursor-pointer px-1"
                  title="Dismiss"
                >
                  &times;
                </button>
              </div>

              {!aoeMode ? (
                /* Single target mode */
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTarget}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                    className="bg-card border border-border rounded px-1.5 py-0.5 text-xs text-body flex-1 min-w-0"
                  >
                    <option value="">Select target...</option>
                    {combatParticipants.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.hp_current}/{p.hp_max})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleApplyDamage}
                    disabled={!selectedTarget}
                    className="text-danger font-semibold hover:bg-danger/10 px-2 py-0.5 rounded cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    Apply -{lastDamageRoll.total} HP
                  </button>
                </div>
              ) : (
                /* AoE mode */
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted">Select targets:</span>
                    <button onClick={selectAll} className="text-xs text-accent hover:underline cursor-pointer">All</button>
                    <button onClick={clearAll} className="text-xs text-muted hover:underline cursor-pointer">None</button>
                    <label className="flex items-center gap-1 text-xs text-warning ml-auto cursor-pointer">
                      <input
                        type="checkbox"
                        checked={halfDamage}
                        onChange={(e) => setHalfDamage(e.target.checked)}
                        className="accent-warning"
                      />
                      Half (saved)
                    </label>
                  </div>
                  {combatParticipants.map(p => (
                    <label key={p.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-card/50 rounded px-1 py-0.5">
                      <input
                        type="checkbox"
                        checked={selectedTargets.has(p.id)}
                        onChange={() => toggleTarget(p.id)}
                        className="accent-accent"
                      />
                      <span className="text-body">{p.name}</span>
                      <span className="text-muted">({p.hp_current}/{p.hp_max})</span>
                    </label>
                  ))}
                  <button
                    onClick={applyAoE}
                    disabled={selectedTargets.size === 0}
                    className="text-xs bg-danger/20 text-danger px-2 py-1 rounded cursor-pointer hover:bg-danger/30 disabled:opacity-40 disabled:cursor-not-allowed font-semibold mt-1"
                  >
                    Apply -{halfDamage ? Math.floor(lastDamageRoll.total / 2) : lastDamageRoll.total} to {selectedTargets.size} target{selectedTargets.size !== 1 ? 's' : ''}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
