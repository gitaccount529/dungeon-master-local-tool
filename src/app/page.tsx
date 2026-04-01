'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Button from '@/components/shared/Button';
import GuidePanel from '@/components/dm/GuidePanel';
import RPNotes from '@/components/dm/RPNotes';
import ImprovToolkit from '@/components/dm/ImprovToolkit';
import ImageGallery from '@/components/dm/ImageGallery';
import LibraryBrowser from '@/components/dm/LibraryBrowser';
import PartyTracker from '@/components/dm/PartyTracker';
import CombatTracker from '@/components/dm/CombatTracker';
import SkillChallenges from '@/components/dm/SkillChallenges';
import SettingsModal from '@/components/dm/SettingsModal';
import ConnectPopover from '@/components/dm/ConnectPopover';
import AdventureSelector from '@/components/dm/AdventureSelector';
import SessionNotes from '@/components/dm/SessionNotes';
import ThemeApplier from '@/components/shared/ThemeApplier';
import type { CombatState, ChallengeState, SpotlightEvent, ReadAloudStyle, GuideSectionId, PartyMember, EncounterOverlay } from '@/lib/types';
import { DEFAULT_SECTION_ORDER } from '@/lib/types';
import { AdventureProvider, useAdventureContext } from '@/lib/AdventureContext';

const TABS = [
  { id: 'guide', label: 'Session Guide' },
  { id: 'party', label: 'Party' },
  { id: 'combat', label: 'Combat' },
  { id: 'challenges', label: 'Challenges' },
  { id: 'rp', label: 'RP Notes' },
  { id: 'notes', label: 'Notes' },
  { id: 'improv', label: 'Improv' },
  { id: 'images', label: 'Images' },
  { id: 'libraries', label: 'Libraries' },
] as const;

type TabId = typeof TABS[number]['id'];

interface PersistedSettings {
  readAloudStyle: string;
  sectionOrder: string[];
  sectionVisibility: Record<string, boolean>;
}

export default function DMView() {
  return (
    <AdventureProvider>
      <DMViewInner />
    </AdventureProvider>
  );
}

