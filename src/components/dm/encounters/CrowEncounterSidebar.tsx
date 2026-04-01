'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import ScarletRotTracker from './ScarletRotTracker';
import TrinketTracker from './TrinketTracker';
import LegendaryActionPool from './LegendaryActionPool';
import VillainActionTracker from './VillainActionTracker';
import KenkuRecallTracker from './KenkuRecallTracker';
import LairPanel from './LairPanel';
import CrowGuidePanel from './CrowGuidePanel';
import {
  createInitialEncounterState,
  getRotTier,
  type CrowEncounterState,
  type ScarletRotPCState,
  type TrinketState,
  type VillainActionState,
  type LegendaryPoolState,
  type KenkuRecallState,
} from '@/data/encounters/scarletCrow';
import type { EncounterOverlay } from '@/lib/types';

interface CrowEncounterSidebarProps {
  crowHp: number;
  partyMembers: { id: string; name: string }[];
  onSpotlightNarrative: (title: string, text: string) => void;
  onSpotlightImage: (title: string, imageUrl: string) => void;
  onSpotlightEncounterOverlay: (overlay: EncounterOverlay) => void;
}

type SectionId = 'rot' | 'trinkets' | 'legendary' | 'villain' | 'kenku' | 'lair' | 'guide';

const SECTION_LABELS: Record<SectionId, string> = {
  rot: 'Scarlet Rot',
  trinkets: 'Shiny Trophies',
  legendary: 'Legendary Actions',
  villain: 'Villain Actions',
  kenku: 'Kenku Recall',
  lair: 'Lair',
  guide: 'Encounter Guide',
};

