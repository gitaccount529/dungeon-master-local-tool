'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { rollD20, rollDice } from '@/lib/diceRoller';
import type { DamageExpression } from '@/lib/diceRoller';

interface DiceRollButtonProps {
  type: 'attack' | 'damage' | 'save';
  label: string;
  attackBonus?: number;
  damage?: DamageExpression;
  saveDC?: number;
  saveAbility?: string;
  onRollResult?: (result: { type: 'attack' | 'damage' | 'save'; total: number; details: string }) => void;
}

interface RollDisplay {
  line1: string;
  line2?: string;
  isNat20?: boolean;
  isNat1?: boolean;
}

export default function DiceRollButton({ type, label, attackBonus, damage, saveDC, saveAbility, onRollResult }: DiceRollButtonProps) {
  const [rollDisplay, setRollDisplay] = useState<RollDisplay | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearTimer();

    if (type === 'attack' && attackBonus !== undefined) {
      const result = rollD20(attackBonus);
      const nat = result.rolls[0];
      const isNat20 = nat === 20;
      const isNat1 = nat === 1;
      const sign = attackBonus >= 0 ? '+' : '';
      const display: RollDisplay = {
        line1: `d20 (${nat}) ${sign}${attackBonus} = ${result.total}`,
        isNat20,
        isNat1,
      };
      if (isNat20) display.line2 = 'CRITICAL HIT!';
      if (isNat1) display.line2 = 'CRITICAL MISS!';
      setRollDisplay(display);
      onRollResult?.({ type: 'attack', total: result.total, details: display.line1 });
    } else if (type === 'damage' && damage) {
      const result = rollDice(damage.count, damage.sides, damage.modifier);
      const diceStr = result.rolls.join(' + ');
      const modStr = damage.modifier !== 0 ? ` ${damage.modifier >= 0 ? '+' : '-'} ${Math.abs(damage.modifier)}` : '';
      const display: RollDisplay = {
        line1: `[${diceStr}]${modStr} = ${result.total}`,
        line2: `${damage.damageType} damage`,
      };
      setRollDisplay(display);
      onRollResult?.({ type: 'damage', total: result.total, details: `${result.total} ${damage.damageType}` });
    } else if (type === 'save') {
      const display: RollDisplay = {
        line1: `DC ${saveDC} ${saveAbility}`,
        line2: 'Players roll!',
      };
      setRollDisplay(display);
      onRollResult?.({ type: 'save', total: saveDC ?? 0, details: `DC ${saveDC} ${saveAbility}` });
    }

    timerRef.current = setTimeout(() => {
      setRollDisplay(null);
    }, 5000);
  };

  const colorClass = type === 'attack' ? 'text-accent' : type === 'damage' ? 'text-danger' : 'text-warning';
  const hoverBg = type === 'attack' ? 'hover:bg-accent/10' : type === 'damage' ? 'hover:bg-danger/10' : 'hover:bg-warning/10';

  return (
    <span className="relative inline">
      <button
        onClick={handleClick}
        className={`${colorClass} ${hoverBg} underline decoration-dotted underline-offset-2 cursor-pointer inline px-0.5 rounded transition-colors`}
        title={type === 'save' ? `DC ${saveDC} ${saveAbility} Save` : `Click to roll`}
      >
        <svg className="w-3 h-3 inline mr-0.5 -mt-0.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <rect x="2" y="2" width="20" height="20" rx="3" />
          <circle cx="8" cy="8" r="1.5" fill="currentColor" />
          <circle cx="16" cy="8" r="1.5" fill="currentColor" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <circle cx="8" cy="16" r="1.5" fill="currentColor" />
          <circle cx="16" cy="16" r="1.5" fill="currentColor" />
        </svg>
        {label}
      </button>
      {rollDisplay && (
        <div
          ref={popoverRef}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-50 whitespace-nowrap"
        >
          <div className={`bg-card border border-border rounded-md shadow-lg px-3 py-1.5 text-xs ${
            rollDisplay.isNat20 ? 'border-green-500/50 bg-green-500/10' :
            rollDisplay.isNat1 ? 'border-red-500/50 bg-red-500/10' : ''
          }`}>
            <p className={`font-mono font-semibold ${
              rollDisplay.isNat20 ? 'text-green-400' :
              rollDisplay.isNat1 ? 'text-red-400' : 'text-body'
            }`}>
              {rollDisplay.line1}
            </p>
            {rollDisplay.line2 && (
              <p className={`text-center ${
                rollDisplay.isNat20 ? 'text-green-400 font-bold' :
                rollDisplay.isNat1 ? 'text-red-400 font-bold' : 'text-muted'
              }`}>
                {rollDisplay.line2}
              </p>
            )}
          </div>
        </div>
      )}
    </span>
  );
}
