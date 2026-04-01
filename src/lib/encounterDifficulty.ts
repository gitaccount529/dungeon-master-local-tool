// XP thresholds by character level (DMG p.82)
const XP_THRESHOLDS: Record<number, { easy: number; medium: number; hard: number; deadly: number }> = {
  1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
  2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
  3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
  4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
  5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
  6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
  7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
  8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
  9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
  10: { easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
  11: { easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
  12: { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
  13: { easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
  14: { easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
  15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
  16: { easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
  17: { easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
  18: { easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
  19: { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
  20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 },
};

// CR to XP mapping (DMG p.274)
const CR_XP: Record<string, number> = {
  '0': 10, '1/8': 25, '1/4': 50, '1/2': 100,
  '1': 200, '2': 450, '3': 700, '4': 1100, '5': 1800,
  '6': 2300, '7': 2900, '8': 3900, '9': 5000, '10': 5900,
  '11': 7200, '12': 8400, '13': 10000, '14': 11500, '15': 13000,
  '16': 15000, '17': 18000, '18': 20000, '19': 22000, '20': 25000,
  '21': 33000, '22': 41000, '23': 50000, '24': 62000, '25': 75000,
  '26': 90000, '27': 105000, '28': 120000, '29': 135000, '30': 155000,
};

// Monster count multipliers (DMG p.82)
function getMultiplier(monsterCount: number, partySize: number): number {
  // Adjust effective monster count for party size
  let adjustedCount = monsterCount;
  if (partySize < 3) adjustedCount += 1; // fewer players = harder
  if (partySize > 5) adjustedCount -= 1; // more players = easier

  if (adjustedCount <= 1) return 1;
  if (adjustedCount === 2) return 1.5;
  if (adjustedCount <= 6) return 2;
  if (adjustedCount <= 10) return 2.5;
  if (adjustedCount <= 14) return 3;
  return 4;
}

/** Get XP value for a CR string */
export function getXPForCR(cr: string): number {
  return CR_XP[cr] || 0;
}

export interface DifficultyResult {
  difficulty: 'trivial' | 'easy' | 'medium' | 'hard' | 'deadly';
  adjustedXP: number;
  rawXP: number;
  thresholds: { easy: number; medium: number; hard: number; deadly: number };
  partySize: number;
  partyLevel: number; // average
}

export function calculateEncounterDifficulty(
  monsterCRs: string[],  // Array of CR strings for each monster
  partyLevels: number[]   // Array of party member levels
): DifficultyResult {
  // Calculate raw XP
  const rawXP = monsterCRs.reduce((sum, cr) => sum + (CR_XP[cr] || 0), 0);

  // Apply multiplier
  const multiplier = getMultiplier(monsterCRs.length, partyLevels.length);
  const adjustedXP = Math.round(rawXP * multiplier);

  // Calculate party thresholds (sum of individual thresholds)
  const avgLevel = Math.max(1, Math.round(partyLevels.reduce((a, b) => a + b, 0) / partyLevels.length));
  const thresholds = {
    easy: partyLevels.reduce((sum, lvl) => sum + (XP_THRESHOLDS[Math.min(lvl, 20)]?.easy || 0), 0),
    medium: partyLevels.reduce((sum, lvl) => sum + (XP_THRESHOLDS[Math.min(lvl, 20)]?.medium || 0), 0),
    hard: partyLevels.reduce((sum, lvl) => sum + (XP_THRESHOLDS[Math.min(lvl, 20)]?.hard || 0), 0),
    deadly: partyLevels.reduce((sum, lvl) => sum + (XP_THRESHOLDS[Math.min(lvl, 20)]?.deadly || 0), 0),
  };

  // Determine difficulty
  let difficulty: DifficultyResult['difficulty'];
  if (adjustedXP >= thresholds.deadly) difficulty = 'deadly';
  else if (adjustedXP >= thresholds.hard) difficulty = 'hard';
  else if (adjustedXP >= thresholds.medium) difficulty = 'medium';
  else if (adjustedXP >= thresholds.easy) difficulty = 'easy';
  else difficulty = 'trivial';

  return { difficulty, adjustedXP, rawXP, thresholds, partySize: partyLevels.length, partyLevel: avgLevel };
}