export default function CrowEncounterSidebar({
  crowHp,
  partyMembers,
  onSpotlightNarrative,
  onSpotlightImage,
  onSpotlightEncounterOverlay,
}: CrowEncounterSidebarProps) {
  const [state, setState] = useState<CrowEncounterState | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(
    new Set(['rot', 'legendary', 'villain'])
  );
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load state from API
  useEffect(() => {
    fetch('/api/encounter-state?key=crow_state')
      .then(r => r.json())
      .then(data => {
        if (data.value) {
          setState(data.value);
        } else {
          // Initialize with party members
          const initial = createInitialEncounterState(partyMembers);
          setState(initial);
          saveState(initial);
        }
      })
      .catch(() => {
        const initial = createInitialEncounterState(partyMembers);
        setState(initial);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync new party members into existing state
  useEffect(() => {
    if (!state) return;
    const existingIds = new Set(state.rotStacks.map(r => r.pcId));
    const newMembers = partyMembers.filter(pc => !existingIds.has(pc.id));
    if (newMembers.length > 0) {
      const updated = {
        ...state,
        rotStacks: [
          ...state.rotStacks,
          ...newMembers.map(pc => ({ pcId: pc.id, pcName: pc.name, stacks: 0, exhaustionFromRot: 0 })),
        ],
      };
      setState(updated);
      saveState(updated);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partyMembers]);

  const saveState = useCallback((s: CrowEncounterState) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch('/api/encounter-state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'crow_state', value: s }),
      });
    }, 300);
  }, []);

  const updateAndSave = useCallback((updates: Partial<CrowEncounterState>) => {
    setState(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      saveState(next);
      return next;
    });
  }, [saveState]);

  // Push rot overlay to players whenever rot stacks change
  const pushRotOverlay = useCallback((rotStacks: ScarletRotPCState[], darkness?: boolean) => {
    onSpotlightEncounterOverlay({
      rotStacks: rotStacks.map(pc => {
        const tier = getRotTier(pc.stacks);
        return {
          pcId: pc.pcId,
          pcName: pc.pcName,
          stacks: pc.stacks,
          tier: tier.name,
          tierColor: tier.color,
          damage: tier.damage,
          effects: tier.effect.split('. ').filter(Boolean),
        };
      }),
      darkness,
    });
  }, [onSpotlightEncounterOverlay]);

  const handleRotUpdate = useCallback((rotStacks: ScarletRotPCState[]) => {
    updateAndSave({ rotStacks });
    pushRotOverlay(rotStacks, state?.darknessActive);
  }, [updateAndSave, pushRotOverlay, state?.darknessActive]);

  const handleSpotlightRot = useCallback((pcId: string) => {
    if (!state) return;
    pushRotOverlay(state.rotStacks, state.darknessActive);
  }, [state, pushRotOverlay]);

  const toggleSection = useCallback((section: SectionId) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }, []);

  const handleSpotlight = useCallback((text: string, title?: string) => {
    onSpotlightNarrative(title || 'Encounter', text);
  }, [onSpotlightNarrative]);

  const toggleDarkness = useCallback(() => {
    if (!state) return;
    const newDarkness = !state.darknessActive;
    updateAndSave({ darknessActive: newDarkness });
    pushRotOverlay(state.rotStacks, newDarkness);
  }, [state, updateAndSave, pushRotOverlay]);

  const resetEncounter = useCallback(() => {
    const initial = createInitialEncounterState(partyMembers);
    setState(initial);
    saveState(initial);
  }, [partyMembers, saveState]);

  if (!state) {
    return <div className="p-4 text-muted text-sm">Loading encounter state...</div>;
  }

  const sections: { id: SectionId; content: React.ReactNode }[] = [
    {
      id: 'rot',
      content: (
        <ScarletRotTracker
          rotStacks={state.rotStacks}
          onUpdate={handleRotUpdate}
          onSpotlightRot={handleSpotlightRot}
        />
      ),
    },
    {
      id: 'trinkets',
      content: (
        <TrinketTracker
          trinkets={state.trinkets}
          partyMembers={partyMembers}
          onUpdate={(trinkets: TrinketState[]) => updateAndSave({ trinkets })}
        />
      ),
    },
    {
      id: 'legendary',
      content: (
        <LegendaryActionPool
          pool={state.legendaryPool}
          onUpdate={(legendaryPool: LegendaryPoolState) => updateAndSave({ legendaryPool })}
        />
      ),
    },
    {
      id: 'villain',
      content: (
        <VillainActionTracker
          villainActions={state.villainActions}
          crowHp={crowHp}
          onUpdate={(villainActions: VillainActionState[]) => updateAndSave({ villainActions })}
          onSpotlight={handleSpotlight}
        />
      ),
    },
    {
      id: 'kenku',
      content: (
        <KenkuRecallTracker
          recall={state.kenkuRecall}
          partyMembers={partyMembers}
          onUpdate={(kenkuRecall: KenkuRecallState) => updateAndSave({ kenkuRecall })}
        />
      ),
    },
    {
      id: 'lair',
      content: (
        <LairPanel onSpotlight={handleSpotlight} onSpotlightImage={onSpotlightImage} />
      ),
    },
    {
      id: 'guide',
      content: (
        <CrowGuidePanel onSpotlight={handleSpotlight} />
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col border-l border-border bg-card-alt">
      {/* Sidebar header */}
      <div className="p-2 border-b border-border flex items-center gap-2 flex-shrink-0">
        <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8B0000' }}>
          Crow Encounter
        </h2>
        <div className="flex-1" />
        <button
          onClick={toggleDarkness}
          className={`text-[10px] px-2 py-0.5 rounded font-bold border transition-colors ${
            state.darknessActive
              ? 'bg-gray-900 text-white border-gray-600'
              : 'bg-card text-muted border-border hover:text-foreground'
          }`}
        >
          {state.darknessActive ? 'Darkness ON' : 'Darkness'}
        </button>
        <button
          onClick={resetEncounter}
          className="text-[10px] px-2 py-0.5 rounded bg-card text-danger border border-border hover:bg-red-900/20 transition-colors"
          title="Reset all encounter state"
        >
          Reset
        </button>
      </div>

      {/* Scrollable sections */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 encounter-sidebar-scroll">
        {sections.map(({ id, content }) => {
          const expanded = expandedSections.has(id);
          // Rot tracker is always visible (no collapse)
          if (id === 'rot') {
            return (
              <div key={id} className="mb-2">
                {content}
              </div>
            );
          }

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
