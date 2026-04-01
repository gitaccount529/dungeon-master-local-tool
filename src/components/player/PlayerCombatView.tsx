'use client';

import { useState, useEffect, useRef } from 'react';
import Badge from '@/components/shared/Badge';

interface CombatParticipantView {
  name: string;
  type: 'pc' | 'monster';
  hp_current: number;
  hp_max: number;
  conditions: string[];
  isActive: boolean;
  imageUrl?: string;
  className?: string;  // character class name for PC fallback display
}

interface TimerState {
  remaining: number;
  duration: number;
}

interface PlayerCombatViewProps {
  round?: number;
  participants?: CombatParticipantView[];
  timer?: TimerState;
}

// TODO: This could be controlled by a DM setting (showMonsterState).
// When false, don't show the HP state indicator for monsters — only for PCs.
const showMonsterState = true;

function getHpStateColor(current: number, max: number): string {
  if (current <= 0) return 'bg-gray-500';
  const ratio = current / max;
  if (ratio > 0.5) return 'bg-success';
  if (ratio > 0.25) return 'bg-warning';
  return 'bg-danger';
}

function getHpStateDotShadow(current: number, max: number): string {
  if (current <= 0) return 'shadow-[0_0_6px_#6b7280]';
  const ratio = current / max;
  if (ratio > 0.5) return 'shadow-[0_0_6px_#22c55e]';
  if (ratio > 0.25) return 'shadow-[0_0_6px_#eab308]';
  return 'shadow-[0_0_6px_#ef4444]';
}

function getHpStateLabel(current: number, max: number): string {
  if (current <= 0) return 'Dead';
  const ratio = current / max;
  if (ratio > 0.5) return 'Healthy';
  if (ratio > 0.25) return 'Wounded';
  return 'Critical';
}

// Circular countdown timer SVG component
function CountdownTimer({ remaining, duration }: TimerState) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = duration > 0 ? remaining / duration : 0;
  const offset = circumference * (1 - progress);

  // Color transitions: green -> yellow -> red
  let strokeColor = '#22c55e'; // green
  let textColor = 'text-success';
  if (remaining <= duration * 0.25) {
    strokeColor = '#ef4444'; // red
    textColor = 'text-danger';
  } else if (remaining <= duration * 0.5) {
    strokeColor = '#eab308'; // yellow
    textColor = 'text-warning';
  }

  const isPulsing = remaining > 0 && remaining <= 10;
  const isExpired = remaining <= 0;

  return (
    <div className={`relative inline-flex items-center justify-center ${isPulsing ? 'combat-timer-pulse' : ''}`}>
      <svg width="140" height="140" viewBox="0 0 120 120" className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="6"
        />
        {/* Progress ring */}
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke={isExpired ? '#ef4444' : strokeColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      {/* Center number */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isExpired ? (
          <span className="text-[64px] font-bold text-danger combat-time-flash leading-none">!</span>
        ) : (
          <span className={`text-[64px] font-bold ${textColor} leading-none tabular-nums`}>
            {remaining}
          </span>
        )}
      </div>
    </div>
  );
}

