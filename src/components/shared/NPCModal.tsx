'use client';

import { useEffect, useRef } from 'react';
import type { NPC } from '@/lib/types';
import { SpotlightButton } from '@/components/dm/SpotlightControls';

interface NPCModalProps {
  npc: NPC;
  onClose: () => void;
  onSpotlightNarrative?: (title: string, text: string) => void;
}

export default function NPCModal({ npc, onClose, onSpotlightNarrative }: NPCModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Click outside to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="relative bg-card border border-border rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto m-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-md bg-card-alt hover:bg-border text-muted hover:text-body transition-colors cursor-pointer z-10"
          title="Close"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="p-5 space-y-4">
          {/* Header */}
          <div>
            <h2 className="text-xl font-bold text-accent tracking-wider pr-8">{npc.name}</h2>
            <p className="text-sm text-info">{npc.role}</p>
          </div>

          {/* Personality */}
          <div className="bg-card-alt rounded-md p-3 border border-border/50">
            <h3 className="text-xs uppercase tracking-wider text-accent font-semibold mb-1.5">Personality</h3>
            <p className="text-sm text-body">{npc.personality}</p>
          </div>

          {/* Voice Notes */}
          <div className="bg-card-alt rounded-md p-3 border border-magic/20">
            <h3 className="text-xs uppercase tracking-wider text-magic font-semibold mb-1.5">Voice Notes</h3>
            <p className="text-sm text-magic/80 italic">{npc.voiceNotes}</p>
          </div>

          {/* Goals & Fears */}
          {(npc.goals || npc.fears) && (
            <div className="grid grid-cols-2 gap-3">
              {npc.goals && (
                <div className="bg-card-alt rounded-md p-3 border border-success/20">
                  <h3 className="text-xs uppercase tracking-wider text-success font-semibold mb-1.5">Goals</h3>
                  <p className="text-sm text-body">{npc.goals}</p>
                </div>
              )}
              {npc.fears && (
                <div className="bg-card-alt rounded-md p-3 border border-danger/20">
                  <h3 className="text-xs uppercase tracking-wider text-danger font-semibold mb-1.5">Fears</h3>
                  <p className="text-sm text-body">{npc.fears}</p>
                </div>
              )}
            </div>
          )}

          {/* Sensory Details */}
          {npc.sensory && (
            <div>
              <h3 className="text-xs uppercase tracking-wider text-accent-secondary font-semibold mb-2">Sensory Details</h3>
              <div className="grid grid-cols-2 gap-2">
                {SENSORY_ENTRIES.map(({ key, label, icon }) => (
                  <div key={key} className="bg-card-alt rounded-md p-3 border border-border/50">
                    <div className="flex items-center gap-1.5 mb-1">
                      {icon}
                      <span className="text-[10px] uppercase tracking-wider text-accent-secondary/70 font-semibold">{label}</span>
                    </div>
                    <p className="text-xs text-body/80">{npc.sensory![key]}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Dialogue */}
          {npc.keyDialogue.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-wider text-info font-semibold mb-2">Key Dialogue</h3>
              <div className="space-y-2">
                {npc.keyDialogue.map((line, i) => (
                  <div key={i} className="flex items-start gap-2 bg-card-alt rounded-md p-3 border border-info/20">
                    <p className="flex-1 dialogue text-sm">{line}</p>
                    {onSpotlightNarrative && (
                      <SpotlightButton onClick={() => onSpotlightNarrative(npc.name, line)} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quirks */}
          {npc.quirks && npc.quirks.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-wider text-warning font-semibold mb-2">Quirks</h3>
              <div className="space-y-3">
                {npc.quirks.map((quirk, qi) => (
                  <div key={qi} className="bg-card-alt rounded-md p-3 border border-warning/20">
                    <p className="text-sm font-medium text-warning/90 mb-2">{quirk.description}</p>
                    {quirk.dialogue.length > 0 && (
                      <div className="space-y-2 ml-3 border-l-2 border-warning/20 pl-3">
                        {quirk.dialogue.map((line, di) => (
                          <div key={di} className="flex items-start gap-2">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sensory detail entries with icons matching the zone SensesPanel style
const SENSORY_ENTRIES: { key: keyof NonNullable<NPC['sensory']>; label: string; icon: React.ReactNode }[] = [
  {
    key: 'appearance',
    label: 'Appearance',
    icon: (
      <svg className="w-3.5 h-3.5 text-accent-secondary/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    key: 'sound',
    label: 'Sound',
    icon: (
      <svg className="w-3.5 h-3.5 text-accent-secondary/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
    ),
  },
  {
    key: 'smell',
    label: 'Smell',
    icon: (
      <svg className="w-3.5 h-3.5 text-accent-secondary/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M12 2C8 2 4 6 4 10c0 3 2 5 4 6v2h8v-2c2-1 4-3 4-6 0-4-4-8-8-8z" />
      </svg>
    ),
  },
  {
    key: 'presence',
    label: 'Presence',
    icon: (
      <svg className="w-3.5 h-3.5 text-accent-secondary/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
      </svg>
    ),
  },
];
