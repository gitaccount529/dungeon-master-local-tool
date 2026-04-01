'use client';

import type { SpotlightEvent } from '@/lib/types';
import NarrativeDisplay from './NarrativeDisplay';
import PlayerCombatView from './PlayerCombatView';
import RotStackDisplay from './RotStackDisplay';

interface SpotlightDisplayProps {
  event: SpotlightEvent;
}

export default function SpotlightDisplay({ event }: SpotlightDisplayProps) {
  switch (event.type) {
    case 'narrative':
    case 'custom':
      return (
        <NarrativeDisplay
          title={event.content.title}
          text={event.content.text}
        />
      );

    case 'image':
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 lava-ambient spotlight-transition">
          {event.content.title && (
            <h2 className="text-xl md:text-2xl font-bold text-accent tracking-wider uppercase mb-4">
              {event.content.title}
            </h2>
          )}
          {event.content.imageUrl && (
            <div className="w-full max-w-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.content.imageUrl}
                alt={event.content.title || 'Spotlight image'}
                className="w-full h-auto rounded-lg border border-border shadow-2xl"
              />
            </div>
          )}
        </div>
      );

    case 'combat':
      return (
        <PlayerCombatView
          round={event.content.combatState?.round}
          participants={event.content.combatState?.participants}
          timer={event.content.combatState?.timer}
        />
      );

    case 'monster':
      if (!event.content.monsterPreview) return null;
      return (
        <div className="min-h-screen flex items-center justify-center p-6 lava-ambient spotlight-transition">
          <div className="max-w-sm w-full bg-card/80 backdrop-blur-sm border border-border rounded-xl overflow-hidden text-center space-y-4">
            {/* Monster portrait */}
            {event.content.monsterPreview.imageUrl && (
              <div className="w-full h-48 relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.content.monsterPreview.imageUrl}
                  alt={event.content.monsterPreview.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
              </div>
            )}
            <div className="px-6 pb-6 space-y-4">
              <h2 className="text-2xl font-bold text-danger tracking-wider uppercase">
                {event.content.monsterPreview.name}
              </h2>
              <div className="text-sm text-muted">
                AC <span className="text-body font-semibold text-lg">{event.content.monsterPreview.ac}</span>
              </div>
              <div className="px-4">
                <div className="w-full bg-card-alt rounded-full h-6 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      event.content.monsterPreview.hp_current / event.content.monsterPreview.hp_max > 0.5
                        ? 'bg-success'
                        : event.content.monsterPreview.hp_current / event.content.monsterPreview.hp_max > 0.25
                        ? 'bg-warning'
                        : 'bg-danger'
                    }`}
                    style={{
                      width: `${(event.content.monsterPreview.hp_current / event.content.monsterPreview.hp_max) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted mt-1">
                  {event.content.monsterPreview.hp_current} / {event.content.monsterPreview.hp_max} HP
                </p>
              </div>
            </div>
          </div>
        </div>
      );

    case 'challenge': {
      if (!event.content.challengeState) return null;
      const ch = event.content.challengeState;
      return (
        <div className="min-h-screen flex items-center justify-center p-6 lava-ambient spotlight-transition">
          <div className="max-w-md w-full bg-card/80 backdrop-blur-sm border border-border rounded-xl overflow-hidden">
            {/* Scene illustration */}
            {ch.imageUrl && (
              <div className="w-full h-32 relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ch.imageUrl}
                  alt={ch.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
              </div>
            )}
            <div className="px-6 pb-6 pt-4 space-y-4">
              <h2 className="text-xl md:text-2xl font-bold text-accent tracking-wider uppercase text-center">
                {ch.name}
              </h2>
              <p className="text-sm text-muted text-center">{ch.description}</p>

              {/* Success bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-success uppercase tracking-wider">Successes</span>
                  <span className="text-muted">{ch.successes} / {ch.successThreshold}</span>
                </div>
                <div className="w-full bg-card-alt rounded-full h-5">
                  <div
                    className="h-full bg-success rounded-full transition-all duration-700 flex items-center justify-center"
                    style={{ width: `${(ch.successes / ch.successThreshold) * 100}%` }}
                  >
                    {ch.successes > 0 && (
                      <span className="text-xs font-bold text-background">{ch.successes}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Failure bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-danger uppercase tracking-wider">Failures</span>
                  <span className="text-muted">{ch.failures} / {ch.failureThreshold}</span>
                </div>
                <div className="w-full bg-card-alt rounded-full h-5">
                  <div
                    className="h-full bg-danger rounded-full transition-all duration-700 flex items-center justify-center"
                    style={{ width: `${(ch.failures / ch.failureThreshold) * 100}%` }}
                  >
                    {ch.failures > 0 && (
                      <span className="text-xs font-bold text-background">{ch.failures}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Resolved outcome */}
              {ch.resolved && (
                <div className={`p-4 rounded-lg border text-center ${
                  ch.outcome === 'success'
                    ? 'bg-success/10 border-success/30'
                    : 'bg-danger/10 border-danger/30'
                }`}>
                  <p className={`text-lg font-bold ${
                    ch.outcome === 'success' ? 'text-success' : 'text-danger'
                  }`}>
                    {ch.outcome === 'success' ? 'Success!' : 'Failure!'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    case 'encounter-overlay':
      if (!event.content.encounterOverlay) return null;
      return <RotStackDisplay overlay={event.content.encounterOverlay} />;

    default:
      return null;
  }
}
