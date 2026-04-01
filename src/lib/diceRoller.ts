'use client';

export interface DiceRollResult {
  rolls: number[];
  modifier: number;
  total: number;
}

export interface DamageExpression {
  count: number;
  sides: number;
  modifier: number;
  damageType: string;
  average: number;
  original: string; // the matched text like "21 (4d6 + 7) bludgeoning damage"
}

export type ActionSegmentType = 'text' | 'attack' | 'damage' | 'save';

export interface ActionSegment {
  type: ActionSegmentType;
  content: string;
  attackBonus?: number;
  damage?: DamageExpression;
  saveDC?: number;
  saveAbility?: string;
}

export function rollDice(count: number, sides: number, modifier: number = 0): DiceRollResult {
  const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
  return { rolls, modifier, total: rolls.reduce((a, b) => a + b, 0) + modifier };
}

export function rollD20(modifier: number = 0): DiceRollResult {
  return rollDice(1, 20, modifier);
}

export function parseAttackBonus(text: string): number | null {
  const match = text.match(/([+-]\d+)\s+to hit/);
  return match ? parseInt(match[1]) : null;
}

export function parseDamageRolls(text: string): DamageExpression[] {
  const results: DamageExpression[] = [];
  // Pattern: "21 (4d6 + 7) bludgeoning damage" or without average "4d6 + 7 fire damage"
  const pattern = /(\d+)\s*\(\s*(\d+)d(\d+)\s*([+-]\s*\d+)?\s*\)\s*(\w+)\s+damage/g;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    results.push({
      average: parseInt(match[1]),
      count: parseInt(match[2]),
      sides: parseInt(match[3]),
      modifier: match[4] ? parseInt(match[4].replace(/\s/g, '')) : 0,
      damageType: match[5],
      original: match[0],
    });
  }
  return results;
}

export function parseSaveDC(text: string): { dc: number; ability: string } | null {
  const match = text.match(/DC\s+(\d+)\s+(\w+)\s+saving throw/i);
  return match ? { dc: parseInt(match[1]), ability: match[2] } : null;
}

export function parseActionText(text: string): ActionSegment[] {
  // Build a list of rollable regions with their positions
  const regions: { start: number; end: number; segment: ActionSegment }[] = [];

  // Find attack bonus: "+11 to hit"
  const atkRegex = /([+-]\d+)\s+to hit/g;
  let m;
  while ((m = atkRegex.exec(text)) !== null) {
    regions.push({
      start: m.index,
      end: m.index + m[0].length,
      segment: { type: 'attack', content: m[0], attackBonus: parseInt(m[1]) }
    });
  }

  // Find damage: "21 (4d6 + 7) bludgeoning damage"
  const dmgRegex = /(\d+)\s*\(\s*(\d+)d(\d+)\s*([+-]\s*\d+)?\s*\)\s*(\w+)\s+damage/g;
  while ((m = dmgRegex.exec(text)) !== null) {
    regions.push({
      start: m.index,
      end: m.index + m[0].length,
      segment: {
        type: 'damage', content: m[0],
        damage: {
          average: parseInt(m[1]), count: parseInt(m[2]), sides: parseInt(m[3]),
          modifier: m[4] ? parseInt(m[4].replace(/\s/g, '')) : 0,
          damageType: m[5], original: m[0],
        }
      }
    });
  }

  // Find save DC: "DC 18 Dexterity saving throw"
  const saveRegex = /DC\s+(\d+)\s+(\w+)\s+saving throw/gi;
  while ((m = saveRegex.exec(text)) !== null) {
    regions.push({
      start: m.index,
      end: m.index + m[0].length,
      segment: { type: 'save', content: m[0], saveDC: parseInt(m[1]), saveAbility: m[2] }
    });
  }

  // Sort by position, remove overlaps
  regions.sort((a, b) => a.start - b.start);
  const filtered: typeof regions = [];
  let lastEnd = 0;
  for (const r of regions) {
    if (r.start >= lastEnd) {
      filtered.push(r);
      lastEnd = r.end;
    }
  }

  // Build segments
  const segments: ActionSegment[] = [];
  let pos = 0;
  for (const r of filtered) {
    if (r.start > pos) {
      segments.push({ type: 'text', content: text.slice(pos, r.start) });
    }
    segments.push(r.segment);
    pos = r.end;
  }
  if (pos < text.length) {
    segments.push({ type: 'text', content: text.slice(pos) });
  }

  return segments;
}
