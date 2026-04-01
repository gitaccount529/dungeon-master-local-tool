'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Zone, ZoneFeature, ZoneEncounter, ZoneNPC, ZoneTreasure, AmbianceTrack, ReadAloudStyle, ZoneSenses, GuideSectionId, NPC, ImprovData, Monster, Scene, PartyMember } from '@/lib/types';
import { DEFAULT_SECTION_ORDER } from '@/lib/types';
import { getAudioEngine, detectSoundProfile } from '@/lib/audioEngine';
import { useAdventureContext } from '@/lib/AdventureContext';
import { makeImageResolver } from '@/hooks/useAdventure';
import { calculateEncounterDifficulty } from '@/lib/encounterDifficulty';
import Badge from '@/components/shared/Badge';
import NPCModal from '@/components/shared/NPCModal';
import EditableText from '@/components/shared/EditableText';
import { SpotlightButton } from './SpotlightControls';

interface GuidePanelProps {
  readAloudStyle?: ReadAloudStyle;
  sectionOrder?: GuideSectionId[];
  sectionVisibility?: Record<string, boolean>;
  onSpotlightNarrative?: (title: string, text: string) => void;
  onSpotlightImage?: (title: string, imageUrl: string) => void;
  onStartCombat?: (monsterIds: string[]) => void;
  onSwitchTab?: (tab: string) => void;
  partyMembers?: PartyMember[];
}

// ═══════════════════════════════════════════
// Lifted audio state — shared across zones
// ═══════════════════════════════════════════

interface ActiveTrackInfo {
  trackName: string;
  zoneId: string;
  zoneName: string;
}

function useAudioState() {
  const engine = useRef(getAudioEngine());
  const [activeTracks, setActiveTracks] = useState<Map<string, ActiveTrackInfo>>(new Map());
  const [trackVolumes, setTrackVolumes] = useState<Record<string, number>>({});
  const [masterVolume, setMasterVolumeState] = useState(0.5);

  const isTrackActive = useCallback((trackId: string) => activeTracks.has(trackId), [activeTracks]);

  const toggleTrack = useCallback(async (track: AmbianceTrack, zoneId: string, zoneName: string) => {
    const eng = engine.current;
    const trackId = track.name;
    if (eng.isPlaying(trackId)) {
      eng.stop(trackId);
      setActiveTracks(prev => {
        const next = new Map(prev);
        next.delete(trackId);
        return next;
      });
    } else {
      const profile = detectSoundProfile(track.name, track.description);
      const vol = trackVolumes[trackId] ?? 0.5;
      await eng.play(trackId, profile, vol);
      setActiveTracks(prev => new Map([...prev, [trackId, { trackName: track.name, zoneId, zoneName }]]));
    }
  }, [trackVolumes]);

  const handleTrackVolume = useCallback((trackId: string, vol: number) => {
    engine.current.setTrackVolume(trackId, vol);
    setTrackVolumes(prev => ({ ...prev, [trackId]: vol }));
  }, []);

  const handleMasterVolume = useCallback((vol: number) => {
    engine.current.setMasterVolume(vol);
    setMasterVolumeState(vol);
  }, []);

  const stopTrack = useCallback((trackId: string) => {
    engine.current.stop(trackId);
    setActiveTracks(prev => {
      const next = new Map(prev);
      next.delete(trackId);
      return next;
    });
  }, []);

  const stopAll = useCallback(() => {
    engine.current.stopAll();
    setActiveTracks(new Map());
  }, []);

  return {
    engine: engine.current,
    activeTracks,
    trackVolumes,
    masterVolume,
    isTrackActive,
    toggleTrack,
    handleTrackVolume,
    handleMasterVolume,
    stopTrack,
    stopAll,
  };
}

type AudioStateReturn = ReturnType<typeof useAudioState>;

