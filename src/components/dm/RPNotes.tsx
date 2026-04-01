'use client';

import { useState } from 'react';
import { useAdventureContext } from '@/lib/AdventureContext';
import type { NPC } from '@/lib/types';
import { SpotlightButton } from './SpotlightControls';

interface RPNotesProps {
  onSpotlightNarrative?: (title: string, text: string) => void;
}

export default function RPNotes({ onSpotlightNarrative }: RPNotesProps) {
  const { data: adventureData } = useAdventureContext();
  const npcs = adventureData?.npcs ?? [];
  const [selectedNpc, setSelectedNpc] = useState<string>('');

  // Auto-select first NPC when data loads
  const effectiveSelectedNpc = selectedNpc || (npcs.length > 0 ? npcs[0].id : '');
  const npc = npcs.find(n => n.id === effectiveSelectedNpc) || npcs[0];

  if (npcs.length === 0) {
    return <div className="text-muted text-center py-8">Loading NPC data...</div>;
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-160px)]">
      {/* NPC sidebar */}
      <nav className="w-56 flex-shrink-0 overflow-y-auto bg-card border border-border rounded-lg">
        <div className="p-3 border-b border-border">
          <h2 className="text-xs uppercase tracking-wider text-accent font-semibold">NPCs</h2>
        </div>
        <div className="p-1">
          {npcs.map(n => (
            <button
              key={n.id}
              onClick={() => setSelectedNpc(n.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors cursor-pointer
                ${effectiveSelectedNpc === n.id
                  ? 'bg-accent/15 text-accent border-l-2 border-accent'
                  : 'text-muted hover:text-body hover:bg-card-alt'
                }`}
            >
              <span className="block font-medium">{n.name}</span>
              <span className="block text-xs text-muted truncate">{n.role.split(',')[0]}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* NPC detail */}
      <main className="flex-1 overflow-y-auto space-y-4">
        <NPCDetail npc={npc} onSpotlightNarrative={onSpotlightNarrative} />
      </main>
    </div>
  );
}

function CollapsibleNoteSection({ id, title, titleColor, children, expanded, onToggle }: {
  id: string;
  title: string;
  titleColor?: string;
  children: React.ReactNode;
  expanded: Set<string>;
  onToggle: (id: string) => void;
}) {
  const isOpen = expanded.has(id);
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <button onClick={() => onToggle(id)} className="flex items-center gap-2 w-full text-left cursor-pointer">
        <h3 className={`text-xs uppercase tracking-wider font-semibold ${titleColor || 'text-accent'}`}>{title}</h3>
        <span className="text-muted text-xs">{isOpen ? '\u25B2' : '\u25BC'}</span>
      </button>
      {isOpen && <div className="mt-2">{children}</div>}
    </div>
  );
}

function NPCDetail({ npc, onSpotlightNarrative }: { npc: NPC; onSpotlightNarrative?: (title: string, text: string) => void }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['personality', 'dialogue']));

  const toggleSection = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <>
      {/* Header */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h2 className="text-xl font-bold text-accent tracking-wider">{npc.name}</h2>
        <p className="text-sm text-info">{npc.role}</p>
      </div>

      {/* Personality */}
      <CollapsibleNoteSection id="personality" title="Personality" titleColor="text-accent" expanded={expanded} onToggle={toggleSection}>
        <p className="text-sm text-body">{npc.personality}</p>
      </CollapsibleNoteSection>

      {/* Voice Notes */}
      <CollapsibleNoteSection id="voice" title="Voice Notes" titleColor="text-magic" expanded={expanded} onToggle={toggleSection}>
        <p className="text-sm text-magic/80 italic">{npc.voiceNotes}</p>
      </CollapsibleNoteSection>

      {/* Sensory Description */}
      {npc.sensory && (
        <CollapsibleNoteSection id="sensory" title="Sensory Description" titleColor="text-accent-secondary" expanded={expanded} onToggle={toggleSection}>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card-alt rounded-md p-3 border border-border/50">
              <div className="flex items-center gap-1.5 mb-1">
                <svg className="w-3.5 h-3.5 text-accent-secondary/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="3"/><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/></svg>
                <span className="text-[10px] uppercase tracking-wider text-accent-secondary/70 font-semibold">Appearance</span>
              </div>
              <p className="text-xs text-body/80">{npc.sensory.appearance}</p>
            </div>
            <div className="bg-card-alt rounded-md p-3 border border-border/50">
              <div className="flex items-center gap-1.5 mb-1">
                <svg className="w-3.5 h-3.5 text-accent-secondary/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                <span className="text-[10px] uppercase tracking-wider text-accent-secondary/70 font-semibold">Sound</span>
              </div>
              <p className="text-xs text-body/80">{npc.sensory.sound}</p>
            </div>
            <div className="bg-card-alt rounded-md p-3 border border-border/50">
              <div className="flex items-center gap-1.5 mb-1">
                <svg className="w-3.5 h-3.5 text-accent-secondary/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 2C8 2 4 6 4 10c0 3 2 5 4 6v2h8v-2c2-1 4-3 4-6 0-4-4-8-8-8z"/></svg>
                <span className="text-[10px] uppercase tracking-wider text-accent-secondary/70 font-semibold">Smell</span>
              </div>
              <p className="text-xs text-body/80">{npc.sensory.smell}</p>
            </div>
            <div className="bg-card-alt rounded-md p-3 border border-border/50">
              <div className="flex items-center gap-1.5 mb-1">
                <svg className="w-3.5 h-3.5 text-accent-secondary/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                <span className="text-[10px] uppercase tracking-wider text-accent-secondary/70 font-semibold">Presence</span>
              </div>
              <p className="text-xs text-body/80">{npc.sensory.presence}</p>
            </div>
          </div>
        </CollapsibleNoteSection>
      )}

      {/* Goals & Fears */}
      <CollapsibleNoteSection id="goals" title="Goals & Fears" titleColor="text-success" expanded={expanded} onToggle={toggleSection}>
        <div className="grid grid-cols-2 gap-4">
          {npc.goals && (
            <div>
              <h4 className="text-xs uppercase tracking-wider text-success font-semibold mb-2">Goals</h4>
              <p className="text-sm text-body">{npc.goals}</p>
            </div>
          )}
          {npc.fears && (
            <div>
              <h4 className="text-xs uppercase tracking-wider text-danger font-semibold mb-2">Fears</h4>
              <p className="text-sm text-body">{npc.fears}</p>
            </div>
          )}
        </div>
      </CollapsibleNoteSection>

      {/* Quirks with Dialogue */}
      {npc.quirks && npc.quirks.length > 0 && (
        <CollapsibleNoteSection id="quirks" title="Quirks" titleColor="text-warning" expanded={expanded} onToggle={toggleSection}>
          <div className="space-y-4">
            {npc.quirks.map((quirk, qi) => (
              <div key={qi} className="bg-card-alt rounded-md p-3 border border-warning/20">
                <p className="text-sm font-medium text-warning/90 mb-2">{quirk.description}</p>
                {quirk.dialogue.length > 0 && (
                  <div className="space-y-2 ml-3 border-l-2 border-warning/20 pl-3">
                    {quirk.dialogue.map((line, di) => (
                      <div key={di} className="flex items-start gap-3">
                        <p className="flex-1 dialogue text-sm text-body/80">{line}</p>
                        {onSpotlightNarrative && (
                          <SpotlightButton onClick={() => onSpotlightNarrative(npc.name, line)} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CollapsibleNoteSection>
      )}

      {/* Key Dialogue */}
      <CollapsibleNoteSection id="dialogue" title="Key Dialogue" titleColor="text-info" expanded={expanded} onToggle={toggleSection}>
        <div className="space-y-3">
          {npc.keyDialogue.map((line, i) => (
            <div key={i} className="flex items-start gap-3 bg-card-alt rounded-md p-3 border border-info/20">
              <p className="flex-1 dialogue text-sm">{line}</p>
              {onSpotlightNarrative && (
                <SpotlightButton onClick={() => onSpotlightNarrative(npc.name, line)} />
              )}
            </div>
          ))}
        </div>
      </CollapsibleNoteSection>
    </>
  );
}
