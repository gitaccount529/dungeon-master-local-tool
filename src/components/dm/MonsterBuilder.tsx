'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import type { LibraryMonster, MonsterAction, MonsterTrait, Monster, LibrarySource } from '@/lib/types';
import { formatDamageFormula } from '@/lib/diceUtils';
import { parseDiceNotation, calculateAverage } from '@/lib/diceUtils';
import StatBlock from '@/components/shared/StatBlock';
import Button from '@/components/shared/Button';

// ═══════════════════════════════════════════
// Types
// ═══════════════════════════════════════════

interface MonsterBuilderProps {
  onSave: (monster: LibraryMonster) => void;
  onCancel: () => void;
  initialMonster?: Partial<LibraryMonster>;
}

type AttackType = 'Melee Weapon Attack' | 'Ranged Weapon Attack' | 'Melee Spell Attack' | 'Ranged Spell Attack' | 'Area Effect' | 'Other';

interface DamageEntry {
  count: number;
  sides: number;
  modifier: number;
  type: string;
}

interface StructuredAction {
  name: string;
  attackType: AttackType;
  toHit: number;
  reach: string;
  target: string;
  damageEntries: DamageEntry[];
  effects: string;
  // Area Effect fields
  area: string;
  dc: number;
  saveAbility: string;
}

interface ActionEntry {
  mode: 'structured' | 'freeform';
  structured: StructuredAction;
  freeform: { name: string; description: string };
}

type ActionCategory = 'actions' | 'bonusActions' | 'reactions' | 'legendaryActions' | 'villainActions' | 'lairActions';

// ═══════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════

const SIZES = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];
const ROLES = ['Leader', 'Support', 'Soldier', 'Minion', 'Controller', 'Artillery', 'Brute'];
const DICE_SIDES = [4, 6, 8, 10, 12, 20];
const ATTACK_TYPES: AttackType[] = ['Melee Weapon Attack', 'Ranged Weapon Attack', 'Melee Spell Attack', 'Ranged Spell Attack', 'Area Effect', 'Other'];
const ABILITY_NAMES = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const;
const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;

const ACTION_CATEGORY_LABELS: Record<ActionCategory, string> = {
  actions: 'Actions',
  bonusActions: 'Bonus Actions',
  reactions: 'Reactions',
  legendaryActions: 'Legendary Actions',
  villainActions: 'Villain Actions',
  lairActions: 'Lair Actions',
};

const inputCls = 'w-full bg-background border border-border rounded px-3 py-2 text-sm text-body placeholder:text-muted/50 focus:outline-none focus:border-accent';
const selectCls = 'w-full bg-background border border-border rounded px-3 py-2 text-sm text-body focus:outline-none focus:border-accent';
const labelCls = 'text-xs text-muted block mb-1';

// ═══════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════

function getModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