export default function GuidePanel({ readAloudStyle = 'atmospheric', sectionOrder = DEFAULT_SECTION_ORDER, sectionVisibility, onSpotlightNarrative, onSpotlightImage, onStartCombat, onSwitchTab, partyMembers = [] }: GuidePanelProps) {
  const { data: adventureData, slug } = useAdventureContext();

  // Derive data from context
  const travelSection = adventureData?.zones.travelSection;
  const zoneOverview = adventureData?.zones.zoneOverview;
  const zones = adventureData?.zones.zones ?? [];
  const monstersList = adventureData?.monsters ?? [];
  const scenesList = adventureData?.scenes ?? [];
  const npcsList = adventureData?.npcs ?? [];
  const improvDataCtx = adventureData?.improv ?? null;

  const resolveImg = makeImageResolver(slug);

  const ALL_ZONES: Zone[] = [
    ...(travelSection ? [travelSection] : []),
    ...(zoneOverview ? [zoneOverview] : []),
    ...zones,
  ];

  const [selectedZoneId, setSelectedZoneId] = useState<string>('travel');
  const [zoneSwitchSuggestion, setZoneSwitchSuggestion] = useState<{ fromZone: string; toZone: Zone } | null>(null);
  const selectedZone = ALL_ZONES.find(z => z.id === selectedZoneId) ?? ALL_ZONES[0] ?? null;
  const audio = useAudioState();

  // ALL useCallback hooks MUST be before early returns (React Rules of Hooks)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleZoneSwitch = useCallback((newZoneId: string) => {
    const oldZoneId = selectedZoneId;
    setSelectedZoneId(newZoneId);

    if (newZoneId !== oldZoneId && audio.activeTracks.size > 0) {
      const newZone = ALL_ZONES.find(z => z.id === newZoneId);
      if (newZone?.ambiance) {
        const playingZones = new Set([...audio.activeTracks.values()].map(t => t.zoneId));
        if (!playingZones.has(newZoneId) || playingZones.size > 1) {
          const playingZoneNames = [...new Set([...audio.activeTracks.values()].map(t => t.zoneName))].join(', ');
          setZoneSwitchSuggestion({ fromZone: playingZoneNames, toZone: newZone });
        }
      }
    }
  }, [selectedZoneId, audio.activeTracks, ALL_ZONES]);

  const dismissSuggestion = useCallback(() => {
    setZoneSwitchSuggestion(null);
  }, []);

  const acceptSuggestion = useCallback(() => {
    audio.stopAll();
    setZoneSwitchSuggestion(null);
  }, [audio]);

  // Compute zones with active audio
  const zonesWithAudio = new Set(
    [...audio.activeTracks.values()].map(t => t.zoneId)
  );

  // Early returns — AFTER all hooks (React Rules of Hooks)
  if (!adventureData) {
    return <div className="flex items-center justify-center h-full text-muted">Loading adventure data...</div>;
  }

  if (ALL_ZONES.length === 0 || !selectedZone) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <p className="text-muted">No zones in this adventure yet.</p>
          <p className="text-xs text-muted/60">Use Claude Code to populate this adventure with zones, monsters, NPCs, and more.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-160px)]">
      {/* Zone sidebar */}
      <nav className="w-56 flex-shrink-0 overflow-y-auto bg-card border border-border rounded-lg">
        <div className="p-3 border-b border-border">
          <h2 className="text-xs uppercase tracking-wider text-accent font-semibold">Zones</h2>
        </div>
        <div className="p-1">
          {ALL_ZONES.map(zone => (
            <button
              key={zone.id}
              onClick={() => handleZoneSwitch(zone.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors cursor-pointer flex items-center gap-1
                ${selectedZoneId === zone.id
                  ? 'bg-accent/15 text-accent border-l-2 border-accent'
                  : 'text-muted hover:text-body hover:bg-card-alt'
                }`}
            >
              <span className="flex-1">{zone.name}</span>
              {zonesWithAudio.has(zone.id) && (
                <span className="w-2 h-2 rounded-full bg-success animate-pulse ml-auto flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Zone content */}
      <main className="flex-1 overflow-y-auto space-y-4">
        {/* Now Playing bar — visible when ANY tracks are playing */}
        {audio.activeTracks.size > 0 && (
          <NowPlayingBar audio={audio} />
        )}

        {/* Zone switch suggestion */}
        {zoneSwitchSuggestion && (
          <ZoneSwitchBanner
            fromZone={zoneSwitchSuggestion.fromZone}
            toZone={zoneSwitchSuggestion.toZone}
            onAccept={acceptSuggestion}
            onDismiss={dismissSuggestion}
          />
        )}

        <ZoneContent zone={selectedZone} readAloudStyle={readAloudStyle} sectionOrder={sectionOrder} sectionVisibility={sectionVisibility} onSpotlightNarrative={onSpotlightNarrative} onSpotlightImage={onSpotlightImage} onStartCombat={onStartCombat} onSwitchTab={onSwitchTab} audio={audio} monsters={monstersList} scenes={scenesList} npcs={npcsList} improvData={improvDataCtx} resolveImg={resolveImg} partyMembers={partyMembers} />
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════
// Now Playing Bar — persistent across zones
// ═══════════════════════════════════════════

function NowPlayingBar({ audio }: { audio: AudioStateReturn }) {
  return (
    <div className="bg-card border border-accent-secondary/30 rounded-lg p-3 shadow-[0_0_12px_rgba(255,170,50,0.08)]">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-accent-secondary animate-pulse" />
          <span className="text-xs uppercase tracking-wider font-semibold text-accent-secondary">Now Playing</span>
        </div>
        <div className="flex-1" />

        {/* Master volume (compact) */}
        <SoundIcon className="w-3 h-3 text-muted flex-shrink-0" />
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(audio.masterVolume * 100)}
          onChange={e => audio.handleMasterVolume(parseInt(e.target.value) / 100)}
          className="w-20 h-1 bg-border rounded-full appearance-none cursor-pointer accent-accent-secondary"
          title={`Master: ${Math.round(audio.masterVolume * 100)}%`}
        />
        <span className="text-[10px] text-muted w-7">{Math.round(audio.masterVolume * 100)}%</span>

        <button
          onClick={audio.stopAll}
          className="px-2 py-0.5 rounded text-[11px] font-medium text-danger/80 hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
          title="Stop all tracks"
        >
          Stop All
        </button>
      </div>

      {/* Track pills */}
      <div className="flex flex-wrap gap-1.5">
        {[...audio.activeTracks.entries()].map(([trackId, info]) => (
          <div
            key={trackId}
            className="flex items-center gap-1.5 bg-accent-secondary/10 border border-accent-secondary/25 rounded-full pl-2.5 pr-1 py-0.5 group"
          >
            <span className="text-[11px] text-accent-secondary font-medium whitespace-nowrap">{info.trackName}</span>
            <span className="text-[9px] text-muted/60 whitespace-nowrap">({info.zoneName})</span>

            {/* Mini volume slider — shown on hover */}
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round((audio.trackVolumes[trackId] ?? 0.5) * 100)}
              onChange={e => audio.handleTrackVolume(trackId, parseInt(e.target.value) / 100)}
              className="w-12 h-0.5 bg-border rounded-full appearance-none cursor-pointer accent-accent-secondary opacity-0 group-hover:opacity-100 transition-opacity"
              title={`Volume: ${Math.round((audio.trackVolumes[trackId] ?? 0.5) * 100)}%`}
            />

            {/* Stop button */}
            <button
              onClick={() => audio.stopTrack(trackId)}
              className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-muted hover:text-danger hover:bg-danger/15 transition-colors cursor-pointer flex-shrink-0"
              title="Stop track"
            >
              &#10005;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Zone Switch Banner
// ═══════════════════════════════════════════

function ZoneSwitchBanner({ fromZone, toZone, onAccept, onDismiss }: { fromZone: string; toZone: Zone; onAccept: () => void; onDismiss: () => void }) {
  return (
    <div className="bg-info/5 border border-info/20 rounded-lg px-4 py-2.5 flex items-center gap-3">
      <svg className="w-4 h-4 text-info flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
      </svg>
      <span className="text-xs text-info/90 flex-1">
        Playing tracks from <span className="font-semibold">{fromZone}</span>. Switch to <span className="font-semibold">{toZone.name}</span> ambiance?
      </span>
      <button
        onClick={onAccept}
        className="px-2.5 py-1 rounded text-[11px] font-medium bg-info/15 text-info hover:bg-info/25 transition-colors cursor-pointer"
      >
        Stop &amp; Switch
      </button>
      <button
        onClick={onDismiss}
        className="text-[11px] text-muted hover:text-body cursor-pointer"
      >
        Keep playing
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════
// AI Generate Button — small muted helper
// ═══════════════════════════════════════════

function GenerateButton({ slug, zoneId, label, promptText }: { slug: string; zoneId: string; label: string; promptText: string }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/adventures/${slug}/generate/zones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: zoneId, prompt: promptText }),
      });
      const context = await res.json();
      alert(`AI Context assembled for "${label}". Use Claude Code to generate content.\n\nContext preview:\n${JSON.stringify(context, null, 2).slice(0, 500)}...`);
    } catch (err) {
      alert(`Failed to build context: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-muted/60 hover:text-accent hover:bg-accent/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-wait flex-shrink-0"
      title="Use Claude Code to generate content"
    >
      {loading ? (
        <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="15" />
        </svg>
      ) : (
        <span>&#10024;</span>
      )}
      {label}
    </button>
  );
}

// ═══════════════════════════════════════════
// Zone Content — all sections
// ═══════════════════════════════════════════

function ZoneContent({ zone, readAloudStyle, sectionOrder, sectionVisibility, onSpotlightNarrative, onSpotlightImage, onStartCombat, onSwitchTab, audio, monsters, scenes, npcs, improvData, resolveImg, partyMembers = [] }: { zone: Zone; readAloudStyle: ReadAloudStyle; sectionOrder: GuideSectionId[]; sectionVisibility?: Record<string, boolean>; onSpotlightNarrative?: (title: string, text: string) => void; onSpotlightImage?: (title: string, imageUrl: string) => void; onStartCombat?: (monsterIds: string[]) => void; onSwitchTab?: (tab: string) => void; audio: AudioStateReturn; monsters: Monster[]; scenes: Scene[]; npcs: NPC[]; improvData: ImprovData | null; resolveImg: (path: string) => string; partyMembers?: PartyMember[] }) {
  const [modalNpc, setModalNpc] = useState<NPC | null>(null);
  const [zoneEditorOpen, setZoneEditorOpen] = useState(false);
  const { patchZone, slug } = useAdventureContext();

  const renderSection = (id: GuideSectionId) => {
    if (sectionVisibility && sectionVisibility[id] === false) return null;
    switch (id) {
      case 'readAloud':
        return (
          <CollapsibleSection key={id} title="Read-Aloud Text" defaultOpen accent="accent-secondary">
            <div className="flex items-start gap-3">
              <div className="flex-1 read-aloud">
                <EditableText
                  value={zone.readAloud[readAloudStyle]}
                  onSave={(text) => patchZone(zone.id, { readAloud: { ...zone.readAloud, [readAloudStyle]: text } })}
                  multiline
                  className="text-body/90 italic whitespace-pre-line"
                  placeholder="Add read-aloud text..."
                />
              </div>
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                {onSpotlightNarrative && (
                  <SpotlightButton size="md" onClick={() => onSpotlightNarrative(zone.name, zone.readAloud[readAloudStyle])} />
                )}
                {slug && <GenerateButton slug={slug} zoneId={zone.id} label="Generate" promptText="Generate read-aloud text" />}
              </div>
            </div>
          </CollapsibleSection>
        );
      case 'map':
        return (
          <CollapsibleSection key={id} title="Zone Map" defaultOpen>
            {zone.mapImageUrl ? (
              <div className="space-y-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveImg(zone.mapImageUrl)}
                  alt={`Map of ${zone.name}`}
                  className="w-full rounded-lg border border-border/50"
                />
                <div className="flex items-center justify-between">
                  <EditableText
                    value={zone.mapImageUrl}
                    onSave={(val) => patchZone(zone.id, { mapImageUrl: val })}
                    className="text-xs text-muted"
                    placeholder="Image path..."
                  />
                  {onSpotlightImage && (
                    <SpotlightButton size="md" label="Show Map to Players" onClick={() => onSpotlightImage(zone.name + ' Map', resolveImg(zone.mapImageUrl!))} />
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="border border-dashed border-border/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted mb-2">No map image set for this zone.</p>
                  <p className="text-xs text-muted/70">Place map images in <code className="text-accent/70">data/adventures/[slug]/images/</code> and set the path below.</p>
                </div>
                <EditableText
                  value={zone.mapImageUrl || ''}
                  onSave={(val) => patchZone(zone.id, { mapImageUrl: val })}
                  className="text-xs text-muted"
                  placeholder="Enter map image path (e.g. maps/zone-1.webp)"
                />
              </div>
            )}
          </CollapsibleSection>
        );
      case 'senses':
        return zone.senses ? <SensesPanel key={id} senses={zone.senses} /> : null;
      case 'ambiance':
        return zone.ambiance ? <AmbiancePanel key={id} ambiance={zone.ambiance} audio={audio} zoneId={zone.id} zoneName={zone.name} patchZone={patchZone} /> : null;
      case 'features':
        return zone.features?.length > 0 ? (
          <CollapsibleSection key={id} title="Features & Hazards" defaultOpen>
            <div className="space-y-3">{zone.features.map((feat, i) => <FeatureCard key={i} feature={feat} />)}</div>
          </CollapsibleSection>
        ) : null;
      case 'encounters':
        return zone.encounters?.length > 0 ? (
          <CollapsibleSection key={id} title="Encounters" accent="danger">
            <div className="space-y-3">
              {zone.encounters.map((enc, i) => <EncounterCard key={i} encounter={enc} onSpotlightNarrative={onSpotlightNarrative} onStartCombat={onStartCombat} monsters={monsters} improvData={improvData} partyMembers={partyMembers} />)}
              {slug && <GenerateButton slug={slug} zoneId={zone.id} label="Generate Encounter" promptText="Generate encounter for this zone" />}
            </div>
          </CollapsibleSection>
        ) : null;
      case 'challenges':
        return zone.linkedChallenges && zone.linkedChallenges.length > 0 ? (
          <LinkedChallengesPanel key={id} challengeIds={zone.linkedChallenges} onSwitchTab={onSwitchTab} scenes={scenes} />
        ) : null;
      case 'npcs':
        return zone.npcs?.length > 0 ? (
          <CollapsibleSection key={id} title="NPCs & Dialogue" accent="info">
            <div className="space-y-3">{zone.npcs.map((npc, i) => <NPCCard key={i} npc={npc} onSpotlightNarrative={onSpotlightNarrative} onClickNPC={setModalNpc} npcs={npcs} />)}</div>
          </CollapsibleSection>
        ) : null;
      case 'treasure':
        return zone.treasure?.length > 0 ? (
          <CollapsibleSection key={id} title="Treasure" accent="gold">
            <div className="space-y-2">{zone.treasure.map((item, i) => <TreasureCard key={i} treasure={item} />)}</div>
          </CollapsibleSection>
        ) : null;
      case 'dmNotes':
        return zone.dmNotes?.length > 0 ? (
          <CollapsibleSection key={id} title="DM Notes" accent="warning">
            <ul className="space-y-2">{zone.dmNotes.map((note, i) => (
              <li key={i} className="text-sm text-warning/90 flex gap-2"><span className="text-warning/50 select-none">&#9670;</span>{note}</li>
            ))}</ul>
          </CollapsibleSection>
        ) : null;
      case 'campaign':
        return zone.campaignNotes?.length > 0 ? (
          <CollapsibleSection key={id} title="Campaign Integration" accent="magic">
            <ul className="space-y-2">{zone.campaignNotes.map((note, i) => (
              <li key={i} className="text-sm text-magic/90 flex gap-2"><span className="text-magic/50 select-none">&#9670;</span>{note}</li>
            ))}</ul>
          </CollapsibleSection>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Zone header (always first) */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-1">
          <EditableText
            value={zone.name}
            onSave={(v) => patchZone(zone.id, { name: v })}
            className="text-xl font-bold text-accent tracking-wider"
          />
          <button
            onClick={() => setZoneEditorOpen(true)}
            className="w-6 h-6 rounded flex items-center justify-center text-muted/50 hover:text-accent hover:bg-accent/10 transition-colors cursor-pointer flex-shrink-0"
            title="Edit Zone"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" />
            </svg>
          </button>
        </div>
        <div className="flex items-start gap-2">
          <p className="text-sm text-muted flex-1">{zone.description}</p>
          {slug && <GenerateButton slug={slug} zoneId={zone.id} label="Generate Description" promptText="Generate zone description" />}
        </div>
      </div>

      {/* Ordered sections */}
      {sectionOrder.filter(id => sectionVisibility?.[id] !== false).map(id => renderSection(id))}

      {/* NPC Detail Modal */}
      {modalNpc && (
        <NPCModal
          npc={modalNpc}
          onClose={() => setModalNpc(null)}
          onSpotlightNarrative={onSpotlightNarrative}
        />
      )}

      {/* Zone Editor Modal */}
      {zoneEditorOpen && (
        <ZoneEditorModal
          zone={zone}
          onSave={(updates) => { patchZone(zone.id, updates); setZoneEditorOpen(false); }}
          onClose={() => setZoneEditorOpen(false)}
        />
      )}
    </>
  );
}


// ═══════════════════════════════════════════
// Zone Editor Modal
// ═══════════════════════════════════════════

interface ZoneEditorDraft {
  name: string;
  description: string;
  mapImageUrl: string;
  features: ZoneFeature[];
  encounters: ZoneEncounter[];
  npcs: ZoneNPC[];
  treasure: ZoneTreasure[];
  dmNotes: string[];
  campaignNotes: string[];
}

function ZoneEditorModal({ zone, onSave, onClose }: { zone: Zone; onSave: (updates: Partial<Zone>) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<ZoneEditorDraft>({
    name: zone.name,
    description: zone.description,
    mapImageUrl: zone.mapImageUrl || '',
    features: zone.features.map(f => ({ ...f })),
    encounters: zone.encounters.map(e => ({ ...e, monsters: [...e.monsters], dialogue: e.dialogue ? [...e.dialogue] : [] })),
    npcs: zone.npcs.map(n => ({ ...n, dialogue: [...n.dialogue] })),
    treasure: zone.treasure.map(t => ({ ...t })),
    dmNotes: [...zone.dmNotes],
    campaignNotes: [...zone.campaignNotes],
  });

  const handleSave = () => {
    const updates: Partial<Zone> = {
      name: draft.name,
      description: draft.description,
      mapImageUrl: draft.mapImageUrl || undefined,
      features: draft.features.filter(f => f.name.trim()),
      encounters: draft.encounters.filter(e => e.name.trim()),
      npcs: draft.npcs.filter(n => n.name.trim()),
      treasure: draft.treasure.filter(t => t.name.trim()),
      dmNotes: draft.dmNotes.filter(n => n.trim()),
      campaignNotes: draft.campaignNotes.filter(n => n.trim()),
    };
    onSave(updates);
  };

  const inputCls = 'w-full bg-card border border-border rounded px-2 py-1.5 text-sm text-body placeholder:text-muted/50 focus:outline-none focus:border-accent/50';
  const smallInputCls = 'w-full bg-card border border-border rounded px-2 py-1 text-xs text-body placeholder:text-muted/50 focus:outline-none focus:border-accent/50';
  const sectionHeaderCls = 'text-xs uppercase tracking-wider font-semibold text-accent mb-2 mt-4 first:mt-0';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[calc(100vh-4rem)] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-accent tracking-wider">Edit Zone</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-md text-sm font-medium bg-accent/20 text-accent hover:bg-accent/30 transition-colors cursor-pointer"
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-md text-sm font-medium text-muted hover:text-body hover:bg-card-alt transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-1">
          {/* Name & Description */}
          <h3 className={sectionHeaderCls}>Basic Info</h3>
          <input
            type="text"
            value={draft.name}
            onChange={e => setDraft(prev => ({ ...prev, name: e.target.value }))}
            className={inputCls}
            placeholder="Zone name"
          />
          <textarea
            value={draft.description}
            onChange={e => setDraft(prev => ({ ...prev, description: e.target.value }))}
            className={`${inputCls} min-h-[4rem] resize-y mt-2`}
            placeholder="Zone description"
          />
          <input
            type="text"
            value={draft.mapImageUrl}
            onChange={e => setDraft(prev => ({ ...prev, mapImageUrl: e.target.value }))}
            className={`${smallInputCls} mt-2`}
            placeholder="Map image URL (e.g. maps/zone-1.webp)"
          />

          {/* Features */}
          <h3 className={sectionHeaderCls}>Features &amp; Hazards</h3>
          {draft.features.map((feat, i) => (
            <div key={i} className="grid grid-cols-[1fr_1.5fr_auto_1fr_auto] gap-2 items-center mb-1.5">
              <input value={feat.name} onChange={e => { const f = [...draft.features]; f[i] = { ...f[i], name: e.target.value }; setDraft(prev => ({ ...prev, features: f })); }} className={smallInputCls} placeholder="Name" />
              <input value={feat.description} onChange={e => { const f = [...draft.features]; f[i] = { ...f[i], description: e.target.value }; setDraft(prev => ({ ...prev, features: f })); }} className={smallInputCls} placeholder="Description" />
              <input type="number" value={feat.dc ?? ''} onChange={e => { const f = [...draft.features]; f[i] = { ...f[i], dc: e.target.value ? parseInt(e.target.value) : undefined }; setDraft(prev => ({ ...prev, features: f })); }} className={`${smallInputCls} w-16`} placeholder="DC" />
              <input value={feat.mechanical || ''} onChange={e => { const f = [...draft.features]; f[i] = { ...f[i], mechanical: e.target.value }; setDraft(prev => ({ ...prev, features: f })); }} className={smallInputCls} placeholder="Mechanical effect" />
              <button onClick={() => setDraft(prev => ({ ...prev, features: prev.features.filter((_, j) => j !== i) }))} className="w-5 h-5 rounded flex items-center justify-center text-muted hover:text-danger cursor-pointer flex-shrink-0"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
          ))}
          <button onClick={() => setDraft(prev => ({ ...prev, features: [...prev.features, { name: '', description: '' }] }))} className="text-xs text-accent/70 hover:text-accent cursor-pointer">+ Add Feature</button>

          {/* Encounters */}
          <h3 className={sectionHeaderCls}>Encounters</h3>
          {draft.encounters.map((enc, i) => (
            <div key={i} className="bg-card-alt rounded-md p-3 border border-border/50 mb-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <input value={enc.name} onChange={e => { const ee = [...draft.encounters]; ee[i] = { ...ee[i], name: e.target.value }; setDraft(prev => ({ ...prev, encounters: ee })); }} className={`${smallInputCls} flex-1`} placeholder="Encounter name" />
                <button onClick={() => setDraft(prev => ({ ...prev, encounters: prev.encounters.filter((_, j) => j !== i) }))} className="w-5 h-5 rounded flex items-center justify-center text-muted hover:text-danger cursor-pointer flex-shrink-0"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
              </div>
              <input value={enc.monsters.join(', ')} onChange={e => { const ee = [...draft.encounters]; ee[i] = { ...ee[i], monsters: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }; setDraft(prev => ({ ...prev, encounters: ee })); }} className={smallInputCls} placeholder="Monsters (comma-separated)" />
              <input value={enc.notes || ''} onChange={e => { const ee = [...draft.encounters]; ee[i] = { ...ee[i], notes: e.target.value }; setDraft(prev => ({ ...prev, encounters: ee })); }} className={smallInputCls} placeholder="Notes" />
              <div className="space-y-1">
                <span className="text-[10px] text-muted uppercase tracking-wider">Dialogue Lines</span>
                {(enc.dialogue || []).map((line, li) => (
                  <div key={li} className="flex items-center gap-1">
                    <input value={line} onChange={e => { const ee = [...draft.encounters]; const d = [...(ee[i].dialogue || [])]; d[li] = e.target.value; ee[i] = { ...ee[i], dialogue: d }; setDraft(prev => ({ ...prev, encounters: ee })); }} className={`${smallInputCls} flex-1`} placeholder="Dialogue line" />
                    <button onClick={() => { const ee = [...draft.encounters]; ee[i] = { ...ee[i], dialogue: (ee[i].dialogue || []).filter((_, j) => j !== li) }; setDraft(prev => ({ ...prev, encounters: ee })); }} className="w-4 h-4 text-muted hover:text-danger cursor-pointer flex-shrink-0"><svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                  </div>
                ))}
                <button onClick={() => { const ee = [...draft.encounters]; ee[i] = { ...ee[i], dialogue: [...(ee[i].dialogue || []), ''] }; setDraft(prev => ({ ...prev, encounters: ee })); }} className="text-[10px] text-accent/60 hover:text-accent cursor-pointer">+ Add Dialogue</button>
              </div>
            </div>
          ))}
          <button onClick={() => setDraft(prev => ({ ...prev, encounters: [...prev.encounters, { name: '', monsters: [], dialogue: [] }] }))} className="text-xs text-accent/70 hover:text-accent cursor-pointer">+ Add Encounter</button>

          {/* NPCs */}
          <h3 className={sectionHeaderCls}>NPCs</h3>
          {draft.npcs.map((npc, i) => (
            <div key={i} className="bg-card-alt rounded-md p-3 border border-border/50 mb-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <input value={npc.name} onChange={e => { const nn = [...draft.npcs]; nn[i] = { ...nn[i], name: e.target.value }; setDraft(prev => ({ ...prev, npcs: nn })); }} className={`${smallInputCls} flex-1`} placeholder="NPC name" />
                <button onClick={() => setDraft(prev => ({ ...prev, npcs: prev.npcs.filter((_, j) => j !== i) }))} className="w-5 h-5 rounded flex items-center justify-center text-muted hover:text-danger cursor-pointer flex-shrink-0"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted uppercase tracking-wider">Dialogue Lines</span>
                {npc.dialogue.map((line, li) => (
                  <div key={li} className="flex items-center gap-1">
                    <input value={line} onChange={e => { const nn = [...draft.npcs]; const d = [...nn[i].dialogue]; d[li] = e.target.value; nn[i] = { ...nn[i], dialogue: d }; setDraft(prev => ({ ...prev, npcs: nn })); }} className={`${smallInputCls} flex-1`} placeholder="Dialogue line" />
                    <button onClick={() => { const nn = [...draft.npcs]; nn[i] = { ...nn[i], dialogue: nn[i].dialogue.filter((_, j) => j !== li) }; setDraft(prev => ({ ...prev, npcs: nn })); }} className="w-4 h-4 text-muted hover:text-danger cursor-pointer flex-shrink-0"><svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                  </div>
                ))}
                <button onClick={() => { const nn = [...draft.npcs]; nn[i] = { ...nn[i], dialogue: [...nn[i].dialogue, ''] }; setDraft(prev => ({ ...prev, npcs: nn })); }} className="text-[10px] text-accent/60 hover:text-accent cursor-pointer">+ Add Dialogue</button>
              </div>
            </div>
          ))}
          <button onClick={() => setDraft(prev => ({ ...prev, npcs: [...prev.npcs, { name: '', dialogue: [] }] }))} className="text-xs text-accent/70 hover:text-accent cursor-pointer">+ Add NPC</button>

          {/* Treasure */}
          <h3 className={sectionHeaderCls}>Treasure</h3>
          {draft.treasure.map((item, i) => (
            <div key={i} className="grid grid-cols-[1fr_1.5fr_auto_auto] gap-2 items-center mb-1.5">
              <input value={item.name} onChange={e => { const t = [...draft.treasure]; t[i] = { ...t[i], name: e.target.value }; setDraft(prev => ({ ...prev, treasure: t })); }} className={smallInputCls} placeholder="Name" />
              <input value={item.description} onChange={e => { const t = [...draft.treasure]; t[i] = { ...t[i], description: e.target.value }; setDraft(prev => ({ ...prev, treasure: t })); }} className={smallInputCls} placeholder="Description" />
              <input value={item.value || ''} onChange={e => { const t = [...draft.treasure]; t[i] = { ...t[i], value: e.target.value }; setDraft(prev => ({ ...prev, treasure: t })); }} className={`${smallInputCls} w-24`} placeholder="Value" />
              <button onClick={() => setDraft(prev => ({ ...prev, treasure: prev.treasure.filter((_, j) => j !== i) }))} className="w-5 h-5 rounded flex items-center justify-center text-muted hover:text-danger cursor-pointer flex-shrink-0"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
          ))}
          <button onClick={() => setDraft(prev => ({ ...prev, treasure: [...prev.treasure, { name: '', description: '' }] }))} className="text-xs text-accent/70 hover:text-accent cursor-pointer">+ Add Treasure</button>

          {/* DM Notes */}
          <h3 className={sectionHeaderCls}>DM Notes</h3>
          {draft.dmNotes.map((note, i) => (
            <div key={i} className="flex items-center gap-2 mb-1.5">
              <input value={note} onChange={e => { const n = [...draft.dmNotes]; n[i] = e.target.value; setDraft(prev => ({ ...prev, dmNotes: n })); }} className={`${smallInputCls} flex-1`} placeholder="DM note" />
              <button onClick={() => setDraft(prev => ({ ...prev, dmNotes: prev.dmNotes.filter((_, j) => j !== i) }))} className="w-5 h-5 rounded flex items-center justify-center text-muted hover:text-danger cursor-pointer flex-shrink-0"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
          ))}
          <button onClick={() => setDraft(prev => ({ ...prev, dmNotes: [...prev.dmNotes, ''] }))} className="text-xs text-accent/70 hover:text-accent cursor-pointer">+ Add DM Note</button>

          {/* Campaign Notes */}
          <h3 className={sectionHeaderCls}>Campaign Notes</h3>
          {draft.campaignNotes.map((note, i) => (
            <div key={i} className="flex items-center gap-2 mb-1.5">
              <input value={note} onChange={e => { const n = [...draft.campaignNotes]; n[i] = e.target.value; setDraft(prev => ({ ...prev, campaignNotes: n })); }} className={`${smallInputCls} flex-1`} placeholder="Campaign note" />
              <button onClick={() => setDraft(prev => ({ ...prev, campaignNotes: prev.campaignNotes.filter((_, j) => j !== i) }))} className="w-5 h-5 rounded flex items-center justify-center text-muted hover:text-danger cursor-pointer flex-shrink-0"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
          ))}
          <button onClick={() => setDraft(prev => ({ ...prev, campaignNotes: [...prev.campaignNotes, ''] }))} className="text-xs text-accent/70 hover:text-accent cursor-pointer">+ Add Campaign Note</button>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 bg-card border-t border-border px-6 py-3 flex items-center justify-end gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-md text-sm font-medium bg-accent/20 text-accent hover:bg-accent/30 transition-colors cursor-pointer"
          >
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md text-sm font-medium text-muted hover:text-body hover:bg-card-alt transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Collapsible Section wrapper
// ═══════════════════════════════════════════

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  accent = 'accent',
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  accent?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const colorMap: Record<string, string> = {
    'accent': 'text-accent',
    'accent-secondary': 'text-accent-secondary',
    'danger': 'text-danger',
    'info': 'text-info',
    'gold': 'text-gold',
    'warning': 'text-warning',
    'magic': 'text-magic',
    'success': 'text-success',
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-card-alt transition-colors cursor-pointer"
      >
        <h3 className={`text-xs uppercase tracking-wider font-semibold ${colorMap[accent] || 'text-accent'}`}>
          {title}
        </h3>
        <span className="text-muted text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════
// Sub-cards for Features, Encounters, NPCs, Treasure
// ═══════════════════════════════════════════

function FeatureCard({ feature }: { feature: ZoneFeature }) {
  return (
    <div className="bg-card-alt rounded-md p-3 border border-border/50">
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="text-sm font-semibold text-body">{feature.name}</h4>
        {feature.dc && <Badge color="danger">DC {feature.dc}</Badge>}
      </div>
      <p className="text-xs text-muted mb-1">{feature.description}</p>
      {feature.mechanical && (
        <p className="text-xs text-accent-secondary italic">{feature.mechanical}</p>
      )}
    </div>
  );
}

function parseEncounterMonsters(monsterStrings: string[], monsterList: Monster[]): string[] {
  const ids: string[] = [];
  for (const entry of monsterStrings) {
    // Match patterns like "Fire Giant Trooper x2" or "Fire Giant Red Fist"
    const match = entry.match(/^(.+?)\s*x(\d+)$/i);
    const name = match ? match[1].trim() : entry.trim();
    const count = match ? parseInt(match[2]) : 1;
    const monster = monsterList.find(m => m.name.toLowerCase() === name.toLowerCase());
    if (monster) {
      for (let i = 0; i < count; i++) {
        ids.push(monster.id);
      }
    }
  }
  return ids;
}

function EncounterCard({ encounter, onSpotlightNarrative, onStartCombat, monsters, improvData, partyMembers = [] }: { encounter: ZoneEncounter; onSpotlightNarrative?: (title: string, text: string) => void; onStartCombat?: (monsterIds: string[]) => void; monsters: Monster[]; improvData: ImprovData | null; partyMembers?: PartyMember[] }) {
  const [rolledName, setRolledName] = useState<string | null>(null);
  const [rolledQuirk, setRolledQuirk] = useState<string | null>(null);

  const handleStartCombat = () => {
    if (!onStartCombat) return;
    const monsterIds = parseEncounterMonsters(encounter.monsters, monsters);
    if (monsterIds.length > 0) {
      onStartCombat(monsterIds);
    }
  };

  const rollNameAndQuirk = () => {
    if (!improvData) return;
    const namesList = improvData.names ?? improvData.giantNames ?? [];
    const name = namesList[Math.floor(Math.random() * namesList.length)];
    const quirk = improvData.personalityQuirks[Math.floor(Math.random() * improvData.personalityQuirks.length)];
    setRolledName(name);
    setRolledQuirk(quirk);
  };

  // Calculate encounter difficulty
  const difficultyResult = (() => {
    if (partyMembers.length === 0) return null;
    const monsterCRs: string[] = [];
    for (const entry of encounter.monsters) {
      const match = entry.match(/^(.+?)\s*x(\d+)$/i);
      const name = match ? match[1].trim() : entry.trim();
      const count = match ? parseInt(match[2]) : 1;
      const monster = monsters.find(m => m.name.toLowerCase() === name.toLowerCase());
      if (monster) {
        for (let i = 0; i < count; i++) {
          monsterCRs.push(monster.cr);
        }
      }
    }
    if (monsterCRs.length === 0) return null;
    const partyLevels = partyMembers.map(m => m.level ?? 1);
    return calculateEncounterDifficulty(monsterCRs, partyLevels);
  })();

  const difficultyColors: Record<string, string> = {
    trivial: 'bg-muted/20 text-muted',
    easy: 'bg-success/20 text-success',
    medium: 'bg-warning/20 text-warning',
    hard: 'bg-accent-secondary/20 text-accent-secondary',
    deadly: 'bg-danger/20 text-danger',
  };

  return (
    <div className="bg-card-alt rounded-md p-3 border border-danger/20">
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-danger">{encounter.name}</h4>
          {difficultyResult && (
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${difficultyColors[difficultyResult.difficulty]}`}
              title={`Adjusted XP: ${difficultyResult.adjustedXP.toLocaleString()} | Thresholds: Easy ${difficultyResult.thresholds.easy.toLocaleString()} / Medium ${difficultyResult.thresholds.medium.toLocaleString()} / Hard ${difficultyResult.thresholds.hard.toLocaleString()} / Deadly ${difficultyResult.thresholds.deadly.toLocaleString()}`}
            >
              {difficultyResult.difficulty}
            </span>
          )}
        </div>
        {onStartCombat && (
          <button
            onClick={handleStartCombat}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-accent/15 text-accent hover:bg-accent/25 transition-colors cursor-pointer flex-shrink-0"
            title="Add monsters to combat tracker"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
              <path d="M13 19l6-6" />
              <path d="M16 16l4 4" />
              <path d="M19 21l2-2" />
            </svg>
            Start Combat
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1 mb-1">
        {encounter.monsters.map((m, i) => (
          <Badge key={i} color="danger">{m}</Badge>
        ))}
      </div>
      {/* Roll Name & Quirk */}
      <div className="flex items-center gap-2 mb-1">
        <button
          onClick={rollNameAndQuirk}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-warning/15 text-warning hover:bg-warning/25 transition-colors cursor-pointer"
          title="Roll a random name and personality quirk for an unnamed giant"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="16" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="16" r="1.5" fill="currentColor"/><circle cx="16" cy="16" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>
          </svg>
          Roll Name &amp; Quirk
        </button>
        {rolledName && (
          <span className="text-xs">
            <span className="text-warning font-semibold">{rolledName}</span>
            {rolledQuirk && <span className="text-muted"> — {rolledQuirk}</span>}
          </span>
        )}
      </div>
      {encounter.notes && <p className="text-xs text-muted">{encounter.notes}</p>}
      {encounter.dialogue && encounter.dialogue.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {encounter.dialogue.map((line, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1 border-l-2 border-danger/30 pl-2.5 py-0.5">
                <p className="text-sm text-muted italic">{line}</p>
              </div>
              {onSpotlightNarrative && (
                <SpotlightButton
                  onClick={() => onSpotlightNarrative(encounter.name, line)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NPCCard({ npc, onSpotlightNarrative, onClickNPC, npcs }: { npc: ZoneNPC; onSpotlightNarrative?: (title: string, text: string) => void; onClickNPC?: (npc: NPC) => void; npcs: NPC[] }) {
  const matchedNpc = npcs.find(n => n.name.toLowerCase() === npc.name.toLowerCase());

  return (
    <div className="bg-card-alt rounded-md p-3 border border-info/20">
      {matchedNpc ? (
        <button
          onClick={() => onClickNPC?.(matchedNpc)}
          className="text-sm font-semibold text-info mb-2 hover:text-info/80 underline decoration-info/30 hover:decoration-info/60 transition-colors cursor-pointer text-left"
        >
          {npc.name}
        </button>
      ) : (
        <h4 className="text-sm font-semibold text-info mb-2">{npc.name}</h4>
      )}
      <div className="space-y-1.5">
        {npc.dialogue.map((line, i) => (
          <div key={i} className="flex items-start gap-2">
            <p className="flex-1 dialogue text-sm">{line}</p>
            {onSpotlightNarrative && (
              <SpotlightButton
                onClick={() => onSpotlightNarrative(npc.name, line)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TreasureCard({ treasure }: { treasure: ZoneTreasure }) {
  return (
    <div className="bg-card-alt rounded-md p-3 border border-gold/20 flex items-start justify-between">
      <div>
        <h4 className="text-sm font-semibold text-gold">{treasure.name}</h4>
        <p className="text-xs text-muted">{treasure.description}</p>
      </div>
      {treasure.value && <Badge color="gold">{treasure.value}</Badge>}
    </div>
  );
}

// ═══════════════════════════════════════════
// Linked Challenges Panel
// ═══════════════════════════════════════════

function LinkedChallengesPanel({ challengeIds, onSwitchTab, scenes }: { challengeIds: string[]; onSwitchTab?: (tab: string) => void; scenes: Scene[] }) {
  const linkedScenes = challengeIds
    .map(id => scenes.find(s => s.id === id))
    .filter((s): s is NonNullable<typeof s> => s != null);

  if (linkedScenes.length === 0) return null;

  return (
    <CollapsibleSection title="Linked Challenges" accent="magic">
      <div className="space-y-3">
        {linkedScenes.map(scene => (
          <div key={scene.id} className="bg-card-alt rounded-md p-3 border border-magic/20">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="text-sm font-semibold text-magic">{scene.name}</h4>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge color="success">{scene.successThreshold} to pass</Badge>
                <Badge color="danger">{scene.failureThreshold} to fail</Badge>
              </div>
            </div>
            <p className="text-xs text-muted mb-2">
              {scene.description.length > 150 ? scene.description.slice(0, 150) + '...' : scene.description}
            </p>
            {onSwitchTab && (
              <button
                onClick={() => onSwitchTab('challenges')}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-magic/15 text-magic hover:bg-magic/25 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M9 5l7 7-7 7" />
                </svg>
                Go to Challenges
              </button>
            )}
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
}

// ═══════════════════════════════════════════
// Senses Panel — DM quick-reference
// ═══════════════════════════════════════════

const SENSE_ENTRIES: { key: keyof ZoneSenses; label: string; icon: React.ReactNode }[] = [
  {
    key: 'sight',
    label: 'Sight',
    icon: (
      <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    key: 'sound',
    label: 'Sound',
    icon: (
      <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>
    ),
  },
  {
    key: 'smell',
    label: 'Smell',
    icon: (
      <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M8 16c0 2.2 1.8 4 4 4s4-1.8 4-4" /><path d="M12 16V8" /><path d="M8 8c0-1.5.5-3 2-4" /><path d="M16 8c0-1.5-.5-3-2-4" /><path d="M6 12c-1 0-2-.5-2-2" /><path d="M18 12c1 0 2-.5 2-2" />
      </svg>
    ),
  },
  {
    key: 'touch',
    label: 'Touch',
    icon: (
      <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M18 11V6a2 2 0 0 0-4 0v5" /><path d="M14 10V4a2 2 0 0 0-4 0v6" /><path d="M10 10.5V6a2 2 0 0 0-4 0v8" /><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-5.7-2.4L3.3 16a2 2 0 1 1 3.4-2L8 16" />
      </svg>
    ),
  },
  {
    key: 'instinct',
    label: 'Instinct',
    icon: (
      <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M12 2a8 8 0 0 0-8 8c0 3 1.5 5.5 4 7v3h8v-3c2.5-1.5 4-4 4-7a8 8 0 0 0-8-8z" /><path d="M10 22h4" />
      </svg>
    ),
  },
];

function SensesPanel({ senses }: { senses: ZoneSenses }) {
  return (
    <CollapsibleSection title="Senses (DM Reference)" accent="accent">
      <div className="space-y-1.5">
        {SENSE_ENTRIES.map(({ key, label, icon }) => (
          <div key={key} className="flex items-start gap-2 text-xs">
            <span className="text-muted/60 mt-0.5">{icon}</span>
            <span className="text-muted font-medium w-14 flex-shrink-0">{label}</span>
            <span className="text-body/80">{senses[key]}</span>
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
}

// ═══════════════════════════════════════════
// Ambiance Panel — Music & Sound toggles
// ═══════════════════════════════════════════

const ALL_AMBIANCE_TAGS: AmbianceTrack['tags'][number][] = ['exploration', 'combat', 'tension', 'stealth', 'spiritual', 'rest', 'boss'];

function AmbiancePanel({ ambiance, audio, zoneId, zoneName, patchZone }: { ambiance: { music: AmbianceTrack[]; sounds: AmbianceTrack[] }; audio: AudioStateReturn; zoneId: string; zoneName: string; patchZone: (zoneId: string, updates: Partial<Zone>) => Promise<void> }) {
  const [filter, setFilter] = useState<string | null>(null);
  const [meterLevels, setMeterLevels] = useState<number[]>([]);
  const animRef = useRef<number>(0);
  const [addingTo, setAddingTo] = useState<'music' | 'sounds' | null>(null);
  const [newTrack, setNewTrack] = useState({ name: '', description: '', searchTerm: '', youtubeUrl: '', tags: [] as AmbianceTrack['tags'] });
  const [tableEditMode, setTableEditMode] = useState<'music' | 'sounds' | null>(null);
  const [tableEditDraft, setTableEditDraft] = useState<AmbianceTrack[]>([]);
  const [tableNewRow, setTableNewRow] = useState({ name: '', description: '', searchTerm: '', youtubeUrl: '' });

  const enterTableEdit = (section: 'music' | 'sounds') => {
    setTableEditMode(section);
    setTableEditDraft(ambiance[section].map(t => ({ ...t })));
    setTableNewRow({ name: '', description: '', searchTerm: '', youtubeUrl: '' });
  };

  const handleTableSave = () => {
    if (!tableEditMode) return;
    let tracks = [...tableEditDraft];
    // Add new row if it has a name
    if (tableNewRow.name.trim()) {
      tracks.push({
        name: tableNewRow.name.trim(),
        description: tableNewRow.description.trim(),
        searchTerm: tableNewRow.searchTerm.trim() || tableNewRow.name.trim(),
        youtubeUrl: tableNewRow.youtubeUrl.trim() || undefined,
        tags: ['exploration'],
      });
    }
    const updated = { ...ambiance, [tableEditMode]: tracks };
    patchZone(zoneId, { ambiance: updated });
    setTableEditMode(null);
  };

  const updateTableRow = (index: number, field: keyof AmbianceTrack, value: string) => {
    setTableEditDraft(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
  };

  const deleteTableRow = (index: number) => {
    setTableEditDraft(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddTrack = (section: 'music' | 'sounds') => {
    if (!newTrack.name.trim()) return;
    const track: AmbianceTrack = {
      name: newTrack.name.trim(),
      description: newTrack.description.trim(),
      searchTerm: newTrack.searchTerm.trim() || newTrack.name.trim(),
      ...(newTrack.youtubeUrl.trim() ? { youtubeUrl: newTrack.youtubeUrl.trim() } : {}),
      tags: newTrack.tags.length > 0 ? newTrack.tags : ['exploration'],
    };
    const updated = {
      ...ambiance,
      [section]: [...ambiance[section], track],
    };
    patchZone(zoneId, { ambiance: updated });
    setNewTrack({ name: '', description: '', searchTerm: '', youtubeUrl: '', tags: [] });
    setAddingTo(null);
  };

  const handleDeleteTrack = (section: 'music' | 'sounds', trackName: string) => {
    const updated = {
      ...ambiance,
      [section]: ambiance[section].filter(t => t.name !== trackName),
    };
    patchZone(zoneId, { ambiance: updated });
  };

  const handleEditTrack = (section: 'music' | 'sounds', trackName: string, updates: Partial<AmbianceTrack>) => {
    const updated = {
      ...ambiance,
      [section]: ambiance[section].map(t => t.name === trackName ? { ...t, ...updates } : t),
    };
    patchZone(zoneId, { ambiance: updated });
  };

  const toggleNewTag = (tag: AmbianceTrack['tags'][number]) => {
    setNewTrack(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }));
  };

  // Audio level meter animation loop
  useEffect(() => {
    const updateMeter = () => {
      const analyser = audio.engine.getAnalyser();
      if (analyser && audio.activeTracks.size > 0) {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const bands = 8;
        const step = Math.floor(data.length / bands);
        const levels: number[] = [];
        for (let i = 0; i < bands; i++) {
          let sum = 0;
          for (let j = 0; j < step; j++) {
            sum += data[i * step + j];
          }
          levels.push(sum / step / 255);
        }
        setMeterLevels(levels);
      } else {
        setMeterLevels([]);
      }
      animRef.current = requestAnimationFrame(updateMeter);
    };
    animRef.current = requestAnimationFrame(updateMeter);
    return () => cancelAnimationFrame(animRef.current);
  }, [audio.activeTracks.size, audio.engine]);

  // Cleanup on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const tagColors: Record<string, string> = {
    exploration: 'bg-success/20 text-success',
    combat: 'bg-danger/20 text-danger',
    tension: 'bg-warning/20 text-warning',
    stealth: 'bg-magic/20 text-magic',
    spiritual: 'bg-info/20 text-info',
    rest: 'bg-accent-secondary/20 text-accent-secondary',
    boss: 'bg-danger/30 text-danger',
  };

  const allTags = Array.from(
    new Set([...ambiance.music, ...ambiance.sounds].flatMap(t => t.tags))
  );

  const filterTracks = (tracks: AmbianceTrack[]) =>
    filter ? tracks.filter(t => t.tags.includes(filter as AmbianceTrack['tags'][number])) : tracks;

  const activeCount = audio.activeTracks.size;

  return (
    <CollapsibleSection title={`Ambiance${activeCount > 0 ? ` (${activeCount} playing)` : ''}`} accent="accent-secondary">
      {/* Master volume + level meter */}
      <div className="flex items-center gap-3 mb-4 bg-card-alt rounded-lg p-3 border border-border/50">
        <SoundIcon className="w-4 h-4 text-accent-secondary flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-accent-secondary font-semibold uppercase tracking-wider">Master Volume</span>
            <span className="text-xs text-muted">{Math.round(audio.masterVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(audio.masterVolume * 100)}
            onChange={e => audio.handleMasterVolume(parseInt(e.target.value) / 100)}
            className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-accent-secondary"
          />
        </div>

        {/* Level meter bars */}
        <div className="flex items-end gap-0.5 h-6 flex-shrink-0" title="Audio Level">
          {(meterLevels.length > 0 ? meterLevels : [0, 0, 0, 0, 0, 0, 0, 0]).map((level, i) => (
            <div
              key={i}
              className="w-1 rounded-t-sm transition-all duration-75"
              style={{
                height: `${Math.max(2, level * 24)}px`,
                backgroundColor: level > 0.6 ? 'var(--color-danger)' : level > 0.3 ? 'var(--color-accent-secondary)' : 'var(--color-success)',
                opacity: level > 0 ? 0.8 : 0.2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Tag filter bar */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => setFilter(null)}
          className={`px-2 py-0.5 rounded text-xs cursor-pointer transition-colors ${
            filter === null ? 'bg-accent/20 text-accent ring-1 ring-accent/40' : 'bg-card-alt text-muted hover:text-body'
          }`}
        >
          All
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setFilter(filter === tag ? null : tag)}
            className={`px-2 py-0.5 rounded text-xs cursor-pointer transition-colors ${
              filter === tag ? 'ring-1 ring-accent/40 ' + (tagColors[tag] || '') : 'bg-card-alt text-muted hover:text-body'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Music section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs uppercase tracking-wider text-accent-secondary/70 font-semibold flex items-center gap-1.5">
            <MusicIcon className="w-3 h-3" /> Music
          </h4>
          <button
            onClick={() => tableEditMode === 'music' ? setTableEditMode(null) : enterTableEdit('music')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${tableEditMode === 'music' ? 'bg-accent-secondary/20 text-accent-secondary' : 'text-muted/60 hover:text-accent-secondary hover:bg-accent-secondary/10'}`}
          >
            {tableEditMode === 'music' ? 'Card View' : 'Edit All'}
          </button>
        </div>
        {tableEditMode === 'music' ? (
          <AmbianceTableEdit
            tracks={tableEditDraft}
            newRow={tableNewRow}
            onUpdateRow={updateTableRow}
            onDeleteRow={deleteTableRow}
            onUpdateNewRow={setTableNewRow}
            onSave={handleTableSave}
            onCancel={() => setTableEditMode(null)}
          />
        ) : (
          <>
            <div className="space-y-2">
              {filterTracks(ambiance.music).map(track => (
                <AmbianceTrackCard
                  key={track.name}
                  track={track}
                  active={audio.isTrackActive(track.name)}
                  volume={audio.trackVolumes[track.name] ?? 0.5}
                  onToggle={() => audio.toggleTrack(track, zoneId, zoneName)}
                  onVolumeChange={(vol) => audio.handleTrackVolume(track.name, vol)}
                  tagColors={tagColors}
                  onEdit={(updates) => handleEditTrack('music', track.name, updates)}
                  onDelete={() => handleDeleteTrack('music', track.name)}
                />
              ))}
            </div>
            {addingTo === 'music' ? (
              <AddTrackForm
                newTrack={newTrack}
                setNewTrack={setNewTrack}
                onSave={() => handleAddTrack('music')}
                onCancel={() => { setAddingTo(null); setNewTrack({ name: '', description: '', searchTerm: '', youtubeUrl: '', tags: [] }); }}
                toggleTag={toggleNewTag}
                tagColors={tagColors}
              />
            ) : (
              <button
                onClick={() => setAddingTo('music')}
                className="mt-2 flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-accent-secondary/70 hover:text-accent-secondary hover:bg-accent-secondary/10 transition-colors cursor-pointer"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Add Music Track
              </button>
            )}
          </>
        )}
      </div>

      {/* Sounds section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs uppercase tracking-wider text-accent-secondary/70 font-semibold flex items-center gap-1.5">
            <SoundIcon className="w-3 h-3" /> Background Sounds
          </h4>
          <button
            onClick={() => tableEditMode === 'sounds' ? setTableEditMode(null) : enterTableEdit('sounds')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${tableEditMode === 'sounds' ? 'bg-accent-secondary/20 text-accent-secondary' : 'text-muted/60 hover:text-accent-secondary hover:bg-accent-secondary/10'}`}
          >
            {tableEditMode === 'sounds' ? 'Card View' : 'Edit All'}
          </button>
        </div>
        {tableEditMode === 'sounds' ? (
          <AmbianceTableEdit
            tracks={tableEditDraft}
            newRow={tableNewRow}
            onUpdateRow={updateTableRow}
            onDeleteRow={deleteTableRow}
            onUpdateNewRow={setTableNewRow}
            onSave={handleTableSave}
            onCancel={() => setTableEditMode(null)}
          />
        ) : (
          <>
            <div className="space-y-2">
              {filterTracks(ambiance.sounds).map(track => (
                <AmbianceTrackCard
                  key={track.name}
                  track={track}
                  active={audio.isTrackActive(track.name)}
                  volume={audio.trackVolumes[track.name] ?? 0.5}
                  onToggle={() => audio.toggleTrack(track, zoneId, zoneName)}
                  onVolumeChange={(vol) => audio.handleTrackVolume(track.name, vol)}
                  tagColors={tagColors}
                  onEdit={(updates) => handleEditTrack('sounds', track.name, updates)}
                  onDelete={() => handleDeleteTrack('sounds', track.name)}
                />
              ))}
            </div>
            {addingTo === 'sounds' ? (
              <AddTrackForm
                newTrack={newTrack}
                setNewTrack={setNewTrack}
                onSave={() => handleAddTrack('sounds')}
                onCancel={() => { setAddingTo(null); setNewTrack({ name: '', description: '', searchTerm: '', youtubeUrl: '', tags: [] }); }}
                toggleTag={toggleNewTag}
                tagColors={tagColors}
              />
            ) : (
              <button
                onClick={() => setAddingTo('sounds')}
                className="mt-2 flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-accent-secondary/70 hover:text-accent-secondary hover:bg-accent-secondary/10 transition-colors cursor-pointer"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Add Sound Track
              </button>
            )}
          </>
        )}
      </div>

      {/* Active summary */}
      {activeCount > 0 && (
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-accent-secondary">
              {activeCount} track{activeCount !== 1 ? 's' : ''} playing
            </span>
            <button
              onClick={audio.stopAll}
              className="text-xs text-muted hover:text-danger cursor-pointer"
            >
              Stop all
            </button>
          </div>
        </div>
      )}
    </CollapsibleSection>
  );
}

/** Extract YouTube video ID from various URL formats */
function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  // youtube.com/watch?v=ID
  const watchMatch = url.match(/(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  // youtu.be/ID
  const shortMatch = url.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  // youtube.com/embed/ID
  const embedMatch = url.match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  return null;
}

function YouTubeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function AmbianceTrackCard({
  track,
  active,
  volume,
  onToggle,
  onVolumeChange,
  tagColors,
  onEdit,
  onDelete,
}: {
  track: AmbianceTrack;
  active: boolean;
  volume: number;
  onToggle: () => void;
  onVolumeChange: (vol: number) => void;
  tagColors: Record<string, string>;
  onEdit?: (updates: Partial<AmbianceTrack>) => void;
  onDelete?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editingSearchTerm, setEditingSearchTerm] = useState(false);
  const [searchTermDraft, setSearchTermDraft] = useState(track.searchTerm);
  const [editDraft, setEditDraft] = useState({ name: track.name, description: track.description, searchTerm: track.searchTerm, youtubeUrl: track.youtubeUrl || '' });
  const [youtubeExpanded, setYoutubeExpanded] = useState(false);

  const youtubeVideoId = track.youtubeUrl ? extractYouTubeVideoId(track.youtubeUrl) : null;

  const handleSaveEdit = () => {
    if (onEdit && editDraft.name.trim()) {
      onEdit({
        name: editDraft.name.trim(),
        description: editDraft.description.trim(),
        searchTerm: editDraft.searchTerm.trim() || editDraft.name.trim(),
        youtubeUrl: editDraft.youtubeUrl.trim() || undefined,
      });
    }
    setEditing(false);
  };

  const handleSaveSearchTerm = () => {
    const trimmed = searchTermDraft.trim();
    if (onEdit && trimmed) {
      onEdit({ searchTerm: trimmed });
    }
    setEditingSearchTerm(false);
  };

  return (
    <div
      className={`rounded-md p-2.5 border transition-all select-none group/track ${
        active
          ? 'bg-accent-secondary/10 border-accent-secondary/40 shadow-[0_0_8px_rgba(255,170,50,0.15)]'
          : 'bg-card-alt border-border/50 hover:border-border'
      }`}
    >
      <div className="flex items-center gap-2">
        {/* Play/Stop button (procedural audio) */}
        <button
          onClick={onToggle}
          className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs transition-colors cursor-pointer ${
            active ? 'bg-accent-secondary text-background' : 'bg-border text-muted hover:bg-border/80'
          }`}
          title={active ? 'Stop procedural audio' : 'Play procedural audio'}
        >
          {active ? '■' : '▶'}
        </button>

        {/* YouTube play button (if youtubeUrl is set) */}
        {youtubeVideoId && (
          <button
            onClick={() => setYoutubeExpanded(!youtubeExpanded)}
            className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs transition-colors cursor-pointer ${
              youtubeExpanded ? 'bg-red-600 text-white' : 'bg-red-600/20 text-red-500 hover:bg-red-600/40'
            }`}
            title={youtubeExpanded ? 'Close YouTube player' : 'Play YouTube video'}
          >
            <YouTubeIcon className="w-3.5 h-3.5" />
          </button>
        )}

        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-1.5">
              <input
                type="text"
                value={editDraft.name}
                onChange={e => setEditDraft(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-card border border-border rounded px-2 py-0.5 text-sm text-body focus:outline-none focus:border-accent-secondary/50"
                autoFocus
              />
              <input
                type="text"
                value={editDraft.description}
                onChange={e => setEditDraft(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description"
                className="w-full bg-card border border-border rounded px-2 py-0.5 text-xs text-body focus:outline-none focus:border-accent-secondary/50"
              />
              <input
                type="text"
                value={editDraft.searchTerm}
                onChange={e => setEditDraft(prev => ({ ...prev, searchTerm: e.target.value }))}
                placeholder="Search term"
                className="w-full bg-card border border-border rounded px-2 py-0.5 text-xs text-body focus:outline-none focus:border-accent-secondary/50"
              />
              <input
                type="text"
                value={editDraft.youtubeUrl}
                onChange={e => setEditDraft(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                placeholder="YouTube URL (optional)"
                className="w-full bg-card border border-border rounded px-2 py-0.5 text-xs text-body focus:outline-none focus:border-accent-secondary/50"
              />
              <div className="flex gap-1.5">
                <button onClick={handleSaveEdit} className="px-2 py-0.5 rounded text-[11px] font-medium bg-accent-secondary/20 text-accent-secondary hover:bg-accent-secondary/30 cursor-pointer">Save</button>
                <button onClick={() => { setEditing(false); setEditDraft({ name: track.name, description: track.description, searchTerm: track.searchTerm, youtubeUrl: track.youtubeUrl || '' }); }} className="px-2 py-0.5 rounded text-[11px] text-muted hover:text-body cursor-pointer">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${active ? 'text-accent-secondary' : 'text-body'}`}>
                  {track.name}
                </span>
                {/* YouTube search link + inline search term edit */}
                {editingSearchTerm ? (
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <input
                      type="text"
                      value={searchTermDraft}
                      onChange={e => setSearchTermDraft(e.target.value)}
                      onBlur={handleSaveSearchTerm}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveSearchTerm(); if (e.key === 'Escape') { setSearchTermDraft(track.searchTerm); setEditingSearchTerm(false); } }}
                      className="bg-card border border-accent-secondary/50 rounded px-1.5 py-0 text-xs text-body focus:outline-none w-36"
                      autoFocus
                    />
                  </div>
                ) : (
                  <>
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(track.searchTerm)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted/50 hover:text-accent-secondary transition-colors flex-shrink-0"
                      title={`Search YouTube: ${track.searchTerm}`}
                      onClick={e => e.stopPropagation()}
                    >
                      <ExternalLinkIcon className="w-3 h-3" />
                    </a>
                    {onEdit && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setSearchTermDraft(track.searchTerm); setEditingSearchTerm(true); }}
                        className="text-muted/30 hover:text-accent-secondary transition-colors flex-shrink-0 cursor-pointer"
                        title={`Edit search term: ${track.searchTerm}`}
                      >
                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" />
                        </svg>
                      </button>
                    )}
                  </>
                )}
                {track.tags.map(tag => (
                  <span key={tag} className={`px-1.5 py-0 rounded text-[10px] ${tagColors[tag] || 'bg-card text-muted'}`}>
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted mt-0.5">{track.description}</p>
            </>
          )}
          {/* Per-track volume slider (visible when active) */}
          {active && !editing && (
            <div className="flex items-center gap-2 mt-1.5">
              <SoundIcon className="w-3 h-3 text-muted" />
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(volume * 100)}
                onChange={e => onVolumeChange(parseInt(e.target.value) / 100)}
                onClick={e => e.stopPropagation()}
                className="flex-1 h-1 bg-border rounded-full appearance-none cursor-pointer accent-accent-secondary"
              />
              <span className="text-[10px] text-muted w-7 text-right">{Math.round(volume * 100)}%</span>
            </div>
          )}
        </div>

        {/* Edit/Delete buttons (shown on hover) */}
        {!editing && (onEdit || onDelete) && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover/track:opacity-100 transition-opacity flex-shrink-0">
            {onEdit && (
              <button
                onClick={() => { setEditDraft({ name: track.name, description: track.description, searchTerm: track.searchTerm, youtubeUrl: track.youtubeUrl || '' }); setEditing(true); }}
                className="w-5 h-5 rounded flex items-center justify-center text-muted hover:text-accent-secondary hover:bg-accent-secondary/10 transition-colors cursor-pointer"
                title="Edit track"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="w-5 h-5 rounded flex items-center justify-center text-muted hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                title="Delete track"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Sound profile indicator */}
        {!editing && (
          <span className="text-[10px] text-muted/40 flex-shrink-0 max-w-24 text-right truncate" title={`Profile: ${detectSoundProfile(track.name, track.description)}`}>
            {detectSoundProfile(track.name, track.description).replace('-', ' ')}
          </span>
        )}
      </div>

      {/* YouTube embedded player */}
      {youtubeExpanded && youtubeVideoId && (
        <div className="mt-2 rounded overflow-hidden border border-border/50">
          <iframe
            width="100%"
            height="80"
            src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1`}
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="block"
            title={`YouTube: ${track.name}`}
          />
        </div>
      )}
    </div>
  );
}

// ── Add Track Form ──

function AddTrackForm({
  newTrack,
  setNewTrack,
  onSave,
  onCancel,
  toggleTag,
  tagColors,
}: {
  newTrack: { name: string; description: string; searchTerm: string; youtubeUrl: string; tags: AmbianceTrack['tags'] };
  setNewTrack: React.Dispatch<React.SetStateAction<{ name: string; description: string; searchTerm: string; youtubeUrl: string; tags: AmbianceTrack['tags'] }>>;
  onSave: () => void;
  onCancel: () => void;
  toggleTag: (tag: AmbianceTrack['tags'][number]) => void;
  tagColors: Record<string, string>;
}) {
  return (
    <div className="mt-2 bg-card-alt rounded-md p-3 border border-accent-secondary/30 space-y-2">
      <input
        type="text"
        value={newTrack.name}
        onChange={e => setNewTrack(prev => ({ ...prev, name: e.target.value }))}
        placeholder="Track name"
        className="w-full bg-background border border-border rounded px-2 py-1 text-sm text-body placeholder:text-muted/50 focus:outline-none focus:border-accent-secondary"
        autoFocus
      />
      <input
        type="text"
        value={newTrack.description}
        onChange={e => setNewTrack(prev => ({ ...prev, description: e.target.value }))}
        placeholder="Description"
        className="w-full bg-background border border-border rounded px-2 py-1 text-sm text-body placeholder:text-muted/50 focus:outline-none focus:border-accent-secondary"
      />
      <input
        type="text"
        value={newTrack.searchTerm}
        onChange={e => setNewTrack(prev => ({ ...prev, searchTerm: e.target.value }))}
        placeholder="YouTube search term (optional)"
        className="w-full bg-background border border-border rounded px-2 py-1 text-sm text-body placeholder:text-muted/50 focus:outline-none focus:border-accent-secondary"
      />
      <input
        type="text"
        value={newTrack.youtubeUrl}
        onChange={e => setNewTrack(prev => ({ ...prev, youtubeUrl: e.target.value }))}
        placeholder="YouTube URL (optional, e.g. youtube.com/watch?v=...)"
        className="w-full bg-background border border-border rounded px-2 py-1 text-sm text-body placeholder:text-muted/50 focus:outline-none focus:border-accent-secondary"
      />
      <div className="flex flex-wrap gap-1">
        {ALL_AMBIANCE_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-2 py-0.5 rounded text-xs cursor-pointer transition-colors ${
              newTrack.tags.includes(tag) ? 'ring-1 ring-accent/40 ' + (tagColors[tag] || '') : 'bg-card text-muted hover:text-body'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={onSave}
          disabled={!newTrack.name.trim()}
          className="px-2.5 py-1 rounded text-xs font-medium bg-accent-secondary/20 text-accent-secondary hover:bg-accent-secondary/30 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default"
        >
          Add
        </button>
        <button
          onClick={onCancel}
          className="px-2.5 py-1 rounded text-xs font-medium text-muted hover:text-body transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Ambiance Table Edit View ──

function AmbianceTableEdit({
  tracks,
  newRow,
  onUpdateRow,
  onDeleteRow,
  onUpdateNewRow,
  onSave,
  onCancel,
}: {
  tracks: AmbianceTrack[];
  newRow: { name: string; description: string; searchTerm: string; youtubeUrl: string };
  onUpdateRow: (index: number, field: keyof AmbianceTrack, value: string) => void;
  onDeleteRow: (index: number) => void;
  onUpdateNewRow: (row: { name: string; description: string; searchTerm: string; youtubeUrl: string }) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const inputCls = 'w-full bg-card border border-border rounded px-1.5 py-1 text-xs text-body focus:outline-none focus:border-accent-secondary/50';

  return (
    <div className="bg-card-alt rounded-lg border border-accent-secondary/30 overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[1fr_1.5fr_1fr_1fr_auto] gap-1 px-3 py-2 bg-card border-b border-border text-[10px] uppercase tracking-wider text-muted font-semibold">
        <span>Name</span>
        <span>Description</span>
        <span>Search Term</span>
        <span>YouTube URL</span>
        <span className="w-6"></span>
      </div>

      {/* Existing tracks */}
      {tracks.map((track, i) => (
        <div key={i} className="grid grid-cols-[1fr_1.5fr_1fr_1fr_auto] gap-1 px-3 py-1.5 border-b border-border/30 items-center">
          <input
            type="text"
            value={track.name}
            onChange={e => onUpdateRow(i, 'name', e.target.value)}
            className={inputCls}
          />
          <input
            type="text"
            value={track.description}
            onChange={e => onUpdateRow(i, 'description', e.target.value)}
            className={inputCls}
          />
          <input
            type="text"
            value={track.searchTerm}
            onChange={e => onUpdateRow(i, 'searchTerm', e.target.value)}
            className={inputCls}
          />
          <input
            type="text"
            value={track.youtubeUrl || ''}
            onChange={e => onUpdateRow(i, 'youtubeUrl', e.target.value)}
            className={inputCls}
            placeholder="Optional"
          />
          <button
            onClick={() => onDeleteRow(i)}
            className="w-6 h-6 rounded flex items-center justify-center text-muted hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer flex-shrink-0"
            title="Delete track"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}

      {/* Add new row */}
      <div className="grid grid-cols-[1fr_1.5fr_1fr_1fr_auto] gap-1 px-3 py-1.5 border-b border-border/30 items-center bg-accent-secondary/5">
        <input
          type="text"
          value={newRow.name}
          onChange={e => onUpdateNewRow({ ...newRow, name: e.target.value })}
          className={inputCls}
          placeholder="New track..."
        />
        <input
          type="text"
          value={newRow.description}
          onChange={e => onUpdateNewRow({ ...newRow, description: e.target.value })}
          className={inputCls}
          placeholder="Description"
        />
        <input
          type="text"
          value={newRow.searchTerm}
          onChange={e => onUpdateNewRow({ ...newRow, searchTerm: e.target.value })}
          className={inputCls}
          placeholder="Search term"
        />
        <input
          type="text"
          value={newRow.youtubeUrl}
          onChange={e => onUpdateNewRow({ ...newRow, youtubeUrl: e.target.value })}
          className={inputCls}
          placeholder="YouTube URL"
        />
        <div className="w-6" />
      </div>

      {/* Save / Cancel buttons */}
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          onClick={onSave}
          className="px-3 py-1 rounded text-xs font-medium bg-accent-secondary/20 text-accent-secondary hover:bg-accent-secondary/30 transition-colors cursor-pointer"
        >
          Save All
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 rounded text-xs font-medium text-muted hover:text-body transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <span className="text-[10px] text-muted/50 ml-auto">{tracks.length} track{tracks.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}

// ── Tiny SVG icons ──

function MusicIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function SoundIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function ExternalLinkIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