export default function PlayerCombatView({ round, participants, timer }: PlayerCombatViewProps) {
  const [transitionKey, setTransitionKey] = useState(0);
  const prevActiveRef = useRef<string | null>(null);

  // Detect active combatant changes for transition animation
  const activeParticipant = participants?.find(p => p.isActive) ?? null;
  const activeName = activeParticipant?.name ?? null;

  useEffect(() => {
    if (activeName && activeName !== prevActiveRef.current) {
      setTransitionKey(k => k + 1);
      prevActiveRef.current = activeName;
    }
  }, [activeName]);

  if (!participants || participants.length === 0) return null;

  const pcsOnly = participants.filter(p => p.type === 'pc');
  const isTimerExpired = timer && timer.remaining <= 0;

  return (
    <div className="min-h-screen flex flex-col lava-ambient">
      {/* ── Round counter ── */}
      <div className="flex-shrink-0 text-center py-3 border-b border-border/30">
        <div className="flex items-center justify-center gap-3">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-muted">Combat</span>
          {round && (
            <span className="text-lg md:text-2xl font-bold text-accent tabular-nums">
              Round {round}
            </span>
          )}
        </div>
      </div>

      {/* ── Main content: sidebar + hero ── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Initiative order sidebar */}
        <div className="flex-shrink-0 md:w-56 border-b md:border-b-0 md:border-r border-border/30 overflow-y-auto combat-sidebar-scroll">
          <div className="p-2 md:p-3">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-2 px-1">
              Initiative
            </h3>
            <div className="space-y-1">
              {participants.map((p, i) => {
                const isActive = p.isActive;
                const isDead = p.hp_current <= 0;
                return (
                  <div
                    key={`${p.name}-${i}`}
                    className={`
                      flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-300
                      ${isActive
                        ? 'bg-accent/15 border border-accent/50 shadow-[0_0_12px_rgba(255,107,53,0.25)]'
                        : 'bg-transparent border border-transparent'
                      }
                      ${isDead && !isActive ? 'opacity-35' : ''}
                    `}
                  >
                    {/* HP state dot */}
                    {(p.type === 'pc' || showMonsterState) && (
                      <span
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getHpStateColor(p.hp_current, p.hp_max)} ${isActive ? getHpStateDotShadow(p.hp_current, p.hp_max) : ''}`}
                        title={getHpStateLabel(p.hp_current, p.hp_max)}
                      />
                    )}
                    {/* Name */}
                    <span className={`text-sm font-semibold truncate ${
                      p.type === 'pc' ? 'text-info' : 'text-danger'
                    } ${isActive ? 'brightness-125' : ''}`}>
                      {p.name}
                    </span>
                    {/* Condition badges */}
                    {p.conditions.length > 0 && (
                      <div className="flex gap-0.5 ml-auto flex-shrink-0">
                        {p.conditions.slice(0, 2).map(c => (
                          <span key={c} className="px-1 py-0.5 rounded text-[8px] bg-warning/20 text-warning leading-none">
                            {c.slice(0, 3)}
                          </span>
                        ))}
                        {p.conditions.length > 2 && (
                          <span className="text-[8px] text-muted">+{p.conditions.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active combatant hero card + timer (center) */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto">
          {activeParticipant && (
            <div
              key={transitionKey}
              className="w-full max-w-lg combat-turn-enter"
            >
              {/* Hero card */}
              <div className={`rounded-2xl p-6 md:p-8 text-center border-2 shadow-2xl ${
                activeParticipant.type === 'pc'
                  ? 'bg-card border-info/40 shadow-[0_0_40px_rgba(59,130,246,0.2)]'
                  : 'bg-card border-danger/40 shadow-[0_0_40px_rgba(239,68,68,0.2)]'
              }`}>
                {/* NOW ACTING label */}
                <div className="mb-4">
                  <span className="inline-block px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] combat-now-acting bg-accent/15 text-accent border border-accent/30">
                    Now Acting
                  </span>
                </div>

                {/* HP state + Name */}
                <div className="flex items-center justify-center gap-3 mb-3">
                  {(activeParticipant.type === 'pc' || showMonsterState) && (
                    <span
                      className={`w-4 h-4 rounded-full ${getHpStateColor(activeParticipant.hp_current, activeParticipant.hp_max)} ${getHpStateDotShadow(activeParticipant.hp_current, activeParticipant.hp_max)}`}
                      title={getHpStateLabel(activeParticipant.hp_current, activeParticipant.hp_max)}
                    />
                  )}
                  <h2 className={`font-bold text-3xl md:text-4xl ${
                    activeParticipant.type === 'pc' ? 'text-info' : 'text-danger'
                  }`}>
                    {activeParticipant.name}
                  </h2>
                </div>

                {/* Type badge */}
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Badge color={activeParticipant.type === 'pc' ? 'info' : 'danger'}>
                    {activeParticipant.type === 'pc' ? 'PC' : 'Monster'}
                  </Badge>
                  {activeParticipant.hp_current <= 0 && (
                    <Badge color="muted">Dead</Badge>
                  )}
                </div>

                {/* Flavor message */}
                <p className="text-sm text-muted italic mb-2">
                  {activeParticipant.type === 'pc'
                    ? "Your turn!"
                    : `The ${activeParticipant.name} acts...`
                  }
                </p>

                {/* Conditions */}
                {activeParticipant.conditions.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                    {activeParticipant.conditions.map(c => (
                      <span key={c} className="px-2.5 py-1 rounded-md text-xs bg-warning/20 text-warning font-medium border border-warning/20">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Timer */}
              {timer && (
                <div className="mt-6 flex justify-center">
                  {isTimerExpired ? (
                    <div className="combat-time-flash text-center">
                      <span className="text-[64px] font-black text-danger leading-none">TIME!</span>
                    </div>
                  ) : (
                    <CountdownTimer remaining={timer.remaining} duration={timer.duration} />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Status overview bar (PCs only) ── */}
      {pcsOnly.length > 0 && (
        <div className="flex-shrink-0 border-t border-border/30 px-3 py-2 overflow-x-auto">
          <div className="flex items-center justify-center gap-4 min-w-max">
            {pcsOnly.map((pc, i) => (
              <div key={`pc-status-${i}`} className="flex items-center gap-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getHpStateColor(pc.hp_current, pc.hp_max)}`}
                  title={getHpStateLabel(pc.hp_current, pc.hp_max)}
                />
                <span className="text-xs font-medium text-info truncate max-w-[80px]">
                  {pc.name}
                </span>
                {pc.conditions.length > 0 && (
                  <div className="flex gap-0.5">
                    {pc.conditions.map(c => (
                      <span key={c} className="px-1 py-0.5 rounded text-[8px] bg-warning/20 text-warning leading-none">
                        {c.slice(0, 3)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