function formatMod(score: number): string {
  const mod = getModifier(score);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function genId() {
  return `lib-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function newStructuredAction(): StructuredAction {
  return {
    name: '',
    attackType: 'Melee Weapon Attack',
    toHit: 5,
    reach: '5 ft.',
    target: 'one target',
    damageEntries: [{ count: 1, sides: 6, modifier: 3, type: 'bludgeoning' }],
    effects: '',
    area: '15-foot cone',
    dc: 13,
    saveAbility: 'Dexterity',
  };
}

function newActionEntry(): ActionEntry {
  return {
    mode: 'structured',
    structured: newStructuredAction(),
    freeform: { name: '', description: '' },
  };
}

function buildActionDescription(s: StructuredAction): string {
  if (s.attackType === 'Area Effect') {
    const dmgParts = s.damageEntries
      .filter(d => d.count > 0 && d.sides > 0)
      .map(d => `${formatDamageFormula(d.count, d.sides, d.modifier)} ${d.type} damage`);
    const dmgStr = dmgParts.join(' plus ');
    let desc = `Each creature in a ${s.area} must make a DC ${s.dc} ${s.saveAbility} saving throw`;
    if (dmgStr) {
      desc += `, taking ${dmgStr} on a failed save, or half as much damage on a successful one.`;
    } else {
      desc += '.';
    }
    if (s.effects) desc += ` ${s.effects}`;
    return desc;
  }

  if (s.attackType === 'Other') {
    const dmgParts = s.damageEntries
      .filter(d => d.count > 0 && d.sides > 0)
      .map(d => `${formatDamageFormula(d.count, d.sides, d.modifier)} ${d.type} damage`);
    let desc = dmgParts.length > 0 ? dmgParts.join(' plus ') + '.' : '';
    if (s.effects) desc += (desc ? ' ' : '') + s.effects;
    return desc;
  }

  // Weapon/Spell attacks
  const dmgParts = s.damageEntries
    .filter(d => d.count > 0 && d.sides > 0)
    .map(d => `${formatDamageFormula(d.count, d.sides, d.modifier)} ${d.type} damage`);
  const hitStr = dmgParts.length > 0 ? dmgParts.join(' plus ') : '';
  let desc = `${s.attackType}: +${s.toHit} to hit, reach ${s.reach}, ${s.target}.`;
  if (hitStr) desc += ` Hit: ${hitStr}.`;
  if (s.effects) desc += ` ${s.effects}`;
  return desc;
}

function actionEntryToMonsterAction(entry: ActionEntry): MonsterAction {
  if (entry.mode === 'freeform') {
    return { name: entry.freeform.name, description: entry.freeform.description };
  }
  return {
    name: entry.structured.name,
    description: buildActionDescription(entry.structured),
  };
}

// ═══════════════════════════════════════════
// Collapsible Section
// ═══════════════════════════════════════════

function BuilderSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-card-alt transition-colors cursor-pointer"
      >
        <h3 className="text-xs uppercase tracking-wider font-semibold text-accent">{title}</h3>
        <span className="text-muted text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function DamageEntryRow({
  entry,
  onChange,
  onRemove,
}: {
  entry: DamageEntry;
  onChange: (e: DamageEntry) => void;
  onRemove: () => void;
}) {
  const preview = entry.count > 0 && entry.sides > 0
    ? `${formatDamageFormula(entry.count, entry.sides, entry.modifier)} ${entry.type}`
    : '';

  return (
    <div className="flex gap-2 items-center flex-wrap">
      <input
        type="number"
        min={1}
        value={entry.count}
        onChange={e => onChange({ ...entry, count: parseInt(e.target.value) || 0 })}
        className={`${inputCls} w-16`}
        placeholder="#"
      />
      <select
        value={entry.sides}
        onChange={e => onChange({ ...entry, sides: parseInt(e.target.value) })}
        className={`${selectCls} w-20`}
      >
        {DICE_SIDES.map(d => (
          <option key={d} value={d}>d{d}</option>
        ))}
      </select>
      <span className="text-muted text-xs">+</span>
      <input
        type="number"
        value={entry.modifier}
        onChange={e => onChange({ ...entry, modifier: parseInt(e.target.value) || 0 })}
        className={`${inputCls} w-16`}
        placeholder="mod"
      />
      <input
        value={entry.type}
        onChange={e => onChange({ ...entry, type: e.target.value })}
        className={`${inputCls} w-28`}
        placeholder="damage type"
      />
      {preview && <span className="text-xs text-muted italic">{preview}</span>}
      <button
        type="button"
        onClick={onRemove}
        className="p-1 text-muted hover:text-danger cursor-pointer"
      >
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

function ActionEntryEditor({
  entry,
  onChange,
  onRemove,
}: {
  entry: ActionEntry;
  onChange: (e: ActionEntry) => void;
  onRemove: () => void;
}) {
  const s = entry.structured;
  const f = entry.freeform;
  const isStructured = entry.mode === 'structured';
  const isWeaponOrSpell = ['Melee Weapon Attack', 'Ranged Weapon Attack', 'Melee Spell Attack', 'Ranged Spell Attack'].includes(s.attackType);
  const isAreaEffect = s.attackType === 'Area Effect';

  const updateStructured = (patch: Partial<StructuredAction>) => {
    onChange({ ...entry, structured: { ...s, ...patch } });
  };

  const updateFreeform = (patch: Partial<{ name: string; description: string }>) => {
    onChange({ ...entry, freeform: { ...f, ...patch } });
  };

  const updateDamageEntry = (i: number, d: DamageEntry) => {
    const next = [...s.damageEntries];
    next[i] = d;
    updateStructured({ damageEntries: next });
  };

  const addDamageEntry = () => {
    updateStructured({ damageEntries: [...s.damageEntries, { count: 1, sides: 6, modifier: 0, type: 'fire' }] });
  };

  const removeDamageEntry = (i: number) => {
    updateStructured({ damageEntries: s.damageEntries.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="bg-card-alt border border-border/50 rounded-lg p-3 space-y-3">
      {/* Header with mode toggle and remove */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...entry, mode: 'structured' })}
            className={`text-xs px-2 py-1 rounded cursor-pointer ${isStructured ? 'bg-accent text-background' : 'bg-background text-muted'}`}
          >
            Structured
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...entry, mode: 'freeform' })}
            className={`text-xs px-2 py-1 rounded cursor-pointer ${!isStructured ? 'bg-accent text-background' : 'bg-background text-muted'}`}
          >
            Freeform
          </button>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 text-muted hover:text-danger cursor-pointer"
          title="Remove action"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {isStructured ? (
        <>
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Name">
              <input className={inputCls} value={s.name} onChange={e => updateStructured({ name: e.target.value })} placeholder="e.g. Slam" />
            </FormField>
            <FormField label="Attack Type">
              <select className={selectCls} value={s.attackType} onChange={e => updateStructured({ attackType: e.target.value as AttackType })}>
                {ATTACK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormField>
          </div>

          {isWeaponOrSpell && (
            <div className="grid grid-cols-3 gap-2">
              <FormField label="To-Hit Bonus">
                <input type="number" className={inputCls} value={s.toHit} onChange={e => updateStructured({ toHit: parseInt(e.target.value) || 0 })} />
              </FormField>
              <FormField label="Reach / Range">
                <input className={inputCls} value={s.reach} onChange={e => updateStructured({ reach: e.target.value })} placeholder="5 ft." />
              </FormField>
              <FormField label="Target">
                <input className={inputCls} value={s.target} onChange={e => updateStructured({ target: e.target.value })} placeholder="one target" />
              </FormField>
            </div>
          )}

          {isAreaEffect && (
            <div className="grid grid-cols-3 gap-2">
              <FormField label="Area">
                <input className={inputCls} value={s.area} onChange={e => updateStructured({ area: e.target.value })} placeholder="15-foot cone" />
              </FormField>
              <FormField label="Save DC">
                <input type="number" className={inputCls} value={s.dc} onChange={e => updateStructured({ dc: parseInt(e.target.value) || 0 })} />
              </FormField>
              <FormField label="Save Ability">
                <input className={inputCls} value={s.saveAbility} onChange={e => updateStructured({ saveAbility: e.target.value })} placeholder="Dexterity" />
              </FormField>
            </div>
          )}

          {/* Damage entries */}
          <div>
            <label className={labelCls}>Damage</label>
            <div className="space-y-2">
              {s.damageEntries.map((d, i) => (
                <DamageEntryRow
                  key={i}
                  entry={d}
                  onChange={de => updateDamageEntry(i, de)}
                  onRemove={() => removeDamageEntry(i)}
                />
              ))}
              <button
                type="button"
                onClick={addDamageEntry}
                className="text-xs text-accent hover:text-accent-secondary cursor-pointer"
              >
                + Add Damage
              </button>
            </div>
          </div>

          <FormField label="Additional Effects">
            <textarea
              className={`${inputCls} min-h-[2.5rem] resize-y`}
              value={s.effects}
              onChange={e => updateStructured({ effects: e.target.value })}
              placeholder="e.g. The target must make a DC 13 STR save or be pushed 10 feet."
            />
          </FormField>

          {/* Auto-generated preview */}
          {s.name && (
            <div className="text-xs text-muted/70 italic border-t border-border/30 pt-2">
              <span className="text-muted font-semibold">Preview:</span> {buildActionDescription(s)}
            </div>
          )}
        </>
      ) : (
        <>
          <FormField label="Name">
            <input className={inputCls} value={f.name} onChange={e => updateFreeform({ name: e.target.value })} placeholder="Action name" />
          </FormField>
          <FormField label="Description">
            <textarea
              className={`${inputCls} min-h-[4rem] resize-y`}
              value={f.description}
              onChange={e => updateFreeform({ description: e.target.value })}
              placeholder="Full action description..."
            />
          </FormField>
        </>
      )}
    </div>
  );
}

function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState('');

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput('');
  };

  const removeTag = (i: number) => {
    onChange(tags.filter((_, idx) => idx !== i));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-1">
        {tags.map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-1 bg-accent/20 text-accent text-xs px-2 py-0.5 rounded-full">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="hover:text-danger cursor-pointer"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </span>
        ))}
      </div>
      <input
        className={inputCls}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
            e.preventDefault();
            addTag(input);
          }
        }}
        placeholder="Type tag name, press Enter or comma to add"
      />
    </div>
  );
}

// ═══════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════

export default function MonsterBuilder({ onSave, onCancel, initialMonster }: MonsterBuilderProps) {
  // ── Basic Info ──
  const [name, setName] = useState(initialMonster?.name || '');
  const [size, setSize] = useState(initialMonster?.size || 'Medium');
  const [mType, setMType] = useState(initialMonster?.type || '');
  const [alignment, setAlignment] = useState(initialMonster?.alignment || '');
  const [cr, setCr] = useState(initialMonster?.cr || '1');
  const [role, setRole] = useState(initialMonster?.role || 'Soldier');

  // ── Ability Scores ──
  const [stats, setStats] = useState(initialMonster?.stats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 });

  // ── Combat Stats ──
  const [ac, setAc] = useState(initialMonster?.ac ?? 10);
  const [acType, setAcType] = useState(initialMonster?.acType || '');
  const [hp, setHp] = useState(initialMonster?.hp ?? 10);
  const [hpFormula, setHpFormula] = useState(initialMonster?.hpFormula || '');
  const [speed, setSpeed] = useState(initialMonster?.speed || '30 ft.');

  // ── Defenses ──
  const [savingThrows, setSavingThrows] = useState(initialMonster?.savingThrows || '');
  const [skills, setSkills] = useState(initialMonster?.skills || '');
  const [damageImmunities, setDamageImmunities] = useState(initialMonster?.damageImmunities || '');
  const [damageResistances, setDamageResistances] = useState(initialMonster?.damageResistances || '');
  const [conditionImmunities, setConditionImmunities] = useState(initialMonster?.conditionImmunities || '');
  const [senses, setSenses] = useState(initialMonster?.senses || '');
  const [languages, setLanguages] = useState(initialMonster?.languages || '');
  const [legendarySaves, setLegendarySaves] = useState<number | undefined>(initialMonster?.legendarySaves);

  // ── Traits ──
  const [traits, setTraits] = useState<MonsterTrait[]>(initialMonster?.traits || []);

  // ── Actions (all categories) ──
  const initActions = useCallback((acts?: MonsterAction[]): ActionEntry[] => {
    if (!acts || acts.length === 0) return [];
    return acts.map(a => ({
      mode: 'freeform' as const,
      structured: newStructuredAction(),
      freeform: { name: a.name, description: a.description },
    }));
  }, []);

  const [actions, setActions] = useState<Record<ActionCategory, ActionEntry[]>>({
    actions: initActions(initialMonster?.actions) || [],
    bonusActions: initActions(initialMonster?.bonusActions),
    reactions: initActions(initialMonster?.reactions),
    legendaryActions: initActions(initialMonster?.legendaryActions),
    villainActions: initActions(initialMonster?.villainActions),
    lairActions: initActions(initialMonster?.lairActions),
  });

  // ── Flavor ──
  const [description, setDescription] = useState(initialMonster?.description || '');
  const [hitFlavor, setHitFlavor] = useState<string[]>(initialMonster?.hitFlavor || []);
  const [missFlavor, setMissFlavor] = useState<string[]>(initialMonster?.missFlavor || []);
  const [namedNPC, setNamedNPC] = useState(initialMonster?.namedNPC || false);
  const [imageUrl, setImageUrl] = useState(initialMonster?.imageUrl || '');
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // ── Library Metadata ──
  const [source, setSource] = useState<LibrarySource>(initialMonster?.source || 'manual');
  const [tags, setTags] = useState<string[]>(initialMonster?.tags || []);

  // ── Saving state ──
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ── HP formula sync ──
  const handleHpFormulaChange = (formula: string) => {
    setHpFormula(formula);
    const parsed = parseDiceNotation(formula);
    if (parsed) {
      setHp(calculateAverage(parsed.count, parsed.sides, parsed.modifier));
    }
  };

  // ── Action helpers ──
  const addAction = (cat: ActionCategory) => {
    setActions(prev => ({ ...prev, [cat]: [...prev[cat], newActionEntry()] }));
  };

  const removeAction = (cat: ActionCategory, i: number) => {
    setActions(prev => ({ ...prev, [cat]: prev[cat].filter((_, idx) => idx !== i) }));
  };

  const updateAction = (cat: ActionCategory, i: number, entry: ActionEntry) => {
    setActions(prev => ({
      ...prev,
      [cat]: prev[cat].map((a, idx) => idx === i ? entry : a),
    }));
  };

  // ── Trait helpers ──
  const addTrait = () => setTraits(prev => [...prev, { name: '', description: '' }]);
  const removeTrait = (i: number) => setTraits(prev => prev.filter((_, idx) => idx !== i));
  const updateTrait = (i: number, patch: Partial<MonsterTrait>) => {
    setTraits(prev => prev.map((t, idx) => idx === i ? { ...t, ...patch } : t));
  };

  // ── Flavor list helpers ──
  const addFlavorItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };
  const removeFlavorItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, i: number) => {
    setter(prev => prev.filter((_, idx) => idx !== i));
  };
  const updateFlavorItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, i: number, val: string) => {
    setter(prev => prev.map((v, idx) => idx === i ? val : v));
  };

  // ── Image upload ──
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/libraries/images', { method: 'POST', body: formData });
      if (res.ok) {
        const { filename } = await res.json();
        setImageUrl(`/api/libraries/images/${filename}`);
      }
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  // ── Build preview monster ──
  const previewMonster: Monster = useMemo(() => ({
    id: initialMonster?.id || 'preview',
    name: name || 'Unnamed Monster',
    size,
    type: mType,
    alignment,
    cr,
    role,
    ac,
    acType,
    hp,
    hpFormula,
    speed,
    stats,
    savingThrows: savingThrows || undefined,
    skills: skills || undefined,
    damageImmunities: damageImmunities || undefined,
    damageResistances: damageResistances || undefined,
    conditionImmunities: conditionImmunities || undefined,
    senses,
    languages,
    legendarySaves: legendarySaves,
    traits: traits.filter(t => t.name.trim()),
    actions: actions.actions.filter(a => a.mode === 'freeform' ? a.freeform.name.trim() : a.structured.name.trim()).map(actionEntryToMonsterAction),
    bonusActions: actions.bonusActions.filter(a => a.mode === 'freeform' ? a.freeform.name.trim() : a.structured.name.trim()).map(actionEntryToMonsterAction),
    reactions: actions.reactions.filter(a => a.mode === 'freeform' ? a.freeform.name.trim() : a.structured.name.trim()).map(actionEntryToMonsterAction),
    legendaryActions: actions.legendaryActions.filter(a => a.mode === 'freeform' ? a.freeform.name.trim() : a.structured.name.trim()).map(actionEntryToMonsterAction),
    villainActions: actions.villainActions.filter(a => a.mode === 'freeform' ? a.freeform.name.trim() : a.structured.name.trim()).map(actionEntryToMonsterAction),
    lairActions: actions.lairActions.filter(a => a.mode === 'freeform' ? a.freeform.name.trim() : a.structured.name.trim()).map(actionEntryToMonsterAction),
    description: description || undefined,
    hitFlavor: hitFlavor.filter(f => f.trim()),
    missFlavor: missFlavor.filter(f => f.trim()),
    namedNPC,
    imageUrl: imageUrl || undefined,
  }), [name, size, mType, alignment, cr, role, ac, acType, hp, hpFormula, speed, stats, savingThrows, skills, damageImmunities, damageResistances, conditionImmunities, senses, languages, legendarySaves, traits, actions, description, hitFlavor, missFlavor, namedNPC, imageUrl, initialMonster?.id]);

  // ── Submit ──
  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const monster: LibraryMonster = {
        ...previewMonster,
        id: initialMonster?.id || genId(),
        source,
        tags,
        sourceBook: initialMonster?.sourceBook,
      };
      onSave(monster);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save monster');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 max-h-[75vh]">
      {/* ── Form Panel (left) ── */}
      <div className="flex-[3] overflow-y-auto space-y-3 pr-1 min-w-0">
        {/* 1. Basic Info */}
        <BuilderSection title="Basic Info" defaultOpen>
          <div className="space-y-3">
            <FormField label="Name">
              <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="Monster name" required />
            </FormField>
            <div className="grid grid-cols-3 gap-2">
              <FormField label="Size">
                <select className={selectCls} value={size} onChange={e => setSize(e.target.value)}>
                  {SIZES.map(s => <option key={s}>{s}</option>)}
                </select>
              </FormField>
              <FormField label="Type">
                <input className={inputCls} value={mType} onChange={e => setMType(e.target.value)} placeholder="e.g. Giant, Fiend" />
              </FormField>
              <FormField label="Alignment">
                <input className={inputCls} value={alignment} onChange={e => setAlignment(e.target.value)} placeholder="e.g. Chaotic Evil" />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FormField label="CR">
                <input className={inputCls} value={cr} onChange={e => setCr(e.target.value)} placeholder="e.g. 1/4, 5, 20" />
              </FormField>
              <FormField label="Role">
                <select className={selectCls} value={role} onChange={e => setRole(e.target.value)}>
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </FormField>
            </div>
          </div>
        </BuilderSection>

        {/* Image */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            {imageUrl ? (
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-border flex-shrink-0 relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Monster" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute inset-0 bg-black/60 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="w-16 h-16 rounded-lg border border-dashed border-border flex items-center justify-center text-muted text-xl flex-shrink-0">
                🖼
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-accent mb-1">Monster Image</h3>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingImage}
                className="px-3 py-1 rounded text-xs font-medium bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 transition-colors cursor-pointer disabled:opacity-50"
              >
                {uploadingImage ? 'Uploading...' : imageUrl ? 'Replace Image' : 'Upload Image'}
              </button>
            </div>
          </div>
        </div>

        {/* 2. Ability Scores */}
        <BuilderSection title="Ability Scores" defaultOpen>
          <div className="grid grid-cols-6 gap-2">
            {ABILITY_KEYS.map((key, i) => (
              <div key={key} className="text-center">
                <label className="text-xs text-muted uppercase tracking-wider block mb-1">{ABILITY_NAMES[i]}</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={stats[key]}
                  onChange={e => setStats(prev => ({ ...prev, [key]: parseInt(e.target.value) || 1 }))}
                  className={`${inputCls} text-center`}
                />
                <p className="text-xs text-accent mt-1 font-mono">{formatMod(stats[key])}</p>
              </div>
            ))}
          </div>
        </BuilderSection>

        {/* 3. Combat Stats */}
        <BuilderSection title="Combat Stats" defaultOpen>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <FormField label="AC">
                <input type="number" className={inputCls} value={ac} onChange={e => setAc(parseInt(e.target.value) || 0)} />
              </FormField>
              <FormField label="AC Type">
                <input className={inputCls} value={acType} onChange={e => setAcType(e.target.value)} placeholder="e.g. natural armor" />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FormField label="HP">
                <input type="number" className={inputCls} value={hp} onChange={e => setHp(parseInt(e.target.value) || 0)} />
              </FormField>
              <FormField label="HP Formula">
                <input className={inputCls} value={hpFormula} onChange={e => handleHpFormulaChange(e.target.value)} placeholder="e.g. 18d12 + 108" />
              </FormField>
            </div>
            <FormField label="Speed">
              <input className={inputCls} value={speed} onChange={e => setSpeed(e.target.value)} placeholder="e.g. 40 ft., fly 60 ft." />
            </FormField>
          </div>
        </BuilderSection>

        {/* 4. Defenses */}
        <BuilderSection title="Defenses">
          <div className="space-y-3">
            <FormField label="Saving Throws">
              <input className={inputCls} value={savingThrows} onChange={e => setSavingThrows(e.target.value)} placeholder="e.g. CON +12, WIS +8" />
            </FormField>
            <FormField label="Skills">
              <input className={inputCls} value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g. Perception +8, Athletics +14" />
            </FormField>
            <FormField label="Damage Immunities">
              <input className={inputCls} value={damageImmunities} onChange={e => setDamageImmunities(e.target.value)} placeholder="e.g. fire, poison" />
            </FormField>
            <FormField label="Damage Resistances">
              <input className={inputCls} value={damageResistances} onChange={e => setDamageResistances(e.target.value)} placeholder="e.g. cold, lightning" />
            </FormField>
            <FormField label="Condition Immunities">
              <input className={inputCls} value={conditionImmunities} onChange={e => setConditionImmunities(e.target.value)} placeholder="e.g. frightened, poisoned" />
            </FormField>
            <FormField label="Senses">
              <input className={inputCls} value={senses} onChange={e => setSenses(e.target.value)} placeholder="e.g. darkvision 120 ft., passive Perception 18" />
            </FormField>
            <FormField label="Languages">
              <input className={inputCls} value={languages} onChange={e => setLanguages(e.target.value)} placeholder="e.g. Giant, Common" />
            </FormField>
            <FormField label="Legendary Saves">
              <input
                type="number"
                min={0}
                className={inputCls}
                value={legendarySaves ?? ''}
                onChange={e => setLegendarySaves(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Leave empty if none"
              />
            </FormField>
          </div>
        </BuilderSection>

        {/* 5. Traits */}
        <BuilderSection title="Traits">
          <div className="space-y-2">
            {traits.map((trait, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 space-y-1">
                  <input
                    className={inputCls}
                    value={trait.name}
                    onChange={e => updateTrait(i, { name: e.target.value })}
                    placeholder="Trait name"
                  />
                  <textarea
                    className={`${inputCls} min-h-[2.5rem] resize-y`}
                    value={trait.description}
                    onChange={e => updateTrait(i, { description: e.target.value })}
                    placeholder="Trait description"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeTrait(i)}
                  className="p-2 text-muted hover:text-danger cursor-pointer mt-1"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addTrait}
              className="text-xs text-accent hover:text-accent-secondary cursor-pointer"
            >
              + Add Trait
            </button>
          </div>
        </BuilderSection>

        {/* 6. Actions (all categories) */}
        <BuilderSection title="Actions" defaultOpen>
          <div className="space-y-4">
            {(Object.keys(ACTION_CATEGORY_LABELS) as ActionCategory[]).map(cat => (
              <div key={cat}>
                <h4 className="text-xs text-muted uppercase tracking-wider font-semibold mb-2">{ACTION_CATEGORY_LABELS[cat]}</h4>
                <div className="space-y-2">
                  {actions[cat].map((entry, i) => (
                    <ActionEntryEditor
                      key={i}
                      entry={entry}
                      onChange={e => updateAction(cat, i, e)}
                      onRemove={() => removeAction(cat, i)}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => addAction(cat)}
                    className="text-xs text-accent hover:text-accent-secondary cursor-pointer"
                  >
                    + Add {ACTION_CATEGORY_LABELS[cat].replace(/s$/, '')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </BuilderSection>

        {/* 7. Flavor */}
        <BuilderSection title="Flavor">
          <div className="space-y-3">
            <FormField label="Description (appearance / narrative)">
              <textarea
                className={`${inputCls} min-h-[3rem] resize-y`}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Narrative description of the creature..."
              />
            </FormField>

            {/* Hit Flavor */}
            <div>
              <label className={labelCls}>Hit Flavor</label>
              <div className="space-y-1">
                {hitFlavor.map((f, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      className={`${inputCls} flex-1`}
                      value={f}
                      onChange={e => updateFlavorItem(setHitFlavor, i, e.target.value)}
                      placeholder="Hit flavor text..."
                    />
                    <button type="button" onClick={() => removeFlavorItem(setHitFlavor, i)} className="p-2 text-muted hover:text-danger cursor-pointer">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => addFlavorItem(setHitFlavor)} className="text-xs text-accent hover:text-accent-secondary cursor-pointer">+ Add Hit Flavor</button>
              </div>
            </div>

            {/* Miss Flavor */}
            <div>
              <label className={labelCls}>Miss Flavor</label>
              <div className="space-y-1">
                {missFlavor.map((f, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      className={`${inputCls} flex-1`}
                      value={f}
                      onChange={e => updateFlavorItem(setMissFlavor, i, e.target.value)}
                      placeholder="Miss flavor text..."
                    />
                    <button type="button" onClick={() => removeFlavorItem(setMissFlavor, i)} className="p-2 text-muted hover:text-danger cursor-pointer">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => addFlavorItem(setMissFlavor)} className="text-xs text-accent hover:text-accent-secondary cursor-pointer">+ Add Miss Flavor</button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="namedNPC" checked={namedNPC} onChange={e => setNamedNPC(e.target.checked)} className="accent-accent" />
              <label htmlFor="namedNPC" className="text-xs text-muted cursor-pointer">Named NPC</label>
            </div>
          </div>
        </BuilderSection>

        {/* 8. Library Metadata */}
        <BuilderSection title="Library Metadata">
          <div className="space-y-3">
            <FormField label="Source">
              <select className={selectCls} value={source} onChange={e => setSource(e.target.value as LibrarySource)}>
                <option value="manual">Manual</option>
                <option value="srd">SRD</option>
                <option value="imported">Imported</option>
                <option value="ai-generated">AI Generated</option>
              </select>
            </FormField>
            <FormField label="Tags">
              <TagInput tags={tags} onChange={setTags} />
            </FormField>
          </div>
        </BuilderSection>

        {/* Save / Cancel */}
        <div className="sticky bottom-0 bg-card border-t border-border -mx-1 px-1 py-3 flex items-center gap-2">
          {error && <p className="text-xs text-danger mr-auto">{error}</p>}
          <div className="ml-auto flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
            <Button type="button" variant="primary" size="sm" disabled={saving} onClick={handleSave}>
              {saving ? 'Saving...' : initialMonster?.id ? 'Update Monster' : 'Add Monster'}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Preview Panel (right) ── */}
      <div className="flex-[2] overflow-y-auto min-w-0 hidden lg:block">
        <div className="sticky top-0">
          <h3 className="text-xs uppercase tracking-wider text-accent font-semibold mb-2">Live Preview</h3>
          <StatBlock monster={previewMonster} expanded />
        </div>
      </div>
    </div>
  );
}
