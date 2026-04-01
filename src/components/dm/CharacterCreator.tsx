'use client';

import { useState, useEffect } from 'react';
import type { PartyMember, AbilityScores, CharacterClass } from '@/lib/types';
import Button from '@/components/shared/Button';

// ═══════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════

const ABILITY_NAMES = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
const ABILITY_LABELS: Record<string, string> = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' };
const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

const STEP_LABELS = ['Identity', 'Ability Scores', 'Proficiencies', 'Review'];

function abilityMod(score: number): number {
  return Math.floor((score - 10) / 2);
}

function formatMod(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function calcProfBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

function hitDieMax(hitDie: string): number {
  const match = hitDie.match(/d(\d+)/);
  return match ? parseInt(match[1]) : 8;
}

// ═══════════════════════════════════════════
// Main CharacterCreator
// ═══════════════════════════════════════════

interface CharacterCreatorProps {
  onComplete: (member: Omit<PartyMember, 'id' | 'created_at'>) => void;
  onCancel: () => void;
}

export default function CharacterCreator({ onComplete, onCancel }: CharacterCreatorProps) {
  const [step, setStep] = useState(0);
  const [classes, setClasses] = useState<CharacterClass[]>([]);

  // Step 1: Identity
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  const [customClass, setCustomClass] = useState('');
  const [level, setLevel] = useState(1);
  const [speed, setSpeed] = useState('30 ft.');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Step 2: Ability Scores
  const [scoreMethod, setScoreMethod] = useState<'manual' | 'standard-array'>('manual');
  const [stats, setStats] = useState<AbilityScores>({ str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 });
  const [arrayAssignments, setArrayAssignments] = useState<Record<string, number | null>>({ str: null, dex: null, con: null, int: null, wis: null, cha: null });

  // Step 3: Proficiencies
  const [savingThrows, setSavingThrows] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);

  // Fetch classes from library
  useEffect(() => {
    fetch('/api/libraries/classes')
      .then(res => res.json())
      .then(data => setClasses(data))
      .catch(() => {});
  }, []);

  // Auto-set saving throws when class changes
  useEffect(() => {
    if (selectedClass?.savingThrows) {
      setSavingThrows(selectedClass.savingThrows);
    }
  }, [selectedClass]);

  // ── Derived values ──
  const className = selectedClass?.name || customClass;
  const hitDie = selectedClass?.hitDie || 'd8';
  const conMod = abilityMod(stats.con);
  const hpAtLevel = hitDieMax(hitDie) + conMod + ((level - 1) * (Math.floor(hitDieMax(hitDie) / 2) + 1 + conMod));
  const ac = 10 + abilityMod(stats.dex);
  const profBonus = calcProfBonus(level);
  const maxSkillPicks = selectedClass?.numSkillChoices ?? 2;
  const availableSkills = selectedClass?.skillChoices;

  // Apply standard array to stats
  useEffect(() => {
    if (scoreMethod === 'standard-array') {
      const newStats = { ...stats };
      for (const ab of ABILITY_NAMES) {
        const assigned = arrayAssignments[ab];
        if (assigned !== null && assigned !== undefined) {
          newStats[ab] = assigned;
        }
      }
      setStats(newStats);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrayAssignments, scoreMethod]);

  // ── Step validation ──
  const canProceed = () => {
    switch (step) {
      case 0: return name.trim() && (selectedClass || customClass.trim());
      case 1: return true;
      case 2: return true;
      case 3: return true;
      default: return false;
    }
  };

  // ── Finalize ──
  const handleComplete = () => {
    const wisMod = abilityMod(stats.wis);
    const percProf = skills.includes('Perception') ? profBonus : 0;

    onComplete({
      name: name.trim(),
      class: className,
      level,
      ac,
      hp_max: Math.max(1, hpAtLevel),
      hp_current: Math.max(1, hpAtLevel),
      notes: notes.trim(),
      conditions: [],
      imageUrl: imageUrl.trim() || undefined,
      classId: selectedClass?.id,
      stats,
      proficiencyBonus: profBonus,
      savingThrows: savingThrows.length > 0 ? savingThrows : undefined,
      skills: skills.length > 0 ? skills : undefined,
      speed,
      passivePerception: 10 + wisMod + percProf,
      spellSlots: undefined,
      cantripsKnown: undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onCancel}>
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 pt-5 pb-3 border-b border-border">
          <h2 className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Create Character</h2>
          {/* Progress steps */}
          <div className="flex gap-1">
            {STEP_LABELS.map((label, i) => (
              <div key={i} className="flex-1">
                <div className={`h-1 rounded-full mb-1 transition-colors ${
                  i <= step ? 'bg-accent' : 'bg-border'
                }`} />
                <span className={`text-[10px] uppercase tracking-wider ${
                  i === step ? 'text-accent font-semibold' : 'text-muted'
                }`}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {step === 0 && (
            <StepIdentity
              name={name} setName={setName}
              selectedClass={selectedClass} setSelectedClass={setSelectedClass}
              customClass={customClass} setCustomClass={setCustomClass}
              level={level} setLevel={setLevel}
              speed={speed} setSpeed={setSpeed}
              notes={notes} setNotes={setNotes}
              imageUrl={imageUrl} setImageUrl={setImageUrl}
              classes={classes}
            />
          )}
          {step === 1 && (
            <StepAbilityScores
              stats={stats} setStats={setStats}
              scoreMethod={scoreMethod} setScoreMethod={setScoreMethod}
              arrayAssignments={arrayAssignments} setArrayAssignments={setArrayAssignments}
              primaryAbility={selectedClass?.primaryAbility}
            />
          )}
          {step === 2 && (
            <StepProficiencies
              savingThrows={savingThrows} setSavingThrows={setSavingThrows}
              skills={skills} setSkills={setSkills}
              availableSkills={availableSkills}
              maxSkillPicks={maxSkillPicks}
              className={className}
            />
          )}
          {step === 3 && (
            <StepReview
              name={name} className={className} level={level}
              stats={stats} ac={ac} hp={hpAtLevel} hitDie={hitDie}
              speed={speed} profBonus={profBonus}
              savingThrows={savingThrows} skills={skills}
              notes={notes}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border flex items-center gap-2">
          {step > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>Back</Button>
          )}
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
          {step < 3 ? (
            <Button variant="primary" size="sm" onClick={() => setStep(step + 1)} disabled={!canProceed()}>
              Next
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={handleComplete}>
              Create Character
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Step 1: Identity
// ═══════════════════════════════════════════

function StepIdentity({
  name, setName,
  selectedClass, setSelectedClass,
  customClass, setCustomClass,
  level, setLevel,
  speed, setSpeed,
  notes, setNotes,
  imageUrl, setImageUrl,
  classes,
}: {
  name: string; setName: (v: string) => void;
  selectedClass: CharacterClass | null; setSelectedClass: (v: CharacterClass | null) => void;
  customClass: string; setCustomClass: (v: string) => void;
  level: number; setLevel: (v: number) => void;
  speed: string; setSpeed: (v: string) => void;
  notes: string; setNotes: (v: string) => void;
  imageUrl: string; setImageUrl: (v: string) => void;
  classes: CharacterClass[];
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-muted uppercase tracking-wider font-semibold">Character Name</label>
        <input
          value={name} onChange={e => setName(e.target.value)}
          placeholder="e.g. Thordak the Brave"
          className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-body focus:outline-none focus:border-accent mt-1"
          autoFocus
        />
      </div>

      {/* Class selection grid */}
      <div>
        <label className="text-xs text-muted uppercase tracking-wider font-semibold">Class</label>
        <div className="grid grid-cols-4 gap-2 mt-2">
          {classes.map(cls => (
            <button
              key={cls.id}
              onClick={() => { setSelectedClass(cls); setCustomClass(''); }}
              className={`p-2 rounded-lg border text-center cursor-pointer transition-colors ${
                selectedClass?.id === cls.id
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border hover:border-accent/50 text-body'
              }`}
            >
              <div className="text-sm font-semibold">{cls.name}</div>
              <div className="text-[10px] text-muted">{cls.hitDie} &middot; {ABILITY_LABELS[cls.primaryAbility]}</div>
            </button>
          ))}
          <button
            onClick={() => { setSelectedClass(null); }}
            className={`p-2 rounded-lg border text-center cursor-pointer transition-colors ${
              !selectedClass && customClass ? 'border-accent bg-accent/10 text-accent' : 'border-dashed border-border hover:border-accent/50 text-muted'
            }`}
          >
            <div className="text-sm font-semibold">Custom</div>
            <div className="text-[10px]">Homebrew</div>
          </button>
        </div>
        {!selectedClass && (
          <input
            value={customClass} onChange={e => setCustomClass(e.target.value)}
            placeholder="Custom class name (e.g. Blood Hunter)"
            className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm text-body focus:outline-none focus:border-accent mt-2"
          />
        )}
        {selectedClass && (
          <p className="text-xs text-muted mt-2">{selectedClass.description}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted uppercase tracking-wider font-semibold">Level</label>
          <input
            type="number" value={level} onChange={e => setLevel(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
            className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm text-body focus:outline-none focus:border-accent mt-1"
          />
        </div>
        <div>
          <label className="text-xs text-muted uppercase tracking-wider font-semibold">Speed</label>
          <input
            value={speed} onChange={e => setSpeed(e.target.value)}
            className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm text-body focus:outline-none focus:border-accent mt-1"
          />
        </div>
        <div>
          <label className="text-xs text-muted uppercase tracking-wider font-semibold">Portrait URL</label>
          <input
            value={imageUrl} onChange={e => setImageUrl(e.target.value)}
            placeholder="/images/..."
            className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm text-body placeholder:text-muted/50 focus:outline-none focus:border-accent mt-1"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-muted uppercase tracking-wider font-semibold">Notes</label>
        <input
          value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Race, background, personality..."
          className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm text-body placeholder:text-muted/50 focus:outline-none focus:border-accent mt-1"
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Step 2: Ability Scores
// ═══════════════════════════════════════════

function StepAbilityScores({
  stats, setStats,
  scoreMethod, setScoreMethod,
  arrayAssignments, setArrayAssignments,
  primaryAbility,
}: {
  stats: AbilityScores; setStats: (v: AbilityScores) => void;
  scoreMethod: 'manual' | 'standard-array'; setScoreMethod: (v: 'manual' | 'standard-array') => void;
  arrayAssignments: Record<string, number | null>; setArrayAssignments: (v: Record<string, number | null>) => void;
  primaryAbility?: string;
}) {
  const usedValues = Object.values(arrayAssignments).filter(v => v !== null) as number[];

  const assignArrayValue = (ability: string, value: number | null) => {
    setArrayAssignments({ ...arrayAssignments, [ability]: value });
  };

  return (
    <div className="space-y-4">
      {/* Method toggle */}
      <div className="flex items-center gap-4">
        <label className="text-xs text-muted uppercase tracking-wider font-semibold">Method:</label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="radio" checked={scoreMethod === 'manual'} onChange={() => setScoreMethod('manual')} className="text-accent" />
          <span className="text-xs text-body">Manual Entry</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="radio" checked={scoreMethod === 'standard-array'} onChange={() => setScoreMethod('standard-array')} className="text-accent" />
          <span className="text-xs text-body">Standard Array (15, 14, 13, 12, 10, 8)</span>
        </label>
      </div>

      {/* Score inputs */}
      <div className="grid grid-cols-6 gap-3">
        {ABILITY_NAMES.map(ab => (
          <div key={ab} className={`text-center p-3 rounded-lg border ${
            ab === primaryAbility ? 'border-accent/50 bg-accent/5' : 'border-border'
          }`}>
            <label className="text-xs text-muted uppercase font-bold block mb-1">
              {ABILITY_LABELS[ab]}
              {ab === primaryAbility && <span className="text-accent ml-0.5">*</span>}
            </label>

            {scoreMethod === 'manual' ? (
              <input
                type="number" min={1} max={30}
                value={stats[ab]}
                onChange={e => setStats({ ...stats, [ab]: parseInt(e.target.value) || 10 })}
                className="w-full bg-background border border-border rounded px-1 py-1.5 text-lg text-body text-center focus:outline-none focus:border-accent font-bold"
              />
            ) : (
              <select
                value={arrayAssignments[ab] ?? ''}
                onChange={e => {
                  const val = e.target.value ? parseInt(e.target.value) : null;
                  assignArrayValue(ab, val);
                }}
                className="w-full bg-background border border-border rounded px-1 py-1.5 text-lg text-body text-center focus:outline-none focus:border-accent font-bold cursor-pointer"
              >
                <option value="">—</option>
                {STANDARD_ARRAY.map(v => {
                  const isUsed = usedValues.includes(v) && arrayAssignments[ab] !== v;
                  // Allow if: not used, or only used once and this isn't a duplicate
                  const usedCount = usedValues.filter(u => u === v).length;
                  const available = usedCount === 0 || arrayAssignments[ab] === v;
                  return (
                    <option key={v} value={v} disabled={!available && isUsed}>{v}</option>
                  );
                })}
              </select>
            )}

            <div className="text-sm text-accent font-semibold mt-1">
              {formatMod(abilityMod(stats[ab]))}
            </div>
          </div>
        ))}
      </div>

      {primaryAbility && (
        <p className="text-xs text-muted">
          <span className="text-accent">*</span> Primary ability for your class. Consider putting your highest score here.
        </p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// Step 3: Proficiencies
// ═══════════════════════════════════════════

const ALL_SKILLS: { name: string; ability: string }[] = [
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

function StepProficiencies({
  savingThrows, setSavingThrows,
  skills, setSkills,
  availableSkills,
  maxSkillPicks,
  className,
}: {
  savingThrows: string[]; setSavingThrows: (v: string[]) => void;
  skills: string[]; setSkills: (v: string[]) => void;
  availableSkills?: string[];
  maxSkillPicks: number;
  className: string;
}) {
  const toggleSave = (ab: string) => {
    setSavingThrows(savingThrows.includes(ab) ? savingThrows.filter(s => s !== ab) : [...savingThrows, ab]);
  };

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else if (skills.length < maxSkillPicks) {
      setSkills([...skills, skill]);
    }
  };

  const displaySkills = availableSkills
    ? ALL_SKILLS.filter(s => availableSkills.includes(s.name))
    : ALL_SKILLS;

  return (
    <div className="space-y-5">
      {/* Saving Throws */}
      <div>
        <label className="text-xs text-muted uppercase tracking-wider font-semibold">Saving Throw Proficiencies</label>
        <p className="text-xs text-muted mb-2">Auto-set from class. Override if needed (e.g. multiclass, feats).</p>
        <div className="flex flex-wrap gap-3">
          {ABILITY_NAMES.map(ab => (
            <label key={ab} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={savingThrows.includes(ab)}
                onChange={() => toggleSave(ab)}
                className="rounded border-border text-accent focus:ring-accent"
              />
              <span className="text-sm text-body">{ABILITY_LABELS[ab]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-muted uppercase tracking-wider font-semibold">
            Skill Proficiencies
          </label>
          <span className={`text-xs font-semibold ${skills.length >= maxSkillPicks ? 'text-accent' : 'text-muted'}`}>
            {skills.length} / {maxSkillPicks} chosen
          </span>
        </div>
        {availableSkills && (
          <p className="text-xs text-muted mb-2">
            {className} can choose from the highlighted skills below.
          </p>
        )}
        <div className="grid grid-cols-3 gap-x-4 gap-y-1.5">
          {displaySkills.map(skill => {
            const checked = skills.includes(skill.name);
            const disabled = !checked && skills.length >= maxSkillPicks;
            return (
              <label key={skill.name} className={`flex items-center gap-1.5 ${disabled ? 'opacity-40' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSkill(skill.name)}
                  disabled={disabled}
                  className="rounded border-border text-accent focus:ring-accent"
                />
                <span className="text-sm text-body">{skill.name}</span>
                <span className="text-[10px] text-muted">({ABILITY_LABELS[skill.ability]})</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Step 4: Review
// ═══════════════════════════════════════════

function StepReview({
  name, className, level,
  stats, ac, hp, hitDie,
  speed, profBonus,
  savingThrows, skills,
  notes,
}: {
  name: string; className: string; level: number;
  stats: AbilityScores; ac: number; hp: number; hitDie: string;
  speed: string; profBonus: number;
  savingThrows: string[]; skills: string[];
  notes: string;
}) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <h3 className="text-lg font-bold text-body">{name}</h3>
        <p className="text-sm text-muted">{className} &middot; Level {level}</p>
      </div>

      {/* Combat stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'AC', value: ac },
          { label: 'HP', value: Math.max(1, hp) },
          { label: 'Hit Die', value: hitDie },
          { label: 'Prof', value: `+${profBonus}` },
        ].map(s => (
          <div key={s.label} className="text-center p-2 rounded-lg border border-border">
            <div className="text-[10px] text-muted uppercase">{s.label}</div>
            <div className="text-lg font-bold text-accent">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Ability scores */}
      <div className="grid grid-cols-6 gap-2">
        {ABILITY_NAMES.map(ab => (
          <div key={ab} className="text-center p-2 rounded border border-border">
            <div className="text-[10px] text-muted font-bold">{ABILITY_LABELS[ab]}</div>
            <div className="text-sm font-bold text-body">{stats[ab]}</div>
            <div className="text-xs text-accent">{formatMod(abilityMod(stats[ab]))}</div>
          </div>
        ))}
      </div>

      {/* Proficiencies */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">Saving Throws</div>
          <div className="text-sm text-body">
            {savingThrows.length > 0
              ? savingThrows.map(s => ABILITY_LABELS[s]).join(', ')
              : <span className="text-muted">None</span>
            }
          </div>
        </div>
        <div>
          <div className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">Speed</div>
          <div className="text-sm text-body">{speed}</div>
        </div>
      </div>

      {skills.length > 0 && (
        <div>
          <div className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">Skills</div>
          <div className="flex flex-wrap gap-1.5">
            {skills.map(s => (
              <span key={s} className="text-xs px-2 py-0.5 rounded bg-accent/15 text-accent">{s}</span>
            ))}
          </div>
        </div>
      )}

      {notes && (
        <div>
          <div className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">Notes</div>
          <div className="text-sm text-body">{notes}</div>
        </div>
      )}
    </div>
  );
}
