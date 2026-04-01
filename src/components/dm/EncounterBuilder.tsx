'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAdventureContext } from '@/lib/AdventureContext';
import { calculateEncounterDifficulty, getXPForCR } from '@/lib/encounterDifficulty';
import type { DifficultyResult } from '@/lib/encounterDifficulty';
import type { Monster, PartyMember, Zone } from '@/lib/types';
import Button from '@/components/shared/Button';

interface EncounterBuilderProps {
  open: boolean;
  onClose: () => void;
  partyMembers: PartyMember[];
  onStartCombat: (monsterIds: string[]) => void;
}

interface SelectedMonster {
  monsterId: string;
  count: number;
}

export default function EncounterBuilder({ open, onClose, partyMembers, onStartCombat }: EncounterBuilderProps) {
  const { data: adventureData, patchZone } = useAdventureContext();
  const monsters: Monster[] = adventureData?.monsters ?? [];
  const allZones: Zone[] = useMemo(() => {
    if (!adventureData) return [];
    const z: Zone[] = [...(adventureData.zones.zones ?? [])];
    if (adventureData.zones.travelSection) z.unshift(adventureData.zones.travelSection);
    if (adventureData.zones.zoneOverview) z.unshift(adventureData.zones.zoneOverview);
    return z;
  }, [adventureData]);

  const [selected, setSelected] = useState<SelectedMonster[]>([]);
  const [addMonsterId, setAddMonsterId] = useState('');
  const [overrideParty, setOverrideParty] = useState(false);
  const [customPartySize, setCustomPartySize] = useState(4);
  const [customPartyLevel, setCustomPartyLevel] = useState(5);
  const [saveZoneId, setSaveZoneId] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setSelected([]);
      setAddMonsterId('');
      setSaveZoneId('');
    }
  }, [open]);

  // Build the CR array for difficulty calc
  const monsterCRs = useMemo(() => {
    const crs: string[] = [];
    for (const s of selected) {
      const m = monsters.find(mon => mon.id === s.monsterId);
      if (m) {
        for (let i = 0; i < s.count; i++) crs.push(m.cr);
      }
    }
    return crs;
  }, [selected, monsters]);

  // Party levels
  const partyLevels = useMemo(() => {
    if (overrideParty) {
      return Array(customPartySize).fill(customPartyLevel);
    }
    if (partyMembers.length === 0) return [5, 5, 5, 5]; // fallback
    return partyMembers.map(p => p.level);
  }, [overrideParty, customPartySize, customPartyLevel, partyMembers]);

  const difficulty: DifficultyResult | null = useMemo(() => {
    if (monsterCRs.length === 0) return null;
    return calculateEncounterDifficulty(monsterCRs, partyLevels);
  }, [monsterCRs, partyLevels]);

  const handleAddMonster = () => {
    if (!addMonsterId) return;
    const existing = selected.find(s => s.monsterId === addMonsterId);
    if (existing) {
      setSelected(selected.map(s => s.monsterId === addMonsterId ? { ...s, count: s.count + 1 } : s));
    } else {
      setSelected([...selected, { monsterId: addMonsterId, count: 1 }]);
    }
  };

  const adjustCount = (monsterId: string, delta: number) => {
    setSelected(prev => prev.map(s => {
      if (s.monsterId !== monsterId) return s;
      const newCount = s.count + delta;
      return newCount > 0 ? { ...s, count: newCount } : s;
    }));
  };

  const removeMonster = (monsterId: string) => {
    setSelected(prev => prev.filter(s => s.monsterId !== monsterId));
  };

  const handleAddToCombat = () => {
    const ids: string[] = [];
    for (const s of selected) {
      for (let i = 0; i < s.count; i++) ids.push(s.monsterId);
    }
    onStartCombat(ids);
    onClose();
  };

  const handleSaveToZone = async () => {
    if (!saveZoneId || selected.length === 0) return;
    const zone = allZones.find(z => z.id === saveZoneId);
    if (!zone) return;

    const monsterIds: string[] = [];
    const names: string[] = [];
    for (const s of selected) {
      const m = monsters.find(mon => mon.id === s.monsterId);
      if (!m) continue;
      for (let i = 0; i < s.count; i++) monsterIds.push(m.id);
      names.push(`${m.name}${s.count > 1 ? ` x${s.count}` : ''}`);
    }

    const newEncounter = {
      name: `Custom Encounter (${names.join(', ')})`,
      monsters: monsterIds,
      notes: difficulty ? `${difficulty.difficulty.toUpperCase()} - Adjusted XP: ${difficulty.adjustedXP.toLocaleString()}` : '',
    };

    const updatedEncounters = [...(zone.encounters || []), newEncounter];
    await patchZone(saveZoneId, { encounters: updatedEncounters });
    onClose();
  };

  if (!open) return null;

  const avgLevel = partyLevels.length > 0
    ? Math.round(partyLevels.reduce((a, b) => a + b, 0) / partyLevels.length)
    : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-accent tracking-wider uppercase">Encounter Builder</h2>
          <button onClick={onClose} className="text-muted hover:text-body text-xl cursor-pointer w-8 h-8 flex items-center justify-center">&times;</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Party Info */}
          <div className="bg-card-alt border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs uppercase tracking-wider text-accent-secondary font-semibold">Party Info</h3>
              <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={overrideParty}
                  onChange={e => setOverrideParty(e.target.checked)}
                  className="rounded"
                />
                Override
              </label>
            </div>
            {overrideParty ? (
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-body">
                  <span className="text-muted text-xs">Size:</span>
                  <input type="number" min={1} max={10} value={customPartySize} onChange={e => setCustomPartySize(Number(e.target.value))}
                    className="w-16 bg-background border border-border rounded px-2 py-1 text-sm text-body focus:outline-none focus:border-accent" />
                </label>
                <label className="flex items-center gap-2 text-sm text-body">
                  <span className="text-muted text-xs">Avg Level:</span>
                  <input type="number" min={1} max={20} value={customPartyLevel} onChange={e => setCustomPartyLevel(Number(e.target.value))}
                    className="w-16 bg-background border border-border rounded px-2 py-1 text-sm text-body focus:outline-none focus:border-accent" />
                </label>
              </div>
            ) : (
              <p className="text-sm text-body">
                {partyMembers.length > 0
                  ? `${partyMembers.length} members, avg level ${avgLevel}`
                  : 'No party data loaded (using default: 4 level-5 PCs)'}
              </p>
            )}
          </div>

          {/* Monster Selection */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-accent font-semibold mb-3">Add Monsters</h3>
            <div className="flex gap-2">
              <select
                value={addMonsterId}
                onChange={e => setAddMonsterId(e.target.value)}
                className="flex-1 bg-background border border-border rounded px-3 py-2 text-sm text-body focus:outline-none focus:border-accent"
              >
                <option value="">Select a monster...</option>
                {monsters.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} (CR {m.cr} / {getXPForCR(m.cr).toLocaleString()} XP)
                  </option>
                ))}
              </select>
              <Button variant="primary" size="sm" onClick={handleAddMonster} disabled={!addMonsterId}>
                Add
              </Button>
            </div>
          </div>

          {/* Selected Monsters List */}
          {selected.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-wider text-accent font-semibold">Encounter Roster</h3>
              <div className="bg-card-alt border border-border rounded-lg divide-y divide-border">
                {selected.map(s => {
                  const m = monsters.find(mon => mon.id === s.monsterId);
                  if (!m) return null;
                  const xp = getXPForCR(m.cr);
                  return (
                    <div key={s.monsterId} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-body">{m.name}</span>
                        <span className="text-xs text-muted ml-2">CR {m.cr}</span>
                        <span className="text-xs text-accent-secondary ml-2">{(xp * s.count).toLocaleString()} XP</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => adjustCount(s.monsterId, -1)} className="w-7 h-7 rounded bg-card border border-border text-body hover:bg-card-alt flex items-center justify-center text-sm cursor-pointer">-</button>
                        <span className="w-8 text-center text-sm font-medium text-body">{s.count}</span>
                        <button onClick={() => adjustCount(s.monsterId, 1)} className="w-7 h-7 rounded bg-card border border-border text-body hover:bg-card-alt flex items-center justify-center text-sm cursor-pointer">+</button>
                      </div>
                      <button onClick={() => removeMonster(s.monsterId)} className="text-danger/60 hover:text-danger text-xs cursor-pointer px-2">Remove</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Difficulty Meter */}
          {difficulty && (
            <DifficultyMeter difficulty={difficulty} />
          )}

          {/* Actions */}
          {selected.length > 0 && (
            <div className="flex flex-col gap-3 pt-2 border-t border-border">
              <div className="flex gap-3">
                <Button variant="primary" size="sm" onClick={handleAddToCombat} className="flex-1">
                  Add to Combat
                </Button>
              </div>
              <div className="flex gap-2 items-center">
                <select
                  value={saveZoneId}
                  onChange={e => setSaveZoneId(e.target.value)}
                  className="flex-1 bg-background border border-border rounded px-3 py-2 text-sm text-body focus:outline-none focus:border-accent"
                >
                  <option value="">Pick a zone to save to...</option>
                  {allZones.map(z => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>
                <Button variant="secondary" size="sm" onClick={handleSaveToZone} disabled={!saveZoneId}>
                  Save as Zone Encounter
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Difficulty Meter ──

function DifficultyMeter({ difficulty }: { difficulty: DifficultyResult }) {
  const { thresholds, adjustedXP } = difficulty;

  // The bar goes from 0 to deadly * 1.5 (so deadly isn't at the far right edge)
  const maxXP = Math.max(thresholds.deadly * 1.5, adjustedXP * 1.1);

  const pctEasy = (thresholds.easy / maxXP) * 100;
  const pctMedium = (thresholds.medium / maxXP) * 100;
  const pctHard = (thresholds.hard / maxXP) * 100;
  const pctDeadly = (thresholds.deadly / maxXP) * 100;
  const pctCurrent = Math.min((adjustedXP / maxXP) * 100, 100);

  const diffColors: Record<string, string> = {
    trivial: 'text-muted',
    easy: 'text-success',
    medium: 'text-gold',
    hard: 'text-warning',
    deadly: 'text-danger',
  };

  const markerColors: Record<string, string> = {
    trivial: 'bg-muted',
    easy: 'bg-success',
    medium: 'bg-gold',
    hard: 'bg-warning',
    deadly: 'bg-danger',
  };

  return (
    <div className="bg-card-alt border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-wider text-accent font-semibold">Difficulty</h3>
        <span className={`text-sm font-bold uppercase tracking-wider ${diffColors[difficulty.difficulty]}`}>
          {difficulty.difficulty} (Adjusted XP: {adjustedXP.toLocaleString()})
        </span>
      </div>

      {/* Bar */}
      <div className="relative h-6 bg-background rounded-full border border-border overflow-hidden">
        {/* Gradient sections */}
        <div className="absolute inset-0 flex">
          <div className="bg-success/30" style={{ width: `${pctMedium}%` }} />
          <div className="bg-gold/30" style={{ width: `${pctHard - pctMedium}%` }} />
          <div className="bg-warning/30" style={{ width: `${pctDeadly - pctHard}%` }} />
          <div className="bg-danger/30" style={{ width: `${100 - pctDeadly}%` }} />
        </div>

        {/* Threshold lines */}
        <div className="absolute top-0 bottom-0 w-px bg-success/60" style={{ left: `${pctEasy}%` }} />
        <div className="absolute top-0 bottom-0 w-px bg-gold/60" style={{ left: `${pctMedium}%` }} />
        <div className="absolute top-0 bottom-0 w-px bg-warning/60" style={{ left: `${pctHard}%` }} />
        <div className="absolute top-0 bottom-0 w-px bg-danger/60" style={{ left: `${pctDeadly}%` }} />

        {/* Current XP marker */}
        <div
          className={`absolute top-0 bottom-0 w-1 ${markerColors[difficulty.difficulty]} rounded-full shadow-lg transition-all duration-300`}
          style={{ left: `${pctCurrent}%` }}
        />
      </div>

      {/* Threshold labels */}
      <div className="relative h-4 text-[10px] text-muted">
        <span className="absolute text-success" style={{ left: `${pctEasy}%`, transform: 'translateX(-50%)' }}>Easy {thresholds.easy.toLocaleString()}</span>
        <span className="absolute text-gold" style={{ left: `${pctMedium}%`, transform: 'translateX(-50%)' }}>Med {thresholds.medium.toLocaleString()}</span>
        <span className="absolute text-warning" style={{ left: `${pctHard}%`, transform: 'translateX(-50%)' }}>Hard {thresholds.hard.toLocaleString()}</span>
        <span className="absolute text-danger" style={{ left: `${pctDeadly}%`, transform: 'translateX(-50%)' }}>Deadly {thresholds.deadly.toLocaleString()}</span>
      </div>

      {/* XP breakdown */}
      <div className="flex gap-4 text-xs text-muted">
        <span>Raw XP: {difficulty.rawXP.toLocaleString()}</span>
        <span>Party: {difficulty.partySize} @ lvl {difficulty.partyLevel}</span>
        <span>Monsters: {difficulty.adjustedXP !== difficulty.rawXP ? `${(difficulty.adjustedXP / difficulty.rawXP).toFixed(1)}x multiplier` : 'no multiplier'}</span>
      </div>
    </div>
  );
}
