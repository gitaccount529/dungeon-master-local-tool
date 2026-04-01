'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PartyMember, AbilityScores, SpellSlots, LibraryParty } from '@/lib/types';
import { conditions as allConditions } from '@/data/conditions';
import { useLibrary } from '@/hooks/useLibrary';
import { v4 as uuidv4 } from 'uuid';
import Button from '@/components/shared/Button';
import HPBar from '@/components/shared/HPBar';
import ConditionBadge from '@/components/shared/ConditionBadge';
import CharacterCreator from '@/components/dm/CharacterCreator';

// ═══════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════

const ABILITY_NAMES = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
const ABILITY_LABELS: Record<string, string> = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' };

const DND_SKILLS: { name: string; ability: string }[] = [
  { name: 'Acrobatics', ability: 'dex' },
  { name: 'Animal Handling', ability: 'wis' },
  { name: 'Arcana', ability: 'int' },
  { name: 'Athletics', ability: 'str' },
  { name: 'Deception', ability: 'cha' },
  { name: 'History', ability: 'int' },
  { name: 'Insight', ability: 'wis' },
  { name: 'Intimidation', ability: 'cha' },
  { name: 'Investigation', ability: 'int' },
  { name: 'Medicine', ability: 'wis' },
  { name: 'Nature', ability: 'int' },
  { name: 'Perception', ability: 'wis' },
  { name: 'Performance', ability: 'cha' },
  { name: 'Persuasion', ability: 'cha' },
  { name: 'Religion', ability: 'int' },
  { name: 'Sleight of Hand', ability: 'dex' },
  { name: 'Stealth', ability: 'dex' },
  { name: 'Survival', ability: 'wis' },
];

const SPELL_LEVEL_LABELS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];

function abilityMod(score: number): number {
  return Math.floor((score - 10) / 2);
}

