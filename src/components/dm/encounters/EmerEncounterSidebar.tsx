'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { MonsterAction } from '@/lib/types';

interface EmerEncounterSidebarProps {
  emerHp: number;
  villainActions: MonsterAction[];
  lairActions: MonsterAction[];
  onSpotlightNarrative: (title: string, text: string) => void;
}

interface EmerEncounterState {
  villainActionsUsed: Record<string, boolean>;
  lairActionLastUsed: string | null;
}

type SectionId = 'villain' | 'lair' | 'guide';

const SECTION_LABELS: Record<SectionId, string> = {
  villain: 'Villain Actions',
  lair: 'Lair Actions',
  guide: 'Encounter Guide',
};

export default function EmerEncounterSidebar({
  emerHp,
  villainActions,
  lairActions,
  onSpotlightNarrative,
}: EmerEncounterSidebarProps) {
  const [state, setState] = useState<EmerEncounterState>({
    villainActionsUsed: {},
    lairActionLastUsed: null,
  });
  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(
    new Set(['villain', 'lair'])
  );
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load state from API
  useEffect(() => {
    fetch('/api/encounter-state?key=emer_state')
      .then(r => r.json())
      .then(data => {
        if (data.value) setState(data.value);
      })
      .catch(() => {});
  }, []);

  const saveState = useCallback((s: EmerEncounterState) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch('/api/encounter-state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'emer_state', value: s }),
      });
    }, 300);
  }, []);

  const toggleSection = useCallback((section: SectionId) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }, []);

  const toggleVillainUsed = useCallback((actionName: string) => {
    setState(prev => {
      const next = {
        ...prev,
        villainActionsUsed: {
          ...prev.villainActionsUsed,
          [actionName]: !prev.villainActionsUsed[actionName],
        },
      };
      saveState(next);
      return next;
    });
  }, [saveState]);

  const markLairUsed = useCallback((actionName: string) => {
    setState(prev => {
      const next = { ...prev, lairActionLastUsed: actionName };
      saveState(next);
      return next;
    });
  }, [saveState]);

  const resetEncounter = useCallback(() => {
    const initial: EmerEncounterState = {
      villainActionsUsed: {},
      lairActionLastUsed: null,
    };
    setState(initial);
    saveState(initial);
  }, [saveState]);

  const sections: { id: SectionId; content: React.ReactNode }[] = [
    {
      id: 'villain',
      content: (
        <VillainActionsPanel
          actions={villainActions}
          usedMap={state.villainActionsUsed}
          emerHp={emerHp}
          onToggleUsed={toggleVillainUsed}
          onSpotlight={onSpotlightNarrative}
        />
      ),
    },
    {
      id: 'lair',
      content: (
        <LairActionsPanel
          actions={lairActions}
          lastUsed={state.lairActionLastUsed}
          onMarkUsed={markLairUsed}
          onSpotlight={onSpotlightNarrative}
        />
      ),
    },
    {
      id: 'guide',
      content: <EmerGuidePanel onSpotlight={onSpotlightNarrative} />,
    },
  ];

  return (
    <div className="h-full flex flex-col border-l border-border bg-card-alt">
      {/* Sidebar header */}
      <div className="p-2 border-b border-border flex items-center gap-2 flex-shrink-0">
        <h2 className="text-xs font-bold uppercase tracking-widest text-danger">
          Lady Emer Encounter
        </h2>
        <div className="flex-1" />
        <span className="text-[10px] font-bold text-muted">
          HP: <span className={emerHp <= 50 ? 'text-danger' : 'text-body'}>{emerHp}</span>/190
        </span>
        <button
          onClick={resetEncounter}
          className="text-[10px] px-2 py-0.5 rounded bg-card text-danger border border-border hover:bg-red-900/20 transition-colors"
          title="Reset encounter state"
        >
          Reset
        </button>
      </div>

      {/* Scrollable sections */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 encounter-sidebar-scroll">
        {sections.map(({ id, content }) => {
          const expanded = expandedSections.has(id);
          return (
            <div key={id} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection(id)}
                className="w-full flex items-center gap-2 px-2 py-1.5 bg-card hover:bg-card-alt transition-colors text-left"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  {SECTION_LABELS[id]}
                </span>
                <span className="ml-auto text-[10px] text-muted">{expanded ? '\u25B2' : '\u25BC'}</span>
              </button>
              {expanded && (
                <div className="p-2 border-t border-border">
                  {content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Villain Actions Panel
// ═══════════════════════════════════════════

function VillainActionsPanel({
  actions,
  usedMap,
  emerHp,
  onToggleUsed,
  onSpotlight,
}: {
  actions: MonsterAction[];
  usedMap: Record<string, boolean>;
  emerHp: number;
  onToggleUsed: (name: string) => void;
  onSpotlight: (title: string, text: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      {actions.map((action, i) => {
        const used = usedMap[action.name] ?? false;
        return (
          <div
            key={i}
            className={`rounded-lg p-2 border transition-all ${
              used
                ? 'border-border opacity-50 bg-card-alt'
                : 'border-border bg-card'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-xs text-foreground">{action.name}</span>
              <div className="flex-1" />
              <button
                onClick={() => onToggleUsed(action.name)}
                className={`text-[10px] px-2 py-0.5 rounded font-bold border transition-colors ${
                  used
                    ? 'bg-card-alt text-muted border-border'
                    : 'bg-success/20 text-success border-success/50 hover:bg-success/30'
                }`}
              >
                {used ? 'Used' : 'Available'}
              </button>
            </div>
            {!used && (
              <>
                <p className="text-[10px] text-muted mb-1">{action.description}</p>
                <button
                  onClick={() => onSpotlight(action.name, action.description)}
                  className="text-[10px] px-2 py-0.5 rounded bg-accent/20 text-accent border border-accent/50 hover:bg-accent/30 transition-colors"
                >
                  Show to Players
                </button>
              </>
            )}
          </div>
        );
      })}
      <p className="text-[9px] text-muted italic mt-1">
        HP: {emerHp}/190 — Villain actions trigger once each during combat
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════
// Lair Actions Panel
// ═══════════════════════════════════════════

function LairActionsPanel({
  actions,
  lastUsed,
  onMarkUsed,
  onSpotlight,
}: {
  actions: MonsterAction[];
  lastUsed: string | null;
  onMarkUsed: (name: string) => void;
  onSpotlight: (title: string, text: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] text-muted italic">
        Initiative count 20 (losing ties). Can&apos;t repeat same action two rounds in a row.
      </p>
      {actions.map((action, i) => {
        const wasLastUsed = lastUsed === action.name;
        return (
          <div
            key={i}
            className={`rounded-lg p-2 border transition-all ${
              wasLastUsed
                ? 'border-warning/50 bg-warning/5'
                : 'border-border bg-card hover:bg-card-alt'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-xs text-foreground">{action.name}</span>
              {wasLastUsed && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-warning/20 text-warning font-bold">
                  Used Last
                </span>
              )}
              <div className="flex-1" />
              <button
                onClick={() => onMarkUsed(action.name)}
                className="text-[10px] px-2 py-0.5 rounded bg-info/20 text-info border border-info/50 hover:bg-info/30 transition-colors"
              >
                Use
              </button>
            </div>
            <p className="text-[10px] text-muted">{action.description}</p>
            <button
              onClick={() => onSpotlight('Lair Action: ' + action.name, action.description)}
              className="text-[10px] px-2 py-0.5 mt-1 rounded bg-accent/20 text-accent border border-accent/50 hover:bg-accent/30 transition-colors"
            >
              Show to Players
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════
// Encounter Guide Panel
// ═══════════════════════════════════════════

function EmerGuidePanel({ onSpotlight }: { onSpotlight: (title: string, text: string) => void }) {
  const tips = [
    {
      title: 'Stone Garden Advantage',
      text: 'Lady Emer retreats to the stone garden (E5) for combat — her lair actions only work there. The garden has statues she can use for Stone Sacrifice.',
    },
    {
      title: 'Stone Gaze Progression',
      text: '1st fail: Speed -10, disadvantage on DEX. 2nd fail: Speed -10 more, dazed. 3rd fail: Petrified (requires greater restoration).',
    },
    {
      title: 'Stone Sacrifice',
      text: 'When Emer fails a save, she can choose to succeed by ending petrification on a creature within 300 ft. She has 3/day uses. The stone garden statues count!',
    },
    {
      title: 'Medusa Evolution (Villain 2)',
      text: 'Emer grows wings — 40 ft fly speed for 1 minute. She will use this to stay out of melee range and rain arrows.',
    },
  ];

  return (
    <div className="space-y-1.5">
      {tips.map((tip, i) => (
        <div key={i} className="bg-card-alt rounded p-2 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-accent">{tip.title}</span>
            <div className="flex-1" />
            <button
              onClick={() => onSpotlight(tip.title, tip.text)}
              className="text-[9px] px-1.5 py-0.5 rounded bg-accent/20 text-accent border border-accent/50 hover:bg-accent/30 transition-colors"
            >
              Spotlight
            </button>
          </div>
          <p className="text-[10px] text-muted">{tip.text}</p>
        </div>
      ))}
    </div>
  );
}
