'use client';

import { useState } from 'react';
import { useAdventureContext } from '@/lib/AdventureContext';
import { makeImageResolver } from '@/hooks/useAdventure';
import type { Scene, ChallengeState } from '@/lib/types';
import Button from '@/components/shared/Button';
import Badge from '@/components/shared/Badge';
import { SpotlightButton } from './SpotlightControls';

interface SkillChallengesProps {
  onSpotlightChallenge?: (state: ChallengeState) => void;
}

interface ActiveChallenge {
  scene: Scene;
  successes: number;
  failures: number;
  rollHistory: { skill: string; result: 'success' | 'failure'; timestamp: number }[];
  resolved: boolean;
  outcome?: 'success' | 'failure';
}

export default function SkillChallenges({ onSpotlightChallenge }: SkillChallengesProps) {
  const { data: adventureData, slug } = useAdventureContext();
  const scenes = adventureData?.scenes ?? [];
  const resolveImg = makeImageResolver(slug);

  const [selectedSceneId, setSelectedSceneId] = useState<string>('');
  const [challenges, setChallenges] = useState<Record<string, ActiveChallenge>>({});

  const effectiveSelectedSceneId = selectedSceneId || (scenes.length > 0 ? scenes[0].id : '');
  const selectedScene = scenes.find(s => s.id === effectiveSelectedSceneId) || scenes[0];

  if (scenes.length === 0) {
    return <div className="text-muted text-center py-8">Loading scene data...</div>;
  }
  const activeChallenge = challenges[effectiveSelectedSceneId];

  const startChallenge = () => {
    setChallenges(prev => ({
      ...prev,
      [effectiveSelectedSceneId]: {
        scene: selectedScene,
        successes: 0,
        failures: 0,
        rollHistory: [],
        resolved: false,
      },
    }));
  };

  const logRoll = (skill: string, result: 'success' | 'failure') => {
    setChallenges(prev => {
      const ch = prev[effectiveSelectedSceneId];
      if (!ch || ch.resolved) return prev;

      const newSuccesses = ch.successes + (result === 'success' ? 1 : 0);
      const newFailures = ch.failures + (result === 'failure' ? 1 : 0);
      const resolved = newSuccesses >= ch.scene.successThreshold || newFailures >= ch.scene.failureThreshold;
      const outcome = resolved
        ? (newSuccesses >= ch.scene.successThreshold ? 'success' : 'failure')
        : undefined;

      return {
        ...prev,
        [effectiveSelectedSceneId]: {
          ...ch,
          successes: newSuccesses,
          failures: newFailures,
          rollHistory: [...ch.rollHistory, { skill, result, timestamp: Date.now() }],
          resolved,
          outcome,
        },
      };
    });
  };

  const resetChallenge = () => {
    setChallenges(prev => {
      const updated = { ...prev };
      delete updated[effectiveSelectedSceneId];
      return updated;
    });
  };

  const handleSpotlight = () => {
    if (!activeChallenge || !onSpotlightChallenge) return;
    onSpotlightChallenge({
      name: activeChallenge.scene.name,
      description: activeChallenge.scene.description,
      imageUrl: activeChallenge.scene.imageUrl ? resolveImg(activeChallenge.scene.imageUrl) : undefined,
      successes: activeChallenge.successes,
      failures: activeChallenge.failures,
      successThreshold: activeChallenge.scene.successThreshold,
      failureThreshold: activeChallenge.scene.failureThreshold,
      resolved: activeChallenge.resolved,
      outcome: activeChallenge.outcome,
    });
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-160px)]">
      {/* Scene sidebar */}
      <nav className="w-56 flex-shrink-0 overflow-y-auto bg-card border border-border rounded-lg">
        <div className="p-3 border-b border-border">
          <h2 className="text-xs uppercase tracking-wider text-accent font-semibold">Challenges</h2>
        </div>
        <div className="p-1">
          {scenes.map(scene => {
            const ch = challenges[scene.id];
            return (
              <button
                key={scene.id}
                onClick={() => setSelectedSceneId(scene.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors cursor-pointer
                  ${effectiveSelectedSceneId === scene.id
                    ? 'bg-accent/15 text-accent border-l-2 border-accent'
                    : 'text-muted hover:text-body hover:bg-card-alt'
                  }`}
              >
                <span className="block font-medium">{scene.name}</span>
                <span className="block text-xs text-muted">
                  {scene.successThreshold}/{scene.failureThreshold}
                  {ch && !ch.resolved && ' — Active'}
                  {ch?.resolved && ch.outcome === 'success' && ' — ✓'}
                  {ch?.resolved && ch.outcome === 'failure' && ' — ✗'}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Challenge content */}
      <main className="flex-1 overflow-y-auto space-y-4">
        {/* Scene info with illustration banner */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {selectedScene.imageUrl && (
            <div className="w-full h-36 relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveImg(selectedScene.imageUrl!)}
                alt={selectedScene.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
              <h2 className="absolute bottom-3 left-5 text-xl font-bold text-accent tracking-wider drop-shadow-lg">
                {selectedScene.name}
              </h2>
            </div>
          )}
          <div className="p-5">
            {!selectedScene.imageUrl && (
              <h2 className="text-xl font-bold text-accent tracking-wider mb-1">{selectedScene.name}</h2>
            )}
            <p className="text-sm text-muted mb-3">{selectedScene.description}</p>
            <div className="flex gap-4 text-sm">
              <span>Successes needed: <span className="text-success font-semibold">{selectedScene.successThreshold}</span></span>
              <span>Failures allowed: <span className="text-danger font-semibold">{selectedScene.failureThreshold}</span></span>
            </div>
          </div>
        </div>

        {/* Progress bars */}
        {activeChallenge ? (
          <>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs uppercase tracking-wider text-accent font-semibold">Progress</h3>
                <div className="flex gap-2">
                  {onSpotlightChallenge && (
                    <SpotlightButton size="md" label="Show Progress" onClick={handleSpotlight} />
                  )}
                  <Button variant="ghost" size="sm" onClick={resetChallenge}>Reset</Button>
                </div>
              </div>

              {/* Success bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-success">Successes</span>
                  <span className="text-muted">{activeChallenge.successes} / {selectedScene.successThreshold}</span>
                </div>
                <div className="w-full bg-card-alt rounded-full h-5">
                  <div
                    className="h-full bg-success rounded-full transition-all duration-500 flex items-center justify-center"
                    style={{ width: `${Math.min(100, (activeChallenge.successes / selectedScene.successThreshold) * 100)}%` }}
                  >
                    {activeChallenge.successes > 0 && (
                      <span className="text-xs font-bold text-background">{activeChallenge.successes}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Failure bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-danger">Failures</span>
                  <span className="text-muted">{activeChallenge.failures} / {selectedScene.failureThreshold}</span>
                </div>
                <div className="w-full bg-card-alt rounded-full h-5">
                  <div
                    className="h-full bg-danger rounded-full transition-all duration-500 flex items-center justify-center"
                    style={{ width: `${Math.min(100, (activeChallenge.failures / selectedScene.failureThreshold) * 100)}%` }}
                  >
                    {activeChallenge.failures > 0 && (
                      <span className="text-xs font-bold text-background">{activeChallenge.failures}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Outcome */}
              {activeChallenge.resolved && (
                <div className={`mt-4 p-3 rounded-lg border ${
                  activeChallenge.outcome === 'success'
                    ? 'bg-success/10 border-success/30'
                    : 'bg-danger/10 border-danger/30'
                }`}>
                  <h4 className={`text-sm font-bold mb-1 ${
                    activeChallenge.outcome === 'success' ? 'text-success' : 'text-danger'
                  }`}>
                    {activeChallenge.outcome === 'success' ? 'Challenge Succeeded!' : 'Challenge Failed!'}
                  </h4>
                  <p className="text-sm text-body">
                    {activeChallenge.outcome === 'success' ? selectedScene.successText : selectedScene.failureText}
                  </p>
                </div>
              )}
            </div>

            {/* Skill checks — log rolls */}
            {!activeChallenge.resolved && (
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-xs uppercase tracking-wider text-accent font-semibold mb-3">Skill Checks</h3>
                <div className="space-y-2">
                  {selectedScene.skills.map((skill, i) => (
                    <div key={i} className="flex items-center justify-between bg-card-alt rounded-md p-3 border border-border/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-body">{skill.skill}</span>
                          <Badge color="danger">DC {skill.dc}</Badge>
                        </div>
                        <p className="text-xs text-muted mt-0.5">{skill.description}</p>
                      </div>
                      <div className="flex gap-1 ml-3">
                        <button
                          onClick={() => logRoll(skill.skill, 'success')}
                          className="w-8 h-8 rounded-md bg-success/20 text-success hover:bg-success/30 flex items-center justify-center text-lg cursor-pointer transition-colors"
                          title="Success"
                        >
                          &#10003;
                        </button>
                        <button
                          onClick={() => logRoll(skill.skill, 'failure')}
                          className="w-8 h-8 rounded-md bg-danger/20 text-danger hover:bg-danger/30 flex items-center justify-center text-lg cursor-pointer transition-colors"
                          title="Failure"
                        >
                          &#10007;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Roll history */}
            {activeChallenge.rollHistory.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-xs uppercase tracking-wider text-muted font-semibold mb-2">Roll History</h3>
                <div className="space-y-1">
                  {[...activeChallenge.rollHistory].reverse().map((roll, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className={roll.result === 'success' ? 'text-success' : 'text-danger'}>
                        {roll.result === 'success' ? '✓' : '✗'}
                      </span>
                      <span className="text-body">{roll.skill}</span>
                      <span className="text-muted">
                        {new Date(roll.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Not started — show skill list and start button */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-xs uppercase tracking-wider text-accent font-semibold mb-3">Available Skills</h3>
              <div className="space-y-2 mb-4">
                {selectedScene.skills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-2 bg-card-alt rounded-md p-2 border border-border/50">
                    <span className="text-sm font-medium text-body">{skill.skill}</span>
                    <Badge color="danger">DC {skill.dc}</Badge>
                    <span className="text-xs text-muted flex-1">{skill.description}</span>
                  </div>
                ))}
              </div>
              <Button variant="primary" onClick={startChallenge}>Start Challenge</Button>
            </div>

            {/* Outcomes preview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-success/20 rounded-lg p-4">
                <h4 className="text-xs uppercase tracking-wider text-success font-semibold mb-2">On Success</h4>
                <p className="text-sm text-body">{selectedScene.successText}</p>
              </div>
              <div className="bg-card border border-danger/20 rounded-lg p-4">
                <h4 className="text-xs uppercase tracking-wider text-danger font-semibold mb-2">On Failure</h4>
                <p className="text-sm text-body">{selectedScene.failureText}</p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
