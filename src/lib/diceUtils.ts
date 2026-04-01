export function calculateAverage(count: number, sides: number, modifier: number = 0): number {
  return Math.floor(count * (sides + 1) / 2) + modifier;
}

export function formatDamageFormula(count: number, sides: number, modifier: number = 0): string {
  const avg = calculateAverage(count, sides, modifier);
  const mod = modifier > 0 ? ` + ${modifier}` : modifier < 0 ? ` - ${Math.abs(modifier)}` : '';
  return `${avg} (${count}d${sides}${mod})`;
}

export function parseDiceNotation(notation: string): { count: number; sides: number; modifier: number } | null {
  const match = notation.match(/(\d+)d(\d+)\s*([+-]\s*\d+)?/);
  if (!match) return null;
  return { count: parseInt(match[1]), sides: parseInt(match[2]), modifier: match[3] ? parseInt(match[3].replace(/\s/g, '')) : 0 };
}
