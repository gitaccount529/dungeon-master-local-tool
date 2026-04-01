'use client';

import { useCallback } from 'react';
import type { SpotlightEvent, ChallengeState, MonsterPreview } from '@/lib/types';

interface UseSpotlightOptions {
  sendSpotlight: (event: SpotlightEvent) => void;
  clearSpotlight: () => void;
}

export function useSpotlight({ sendSpotlight, clearSpotlight }: UseSpotlightOptions) {
  const spotlightNarrative = useCallback((title: string, text: string) => {
    sendSpotlight({
      type: 'narrative',
      content: { title, text },
      timestamp: Date.now(),
    });
  }, [sendSpotlight]);

  const spotlightImage = useCallback((title: string, imageUrl: string) => {
    sendSpotlight({
      type: 'image',
      content: { title, imageUrl },
      timestamp: Date.now(),
    });
  }, [sendSpotlight]);

  const spotlightCombat = useCallback((round: number, participants: SpotlightEvent['content']['combatState']) => {
    sendSpotlight({
      type: 'combat',
      content: { combatState: participants },
      timestamp: Date.now(),
    });
  }, [sendSpotlight]);

  const spotlightMonster = useCallback((monster: MonsterPreview) => {
    sendSpotlight({
      type: 'monster',
      content: { monsterPreview: monster },
      timestamp: Date.now(),
    });
  }, [sendSpotlight]);

  const spotlightChallenge = useCallback((challenge: ChallengeState) => {
    sendSpotlight({
      type: 'challenge',
      content: { challengeState: challenge },
      timestamp: Date.now(),
    });
  }, [sendSpotlight]);

  const spotlightCustom = useCallback((title: string, text: string) => {
    sendSpotlight({
      type: 'custom',
      content: { title, text },
      timestamp: Date.now(),
    });
  }, [sendSpotlight]);

  return {
    spotlightNarrative,
    spotlightImage,
    spotlightCombat,
    spotlightMonster,
    spotlightChallenge,
    spotlightCustom,
    clearSpotlight,
  };
}
