'use client';

import { useState } from 'react';
import { conditions } from '@/data/conditions';
import type { ActiveCondition } from '@/lib/types';

interface ConditionBadgeProps {
  condition: string;
  activeCondition?: ActiveCondition;
  onRemove?: () => void;
  showRemove?: boolean;
}

export default function ConditionBadge({ condition, activeCondition, onRemove, showRemove = true }: ConditionBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const conditionData = conditions.find(c => c.name === condition);
  const description = conditionData?.description || 'Unknown condition';

  // Build duration indicator text
  let durationIndicator = '';
  if (activeCondition) {
    switch (activeCondition.duration) {
      case 'save-ends':
        durationIndicator = activeCondition.saveDC ? `DC ${activeCondition.saveDC}` : 'Save';
        break;
      case 'timed':
        durationIndicator = activeCondition.turnsRemaining != null ? `${activeCondition.turnsRemaining}r` : '';
        break;
      case 'start-of-turn':
      case 'end-of-turn':
        durationIndicator = activeCondition.turnsRemaining != null ? `${activeCondition.turnsRemaining}r` : '';
        break;
      case 'permanent':
      default:
        break;
    }
  }

  // Build tooltip detail
  let tooltipDetail = '';
  if (activeCondition) {
    const parts: string[] = [condition];
    if (activeCondition.duration === 'save-ends' && activeCondition.saveDC) {
      parts.push(`Save Ends (DC ${activeCondition.saveDC} ${activeCondition.saveAbility || ''})`);
    } else if (activeCondition.duration === 'timed' && activeCondition.turnsRemaining != null) {
      parts.push(`${activeCondition.turnsRemaining} rounds remaining`);
    } else if (activeCondition.duration === 'start-of-turn') {
      parts.push('Ends at start of turn');
      if (activeCondition.turnsRemaining != null) parts.push(`${activeCondition.turnsRemaining} rounds`);
    } else if (activeCondition.duration === 'end-of-turn') {
      parts.push('Ends at end of turn');
      if (activeCondition.turnsRemaining != null) parts.push(`${activeCondition.turnsRemaining} rounds`);
    } else if (activeCondition.duration === 'permanent') {
      parts.push('Permanent');
    }
    if (activeCondition.note) parts.push(activeCondition.note);
    tooltipDetail = parts.join(' - ');
  }

  // Clock icon for start/end of turn
  const showClock = activeCondition && (activeCondition.duration === 'start-of-turn' || activeCondition.duration === 'end-of-turn') && !activeCondition.turnsRemaining;

  return (
    <span
      className="relative inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                 bg-warning/20 text-warning border border-warning/40 cursor-help"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {condition}
      {durationIndicator && (
        <span className="text-[10px] opacity-75 ml-0.5">{durationIndicator}</span>
      )}
      {showClock && (
        <svg className="w-3 h-3 opacity-75" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )}
      {showRemove && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 hover:text-danger transition-colors cursor-pointer"
          aria-label={`Remove ${condition}`}
        >
          &times;
        </button>
      )}

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg
                        bg-card border border-border text-body text-xs whitespace-normal
                        min-w-[200px] max-w-[300px] z-50 shadow-lg">
          <p className="font-semibold text-accent mb-1">{condition}</p>
          {tooltipDetail ? (
            <p className="text-accent-secondary mb-1">{tooltipDetail}</p>
          ) : null}
          <p className="text-muted">{description}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px
                          border-4 border-transparent border-t-border" />
        </div>
      )}
    </span>
  );
}