function DMViewInner() {
  const { data: adventureData, adventures, adventuresLoading, setActiveAdventure, refreshAdventures, deleteAdventure, activeSlug, patchAdventure } = useAdventureContext();

  const [activeTab, setActiveTab] = useState<TabId>('guide');
  const [playerCount, setPlayerCount] = useState(0);
  const [partyMembers, setPartyMembers] = useState<PartyMember[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Fetch party members for difficulty calculations
  useEffect(() => {
    const fetchParty = async () => {
      try {
        const res = await fetch('/api/party');
        if (res.ok) {
          const data = await res.json();
          setPartyMembers(data);
        }
      } catch { /* ignore */ }
    };
    fetchParty();
    const interval = setInterval(fetchParty, 15000);
    return () => clearInterval(interval);
  }, []);

  // Poll player count every 5 seconds
  useEffect(() => {
    const pollPlayerCount = async () => {
      try {
        const res = await fetch('/api/spotlight?playerCount');
        if (res.ok) {
          const data = await res.json();
          setPlayerCount(data.playerCount ?? 0);
        }
      } catch { /* ignore */ }
    };
    pollPlayerCount();
    const interval = setInterval(pollPlayerCount, 5000);
    return () => clearInterval(interval);
  }, []);
  const [customText, setCustomText] = useState('');
  const [spotlightStatus, setSpotlightStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [readAloudStyle, setReadAloudStyle] = useState<ReadAloudStyle>('atmospheric');
  const [sectionOrder, setSectionOrder] = useState<GuideSectionId[]>([...DEFAULT_SECTION_ORDER]);
  const [sectionVisibility, setSectionVisibility] = useState<Record<string, boolean>>(
    () => Object.fromEntries(DEFAULT_SECTION_ORDER.map(id => [id, true]))
  );
  const [pendingCombatMonsters, setPendingCombatMonsters] = useState<string[]>([]);
  const [adventureSwitcherOpen, setAdventureSwitcherOpen] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load settings from session on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/session?key=settings');
        if (res.ok) {
          const { value } = await res.json();
          if (value) {
            const parsed: PersistedSettings = JSON.parse(value);
            if (parsed.readAloudStyle) setReadAloudStyle(parsed.readAloudStyle as ReadAloudStyle);
            if (Array.isArray(parsed.sectionOrder) && parsed.sectionOrder.length > 0) {
              setSectionOrder(parsed.sectionOrder as GuideSectionId[]);
            }
            if (parsed.sectionVisibility) setSectionVisibility(parsed.sectionVisibility);
          }
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setSettingsLoaded(true);
      }
    }
    loadSettings();
  }, []);

  // Debounced save settings on change
  const saveSettings = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const settings: PersistedSettings = { readAloudStyle, sectionOrder, sectionVisibility };
      fetch('/api/session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'settings', value: JSON.stringify(settings) }),
      }).catch(err => console.error('Failed to save settings:', err));
    }, 500);
  }, [readAloudStyle, sectionOrder, sectionVisibility]);

  useEffect(() => {
    if (!settingsLoaded) return;
    saveSettings();
  }, [readAloudStyle, sectionOrder, sectionVisibility, settingsLoaded, saveSettings]);

  // Start Combat: switch to combat tab and queue monsters
  const handleStartCombat = (monsterIds: string[]) => {
    setPendingCombatMonsters(monsterIds);
    setActiveTab('combat');
  };

  // Spotlight: push content to the Player View via /api/spotlight
  const sendSpotlight = async (event: SpotlightEvent) => {
    try {
      await fetch('/api/spotlight', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      setSpotlightStatus('sent');
      setTimeout(() => setSpotlightStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to send spotlight:', err);
      setSpotlightStatus('error');
      setTimeout(() => setSpotlightStatus('idle'), 3000);
    }
  };

  const handleSpotlightNarrative = (title: string, text: string) => {
    sendSpotlight({ type: 'narrative', content: { title, text }, timestamp: Date.now() });
  };

  const handleSpotlightImage = (title: string, imageUrl: string) => {
    sendSpotlight({ type: 'image', content: { title, imageUrl }, timestamp: Date.now() });
  };

  const handleSpotlightCombat = (state: CombatState, timer?: { remaining: number; duration: number }) => {
    sendSpotlight({
      type: 'combat',
      content: {
        combatState: {
          round: state.round,
          participants: state.participants.map((p, i) => ({
            name: p.name,
            type: p.type,
            hp_current: p.hp_current,
            hp_max: p.hp_max,
            conditions: p.conditions,
            isActive: i === state.turn_index,
          })),
          timer: timer,
        },
      },
      timestamp: Date.now(),
    });
  };

  const handleSpotlightChallenge = (state: ChallengeState) => {
    sendSpotlight({ type: 'challenge', content: { challengeState: state }, timestamp: Date.now() });
  };

  const handleSpotlightEncounterOverlay = (overlay: EncounterOverlay) => {
    sendSpotlight({ type: 'encounter-overlay', content: { encounterOverlay: overlay }, timestamp: Date.now() });
  };

  const handleSendCustom = () => {
    if (!customText.trim()) return;
    sendSpotlight({ type: 'custom', content: { text: customText.trim() }, timestamp: Date.now() });
    setCustomText('');
  };

  const handleClearSpotlight = async () => {
    try {
      await fetch('/api/spotlight', { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to clear spotlight:', err);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'guide':
        return <GuidePanel readAloudStyle={readAloudStyle} sectionOrder={sectionOrder} sectionVisibility={sectionVisibility} onSpotlightNarrative={handleSpotlightNarrative} onSpotlightImage={handleSpotlightImage} onStartCombat={handleStartCombat} onSwitchTab={(tab) => setActiveTab(tab as TabId)} partyMembers={partyMembers} />;
      case 'rp':
        return <RPNotes onSpotlightNarrative={handleSpotlightNarrative} />;
      case 'notes':
        return <SessionNotes onSpotlightNarrative={handleSpotlightNarrative} />;
      case 'improv':
        return <ImprovToolkit onSpotlightNarrative={handleSpotlightNarrative} />;
      case 'party':
        return <PartyTracker />;
      case 'combat':
        return <CombatTracker onSpotlightCombat={handleSpotlightCombat} onSpotlightNarrative={handleSpotlightNarrative} onSpotlightImage={handleSpotlightImage} onSpotlightEncounterOverlay={handleSpotlightEncounterOverlay} pendingMonsters={pendingCombatMonsters} onClearPending={() => setPendingCombatMonsters([])} />;
      case 'challenges':
        return <SkillChallenges onSpotlightChallenge={handleSpotlightChallenge} />;
      case 'images':
        return <ImageGallery onSpotlightImage={handleSpotlightImage} />;
      case 'libraries':
        return <LibraryBrowser />;
      default:
        return null;
    }
  };

  const headerTitle = adventureData?.adventure.headerTitle ?? { primary: 'DM', secondary: 'TOOL' };

  // Show adventure selector if no adventure is loaded
  if (!adventureData && !adventuresLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <ThemeApplier />
        <header className="bg-card border-b border-border px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold tracking-wider">
              <span className="text-accent">DM</span>{' '}
              <span className="text-accent-secondary">TOOL</span>
            </h1>
          </div>
        </header>
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <AdventureSelector
              adventures={adventures}
              loading={adventuresLoading}
              onSelect={setActiveAdventure}
              onRefresh={refreshAdventures}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ThemeApplier />
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setAdventureSwitcherOpen(!adventureSwitcherOpen)}
              className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
              title="Switch adventure"
            >
              <h1 className="text-lg font-bold tracking-wider">
                <span className="text-accent">{headerTitle.primary}</span>{' '}
                <span className="text-accent-secondary">{headerTitle.secondary}</span>
              </h1>
              <svg className={`w-3 h-3 text-muted transition-transform ${adventureSwitcherOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {adventureSwitcherOpen && (
              <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 w-64 overflow-hidden">
                <div className="px-3 py-1.5 bg-card-alt text-xs uppercase tracking-wider text-muted font-semibold border-b border-border">
                  Adventures
                </div>
                {adventures.map(adv => (
                  <div key={adv.id} className="flex items-center group">
                    {confirmDeleteId === adv.id ? (
                      <div className="flex-1 flex items-center gap-1 px-3 py-2 bg-danger/10">
                        <span className="text-xs text-danger flex-1 truncate">Delete {adv.name}?</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteAdventure(adv.id); setConfirmDeleteId(null); setAdventureSwitcherOpen(false); }}
                          className="text-[10px] font-semibold text-danger hover:text-danger/80 px-1.5 py-0.5 rounded bg-danger/20 cursor-pointer"
                        >
                          Yes
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                          className="text-[10px] font-semibold text-muted hover:text-body px-1.5 py-0.5 cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => { setActiveAdventure(adv.id); setAdventureSwitcherOpen(false); setConfirmDeleteId(null); }}
                          className={`flex-1 text-left px-3 py-2 text-sm cursor-pointer transition-colors flex items-center gap-2 ${
                            adv.id === activeSlug
                              ? 'bg-accent/10 text-accent'
                              : 'text-body hover:bg-card-alt'
                          }`}
                        >
                          {adv.id === activeSlug && (
                            <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                          )}
                          <span className="flex-1 truncate">{adv.name}</span>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(adv.id); }}
                          className="opacity-0 group-hover:opacity-100 text-muted hover:text-danger px-2 py-1 text-xs cursor-pointer transition-all"
                          title="Delete adventure"
                        >
                          &#10005;
                        </button>
                      </>
                    )}
                  </div>
                ))}
                <div className="border-t border-border">
                  <button
                    onClick={() => { setActiveAdventure(null as unknown as string); setAdventureSwitcherOpen(false); }}
                    className="w-full text-left px-3 py-2 text-sm text-accent-secondary hover:bg-card-alt cursor-pointer transition-colors"
                  >
                    + Create New Adventure...
                  </button>
                </div>
              </div>
            )}
          </div>
          <span className="text-xs text-muted">DM View</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className={`inline-block w-2 h-2 rounded-full ${playerCount > 0 ? 'bg-success' : 'bg-muted'}`} />
            <span className="text-muted">{playerCount} player{playerCount !== 1 ? 's' : ''} connected</span>
          </div>
          {spotlightStatus === 'sent' && (
            <span className="text-xs text-success animate-pulse">✦ Sent to players</span>
          )}
          {spotlightStatus === 'error' && (
            <span className="text-xs text-danger">✦ Failed to send</span>
          )}
          <div className="relative">
            <button
              onClick={() => setConnectOpen(!connectOpen)}
              className="px-2 py-1.5 rounded-md text-xs text-muted hover:text-accent hover:bg-card-alt transition-colors cursor-pointer border border-border/50"
              title="Player Connection"
            >
              <svg className="w-4 h-4 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                <line x1="12" y1="20" x2="12.01" y2="20" />
              </svg>
              Connect
            </button>
            <ConnectPopover open={connectOpen} onClose={() => setConnectOpen(false)} />
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            className="px-2 py-1.5 rounded-md text-xs text-muted hover:text-accent hover:bg-card-alt transition-colors cursor-pointer border border-border/50"
            title="Settings"
          >
            <svg className="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          <Button variant="danger" size="sm" onClick={handleClearSpotlight}>
            Clear Player Screen
          </Button>
        </div>
      </header>

      {/* Quick-text input for custom messages */}
      <div className="bg-card-alt border-b border-border px-6 py-2 flex gap-2">
        <input
          type="text"
          value={customText}
          onChange={e => setCustomText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendCustom()}
          placeholder="Send custom text to players..."
          className="flex-1 bg-background border border-border rounded px-3 py-1.5 text-sm text-body
                     placeholder:text-muted/50 focus:outline-none focus:border-accent"
        />
        <Button variant="spotlight" size="sm" onClick={handleSendCustom}>
          Send to Players
        </Button>
      </div>

      {/* Tab Navigation */}
      <nav className="bg-card border-b border-border px-6">
        <div className="flex gap-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs uppercase tracking-wider font-medium transition-colors cursor-pointer
                ${activeTab === tab.id
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-muted hover:text-body'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Tab Content */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {renderTabContent()}
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        readAloudStyle={readAloudStyle}
        onReadAloudStyleChange={setReadAloudStyle}
        sectionOrder={sectionOrder}
        onSectionOrderChange={setSectionOrder}
        sectionVisibility={sectionVisibility}
        onSectionVisibilityChange={setSectionVisibility}
        adventure={adventureData?.adventure}
        onPatchAdventure={(updates) => patchAdventure(updates as Partial<import('@/lib/types').Adventure>)}
      />
    </div>
  );
}
