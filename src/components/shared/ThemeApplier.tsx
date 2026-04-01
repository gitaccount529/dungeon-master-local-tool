'use client';

import { useEffect } from 'react';
import { useAdventureContext } from '@/lib/AdventureContext';
import { applyTheme, resetTheme } from '@/lib/theme';

export default function ThemeApplier() {
  const { data } = useAdventureContext();
  const theme = data?.adventure?.theme;

  useEffect(() => {
    applyTheme(theme);
    return () => { resetTheme(); };
  }, [theme]);

  return null;
}
