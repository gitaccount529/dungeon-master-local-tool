'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Button from '@/components/shared/Button';
import { useLibrary } from '@/hooks/useLibrary';
import MonsterBuilder from './MonsterBuilder';
import type {
  LibraryType, LibraryMonster, TreasureItem, LocationTemplate,
  ChallengeTemplate, AmbiancePreset, SkillCheck, AmbianceTrack,
} from '@/lib/types';

interface CreateLibraryItemModalProps {
  type: LibraryType;
  onClose: () => void;
}

export default function CreateLibraryItemModal({ type, onClose }: CreateLibraryItemModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const isMonster = type === 'monsters';
  const lib = useLibrary<LibraryMonster>('monsters');

  const handleMonsterSave = async (monster: LibraryMonster) => {
    await lib.addItem(monster);
    onClose();
  };

  return (
    <div ref={overlayRef} onClick={handleOverlayClick} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className={`relative bg-card border border-border rounded-lg shadow-2xl w-full ${isMonster ? 'max-w-6xl' : 'max-w-2xl'} max-h-[85vh] overflow-y-auto m-4`}>
        {!isMonster && (
          <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-md bg-card-alt hover:bg-border text-muted hover:text-body transition-colors cursor-pointer z-10">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        <div className="p-6">
          {isMonster ? (
            <MonsterBuilder onSave={handleMonsterSave} onCancel={onClose} />
          ) : (
            <>
              <h3 className="text-xs uppercase tracking-wider text-accent font-semibold mb-4">
                Add New {type === 'treasures' ? 'Treasure' : type === 'locations' ? 'Location' : type === 'challenges' ? 'Challenge' : 'Ambiance Preset'}
              </h3>
              {type === 'treasures' && <TreasureForm onClose={onClose} />}
              {type === 'locations' && <LocationForm onClose={onClose} />}
              {type === 'challenges' && <ChallengeForm onClose={onClose} />}
              {type === 'ambiance' && <AmbianceForm onClose={onClose} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Shared form helpers
// ═══════════════════════════════════════════

const inputCls = 'w-full bg-background border border-border rounded px-3 py-2 text-sm text-body placeholder:text-muted/50 focus:outline-none focus:border-accent';
const labelCls = 'text-xs text-muted block mb-1';
const selectCls = 'w-full bg-background border border-border rounded px-3 py-2 text-sm text-body focus:outline-none focus:border-accent';

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function genId() {
  return `lib-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ═══════════════════════════════════════════
// Monster Form
// ═══════════════════════════════════════════

function MonsterForm({ onClose }: { onClose: () => void }) {
  const lib = useLibrary<LibraryMonster>('monsters');
  const [name, setName] = useState('');
  const [size, setSize] = useState('Medium');
  const [mType, setMType] = useState('');
  const [cr, setCr] = useState('1');
  const [role, setRole] = useState('Soldier');
  const [ac, setAc] = useState('10');
  const [hp, setHp] = useState('10');
  const [speed, setSpeed] = useState('30 ft.');
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (jsonMode) {
        const parsed = JSON.parse(jsonText);
        const item: LibraryMonster = { ...parsed, id: parsed.id || genId(), source: 'manual', tags: parsed.tags ?? [] };
        await lib.addItem(item);
      } else {
        const item: LibraryMonster = {
          id: genId(), name, size, type: mType, alignment: '', cr, role,
          ac: parseInt(ac) || 10, acType: '', hp: parseInt(hp) || 10, hpFormula: '',
          speed, stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
          senses: '', languages: '', traits: [], actions: [],
          source: 'manual', tags: [],
        };
        await lib.addItem(item);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add monster');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <button type="button" onClick={() => setJsonMode(false)} className={`text-xs px-2 py-1 rounded cursor-pointer ${!jsonMode ? 'bg-accent text-background' : 'bg-card-alt text-muted'}`}>Form</button>
        <button type="button" onClick={() => setJsonMode(true)} className={`text-xs px-2 py-1 rounded cursor-pointer ${jsonMode ? 'bg-accent text-background' : 'bg-card-alt text-muted'}`}>JSON</button>
      </div>

      {jsonMode ? (
        <FormField label="Full Monster JSON">
          <textarea value={jsonText} onChange={e => setJsonText(e.target.value)} className={`${inputCls} min-h-[12rem] resize-y font-mono text-xs`} placeholder='{"name": "Goblin", "cr": "1/4", ...}' />
        </FormField>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Name"><input className={inputCls} value={name} onChange={e => setName(e.target.value)} required /></FormField>
            <FormField label="Type"><input className={inputCls} value={mType} onChange={e => setMType(e.target.value)} placeholder="e.g. Humanoid" /></FormField>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <FormField label="Size">
              <select className={selectCls} value={size} onChange={e => setSize(e.target.value)}>
                {['Tiny','Small','Medium','Large','Huge','Gargantuan'].map(s => <option key={s}>{s}</option>)}
              </select>
            </FormField>
            <FormField label="CR"><input className={inputCls} value={cr} onChange={e => setCr(e.target.value)} /></FormField>
            <FormField label="AC"><input className={inputCls} type="number" value={ac} onChange={e => setAc(e.target.value)} /></FormField>
            <FormField label="HP"><input className={inputCls} type="number" value={hp} onChange={e => setHp(e.target.value)} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Role">
              <select className={selectCls} value={role} onChange={e => setRole(e.target.value)}>
                {['Leader','Support','Soldier','Minion','Controller','Artillery','Brute'].map(r => <option key={r}>{r}</option>)}
              </select>
            </FormField>
            <FormField label="Speed"><input className={inputCls} value={speed} onChange={e => setSpeed(e.target.value)} /></FormField>
          </div>
        </>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="flex gap-2 pt-2">
        <Button type="submit" variant="primary" size="sm" disabled={saving}>{saving ? 'Saving...' : 'Add Monster'}</Button>
        <Button type="button" variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  );
}

// ═══════════════════════════════════════════
// Treasure Form
// ═══════════════════════════════════════════

function TreasureForm({ onClose }: { onClose: () => void }) {
  const lib = useLibrary<TreasureItem>('treasures');
  const [name, setName] = useState('');
  const [tType, setTType] = useState<TreasureItem['type']>('wondrous');
  const [rarity, setRarity] = useState<TreasureItem['rarity']>('common');
  const [description, setDescription] = useState('');
  const [properties, setProperties] = useState('');
  const [value, setValue] = useState('');
  const [attunement, setAttunement] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const item: TreasureItem = {
        id: genId(), name, type: tType, rarity, description, properties: properties || undefined,
        value: value || undefined, attunement, source: 'manual', tags: [],
      };
      await lib.addItem(item);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add treasure');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <FormField label="Name"><input className={inputCls} value={name} onChange={e => setName(e.target.value)} required /></FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Type">
          <select className={selectCls} value={tType} onChange={e => setTType(e.target.value as TreasureItem['type'])}>
            {['weapon','armor','potion','scroll','wondrous','ring','wand','staff','other'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </FormField>
        <FormField label="Rarity">
          <select className={selectCls} value={rarity} onChange={e => setRarity(e.target.value as TreasureItem['rarity'])}>
            {['common','uncommon','rare','very-rare','legendary','artifact'].map(r => <option key={r} value={r}>{r.replace('-',' ')}</option>)}
          </select>
        </FormField>
      </div>
      <FormField label="Description"><textarea className={`${inputCls} min-h-[4rem] resize-y`} value={description} onChange={e => setDescription(e.target.value)} /></FormField>
      <FormField label="Properties"><input className={inputCls} value={properties} onChange={e => setProperties(e.target.value)} placeholder="e.g. +1 to attack and damage" /></FormField>
      <div className="grid grid-cols-2 gap-3 items-end">
        <FormField label="Value"><input className={inputCls} value={value} onChange={e => setValue(e.target.value)} placeholder="e.g. 500 gp" /></FormField>
        <div className="flex items-center gap-2 pb-2">
          <input type="checkbox" id="attunement" checked={attunement} onChange={e => setAttunement(e.target.checked)} className="accent-accent" />
          <label htmlFor="attunement" className="text-xs text-muted cursor-pointer">Requires Attunement</label>
        </div>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="flex gap-2 pt-2">
        <Button type="submit" variant="primary" size="sm" disabled={saving}>{saving ? 'Saving...' : 'Add Treasure'}</Button>
        <Button type="button" variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  );
}

// ═══════════════════════════════════════════
// Location Form
// ═══════════════════════════════════════════

function LocationForm({ onClose }: { onClose: () => void }) {
  const lib = useLibrary<LocationTemplate>('locations');
  const [name, setName] = useState('');
  const [environment, setEnvironment] = useState('');
  const [description, setDescription] = useState('');
  const [punchy, setPunchy] = useState('');
  const [atmospheric, setAtmospheric] = useState('');
  const [immersive, setImmersive] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const item: LocationTemplate = {
        id: genId(), name, environment, description,
        readAloud: { punchy, atmospheric, immersive },
        features: [], source: 'manual', tags: [],
      };
      await lib.addItem(item);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add location');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Name"><input className={inputCls} value={name} onChange={e => setName(e.target.value)} required /></FormField>
        <FormField label="Environment"><input className={inputCls} value={environment} onChange={e => setEnvironment(e.target.value)} placeholder="e.g. dungeon, wilderness" /></FormField>
      </div>
      <FormField label="Description"><textarea className={`${inputCls} min-h-[3rem] resize-y`} value={description} onChange={e => setDescription(e.target.value)} /></FormField>
      <FormField label="Read-Aloud: Punchy (60-80 words)"><textarea className={`${inputCls} min-h-[3rem] resize-y`} value={punchy} onChange={e => setPunchy(e.target.value)} /></FormField>
      <FormField label="Read-Aloud: Atmospheric (80-120 words)"><textarea className={`${inputCls} min-h-[3rem] resize-y`} value={atmospheric} onChange={e => setAtmospheric(e.target.value)} /></FormField>
      <FormField label="Read-Aloud: Immersive (150-250 words)"><textarea className={`${inputCls} min-h-[4rem] resize-y`} value={immersive} onChange={e => setImmersive(e.target.value)} /></FormField>
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="flex gap-2 pt-2">
        <Button type="submit" variant="primary" size="sm" disabled={saving}>{saving ? 'Saving...' : 'Add Location'}</Button>
        <Button type="button" variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  );
}

// ═══════════════════════════════════════════
// Challenge Form
// ═══════════════════════════════════════════

function ChallengeForm({ onClose }: { onClose: () => void }) {
  const lib = useLibrary<ChallengeTemplate>('challenges');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [successThreshold, setSuccessThreshold] = useState('3');
  const [failureThreshold, setFailureThreshold] = useState('3');
  const [successText, setSuccessText] = useState('');
  const [failureText, setFailureText] = useState('');
  const [skills, setSkills] = useState<SkillCheck[]>([{ skill: '', dc: 15, description: '' }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addSkill = () => setSkills(prev => [...prev, { skill: '', dc: 15, description: '' }]);
  const removeSkill = (i: number) => setSkills(prev => prev.filter((_, idx) => idx !== i));
  const updateSkill = (i: number, field: keyof SkillCheck, val: string | number) => {
    setSkills(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const item: ChallengeTemplate = {
        id: genId(), name, description,
        successThreshold: parseInt(successThreshold) || 3,
        failureThreshold: parseInt(failureThreshold) || 3,
        skills: skills.filter(s => s.skill.trim()),
        successText, failureText, source: 'manual', tags: [],
      };
      await lib.addItem(item);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add challenge');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <FormField label="Name"><input className={inputCls} value={name} onChange={e => setName(e.target.value)} required /></FormField>
      <FormField label="Description"><textarea className={`${inputCls} min-h-[3rem] resize-y`} value={description} onChange={e => setDescription(e.target.value)} /></FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Success Threshold"><input className={inputCls} type="number" value={successThreshold} onChange={e => setSuccessThreshold(e.target.value)} /></FormField>
        <FormField label="Failure Threshold"><input className={inputCls} type="number" value={failureThreshold} onChange={e => setFailureThreshold(e.target.value)} /></FormField>
      </div>

      <div>
        <label className={labelCls}>Skill Checks</label>
        <div className="space-y-2">
          {skills.map((s, i) => (
            <div key={i} className="flex gap-2 items-start">
              <input className={`${inputCls} flex-1`} placeholder="Skill" value={s.skill} onChange={e => updateSkill(i, 'skill', e.target.value)} />
              <input className={`${inputCls} w-16`} type="number" placeholder="DC" value={s.dc} onChange={e => updateSkill(i, 'dc', parseInt(e.target.value) || 0)} />
              <input className={`${inputCls} flex-1`} placeholder="Description" value={s.description} onChange={e => updateSkill(i, 'description', e.target.value)} />
              <button type="button" onClick={() => removeSkill(i)} className="p-2 text-muted hover:text-danger cursor-pointer">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
          ))}
          <button type="button" onClick={addSkill} className="text-xs text-accent hover:text-accent-secondary cursor-pointer">+ Add Skill Check</button>
        </div>
      </div>

      <FormField label="Success Text"><textarea className={`${inputCls} min-h-[2rem] resize-y`} value={successText} onChange={e => setSuccessText(e.target.value)} /></FormField>
      <FormField label="Failure Text"><textarea className={`${inputCls} min-h-[2rem] resize-y`} value={failureText} onChange={e => setFailureText(e.target.value)} /></FormField>

      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="flex gap-2 pt-2">
        <Button type="submit" variant="primary" size="sm" disabled={saving}>{saving ? 'Saving...' : 'Add Challenge'}</Button>
        <Button type="button" variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  );
}

// ═══════════════════════════════════════════
// Ambiance Form
// ═══════════════════════════════════════════

function AmbianceForm({ onClose }: { onClose: () => void }) {
  const lib = useLibrary<AmbiancePreset>('ambiance');
  const [name, setName] = useState('');
  const [environment, setEnvironment] = useState('');
  const [description, setDescription] = useState('');
  const [music, setMusic] = useState<{ name: string; searchTerm: string }[]>([]);
  const [sounds, setSounds] = useState<{ name: string; searchTerm: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addTrack = (type: 'music' | 'sounds') => {
    const setter = type === 'music' ? setMusic : setSounds;
    setter(prev => [...prev, { name: '', searchTerm: '' }]);
  };
  const removeTrack = (type: 'music' | 'sounds', i: number) => {
    const setter = type === 'music' ? setMusic : setSounds;
    setter(prev => prev.filter((_, idx) => idx !== i));
  };
  const updateTrack = (type: 'music' | 'sounds', i: number, field: 'name' | 'searchTerm', val: string) => {
    const setter = type === 'music' ? setMusic : setSounds;
    setter(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: val } : t));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const toTrack = (t: { name: string; searchTerm: string }): AmbianceTrack => ({
        name: t.name, description: '', searchTerm: t.searchTerm, tags: [],
      });
      const item: AmbiancePreset = {
        id: genId(), name, environment, description,
        music: music.filter(m => m.name.trim()).map(toTrack),
        sounds: sounds.filter(s => s.name.trim()).map(toTrack),
        source: 'manual', tags: [],
      };
      await lib.addItem(item);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add ambiance preset');
    } finally {
      setSaving(false);
    }
  };

  const renderTrackList = (type: 'music' | 'sounds', items: { name: string; searchTerm: string }[]) => (
    <div>
      <label className={labelCls}>{type === 'music' ? 'Music Tracks' : 'Sound Tracks'}</label>
      <div className="space-y-2">
        {items.map((t, i) => (
          <div key={i} className="flex gap-2">
            <input className={`${inputCls} flex-1`} placeholder="Track name" value={t.name} onChange={e => updateTrack(type, i, 'name', e.target.value)} />
            <input className={`${inputCls} flex-1`} placeholder="Search term" value={t.searchTerm} onChange={e => updateTrack(type, i, 'searchTerm', e.target.value)} />
            <button type="button" onClick={() => removeTrack(type, i)} className="p-2 text-muted hover:text-danger cursor-pointer">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        ))}
        <button type="button" onClick={() => addTrack(type)} className="text-xs text-accent hover:text-accent-secondary cursor-pointer">+ Add {type === 'music' ? 'Music' : 'Sound'} Track</button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Name"><input className={inputCls} value={name} onChange={e => setName(e.target.value)} required /></FormField>
        <FormField label="Environment"><input className={inputCls} value={environment} onChange={e => setEnvironment(e.target.value)} placeholder="e.g. volcanic, forest" /></FormField>
      </div>
      <FormField label="Description"><textarea className={`${inputCls} min-h-[3rem] resize-y`} value={description} onChange={e => setDescription(e.target.value)} /></FormField>
      {renderTrackList('music', music)}
      {renderTrackList('sounds', sounds)}
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="flex gap-2 pt-2">
        <Button type="submit" variant="primary" size="sm" disabled={saving}>{saving ? 'Saving...' : 'Add Ambiance'}</Button>
        <Button type="button" variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  );
}
