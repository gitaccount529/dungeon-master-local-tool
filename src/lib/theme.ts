import type { AdventureTheme } from '@/lib/types';

// Default theme matches globals.css :root values (Molten Enclave orange)
export const DEFAULT_THEME: Required<AdventureTheme> = {
  background: '#1a1110',
  foreground: '#e0d5cf',
  card: '#221815',
  cardAlt: '#1e1412',
  border: '#33221a',
  accent: '#ff6b35',
  accentSecondary: '#ff9466',
  textMuted: '#aa7766',
  textBody: '#e0d5cf',
  textBright: '#f0e0d0',
};

// Maps camelCase theme keys to CSS variable names
export const THEME_CSS_MAP: Record<keyof AdventureTheme, string> = {
  background: '--background',
  foreground: '--foreground',
  card: '--card',
  cardAlt: '--card-alt',
  border: '--border',
  accent: '--accent',
  accentSecondary: '--accent-secondary',
  textMuted: '--text-muted',
  textBody: '--text-body',
  textBright: '--text-bright',
};

/** Apply a theme to the document root. Call with undefined to reset to defaults. */
export function applyTheme(theme: AdventureTheme | undefined) {
  const root = document.documentElement;
  const entries = Object.entries(THEME_CSS_MAP) as [keyof AdventureTheme, string][];
  for (const [key, cssVar] of entries) {
    root.style.setProperty(cssVar, theme?.[key] ?? DEFAULT_THEME[key]);
  }
}

/** Reset theme to defaults */
export function resetTheme() {
  applyTheme(undefined);
}
