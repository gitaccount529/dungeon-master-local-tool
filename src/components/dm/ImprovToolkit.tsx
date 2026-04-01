'use client';

import { useState } from 'react';
import { useAdventureContext } from '@/lib/AdventureContext';
import type { BattleCry, EnvironmentalEvent } from '@/lib/types';
import Button from '@/components/shared/Button';
import { SpotlightButton } from './SpotlightControls';

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface ImprovToolkitProps {
  onSpotlightNarrative?: (title: string, text: string) => void;
}

export default function ImprovToolkit({ onSpotlightNarrative }: ImprovToolkitProps) {
  const { data: adventureData } = useAdventureContext();
  const improvData = adventureData?.improv ?? null;

  const [rolledName, setRolledName] = useState<string | null>(null);
  const [rolledQuirk, setRolledQuirk] = useState<string | null>(null);
  const [rolledCry, setRolledCry] = useState<BattleCry | null>(null);
  const [rolledEvent, setRolledEvent] = useState<EnvironmentalEvent | null>(null);

  if (!improvData) {
    return <div className="text-muted text-center py-8">Loading improv data...</div>;
  }

  const namesList = improvData.names ?? improvData.giantNames ?? [];
  const nameLabel = improvData.nameLabel ?? 'Name';

  return (
    <div className="space-y-6">
      {/* Random Generators */}
      <div className="grid grid-cols-2 gap-4">
        {/* Name */}
        <SimpleRandomCard
          title={nameLabel}
          result={rolledName}
          onRoll={() => setRolledName(randomItem(namesList))}
          accent="accent"
          pool={namesList.length}
        />

        {/* Personality Quirk */}
        <SimpleRandomCard
          title="Personality Quirk"
          result={rolledQuirk}
          onRoll={() => setRolledQuirk(randomItem(improvData.personalityQuirks))}
          accent="magic"
          pool={improvData.personalityQuirks.length}
        />

        {/* Battle Cry — structured with narrative */}
        <div className="bg-card border rounded-lg p-4 text-danger border-danger/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs uppercase tracking-wider font-semibold">Battle Cry</h3>
            <span className="text-xs text-muted">pool: {improvData.battleCries.length}</span>
          </div>
          <div className="min-h-[5rem] mb-3">
            {rolledCry ? (
              <div className="space-y-2">
                <p className="text-sm font-bold text-danger">&ldquo;{rolledCry.cry}&rdquo;</p>
                <p className="read-aloud text-sm">{rolledCry.narrative}</p>
              </div>
            ) : (
              <p className="text-sm text-muted italic">Click to roll...</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setRolledCry(randomItem(improvData.battleCries))}>
              Roll
            </Button>
            {rolledCry && onSpotlightNarrative && (
              <SpotlightButton
                size="md"
                label="Send Narrative"
                onClick={() => onSpotlightNarrative('Battle Cry', `"${rolledCry.cry}"\n\n${rolledCry.narrative}`)}
              />
            )}
          </div>
        </div>

        {/* Environmental Event — structured with narrative + mechanic */}
        <div className="bg-card border rounded-lg p-4 text-warning border-warning/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs uppercase tracking-wider font-semibold">Environmental Event</h3>
            <span className="text-xs text-muted">pool: {improvData.environmentalEvents.length}</span>
          </div>
          <div className="min-h-[5rem] mb-3">
            {rolledEvent ? (
              <div className="space-y-2">
                <p className="text-sm font-bold text-warning">{rolledEvent.name}</p>
                <p className="read-aloud text-sm">{rolledEvent.narrative}</p>
                <p className="text-xs text-muted italic border-t border-border pt-2 mt-2">
                  ⚙ {rolledEvent.mechanic}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted italic">Click to roll...</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setRolledEvent(randomItem(improvData.environmentalEvents))}>
              Roll
            </Button>
            {rolledEvent && onSpotlightNarrative && (
              <SpotlightButton
                size="md"
                label="Send Narrative"
                onClick={() => onSpotlightNarrative(rolledEvent.name, rolledEvent.narrative)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Quick-Reference Name List */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-xs uppercase tracking-wider text-accent font-semibold mb-3">
          Quick-Reference Name List
        </h3>
        <div className="flex flex-wrap gap-2">
          {namesList.map((name, i) => (
            <span key={i} className="px-2 py-1 bg-card-alt rounded text-sm text-body border border-border/50">
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* Flavor Text Blocks */}
      <div className="space-y-4">
        {improvData.flavorText.map((category, i) => (
          <FlavorTextBlock
            key={i}
            category={category.category}
            texts={category.texts}
            onSpotlightNarrative={onSpotlightNarrative}
          />
        ))}
      </div>
    </div>
  );
}

function SimpleRandomCard({
  title,
  result,
  onRoll,
  accent,
  pool,
}: {
  title: string;
  result: string | null;
  onRoll: () => void;
  accent: string;
  pool: number;
}) {
  const colorMap: Record<string, string> = {
    accent: 'text-accent border-accent/30',
    magic: 'text-magic border-magic/30',
  };

  return (
    <div className={`bg-card border rounded-lg p-4 ${colorMap[accent] || 'border-border'}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs uppercase tracking-wider font-semibold">{title}</h3>
        <span className="text-xs text-muted">pool: {pool}</span>
      </div>
      <div className="min-h-[3rem] flex items-center mb-3">
        {result ? (
          <p className="text-sm text-body font-medium">{result}</p>
        ) : (
          <p className="text-sm text-muted italic">Click to roll...</p>
        )}
      </div>
      <Button variant="secondary" size="sm" onClick={onRoll}>
        Roll
      </Button>
    </div>
  );
}

function FlavorTextBlock({
  category,
  texts,
  onSpotlightNarrative,
}: {
  category: string;
  texts: string[];
  onSpotlightNarrative?: (title: string, text: string) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs uppercase tracking-wider text-accent-secondary font-semibold">{category}</h3>
        <div className="flex items-center gap-2">
          {onSpotlightNarrative && (
            <SpotlightButton onClick={() => onSpotlightNarrative(category, texts[currentIndex])} />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentIndex((currentIndex + 1) % texts.length)}
          >
            Next ({currentIndex + 1}/{texts.length})
          </Button>
        </div>
      </div>
      <p className="read-aloud text-sm">{texts[currentIndex]}</p>
    </div>
  );
}