function formatMod(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function calcProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

function calcPassivePerception(stats: AbilityScores | undefined, level: number, skills: string[] | undefined): number {
  const wisMod = stats ? abilityMod(stats.wis) : 0;
  const proficient = skills?.includes('Perception') ? calcProficiencyBonus(level) : 0;
  return 10 + wisMod + proficient;
}

// ═══════════════════════════════════════════
// Collapsible Section
// ═══════════════════════════════════════════

function CollapsibleSection({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border/50 rounded-md overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 bg-card-alt/50 text-xs uppercase tracking-wider text-muted font-semibold hover:text-accent cursor-pointer transition-colors"
      >
        {title}
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>&#9660;</span>
      </button>
      {open && <div className="p-3 space-y-3">{children}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════
// Portrait Avatar
// ═══════════════════════════════════════════

function CharacterPortrait({ member, size = 'md' }: { member: PartyMember; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const textClass = size === 'sm' ? 'text-[10px]' : 'text-xs';

  if (member.imageUrl) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden border border-border flex-shrink-0`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={member.imageUrl}
          alt={member.name}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </div>
    );
  }

  // Fallback: initials circle
  const initials = member.class ? member.class.substring(0, 2).toUpperCase() : member.name.substring(0, 2).toUpperCase();
  return (
    <div className={`${sizeClass} rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center flex-shrink-0`}>
      <span className={`${textClass} font-bold text-accent`}>{initials}</span>
    </div>
  );
}

// ═══════════════════════════════════════════
// Spell Slot Display/Editor
// ═══════════════════════════════════════════

function SpellSlotTracker({ spellSlots, onUpdate }: { spellSlots?: SpellSlots; onUpdate: (slots: SpellSlots) => void }) {
  const [setupMode, setSetupMode] = useState(false);
  const [setupSlots, setSetupSlots] = useState<SpellSlots>(() => {
    const initial: SpellSlots = {};
    for (let i = 1; i <= 9; i++) {
      initial[i] = { max: spellSlots?.[i]?.max ?? 0, used: spellSlots?.[i]?.used ?? 0 };
    }
    return initial;
  });

  const hasAnySlots = spellSlots && Object.values(spellSlots).some(s => s.max > 0);

  const toggleSlot = (level: number, slotIndex: number) => {
    if (!spellSlots) return;
    const current = { ...spellSlots };
    const slot = current[level];
    if (!slot) return;
    // If clicking a used slot (index < used count), mark it available
    // If clicking an available slot, mark it used
    if (slotIndex < slot.used) {
      current[level] = { ...slot, used: slotIndex };
    } else {
      current[level] = { ...slot, used: slotIndex + 1 };
    }
    onUpdate(current);
  };

  const longRest = () => {
    if (!spellSlots) return;
    const reset: SpellSlots = {};
    for (const [lvl, slot] of Object.entries(spellSlots)) {
      reset[Number(lvl)] = { max: slot.max, used: 0 };
    }
    onUpdate(reset);
  };

  if (setupMode) {
    return (
      <div className="border border-border/50 rounded-md p-3 space-y-2">
        <div className="text-xs uppercase tracking-wider text-muted font-semibold">Setup Spell Slots</div>
        <div className="grid grid-cols-9 gap-1">
          {SPELL_LEVEL_LABELS.map((label, i) => (
            <div key={i} className="text-center">
              <div className="text-[10px] text-muted mb-1">{label}</div>
              <input
                type="number"
                min={0}
                max={9}
                value={setupSlots[i + 1]?.max ?? 0}
                onChange={e => setSetupSlots(prev => ({ ...prev, [i + 1]: { max: Math.max(0, parseInt(e.target.value) || 0), used: 0 } }))}
                className="w-full bg-background border border-border rounded px-1 py-0.5 text-xs text-body text-center focus:outline-none focus:border-accent"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={() => { onUpdate(setupSlots); setSetupMode(false); }}>Save Slots</Button>
          <Button variant="ghost" size="sm" onClick={() => setSetupMode(false)}>Cancel</Button>
        </div>
      </div>
    );
  }

  if (!hasAnySlots) {
    return (
      <button
        onClick={() => setSetupMode(true)}
        className="text-xs text-muted hover:text-accent cursor-pointer px-2 py-1 border border-dashed border-border rounded"
      >
        + Setup Spell Slots
      </button>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted font-semibold">Spell Slots</span>
        <div className="flex gap-1">
          <button onClick={() => setSetupMode(true)} className="text-[10px] text-muted hover:text-accent cursor-pointer">Edit</button>
          <button onClick={longRest} className="text-[10px] text-accent hover:text-accent/80 cursor-pointer font-semibold">Long Rest</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {Object.entries(spellSlots).filter(([, s]) => s.max > 0).map(([lvl, slot]) => (
          <div key={lvl} className="flex items-center gap-1">
            <span className="text-[10px] text-muted w-6">{SPELL_LEVEL_LABELS[Number(lvl) - 1]}</span>
            <div className="flex gap-0.5">
              {Array.from({ length: slot.max }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => toggleSlot(Number(lvl), i)}
                  className={`w-4 h-4 rounded-full border-2 cursor-pointer transition-colors ${
                    i < slot.used
                      ? 'bg-border/50 border-border/50'
                      : 'bg-accent border-accent'
                  }`}
                  title={i < slot.used ? 'Used (click to restore)' : 'Available (click to use)'}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Main PartyTracker
// ═══════════════════════════════════════════

export default function PartyTracker() {
  const [members, setMembers] = useState<PartyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const partyLibrary = useLibrary<LibraryParty>('parties');

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch('/api/party');
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      console.error('Failed to fetch party:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const addMember = async () => {
    try {
      const res = await fetch('/api/party', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Character', class: '', level: 1, ac: 10, hp_max: 20, hp_current: 20, notes: '', conditions: [] }),
      });
      const member = await res.json();
      setMembers(prev => [...prev, member]);
    } catch (err) {
      console.error('Failed to add member:', err);
    }
  };

  const updateMember = async (id: string, updates: Partial<PartyMember>) => {
    try {
      await fetch('/api/party', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    } catch (err) {
      console.error('Failed to update member:', err);
    }
  };

  const deleteMember = async (id: string) => {
    try {
      await fetch(`/api/party?id=${id}`, { method: 'DELETE' });
      setMembers(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Failed to delete member:', err);
    }
  };

  const savePartyToLibrary = async (name: string, description: string) => {
    const partyTemplate: LibraryParty = {
      id: uuidv4(),
      name,
      description: description || undefined,
      members: members.map(({ hp_current, conditions, created_at, ...rest }) => rest),
      source: 'manual',
      tags: [],
    };
    await partyLibrary.addItem(partyTemplate);
    setShowSaveModal(false);
  };

  const loadPartyFromLibrary = async (partyId: string, mode: 'replace' | 'append') => {
    try {
      const res = await fetch('/api/party/load-from-library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partyId, mode }),
      });
      if (!res.ok) throw new Error('Failed to load party');
      await fetchMembers();
      setShowLoadModal(false);
    } catch (err) {
      console.error('Failed to load party from library:', err);
    }
  };

  const handleCreatorComplete = async (member: Omit<PartyMember, 'id' | 'created_at'>) => {
    try {
      const res = await fetch('/api/party', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member),
      });
      const created = await res.json();
      setMembers(prev => [...prev, created]);
      setShowCreator(false);
    } catch (err) {
      console.error('Failed to create character:', err);
    }
  };

  if (loading) {
    return <div className="text-muted text-center py-8">Loading party...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-wider text-accent font-semibold">
          Party Members ({members.length})
        </h2>
        <div className="flex items-center gap-2">
          {members.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setShowSaveModal(true)}>
              Save to Library
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setShowLoadModal(true)}>
            Load from Library
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowCreator(true)}>
            + Create Character
          </Button>
          <Button variant="ghost" size="sm" onClick={addMember}>
            + Quick Add
          </Button>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted">No party members yet. Click &quot;Add Character&quot; to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map(member => (
            <PartyMemberCard
              key={member.id}
              member={member}
              onUpdate={(updates) => updateMember(member.id, updates)}
              onDelete={() => deleteMember(member.id)}
            />
          ))}
        </div>
      )}

      {showSaveModal && (
        <SavePartyModal
          onSave={savePartyToLibrary}
          onClose={() => setShowSaveModal(false)}
          memberCount={members.length}
        />
      )}

      {showLoadModal && (
        <LoadPartyModal
          parties={partyLibrary.items}
          loading={partyLibrary.loading}
          onLoad={loadPartyFromLibrary}
          onDelete={(id) => partyLibrary.deleteItem(id)}
          onClose={() => setShowLoadModal(false)}
        />
      )}

      {showCreator && (
        <CharacterCreator
          onComplete={handleCreatorComplete}
          onCancel={() => setShowCreator(false)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// Individual Party Member Card
// ═══════════════════════════════════════════

function PartyMemberCard({
  member,
  onUpdate,
  onDelete,
}: {
  member: PartyMember;
  onUpdate: (updates: Partial<PartyMember>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(!member.name || member.name === 'New Character');
  const [hpInput, setHpInput] = useState('');
  const [conditionDropdown, setConditionDropdown] = useState(false);

  // Edit form state — basic
  const [editName, setEditName] = useState(member.name);
  const [editClass, setEditClass] = useState(member.class);
  const [editLevel, setEditLevel] = useState(member.level ?? 1);
  const [editAC, setEditAC] = useState(member.ac);
  const [editMaxHP, setEditMaxHP] = useState(member.hp_max);
  const [editSpeed, setEditSpeed] = useState(member.speed ?? '30 ft.');
  const [editNotes, setEditNotes] = useState(member.notes);
  const [editImageUrl, setEditImageUrl] = useState(member.imageUrl ?? '');

  // Edit form state — ability scores
  const [editStats, setEditStats] = useState<AbilityScores>(member.stats ?? { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 });
  const [editProfOverride, setEditProfOverride] = useState<number | null>(member.proficiencyBonus ?? null);

  // Edit form state — proficiencies
  const [editSaves, setEditSaves] = useState<string[]>(member.savingThrows ?? []);
  const [editSkills, setEditSkills] = useState<string[]>(member.skills ?? []);

  const profBonus = editProfOverride ?? calcProficiencyBonus(editLevel);
  const autoPassivePerception = calcPassivePerception(editStats, editLevel, editSkills);

  const handleDamage = () => {
    const amount = parseInt(hpInput);
    if (isNaN(amount) || amount <= 0) return;
    const newHP = Math.max(0, member.hp_current - amount);
    onUpdate({ hp_current: newHP });
    setHpInput('');
  };

  const handleHeal = () => {
    const amount = parseInt(hpInput);
    if (isNaN(amount) || amount <= 0) return;
    const newHP = Math.min(member.hp_max, member.hp_current + amount);
    onUpdate({ hp_current: newHP });
    setHpInput('');
  };

  const addCondition = (condition: string) => {
    if (!member.conditions.includes(condition)) {
      onUpdate({ conditions: [...member.conditions, condition] });
    }
    setConditionDropdown(false);
  };

  const removeCondition = (condition: string) => {
    onUpdate({ conditions: member.conditions.filter(c => c !== condition) });
  };

  const toggleSave = (ability: string) => {
    setEditSaves(prev => prev.includes(ability) ? prev.filter(s => s !== ability) : [...prev, ability]);
  };

  const toggleSkill = (skill: string) => {
    setEditSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const saveEdit = () => {
    const hasStats = Object.values(editStats).some(v => v !== 10);
    onUpdate({
      name: editName,
      class: editClass,
      level: editLevel,
      ac: editAC,
      hp_max: editMaxHP,
      hp_current: Math.min(member.hp_current, editMaxHP),
      speed: editSpeed,
      notes: editNotes,
      imageUrl: editImageUrl || undefined,
      stats: hasStats ? editStats : member.stats ?? undefined,
      proficiencyBonus: editProfOverride ?? undefined,
      savingThrows: editSaves.length > 0 ? editSaves : undefined,
      skills: editSkills.length > 0 ? editSkills : undefined,
      passivePerception: autoPassivePerception,
    });
    setEditing(false);
  };

  // ── Edit mode
  if (editing) {
    return (
      <div className="bg-card border border-accent/30 rounded-lg p-4 space-y-3">
        {/* Section 1: Basic Info (always expanded) */}
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-wider text-accent font-semibold">Basic Info</div>
          <div className="grid grid-cols-6 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-muted uppercase tracking-wider">Name</label>
              <input
                value={editName} onChange={e => setEditName(e.target.value)}
                className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm text-body focus:outline-none focus:border-accent"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider">Class</label>
              <input
                value={editClass} onChange={e => setEditClass(e.target.value)}
                className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm text-body focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider">Level</label>
              <input
                type="number" value={editLevel} onChange={e => setEditLevel(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm text-body focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider">AC</label>
              <input
                type="number" value={editAC} onChange={e => setEditAC(parseInt(e.target.value) || 0)}
                className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm text-body focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider">Max HP</label>
              <input
                type="number" value={editMaxHP} onChange={e => setEditMaxHP(parseInt(e.target.value) || 1)}
                className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm text-body focus:outline-none focus:border-accent"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted uppercase tracking-wider">Speed</label>
              <input
                value={editSpeed} onChange={e => setEditSpeed(e.target.value)}
                placeholder="30 ft."
                className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm text-body focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider">Portrait URL</label>
              <input
                value={editImageUrl} onChange={e => setEditImageUrl(e.target.value)}
                placeholder="https://... or /images/..."
                className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm text-body placeholder:text-muted/50 focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Ability Scores (collapsible) */}
        <CollapsibleSection title={`Ability Scores (Prof ${formatMod(profBonus)})`}>
          <div className="grid grid-cols-6 gap-2">
            {ABILITY_NAMES.map(ab => (
              <div key={ab} className="text-center">
                <label className="text-[10px] text-muted uppercase font-bold">{ABILITY_LABELS[ab]}</label>
                <input
                  type="number"
                  value={editStats[ab]}
                  onChange={e => setEditStats(prev => ({ ...prev, [ab]: parseInt(e.target.value) || 10 }))}
                  className="w-full bg-background border border-border rounded px-1 py-1 text-sm text-body text-center focus:outline-none focus:border-accent"
                />
                <div className="text-xs text-accent font-semibold mt-0.5">
                  {formatMod(abilityMod(editStats[ab]))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <label className="text-xs text-muted">Proficiency Bonus Override:</label>
            <input
              type="number"
              value={editProfOverride ?? ''}
              onChange={e => {
                const v = parseInt(e.target.value);
                setEditProfOverride(isNaN(v) ? null : v);
              }}
              placeholder={`Auto: +${calcProficiencyBonus(editLevel)}`}
              className="w-24 bg-background border border-border rounded px-2 py-0.5 text-xs text-body text-center focus:outline-none focus:border-accent"
            />
            <span className="text-[10px] text-muted">(blank = auto from level)</span>
          </div>
        </CollapsibleSection>

        {/* Section 3: Proficiencies (collapsible) */}
        <CollapsibleSection title="Proficiencies">
          {/* Saving Throws */}
          <div>
            <div className="text-xs text-muted uppercase tracking-wider mb-1 font-semibold">Saving Throws</div>
            <div className="flex flex-wrap gap-2">
              {ABILITY_NAMES.map(ab => (
                <label key={ab} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editSaves.includes(ab)}
                    onChange={() => toggleSave(ab)}
                    className="rounded border-border text-accent focus:ring-accent"
                  />
                  <span className="text-xs text-body">{ABILITY_LABELS[ab]}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Skills */}
          <div>
            <div className="text-xs text-muted uppercase tracking-wider mb-1 font-semibold">Skills</div>
            <div className="grid grid-cols-3 gap-x-4 gap-y-1">
              {DND_SKILLS.map(skill => (
                <label key={skill.name} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editSkills.includes(skill.name)}
                    onChange={() => toggleSkill(skill.name)}
                    className="rounded border-border text-accent focus:ring-accent"
                  />
                  <span className="text-xs text-body">{skill.name}</span>
                  <span className="text-[10px] text-muted">({ABILITY_LABELS[skill.ability]})</span>
                </label>
              ))}
            </div>
          </div>
          {/* Auto-calc passive perception */}
          <div className="text-xs text-muted">
            Passive Perception: <span className="text-body font-semibold">{autoPassivePerception}</span>
            <span className="text-[10px] ml-1">(10 + WIS mod{editSkills.includes('Perception') ? ' + prof' : ''})</span>
          </div>
        </CollapsibleSection>

        {/* Section 4: Notes (collapsible) */}
        <CollapsibleSection title="Notes">
          <textarea
            value={editNotes} onChange={e => setEditNotes(e.target.value)}
            placeholder="Race, background, quirks, etc."
            rows={3}
            className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm text-body placeholder:text-muted/50 focus:outline-none focus:border-accent resize-y"
          />
        </CollapsibleSection>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={saveEdit}>Save</Button>
          <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
          <div className="flex-1" />
          <Button variant="danger" size="sm" onClick={onDelete}>Delete</Button>
        </div>
      </div>
    );
  }

  // ── Display mode
  const displayProfBonus = member.proficiencyBonus ?? calcProficiencyBonus(member.level);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-start gap-3">
        {/* Portrait */}
        <CharacterPortrait member={member} size="md" />

        {/* Left: Name, class, info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-info truncate">{member.name}</h3>
            <span className="text-xs text-muted">{member.class}{member.level ? ` Lvl ${member.level}` : ''}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/15 text-accent font-semibold">
              +{displayProfBonus}
            </span>
            <button onClick={() => setEditing(true)} className="text-xs text-muted hover:text-accent cursor-pointer" title="Edit">
              &#9998;
            </button>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted mb-2">
            <span>AC <span className="text-body font-semibold">{member.ac}</span></span>
            {member.speed && <span>Speed <span className="text-body font-semibold">{member.speed}</span></span>}
            {member.passivePerception && (
              <span>PP <span className="text-body font-semibold">{member.passivePerception}</span></span>
            )}
            {member.notes && <span className="truncate">{member.notes}</span>}
          </div>

          {/* Ability Scores compact line */}
          {member.stats && (
            <div className="flex gap-2 mb-2 text-[11px]">
              {ABILITY_NAMES.map(ab => (
                <span key={ab} className="text-muted">
                  <span className="font-bold text-body">{ABILITY_LABELS[ab]}</span>{' '}
                  {member.stats![ab]}
                  <span className="text-accent">({formatMod(abilityMod(member.stats![ab]))})</span>
                </span>
              ))}
            </div>
          )}

          {/* HP Bar */}
          <HPBar current={member.hp_current} max={member.hp_max} size="md" />
        </div>

        {/* Right: HP management */}
        <div className="flex-shrink-0 space-y-2">
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={hpInput}
              onChange={e => setHpInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleDamage();
              }}
              placeholder="HP"
              className="w-16 bg-background border border-border rounded px-2 py-1 text-sm text-body text-center focus:outline-none focus:border-accent"
            />
            <Button variant="danger" size="sm" onClick={handleDamage}>Dmg</Button>
            <Button variant="primary" size="sm" onClick={handleHeal} className="!bg-success/20 !text-success !border-success/40 border">Heal</Button>
          </div>
        </div>
      </div>

      {/* Conditions */}
      <div className="mt-2 flex items-center gap-1 flex-wrap">
        {member.conditions.map(cond => (
          <ConditionBadge key={cond} condition={cond} onRemove={() => removeCondition(cond)} />
        ))}
        <div className="relative">
          <button
            onClick={() => setConditionDropdown(!conditionDropdown)}
            className="text-xs text-muted hover:text-accent px-1 cursor-pointer"
          >
            + Condition
          </button>
          {conditionDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 w-48 max-h-48 overflow-y-auto">
              {allConditions
                .filter(c => !member.conditions.includes(c.name))
                .map(c => (
                  <button
                    key={c.name}
                    onClick={() => addCondition(c.name)}
                    className="w-full text-left px-3 py-1.5 text-xs text-body hover:bg-card-alt cursor-pointer"
                  >
                    {c.name}
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Spell Slot Tracker */}
      <div className="mt-3">
        <SpellSlotTracker
          spellSlots={member.spellSlots}
          onUpdate={(slots) => onUpdate({ spellSlots: slots })}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Save Party to Library Modal
// ═══════════════════════════════════════════

function SavePartyModal({
  onSave,
  onClose,
  memberCount,
}: {
  onSave: (name: string, description: string) => Promise<void>;
  onClose: () => void;
  memberCount: number;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave(name.trim(), description.trim());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-accent uppercase tracking-wider mb-4">Save Party to Library</h3>
        <p className="text-xs text-muted mb-4">
          Save your current party ({memberCount} member{memberCount !== 1 ? 's' : ''}) as a reusable template.
          HP will reset to max and conditions will be cleared when loaded.
        </p>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted uppercase tracking-wider">Party Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Dragon Slayers"
              className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm text-body focus:outline-none focus:border-accent mt-1"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
            />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider">Description (optional)</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Level 5 party for dungeon crawls"
              className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm text-body focus:outline-none focus:border-accent mt-1"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <Button variant="primary" size="sm" onClick={handleSave} disabled={!name.trim() || saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Load Party from Library Modal
// ═══════════════════════════════════════════

function LoadPartyModal({
  parties,
  loading,
  onLoad,
  onDelete,
  onClose,
}: {
  parties: LibraryParty[];
  loading: boolean;
  onLoad: (partyId: string, mode: 'replace' | 'append') => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<'replace' | 'append'>('replace');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmReplace, setConfirmReplace] = useState(false);

  const handleLoad = async () => {
    if (!selectedId) return;
    if (mode === 'replace' && !confirmReplace) {
      setConfirmReplace(true);
      return;
    }
    setLoadingId(selectedId);
    try {
      await onLoad(selectedId, mode);
    } finally {
      setLoadingId(null);
      setConfirmReplace(false);
    }
  };

  const handleDelete = async (id: string) => {
    await onDelete(id);
    if (selectedId === id) setSelectedId(null);
  };

  // Reset confirmation when selection or mode changes
  const selectParty = (id: string) => {
    setSelectedId(id);
    setConfirmReplace(false);
  };

  const selectMode = (m: 'replace' | 'append') => {
    setMode(m);
    setConfirmReplace(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-accent uppercase tracking-wider mb-4">Load Party from Library</h3>

        {loading ? (
          <div className="text-muted text-center py-8 text-sm">Loading saved parties...</div>
        ) : parties.length === 0 ? (
          <div className="text-muted text-center py-8 text-sm">
            No saved parties yet. Save your current party first.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
            {parties.map(party => (
              <div
                key={party.id}
                onClick={() => selectParty(party.id)}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedId === party.id
                    ? 'border-accent bg-accent/10'
                    : 'border-border hover:border-accent/50'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-body truncate">{party.name}</div>
                  <div className="text-xs text-muted">
                    {party.members.length} member{party.members.length !== 1 ? 's' : ''}
                    {party.members.length > 0 && (
                      <span className="ml-1">
                        &mdash; {party.members.map(m => m.name).join(', ')}
                      </span>
                    )}
                  </div>
                  {party.description && (
                    <div className="text-xs text-muted/70 mt-0.5 truncate">{party.description}</div>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(party.id); }}
                  className="text-xs text-muted hover:text-danger ml-2 flex-shrink-0 cursor-pointer"
                  title="Remove from library"
                >
                  &#10005;
                </button>
              </div>
            ))}
          </div>
        )}

        {parties.length > 0 && (
          <>
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="loadMode"
                  checked={mode === 'replace'}
                  onChange={() => selectMode('replace')}
                  className="text-accent focus:ring-accent"
                />
                <span className="text-xs text-body">Replace current party</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="loadMode"
                  checked={mode === 'append'}
                  onChange={() => selectMode('append')}
                  className="text-accent focus:ring-accent"
                />
                <span className="text-xs text-body">Add to current party</span>
              </label>
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleLoad}
                disabled={!selectedId || !!loadingId}
              >
                {loadingId
                  ? 'Loading...'
                  : confirmReplace
                  ? 'Confirm Replace?'
                  : 'Load Party'}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            </div>
          </>
        )}

        {parties.length === 0 && (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
          </div>
        )}
      </div>
    </div>
  );
}
