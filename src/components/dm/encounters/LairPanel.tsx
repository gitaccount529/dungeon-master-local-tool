'use client';

import { useState } from 'react';
import { RUINED_TEMPLE } from '@/data/encounters/scarletCrow';

interface LairPanelProps {
  onSpotlight: (text: string, title?: string) => void;
  onSpotlightImage: (title: string, imageUrl: string) => void;
}

export default function LairPanel({ onSpotlight, onSpotlightImage }: LairPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-1.5">
      <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#8B0000' }}>
        Lair: {RUINED_TEMPLE.name}
      </h3>

      {/* Lair image spotlight */}
      <button
        onClick={() => onSpotlightImage(RUINED_TEMPLE.name, RUINED_TEMPLE.image)}
        className="w-full text-[10px] px-2 py-1 rounded bg-accent/20 text-accent border border-accent/50 hover:bg-accent/30 transition-colors"
      >
        Show Lair Image to Players
      </button>

      {/* Read-aloud sections */}
      {Object.entries(RUINED_TEMPLE.readAloud).map(([key, text]) => (
        <div key={key} className="bg-card-alt rounded p-2 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-accent capitalize">{key}</span>
            <div className="flex-1" />
            <button
              onClick={() => copyText(text)}
              className="text-[9px] px-1.5 py-0.5 rounded bg-card text-muted border border-border hover:text-foreground transition-colors"
            >
              Copy
            </button>
            <button
              onClick={() => onSpotlight(text, `${RUINED_TEMPLE.name} \u2014 ${key}`)}
              className="text-[9px] px-1.5 py-0.5 rounded bg-accent/20 text-accent border border-accent/50 hover:bg-accent/30 transition-colors"
            >
              Spotlight
            </button>
          </div>
          <p className="text-[11px] italic text-accent-secondary border-l-2 border-accent pl-2 leading-relaxed">
            {text}
          </p>
        </div>
      ))}

      {/* Terrain features */}
      <div className="space-y-1">
        {RUINED_TEMPLE.terrain.map((t, i) => (
          <div
            key={i}
            className="bg-card-alt rounded p-1.5 border border-border cursor-pointer"
            onClick={() => setExpandedSection(expandedSection === t.name ? null : t.name)}
          >
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-foreground">{t.name}</span>
              <span className="text-[10px] text-muted ml-auto">{t.effect}</span>
              <span className="text-[10px] text-muted">{expandedSection === t.name ? '\u25B2' : '\u25BC'}</span>
            </div>
            {expandedSection === t.name && (
              <p className="text-[10px] text-muted mt-1">{t.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
