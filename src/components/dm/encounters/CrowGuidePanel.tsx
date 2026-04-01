'use client';

import { useState } from 'react';
import { ENCOUNTER_GUIDE } from '@/data/encounters/scarletCrow';

interface CrowGuidePanelProps {
  onSpotlight: (text: string, title?: string) => void;
}

export default function CrowGuidePanel({ onSpotlight }: CrowGuidePanelProps) {
  const [expandedPhase, setExpandedPhase] = useState<string | null>('pre-combat');

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-1.5">
      <h3 className="text-sm font-bold uppercase tracking-wider text-accent">Encounter Guide</h3>

      <div className="space-y-1">
        {ENCOUNTER_GUIDE.map(phase => {
          const expanded = expandedPhase === phase.id;
          const isUltimate = phase.id === 'death-throes';

          return (
            <div
              key={phase.id}
              className={`rounded-lg border transition-all ${
                isUltimate && expanded
                  ? 'border-red-700 bg-red-900/10'
                  : 'border-border bg-card'
              }`}
            >
              {/* Header */}
              <button
                onClick={() => setExpandedPhase(expanded ? null : phase.id)}
                className="w-full flex items-center gap-2 p-2 text-left"
              >
                <span className={`text-[11px] font-bold ${isUltimate ? 'text-danger' : 'text-foreground'}`}>
                  {phase.name}
                </span>
                <span className="text-[10px] text-muted">{phase.label}</span>
                <span className="ml-auto text-[10px] text-muted">{expanded ? '\u25B2' : '\u25BC'}</span>
              </button>

              {/* Expanded content */}
              {expanded && (
                <div className="px-2 pb-2 space-y-1.5">
                  {/* Notes */}
                  <ul className="text-[11px] text-muted space-y-0.5">
                    {phase.notes.map((note, i) => (
                      <li key={i} className="flex gap-1.5">
                        <span className="text-accent flex-shrink-0">\u2022</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Read-aloud */}
                  {phase.readAloud && (
                    <div className="border-l-2 border-accent pl-2">
                      <p className="text-[11px] italic text-accent-secondary leading-relaxed">
                        {phase.readAloud}
                      </p>
                      <div className="flex gap-1 mt-1">
                        <button
                          onClick={() => copyText(phase.readAloud!)}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-card-alt text-muted border border-border hover:text-foreground transition-colors"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => onSpotlight(phase.readAloud!, phase.name)}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-accent/20 text-accent border border-accent/50 hover:bg-accent/30 transition-colors"
                        >
                          Spotlight
                        </button>
                      </div>
                    </div>
                  )}

                  {/* DM Tips */}
                  {phase.dmTips && (
                    <div className="bg-card-alt rounded p-1.5 border border-border">
                      <span className="text-[10px] font-bold text-warning">DM Tips:</span>
                      <ul className="text-[10px] text-muted mt-0.5 space-y-0.5">
                        {phase.dmTips.map((tip, i) => (
                          <li key={i} className="flex gap-1.5">
                            <span className="text-warning flex-shrink-0">\u25B8</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
