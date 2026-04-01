'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { CombatParticipant, CombatState, PartyMember, Monster, ImprovData, ActiveCondition, EncounterOverlay } from '@/lib/types';
import { useAdventureContext } from '@/lib/AdventureContext';
import { makeImageResolver } from '@/hooks/useAdventure';
import { conditions as allConditions } from '@/data/conditions';
import { v4 as uuidv4 } from 'uuid';
import Button from '@/components/shared/Button';
import HPBar from '@/components/shared/HPBar';
import Badge from '@/components/shared/Badge';
import ConditionBadge from '@/components/shared/ConditionBadge';
import StatBlock from '@/components/shared/StatBlock';
import { SpotlightButton } from './SpotlightControls';
import CrowEncounterSidebar from './encounters/CrowEncounterSidebar';
import EmerEncounterSidebar from './encounters/EmerEncounterSidebar';

interface CombatTimerData {
  remaining: number;
  duration: number;
}

interface CombatTrackerProps {
  onSpotlightCombat?: (combatState: CombatState, timer?: CombatTimerData) => void;
  onSpotlightNarrative?: (title: string, text: string) => void;
  onSpotlightImage?: (title: string, imageUrl: string) => void;
  onSpotlightEncounterOverlay?: (overlay: EncounterOverlay) => void;
  pendingMonsters?: string[];
  onClearPending?: () => void;
}

// Helper to check if a participant is Lair Actions
function isLairAction(p: CombatParticipant): boolean {
  return p.id === 'lair-actions';
}

export default function CombatTracker({ onSpotlightCombat, onSpotlightNarrative, onSpotlightImage, onSpotlightEncounterOverlay, pendingMonsters, onClearPending }: CombatTrackerProps) {
  const { data: adventureData, slug } = useAdventureContext();
  const monsters: Monster[] = adventureData?.monsters ?? [];
  const improvData: ImprovData | null = adventureData?.improv ?? null;
  const resolveImg = makeImageResolver(slug);

  const [combat, setCombat] = useState<CombatState>({
    id: 1, active: false, round: 1, turn_index: 0, participants: [],
  });
  const [partyMembers, setPartyMembers] = useState<PartyMember[]>([]);
  const [addMonsterDropdown, setAddMonsterDropdown] = useState(false);
  const [expandedStatBlock, setExpandedStatBlock] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [usedNames, setUsedNames] = useState<Set<string>>(new Set());

  // Condition expiry notifications
  const [conditionNotifications, setConditionNotifications] = useState<string[]>([]);
  // Save reminders for current turn participant
  const [saveReminders, setSaveReminders] = useState<{ participantId: string; conditions: ActiveCondition[] }| null>(null);

  // Timer state
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerDuration, setTimerDuration] = useState(60);
  const [timerRemaining, setTimerRemaining] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const timerExpiredRef = useRef(false);

  // Undo/Redo state
  const [combatHistory, setCombatHistory] = useState<CombatState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoRef = useRef(false);

  // Drag-and-drop state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Fetch combat state and party members
  useEffect(() => {
    Promise.all([
      fetch('/api/combat').then(r => r.json()),
      fetch('/api/party').then(r => r.json()),
    ]).then(([combatData, partyData]) => {
      setCombat(combatData);
      setPartyMembers(partyData);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load combat data:', err);
      setLoading(false);
    });
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (!timerActive || timerRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimerRemaining(prev => {
        if (prev <= 1) {
          setTimerActive(false);
          setTimerExpired(true);
          timerExpiredRef.current = true;
          setTimeout(() => {
            setTimerExpired(false);
            timerExpiredRef.current = false;
          }, 3000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, timerRemaining]);

  // Reset timer helper
  const resetTimer = useCallback(() => {
    setTimerRemaining(timerDuration);
    setTimerActive(true);
    setTimerExpired(false);
    timerExpiredRef.current = false;
  }, [timerDuration]);

  // Handle pending monsters from GuidePanel "Start Combat" button
  // Uses setCombat callback to avoid stale closure over combat state
  useEffect(() => {
    if (!pendingMonsters || pendingMonsters.length === 0 || loading) return;

    setCombat(currentCombat => {
      const newParticipants: CombatParticipant[] = [];
      const newUsedNames = new Set(usedNames);
      const batchCounts: Record<string, number> = {};

      for (const monsterId of pendingMonsters) {
        const monsterData = monsters.find(m => m.id === monsterId);
        if (!monsterData) continue;

        const dexMod = Math.floor((monsterData.stats.dex - 10) / 2);
        const initiative = Math.floor(Math.random() * 20) + 1 + dexMod;

        let displayName = monsterData.name;
        const isGiant = monsterData.type.toLowerCase().includes('giant');
        const existingCount = currentCombat.participants.filter(p => p.monsterId === monsterId).length + (batchCounts[monsterId] || 0);

        if (monsterData.namedNPC) {
          displayName = monsterData.name;
        } else if (isGiant) {
          const giantNames = improvData?.giantNames ?? [];
          const availableNames = giantNames.filter(n => !newUsedNames.has(n));
          if (availableNames.length > 0) {
            const randomName = availableNames[Math.floor(Math.random() * availableNames.length)];
            displayName = `${randomName} (${monsterData.name})`;
            newUsedNames.add(randomName);
          } else {
            displayName = existingCount > 0 ? `${monsterData.name} ${existingCount + 1}` : monsterData.name;
          }
        } else {
          displayName = existingCount > 0 ? `${monsterData.name} ${existingCount + 1}` : monsterData.name;
        }

        batchCounts[monsterId] = (batchCounts[monsterId] || 0) + 1;

        newParticipants.push({
          id: uuidv4(),
          name: displayName,
          type: 'monster',
          initiative,
          ac: monsterData.ac,
          hp_max: monsterData.hp,
          hp_current: monsterData.hp,
          conditions: [],
          monsterId,
        });
      }

      if (newParticipants.length > 0) {
        setUsedNames(newUsedNames);
        const newState = { ...currentCombat, participants: [...currentCombat.participants, ...newParticipants] };
        // Save to API asynchronously
        fetch('/api/combat', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newState),
        }).catch(err => console.error('Failed to save combat:', err));
        return newState;
      }
      return currentCombat;
    });

    if (onClearPending) onClearPending();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingMonsters, loading]);

  // Build timer data for spotlight broadcast
  const getTimerData = useCallback((): CombatTimerData | undefined => {
    if (!timerEnabled) return undefined;
    return { remaining: timerRemaining, duration: timerDuration };
  }, [timerEnabled, timerRemaining, timerDuration]);

  // Save combat state and auto-push to Player View when combat is active
  const saveCombat = useCallback(async (state: CombatState) => {
    setCombat(state);
    try {
      await fetch('/api/combat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
      // Auto-push combat state to Player View when combat is active
      if (state.active && onSpotlightCombat) {
        onSpotlightCombat(state, getTimerData());
      }
    } catch (err) {
      console.error('Failed to save combat:', err);
    }
  }, [onSpotlightCombat, getTimerData]);

  // Save combat with undo/redo history tracking
  // History stores snapshots: combatHistory[historyIndex] = current state
  // On new action: push new state, trim redo future
  // On undo: move historyIndex back, restore that snapshot
  // On redo: move historyIndex forward, restore that snapshot
  const saveCombatWithHistory = useCallback((newState: CombatState) => {
    if (isUndoRedoRef.current) {
      saveCombat(newState);
      return;
    }
    setCombatHistory(prev => {
      const trimmed = prev.slice(0, historyIndex + 1); // discard redo future
      const updated = [...trimmed, newState].slice(-20); // keep last 20
      // Adjust historyIndex to point to the new entry
      setHistoryIndex(updated.length - 1);
      return updated;
    });
    saveCombat(newState);
  }, [saveCombat, historyIndex]);

  const undoCombat = useCallback(() => {
    if (historyIndex <= 0) return;
    isUndoRedoRef.current = true;
    const newIndex = historyIndex - 1;
    const prevState = combatHistory[newIndex];
    setHistoryIndex(newIndex);
    saveCombat(prevState);
    setTimeout(() => { isUndoRedoRef.current = false; }, 0);
  }, [historyIndex, combatHistory, saveCombat]);

  const redoCombat = useCallback(() => {
    if (historyIndex >= combatHistory.length - 1) return;
    isUndoRedoRef.current = true;
    const newIndex = historyIndex + 1;
    const nextState = combatHistory[newIndex];
    setHistoryIndex(newIndex);
    saveCombat(nextState);
    setTimeout(() => { isUndoRedoRef.current = false; }, 0);
  }, [historyIndex, combatHistory, saveCombat]);

  // ── Pre-combat: add PCs from party
  const addPCsFromParty = () => {
    const newParticipants: CombatParticipant[] = partyMembers
      .filter(pm => !combat.participants.some(p => p.id === pm.id))
      .map(pm => ({
        id: pm.id,
        name: pm.name,
        type: 'pc' as const,
        initiative: 0,
        ac: pm.ac,
        hp_max: pm.hp_max,
        hp_current: pm.hp_current,
        conditions: [...pm.conditions],
      }));
    saveCombatWithHistory({ ...combat, participants: [...combat.participants, ...newParticipants] });
  };

  // ── Add monster from data (with random giant naming)
  const addMonster = (monsterId: string) => {
    const monsterData = monsters.find(m => m.id === monsterId);
    if (!monsterData) return;

    const dexMod = Math.floor((monsterData.stats.dex - 10) / 2);
    const initiative = Math.floor(Math.random() * 20) + 1 + dexMod;

    // Determine name: named NPCs keep their name, giants get random names, others get numbers
    let displayName = monsterData.name;
    const isGiant = monsterData.type.toLowerCase().includes('giant');

    if (monsterData.namedNPC) {
      // Named NPCs always keep their original name
      displayName = monsterData.name;
    } else if (isGiant) {
      // Pick a random unused giant name
      const giantNames = improvData?.giantNames ?? [];
      const availableNames = giantNames.filter(n => !usedNames.has(n));
      if (availableNames.length > 0) {
        const randomName = availableNames[Math.floor(Math.random() * availableNames.length)];
        displayName = `${randomName} (${monsterData.name})`;
        setUsedNames(prev => new Set([...prev, randomName]));
      } else {
        // Fallback to numbering if all names used
        const existingCount = combat.participants.filter(p => p.monsterId === monsterId).length;
        displayName = existingCount > 0 ? `${monsterData.name} ${existingCount + 1}` : monsterData.name;
      }
    } else {
      // Non-giant, non-named: sequential numbering
      const existingCount = combat.participants.filter(p => p.monsterId === monsterId).length;
      displayName = existingCount > 0 ? `${monsterData.name} ${existingCount + 1}` : monsterData.name;
    }

    const participant: CombatParticipant = {
      id: uuidv4(),
      name: displayName,
      type: 'monster',
      initiative,
      ac: monsterData.ac,
      hp_max: monsterData.hp,
      hp_current: monsterData.hp,
      conditions: [],
      monsterId,
    };

    saveCombatWithHistory({ ...combat, participants: [...combat.participants, participant] });
    setAddMonsterDropdown(false);
  };

  // ── Rename a participant
  const renameParticipant = (id: string, newName: string) => {
    const updated = combat.participants.map(p =>
      p.id === id ? { ...p, name: newName } : p
    );
    saveCombatWithHistory({ ...combat, participants: updated });
  };

  // ── Set initiative for a participant
  const setInitiative = (id: string, init: number) => {
    const updated = combat.participants.map(p =>
      p.id === id ? { ...p, initiative: init } : p
    );
    saveCombatWithHistory({ ...combat, participants: updated });
  };

  // ── Start combat (sort by initiative)
  const startCombat = () => {
    const sorted = [...combat.participants].sort((a, b) => b.initiative - a.initiative);
    // Check first participant for save reminders
    const first = sorted[0];
    if (first) {
      const saveEnds = (first.activeConditions || []).filter(ac => ac.duration === 'save-ends');
      if (saveEnds.length > 0) {
        setSaveReminders({ participantId: first.id, conditions: saveEnds });
      } else {
        setSaveReminders(null);
      }
    }
    saveCombatWithHistory({ ...combat, active: true, round: 1, turn_index: 0, participants: sorted });
    if (timerEnabled) resetTimer();
  };

  // ── Next turn (with condition auto-decrement)
  const nextTurn = () => {
    let nextIndex = combat.turn_index + 1;
    let nextRound = combat.round;
    const isNewRound = nextIndex >= combat.participants.length;
    if (isNewRound) {
      nextIndex = 0;
      nextRound++;
    }

    const notifications: string[] = [];
    const updatedParticipants = combat.participants.map((p, idx) => {
      let activeConditions = [...(p.activeConditions || [])];
      let conditions = [...p.conditions];

      // For the participant whose turn just ended: decrement end-of-turn conditions
      if (idx === combat.turn_index) {
        activeConditions = activeConditions.filter(ac => {
          if (ac.duration === 'end-of-turn' && ac.turnsRemaining != null) {
            const remaining = ac.turnsRemaining - 1;
            if (remaining <= 0) {
              notifications.push(`${p.name}'s ${ac.name} has ended!`);
              conditions = conditions.filter(c => c !== ac.name);
              return false;
            }
            ac.turnsRemaining = remaining;
          }
          return true;
        });
      }

      // For the participant whose turn is about to start: decrement start-of-turn conditions
      if (idx === nextIndex) {
        activeConditions = activeConditions.filter(ac => {
          if (ac.duration === 'start-of-turn' && ac.turnsRemaining != null) {
            const remaining = ac.turnsRemaining - 1;
            if (remaining <= 0) {
              notifications.push(`${p.name}'s ${ac.name} has ended!`);
              conditions = conditions.filter(c => c !== ac.name);
              return false;
            }
            ac.turnsRemaining = remaining;
          }
          return true;
        });
      }

      // At start of new round (turn_index wraps to 0): decrement timed conditions on ALL
      if (isNewRound) {
        activeConditions = activeConditions.filter(ac => {
          if (ac.duration === 'timed' && ac.turnsRemaining != null) {
            const remaining = ac.turnsRemaining - 1;
            if (remaining <= 0) {
              notifications.push(`${p.name}'s ${ac.name} has ended!`);
              conditions = conditions.filter(c => c !== ac.name);
              return false;
            }
            ac.turnsRemaining = remaining;
          }
          return true;
        });
      }

      return { ...p, conditions, activeConditions };
    });

    // Show notifications
    if (notifications.length > 0) {
      setConditionNotifications(notifications);
      setTimeout(() => setConditionNotifications([]), 5000);
    }

    // Check for save reminders on the next participant
    const nextParticipant = updatedParticipants[nextIndex];
    if (nextParticipant) {
      const saveEndsConditions = (nextParticipant.activeConditions || []).filter(ac => ac.duration === 'save-ends');
      if (saveEndsConditions.length > 0) {
        setSaveReminders({ participantId: nextParticipant.id, conditions: saveEndsConditions });
      } else {
        setSaveReminders(null);
      }
    }

    saveCombatWithHistory({ ...combat, turn_index: nextIndex, round: nextRound, participants: updatedParticipants });
    if (timerEnabled) resetTimer();
  };

  // ── Previous turn
  const prevTurn = () => {
    let prevIndex = combat.turn_index - 1;
    let prevRound = combat.round;
    if (prevIndex < 0) {
      prevIndex = Math.max(0, combat.participants.length - 1);
      prevRound = Math.max(1, prevRound - 1);
    }
    saveCombatWithHistory({ ...combat, turn_index: prevIndex, round: prevRound });
    if (timerEnabled) resetTimer();
  };

  // ── HP management
  const modifyHP = (id: string, amount: number) => {
    const updated = combat.participants.map(p => {
      if (p.id !== id) return p;
      const newHP = Math.max(0, Math.min(p.hp_max, p.hp_current + amount));
      return { ...p, hp_current: newHP };
    });
    saveCombatWithHistory({ ...combat, participants: updated });
  };

  // ── Condition management
  const addCondition = (id: string, condition: string) => {
    const updated = combat.participants.map(p => {
      if (p.id !== id || p.conditions.includes(condition)) return p;
      const newActiveCondition: ActiveCondition = { name: condition, duration: 'permanent' };
      return {
        ...p,
        conditions: [...p.conditions, condition],
        activeConditions: [...(p.activeConditions || []), newActiveCondition],
      };
    });
    saveCombatWithHistory({ ...combat, participants: updated });
  };

  const addConditionWithDuration = (id: string, ac: ActiveCondition) => {
    const updated = combat.participants.map(p => {
      if (p.id !== id) return p;
      if (p.conditions.includes(ac.name)) return p;
      return {
        ...p,
        conditions: [...p.conditions, ac.name],
        activeConditions: [...(p.activeConditions || []), ac],
      };
    });
    saveCombatWithHistory({ ...combat, participants: updated });
  };

  const removeCondition = (id: string, condition: string) => {
    const updated = combat.participants.map(p => {
      if (p.id !== id) return p;
      return {
        ...p,
        conditions: p.conditions.filter(c => c !== condition),
        activeConditions: (p.activeConditions || []).filter(ac => ac.name !== condition),
      };
    });
    saveCombatWithHistory({ ...combat, participants: updated });
  };

  // ── Remove participant
  const removeParticipant = (id: string) => {
    const remaining = combat.participants.filter(p => p.id !== id);
    const turnIndex = Math.min(combat.turn_index, Math.max(0, remaining.length - 1));
    saveCombatWithHistory({ ...combat, participants: remaining, turn_index: turnIndex });
  };

  // ── Modify participant (AC, HP max, etc.)
  const modifyParticipant = (id: string, updates: Partial<CombatParticipant>) => {
    const updated = combat.participants.map(p =>
      p.id === id ? { ...p, ...updates } : p
    );
    saveCombatWithHistory({ ...combat, participants: updated });
  };

  // ── End combat: sync HP and conditions back to party
  const endCombat = async () => {
    for (const participant of combat.participants) {
      if (participant.type === 'pc') {
        try {
          await fetch('/api/party', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: participant.id,
              hp_current: participant.hp_current,
              conditions: participant.conditions,
            }),
          });
        } catch (err) {
          console.error('Failed to sync party member:', err);
        }
      }
    }
    setUsedNames(new Set()); // Reset giant name pool
    setSaveReminders(null);
    setConditionNotifications([]);
    saveCombatWithHistory({ ...combat, active: false, round: 1, turn_index: 0, participants: [] });
  };

  // ── Save result handler (for save-ends conditions)
  const handleSaveResult = (participantId: string, conditionName: string, saved: boolean) => {
    if (saved) {
      removeCondition(participantId, conditionName);
    }
    // Update save reminders: remove the saved condition
    setSaveReminders(prev => {
      if (!prev || prev.participantId !== participantId) return prev;
      const remaining = prev.conditions.filter(c => c.name !== conditionName);
      return remaining.length > 0 ? { ...prev, conditions: remaining } : null;
    });
  };

  // ── Drag-and-drop reordering
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const reordered = [...combat.participants];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);

    // Adjust turn_index if combat is active
    let newTurnIndex = combat.turn_index;
    if (combat.active) {
      const currentTurnId = combat.participants[combat.turn_index]?.id;
      if (currentTurnId) {
        newTurnIndex = reordered.findIndex(p => p.id === currentTurnId);
        if (newTurnIndex === -1) newTurnIndex = 0;
      }
    }

    saveCombatWithHistory({ ...combat, participants: reordered, turn_index: newTurnIndex });
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  // ── Add Lair Actions
  const hasLairActions = combat.participants.some(p => isLairAction(p));

  const addLairActions = () => {
    if (hasLairActions) return;
    const lairParticipant: CombatParticipant = {
      id: 'lair-actions',
      name: 'Lair Actions',
      type: 'monster' as const,
      initiative: 20,
      ac: 0,
      hp_max: 999,
      hp_current: 999,
      conditions: [],
      monsterId: undefined,
    };
    saveCombatWithHistory({ ...combat, participants: [...combat.participants, lairParticipant] });
  };

  // Split monsters into named NPCs and regular monsters for dropdown
  const namedNPCs = monsters.filter(m => m.namedNPC);
  const regularMonsters = monsters.filter(m => !m.namedNPC);

  // ── Encounter Detection ──
  const CROW_MONSTER_ID = 'monstrous-crow-scarlet-rot';
  const crowParticipant = combat.participants.find(p => p.monsterId === CROW_MONSTER_ID);
  const isCrowEncounter = !!crowParticipant;
  const crowHp = crowParticipant?.hp_current ?? 0;
  const encounterPartyMembers = partyMembers.map(pc => ({ id: pc.id, name: pc.name }));

  // Lady Emer encounter detection
  const EMER_MONSTER_ID = 'lady-emer';
  const emerParticipant = combat.participants.find(p => p.monsterId === EMER_MONSTER_ID);
  const isEmerEncounter = !!emerParticipant;
  const emerHp = emerParticipant?.hp_current ?? 0;
  const emerMonster = monsters.find(m => m.id === EMER_MONSTER_ID);

  if (loading) {
    return <div className="text-muted text-center py-8">Loading combat state...</div>;
  }

  const combatContent = (
    <div className="space-y-4">
      {/* Combat header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xs uppercase tracking-wider text-accent font-semibold">
            Combat Tracker
          </h2>
          {combat.active && (
            <Badge color="danger">
              Round {combat.round}
            </Badge>
          )}
          <Badge color={combat.active ? 'success' : 'muted'}>
            {combat.active ? 'Active' : 'Setup'}
          </Badge>
        </div>
        <div className="flex gap-2">
          {!combat.active ? (
            <>
              <Button variant="secondary" size="sm" onClick={addPCsFromParty}>
                Add Party
              </Button>
              <div className="relative">
                <Button variant="secondary" size="sm" onClick={() => setAddMonsterDropdown(!addMonsterDropdown)}>
                  + Monster
                </Button>
                {addMonsterDropdown && (
                  <div className="absolute top-full right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 w-72 max-h-72 overflow-y-auto">
                    {namedNPCs.length > 0 && (
                      <>
                        <div className="px-3 py-1.5 bg-card-alt text-xs uppercase tracking-wider text-accent font-semibold border-b border-border sticky top-0">
                          Named NPCs
                        </div>
                        {namedNPCs.map(m => (
                          <button
                            key={m.id}
                            onClick={() => addMonster(m.id)}
                            className="w-full text-left px-3 py-2 text-sm text-body hover:bg-card-alt cursor-pointer flex items-center gap-2"
                          >
                            {m.imageUrl && (
                              <div className="w-6 h-6 rounded-full overflow-hidden border border-border/50 flex-shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={resolveImg(m.imageUrl ?? '')} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                            <span className="text-accent flex-1">{m.name}</span>
                            <span className="text-xs text-muted">CR {m.cr}</span>
                          </button>
                        ))}
                      </>
                    )}
                    <div className="px-3 py-1.5 bg-card-alt text-xs uppercase tracking-wider text-danger font-semibold border-b border-border border-t sticky top-0">
                      Monsters
                    </div>
                    {regularMonsters.map(m => (
                      <button
                        key={m.id}
                        onClick={() => addMonster(m.id)}
                        className="w-full text-left px-3 py-2 text-sm text-body hover:bg-card-alt cursor-pointer flex items-center gap-2"
                      >
                        {m.imageUrl && (
                          <div className="w-6 h-6 rounded-full overflow-hidden border border-border/50 flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={resolveImg(m.imageUrl ?? '')} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <span className="flex-1">{m.name}</span>
                        <span className="text-xs text-muted">CR {m.cr}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button
                variant="secondary" size="sm"
                onClick={addLairActions}
                disabled={hasLairActions}
                className="!bg-purple-500/10 !text-purple-400 !border-purple-500/30 hover:!bg-purple-500/20 disabled:!opacity-40"
                title={hasLairActions ? 'Lair Actions already added' : 'Add Lair Actions at Initiative 20'}
              >
                <span className="mr-1">&#x1F3F0;</span> Lair Actions
              </Button>
              <Button
                variant="primary" size="sm"
                onClick={startCombat}
                disabled={combat.participants.length === 0}
              >
                Start Combat
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={prevTurn}>&#9664; Prev</Button>
              <Button variant="primary" size="sm" onClick={nextTurn}>Next &#9654;</Button>
              {/* Undo/Redo */}
              <button
                onClick={undoCombat}
                disabled={historyIndex <= 0}
                className={`px-1.5 py-1 rounded text-sm cursor-pointer transition-colors ${
                  historyIndex <= 0 ? 'text-muted/30 cursor-not-allowed' : 'text-accent hover:bg-accent/10'
                }`}
                title="Undo"
              >
                &#x21B6;
              </button>
              <button
                onClick={redoCombat}
                disabled={historyIndex >= combatHistory.length - 1}
                className={`px-1.5 py-1 rounded text-sm cursor-pointer transition-colors ${
                  historyIndex >= combatHistory.length - 1 ? 'text-muted/30 cursor-not-allowed' : 'text-accent hover:bg-accent/10'
                }`}
                title="Redo"
              >
                &#x21B7;
              </button>
              {/* Timer toggle */}
              <button
                onClick={() => {
                  const next = !timerEnabled;
                  setTimerEnabled(next);
                  if (!next) {
                    setTimerActive(false);
                    setTimerExpired(false);
                  }
                }}
                className={`px-1.5 py-1 rounded text-sm cursor-pointer transition-colors ${
                  timerEnabled ? 'text-accent bg-accent/10' : 'text-muted hover:text-accent hover:bg-accent/10'
                }`}
                title={timerEnabled ? 'Disable turn timer' : 'Enable turn timer'}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="13" r="8" />
                  <path d="M12 9v4l2 2" />
                  <path d="M9 1h6" />
                  <path d="M12 1v2" />
                </svg>
              </button>
              {timerEnabled && (
                <div className="flex items-center gap-0.5">
                  {[30, 60, 90].map(d => (
                    <button
                      key={d}
                      onClick={() => { setTimerDuration(d); setTimerRemaining(d); }}
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition-colors ${
                        timerDuration === d ? 'bg-accent text-white' : 'bg-card-alt text-muted hover:text-accent'
                      }`}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              )}
              <div className="relative">
                <Button variant="secondary" size="sm" onClick={() => setAddMonsterDropdown(!addMonsterDropdown)}>
                  + Monster
                </Button>
                {addMonsterDropdown && (
                  <div className="absolute top-full right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 w-72 max-h-72 overflow-y-auto">
                    {namedNPCs.length > 0 && (
                      <>
                        <div className="px-3 py-1.5 bg-card-alt text-xs uppercase tracking-wider text-accent font-semibold border-b border-border sticky top-0">
                          Named NPCs
                        </div>
                        {namedNPCs.map(m => (
                          <button
                            key={m.id}
                            onClick={() => addMonster(m.id)}
                            className="w-full text-left px-3 py-2 text-sm text-body hover:bg-card-alt cursor-pointer flex items-center gap-2"
                          >
                            {m.imageUrl && (
                              <div className="w-6 h-6 rounded-full overflow-hidden border border-border/50 flex-shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={resolveImg(m.imageUrl ?? '')} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                            <span className="text-accent flex-1">{m.name}</span>
                            <span className="text-xs text-muted">CR {m.cr}</span>
                          </button>
                        ))}
                      </>
                    )}
                    <div className="px-3 py-1.5 bg-card-alt text-xs uppercase tracking-wider text-danger font-semibold border-b border-border border-t sticky top-0">
                      Monsters
                    </div>
                    {regularMonsters.map(m => (
                      <button
                        key={m.id}
                        onClick={() => addMonster(m.id)}
                        className="w-full text-left px-3 py-2 text-sm text-body hover:bg-card-alt cursor-pointer flex items-center gap-2"
                      >
                        {m.imageUrl && (
                          <div className="w-6 h-6 rounded-full overflow-hidden border border-border/50 flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={resolveImg(m.imageUrl ?? '')} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <span className="flex-1">{m.name}</span>
                        <span className="text-xs text-muted">CR {m.cr}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {onSpotlightCombat && (
                <SpotlightButton
                  size="md"
                  label="Show Combat"
                  onClick={() => onSpotlightCombat(combat, getTimerData())}
                />
              )}
              <Button variant="danger" size="sm" onClick={endCombat}>End Combat</Button>
            </>
          )}
        </div>
      </div>

      {/* Turn Timer Display */}
      {combat.active && timerEnabled && (
        <div className="flex items-center justify-center gap-3">
          {timerExpired ? (
            <div className="text-3xl font-black text-danger animate-pulse tracking-widest">
              TIME!
            </div>
          ) : (
            <div className={`text-3xl font-black tabular-nums ${
              timerRemaining > timerDuration * 0.5
                ? 'text-success'
                : timerRemaining > timerDuration * 0.25
                  ? 'text-warning'
                  : timerRemaining <= 10
                    ? 'text-danger animate-pulse'
                    : 'text-danger'
            }`}>
              {timerRemaining}s
            </div>
          )}
          <div className="flex gap-1">
            <button
              onClick={() => setTimerActive(!timerActive)}
              className="text-xs text-muted hover:text-accent cursor-pointer px-2 py-0.5 rounded bg-card-alt border border-border"
            >
              {timerActive ? 'Pause' : 'Resume'}
            </button>
            <button
              onClick={resetTimer}
              className="text-xs text-muted hover:text-accent cursor-pointer px-2 py-0.5 rounded bg-card-alt border border-border"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Condition expiry notifications */}
      {conditionNotifications.length > 0 && (
        <div className="space-y-1">
          {conditionNotifications.map((note, i) => (
            <div key={i} className="bg-accent/10 border border-accent/30 rounded-md px-3 py-2 text-sm text-accent animate-pulse">
              {note}
            </div>
          ))}
        </div>
      )}

      {/* Save reminder bar */}
      {saveReminders && combat.active && (() => {
        const p = combat.participants.find(pp => pp.id === saveReminders.participantId);
        if (!p) return null;
        return (
          <div className="bg-warning/10 border border-warning/40 rounded-lg px-4 py-3">
            <p className="text-sm font-semibold text-warning mb-2">
              {p.name} must save against:
            </p>
            <div className="flex flex-wrap gap-2">
              {saveReminders.conditions.map(ac => (
                <div key={ac.name} className="inline-flex items-center gap-2 bg-card border border-border rounded-md px-3 py-1.5">
                  <span className="text-sm text-body font-medium">
                    {ac.name}
                    {ac.saveDC ? ` (DC ${ac.saveDC} ${ac.saveAbility || ''})` : ''}
                  </span>
                  <button
                    onClick={() => handleSaveResult(saveReminders.participantId, ac.name, true)}
                    className="px-2 py-0.5 text-xs font-semibold rounded bg-success/20 text-success border border-success/30 hover:bg-success/30 cursor-pointer"
                  >
                    Saved!
                  </button>
                  <button
                    onClick={() => handleSaveResult(saveReminders.participantId, ac.name, false)}
                    className="px-2 py-0.5 text-xs font-semibold rounded bg-danger/20 text-danger border border-danger/30 hover:bg-danger/30 cursor-pointer"
                  >
                    Failed
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Participants list */}
      {combat.participants.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted">No participants. Add party members and monsters to begin.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {combat.participants.map((p, index) => (
            <ParticipantRow
              key={p.id}
              participant={p}
              index={index}
              isActive={combat.active && index === combat.turn_index}
              isCombatActive={combat.active}
              monsters={monsters}
              resolveImg={resolveImg}
              onSetInitiative={(init) => setInitiative(p.id, init)}
              onModifyHP={(amount) => modifyHP(p.id, amount)}
              onAddCondition={(cond) => addCondition(p.id, cond)}
              onAddConditionWithDuration={(ac) => addConditionWithDuration(p.id, ac)}
              onRemoveCondition={(cond) => removeCondition(p.id, cond)}
              onRemove={() => removeParticipant(p.id)}
              onRename={(name) => renameParticipant(p.id, name)}
              onModifyParticipant={(id, updates) => modifyParticipant(id, updates)}
              expandedStatBlock={expandedStatBlock}
              onToggleStatBlock={(id) => setExpandedStatBlock(expandedStatBlock === id ? null : id)}
              onSpotlightNarrative={onSpotlightNarrative}
              combatParticipants={combat.participants}
              onApplyDamageToTarget={(targetId, amount) => modifyHP(targetId, amount)}
              isDragging={dragIndex === index}
              isDragOver={dragOverIndex === index}
              dragPosition={dragOverIndex === index && dragIndex !== null ? (dragIndex < index ? 'below' : 'above') : null}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              partyMembers={partyMembers}
            />
          ))}
        </div>
      )}

      {/* Monster stat block reference */}
      {!combat.active && (
        <div className="mt-6">
          <h3 className="text-xs uppercase tracking-wider text-muted font-semibold mb-3">Monster Reference</h3>
          <div className="space-y-2">
            {monsters.map(m => (
              <div key={m.id} className="relative group">
                <StatBlock monster={m} />
                <button
                  onClick={async () => {
                    if (!confirm(`Remove "${m.name}" from this adventure?`)) return;
                    try {
                      const res = await fetch(`/api/adventures/${slug}/monsters?id=${m.id}`, { method: 'DELETE' });
                      if (res.ok) window.location.reload();
                    } catch { /* ignore */ }
                  }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-danger/20 text-danger hover:bg-danger/40 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title={`Remove ${m.name} from adventure`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ── Wrap with Encounter Sidebar if Crow is in combat ──
  if (isCrowEncounter && onSpotlightNarrative && onSpotlightImage && onSpotlightEncounterOverlay) {
    return (
      <div className="grid grid-cols-[1fr_380px] gap-0 h-full -mx-4 -my-4">
        <div className="p-4 overflow-y-auto">
          {combatContent}
        </div>
        <CrowEncounterSidebar
          crowHp={crowHp}
          partyMembers={encounterPartyMembers}
          onSpotlightNarrative={onSpotlightNarrative}
          onSpotlightImage={onSpotlightImage}
          onSpotlightEncounterOverlay={onSpotlightEncounterOverlay}
        />
      </div>
    );
  }

  // ── Wrap with Encounter Sidebar if Lady Emer is in combat ──
  if (isEmerEncounter && emerMonster && onSpotlightNarrative) {
    return (
      <div className="grid grid-cols-[1fr_380px] gap-0 h-full -mx-4 -my-4">
        <div className="p-4 overflow-y-auto">
          {combatContent}
        </div>
        <EmerEncounterSidebar
          emerHp={emerHp}
          villainActions={emerMonster.villainActions ?? []}
          lairActions={emerMonster.lairActions ?? []}
          onSpotlightNarrative={onSpotlightNarrative}
        />
      </div>
    );
  }

  return combatContent;
}

// ═══════════════════════════════════════════
// Individual Participant Row
// ═══════════════════════════════════════════

function ParticipantRow({
  participant,
  index: _index,
  isActive,
  isCombatActive,
  monsters,
  resolveImg,
  onSetInitiative,
  onModifyHP,
  onAddCondition,
  onAddConditionWithDuration,
  onRemoveCondition,
  onRemove,
  onRename,
  onModifyParticipant,
  expandedStatBlock,
  onToggleStatBlock,
  onSpotlightNarrative,
  combatParticipants,
  onApplyDamageToTarget,
  isDragging,
  isDragOver,
  dragPosition,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  partyMembers,
}: {
  participant: CombatParticipant;
  index: number;
  isActive: boolean;
  isCombatActive: boolean;
  monsters: Monster[];
  resolveImg: (relativePath: string) => string;
  onSetInitiative: (init: number) => void;
  onModifyHP: (amount: number) => void;
  onAddCondition: (condition: string) => void;
  onAddConditionWithDuration: (ac: ActiveCondition) => void;
  onRemoveCondition: (condition: string) => void;
  onRemove: () => void;
  onRename: (name: string) => void;
  onModifyParticipant: (id: string, updates: Partial<CombatParticipant>) => void;
  expandedStatBlock: string | null;
  onToggleStatBlock: (id: string) => void;
  onSpotlightNarrative?: (title: string, text: string) => void;
  combatParticipants?: Array<{ id: string; name: string; hp_current: number; hp_max: number }>;
  onApplyDamageToTarget?: (targetId: string, amount: number) => void;
  isDragging: boolean;
  isDragOver: boolean;
  dragPosition: 'above' | 'below' | null;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  partyMembers?: PartyMember[];
}) {
  const [hpInput, setHpInput] = useState('');
  const [condDropdown, setCondDropdown] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(participant.name);
  const [narrativeText, setNarrativeText] = useState<string | null>(null);
  const [narrativeType, setNarrativeType] = useState<'hit' | 'miss' | null>(null);
  const [editingAC, setEditingAC] = useState(false);
  const [acValue, setAcValue] = useState(String(participant.ac));
  const [editingHPMax, setEditingHPMax] = useState(false);
  const [hpMaxValue, setHpMaxValue] = useState(String(participant.hp_max));

  // Condition duration modal state
  const [condDurationModal, setCondDurationModal] = useState<string | null>(null); // condition name being configured
  const [condDurationType, setCondDurationType] = useState<ActiveCondition['duration']>('permanent');
  const [condSaveDC, setCondSaveDC] = useState(15);
  const [condSaveAbility, setCondSaveAbility] = useState('CON');
  const [condTurns, setCondTurns] = useState(3);
  const [condNote, setCondNote] = useState('');

  const openCondDurationModal = (condName: string) => {
    setCondDurationModal(condName);
    setCondDurationType('permanent');
    setCondSaveDC(15);
    setCondSaveAbility('CON');
    setCondTurns(3);
    setCondNote('');
  };

  const confirmConditionWithDuration = () => {
    if (!condDurationModal) return;
    const ac: ActiveCondition = {
      name: condDurationModal,
      duration: condDurationType,
      note: condNote || undefined,
    };
    if (condDurationType === 'save-ends') {
      ac.saveDC = condSaveDC;
      ac.saveAbility = condSaveAbility;
    }
    if (condDurationType === 'timed' || condDurationType === 'start-of-turn' || condDurationType === 'end-of-turn') {
      ac.turnsRemaining = condTurns;
    }
    onAddConditionWithDuration(ac);
    setCondDurationModal(null);
    setCondDropdown(false);
  };

  const isMonster = participant.type === 'monster';
  const isLair = isLairAction(participant);
  const monsterData = (isMonster && !isLair) ? monsters.find(m => m.id === participant.monsterId) : null;
  const pcData = (!isMonster && partyMembers) ? partyMembers.find(pm => pm.id === participant.id) : null;

  const handleDamage = () => {
    const amount = parseInt(hpInput);
    if (isNaN(amount) || amount <= 0) return;
    onModifyHP(-amount);
    setHpInput('');
  };

  const handleHeal = () => {
    const amount = parseInt(hpInput);
    if (isNaN(amount) || amount <= 0) return;
    onModifyHP(amount);
    setHpInput('');
  };

  const commitRename = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== participant.name) {
      onRename(trimmed);
    } else {
      setEditName(participant.name);
    }
    setEditing(false);
  };

  const rollNarrative = (type: 'hit' | 'miss') => {
    if (!monsterData) return;
    const pool = type === 'hit' ? monsterData.hitFlavor : monsterData.missFlavor;
    if (!pool || pool.length === 0) return;
    const text = pool[Math.floor(Math.random() * pool.length)];
    setNarrativeText(text);
    setNarrativeType(type);
  };

  return (
    <div
      draggable={true}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`bg-card border rounded-lg p-3 transition-all relative ${
        isLair && isActive
          ? 'border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.4)] ring-1 ring-purple-500/50'
          : isActive
            ? 'border-accent shadow-[0_0_12px_rgba(255,107,53,0.3)] ring-1 ring-accent/50'
            : isLair
              ? 'border-purple-500/40'
              : 'border-border'
      } ${!isLair && participant.hp_current === 0 ? 'opacity-50' : ''} ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      } ${
        dragPosition === 'above' ? 'border-t-2 !border-t-accent' : ''
      } ${
        dragPosition === 'below' ? 'border-b-2 !border-b-accent' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Drag handle */}
        <div
          className="flex-shrink-0 cursor-grab active:cursor-grabbing text-muted/30 hover:text-muted transition-colors select-none"
          title="Drag to reorder"
        >
          <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
            <circle cx="2" cy="2" r="1.5" />
            <circle cx="8" cy="2" r="1.5" />
            <circle cx="2" cy="8" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="2" cy="14" r="1.5" />
            <circle cx="8" cy="14" r="1.5" />
          </svg>
        </div>

        {/* Active indicator */}
        {isCombatActive && (
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
            isLair && isActive ? 'bg-purple-500 animate-pulse' : isActive ? 'bg-accent animate-pulse' : 'bg-border'
          }`} />
        )}

        {/* Initiative */}
        <div className="w-12 flex-shrink-0">
          {isLair ? (
            <span className="text-sm font-bold text-purple-400 text-center block" title="Lair actions always act on initiative 20">20</span>
          ) : isCombatActive ? (
            <span className="text-sm font-bold text-accent text-center block">{participant.initiative}</span>
          ) : (
            <input
              type="number"
              value={participant.initiative || ''}
              onChange={e => onSetInitiative(parseInt(e.target.value) || 0)}
              placeholder="Init"
              className="w-12 bg-background border border-border rounded px-1 py-0.5 text-xs text-body text-center focus:outline-none focus:border-accent"
            />
          )}
        </div>

        {/* Lair icon, Monster portrait, or PC portrait thumbnail */}
        {isLair ? (
          <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center flex-shrink-0">
            <span className="text-base leading-none">&#x1F3F0;</span>
          </div>
        ) : monsterData?.imageUrl ? (
          <div className="w-8 h-8 rounded-full overflow-hidden border border-border flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveImg(monsterData.imageUrl)}
              alt={participant.name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        ) : pcData?.imageUrl ? (
          <div className="w-8 h-8 rounded-full overflow-hidden border border-border flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pcData.imageUrl}
              alt={participant.name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        ) : pcData ? (
          <div className="w-8 h-8 rounded-full bg-info/20 border border-info/40 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-info">
              {(pcData.class || pcData.name).substring(0, 2).toUpperCase()}
            </span>
          </div>
        ) : null}

        {/* Name + type badge (with inline rename) */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isLair ? (
              <>
                <span className="text-sm font-semibold text-purple-400">Lair Actions</span>
                <Badge color="info" className="!bg-purple-500/20 !text-purple-400">
                  Lair
                </Badge>
                <span className="text-xs text-purple-400/60">Initiative 20 (Lair)</span>
              </>
            ) : (
              <>
                {editing ? (
                  <input
                    autoFocus
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') { setEditName(participant.name); setEditing(false); } }}
                    className="text-sm font-semibold bg-background border border-accent rounded px-1 py-0.5 text-body focus:outline-none w-48"
                  />
                ) : (
                  <span
                    onClick={() => { setEditName(participant.name); setEditing(true); }}
                    className={`text-sm font-semibold truncate cursor-pointer hover:underline ${isMonster ? 'text-danger' : 'text-info'}`}
                    title="Click to rename"
                  >
                    {participant.name}
                  </span>
                )}
                <Badge color={isMonster ? 'danger' : 'info'}>
                  {isMonster ? 'Monster' : 'PC'}
                </Badge>
                {editingAC ? (
                  <input
                    autoFocus
                    type="number"
                    value={acValue}
                    onChange={e => setAcValue(e.target.value)}
                    onBlur={() => {
                      const v = parseInt(acValue);
                      if (!isNaN(v) && v > 0) onModifyParticipant(participant.id, { ac: v });
                      else setAcValue(String(participant.ac));
                      setEditingAC(false);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                      if (e.key === 'Escape') { setAcValue(String(participant.ac)); setEditingAC(false); }
                    }}
                    className="w-12 bg-background border border-accent rounded px-1 py-0.5 text-xs text-body text-center focus:outline-none"
                  />
                ) : (
                  <span
                    onClick={() => { setAcValue(String(participant.ac)); setEditingAC(true); }}
                    className="text-xs text-muted cursor-pointer hover:text-accent"
                    title="Click to edit AC"
                  >
                    AC {participant.ac}
                  </span>
                )}
                {/* Show/Hide image to players */}
                {isMonster && monsterData?.imageUrl && (
                  <>
                    <button
                      onClick={() => {
                        fetch('/api/spotlight', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            type: 'image',
                            content: { title: participant.name, imageUrl: resolveImg(monsterData.imageUrl!) },
                            timestamp: Date.now(),
                          }),
                        });
                      }}
                      className="text-xs text-muted hover:text-accent cursor-pointer"
                      title="Show image to players"
                    >
                      <svg className="w-3.5 h-3.5 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    <button
                      onClick={() => { fetch('/api/spotlight', { method: 'DELETE' }); }}
                      className="text-xs text-muted hover:text-danger cursor-pointer"
                      title="Hide image from players"
                    >
                      <svg className="w-3.5 h-3.5 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    </button>
                  </>
                )}
                {monsterData && (
                  <button
                    onClick={() => onToggleStatBlock(participant.id)}
                    className="text-xs text-muted hover:text-accent cursor-pointer"
                    title="Toggle stat block"
                  >
                    {expandedStatBlock === participant.id ? '▲' : '▼'} Stats
                  </button>
                )}
              </>
            )}
          </div>

          {/* Conditions */}
          <div className="flex items-center gap-1 flex-wrap mt-1">
            {participant.conditions.map(cond => {
              const ac = (participant.activeConditions || []).find(a => a.name === cond);
              return (
                <ConditionBadge key={cond} condition={cond} activeCondition={ac} onRemove={() => onRemoveCondition(cond)} />
              );
            })}
            <div className="relative">
              <button onClick={() => setCondDropdown(!condDropdown)} className="text-xs text-muted hover:text-accent cursor-pointer">+</button>
              {condDropdown && !condDurationModal && (
                <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 w-44 max-h-40 overflow-y-auto">
                  {allConditions.filter(c => !participant.conditions.includes(c.name)).map(c => (
                    <button key={c.name} onClick={() => openCondDurationModal(c.name)}
                      className="w-full text-left px-2 py-1 text-xs text-body hover:bg-card-alt cursor-pointer">
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
              {/* Condition Duration Modal */}
              {condDurationModal && (
                <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 w-64 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-accent">{condDurationModal}</span>
                    <button onClick={() => setCondDurationModal(null)} className="text-xs text-muted hover:text-danger cursor-pointer">&times;</button>
                  </div>
                  {/* Duration type */}
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted block mb-1">Duration</label>
                    <select
                      value={condDurationType}
                      onChange={e => setCondDurationType(e.target.value as ActiveCondition['duration'])}
                      className="w-full bg-background border border-border rounded px-2 py-1 text-xs text-body focus:outline-none focus:border-accent"
                    >
                      <option value="permanent">Permanent</option>
                      <option value="save-ends">Save Ends</option>
                      <option value="start-of-turn">Start of Turn</option>
                      <option value="end-of-turn">End of Turn</option>
                      <option value="timed">X Rounds</option>
                    </select>
                  </div>
                  {/* Save Ends fields */}
                  {condDurationType === 'save-ends' && (
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] uppercase tracking-wider text-muted block mb-1">DC</label>
                        <input
                          type="number" value={condSaveDC} onChange={e => setCondSaveDC(parseInt(e.target.value) || 10)}
                          className="w-full bg-background border border-border rounded px-2 py-1 text-xs text-body focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] uppercase tracking-wider text-muted block mb-1">Ability</label>
                        <select
                          value={condSaveAbility} onChange={e => setCondSaveAbility(e.target.value)}
                          className="w-full bg-background border border-border rounded px-2 py-1 text-xs text-body focus:outline-none focus:border-accent"
                        >
                          <option value="STR">STR</option>
                          <option value="DEX">DEX</option>
                          <option value="CON">CON</option>
                          <option value="INT">INT</option>
                          <option value="WIS">WIS</option>
                          <option value="CHA">CHA</option>
                        </select>
                      </div>
                    </div>
                  )}
                  {/* Timed / Start/End of turn: round count */}
                  {(condDurationType === 'timed' || condDurationType === 'start-of-turn' || condDurationType === 'end-of-turn') && (
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-muted block mb-1">Rounds</label>
                      <input
                        type="number" value={condTurns} min={1} onChange={e => setCondTurns(parseInt(e.target.value) || 1)}
                        className="w-full bg-background border border-border rounded px-2 py-1 text-xs text-body focus:outline-none focus:border-accent"
                      />
                    </div>
                  )}
                  {/* Note */}
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted block mb-1">Note (optional)</label>
                    <input
                      type="text" value={condNote} onChange={e => setCondNote(e.target.value)}
                      placeholder="e.g. caused by Hellfire Breath"
                      className="w-full bg-background border border-border rounded px-2 py-1 text-xs text-body focus:outline-none focus:border-accent"
                    />
                  </div>
                  <button
                    onClick={confirmConditionWithDuration}
                    className="w-full bg-accent/20 text-accent border border-accent/40 rounded px-3 py-1.5 text-xs font-semibold hover:bg-accent/30 cursor-pointer"
                  >
                    Apply Condition
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* HP bar + management (hidden for Lair Actions) */}
        {!isLair && (
          <>
            <div className="w-40 flex-shrink-0">
              <div className="flex items-center gap-1">
                <div className="flex-1">
                  <HPBar current={participant.hp_current} max={participant.hp_max} size="sm" />
                </div>
                {editingHPMax ? (
                  <input
                    autoFocus
                    type="number"
                    value={hpMaxValue}
                    onChange={e => setHpMaxValue(e.target.value)}
                    onBlur={() => {
                      const v = parseInt(hpMaxValue);
                      if (!isNaN(v) && v > 0) {
                        onModifyParticipant(participant.id, {
                          hp_max: v,
                          hp_current: Math.min(participant.hp_current, v),
                        });
                      } else {
                        setHpMaxValue(String(participant.hp_max));
                      }
                      setEditingHPMax(false);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                      if (e.key === 'Escape') { setHpMaxValue(String(participant.hp_max)); setEditingHPMax(false); }
                    }}
                    className="w-12 bg-background border border-accent rounded px-1 py-0.5 text-xs text-body text-center focus:outline-none"
                  />
                ) : (
                  <button
                    onClick={() => { setHpMaxValue(String(participant.hp_max)); setEditingHPMax(true); }}
                    className="text-muted hover:text-accent cursor-pointer flex-shrink-0"
                    title="Edit max HP"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <input
                type="number" value={hpInput} onChange={e => setHpInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleDamage(); }}
                placeholder="HP"
                className="w-14 bg-background border border-border rounded px-1 py-0.5 text-xs text-body text-center focus:outline-none focus:border-accent"
              />
              <Button variant="danger" size="sm" onClick={handleDamage}>-</Button>
              <Button variant="primary" size="sm" onClick={handleHeal} className="!bg-success/20 !text-success">+</Button>
              <button onClick={onRemove} className="text-xs text-muted hover:text-danger cursor-pointer ml-1" title="Remove">
                &times;
              </button>
            </div>
          </>
        )}

        {/* Remove button for Lair Actions (no HP controls) */}
        {isLair && (
          <button onClick={onRemove} className="text-xs text-muted hover:text-danger cursor-pointer ml-1 flex-shrink-0" title="Remove">
            &times;
          </button>
        )}
      </div>

      {/* Monster description + stat block (expanded) */}
      {monsterData && expandedStatBlock === participant.id && (
        <div className="mt-3 border-t border-border pt-3 space-y-3 relative">
          <button
            onClick={() => onToggleStatBlock(participant.id)}
            className="absolute top-3 right-0 text-sm text-muted hover:text-danger cursor-pointer leading-none"
            title="Close stat block"
          >
            &times;
          </button>
          {/* Show monster to players (image + description) */}
          {(monsterData.imageUrl || monsterData.description) && (
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-accent font-semibold">{monsterData.name}</span>
              {monsterData.imageUrl && (
                <SpotlightButton
                  size="md"
                  label="Show Image"
                  onClick={() => {
                    fetch('/api/spotlight', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        type: 'image',
                        content: { title: participant.name, imageUrl: resolveImg(monsterData.imageUrl!) },
                        timestamp: Date.now(),
                      }),
                    });
                  }}
                />
              )}
              {onSpotlightNarrative && monsterData.description && (
                <SpotlightButton
                  size="md"
                  label="Show Description"
                  onClick={() => {
                    onSpotlightNarrative(monsterData.name, monsterData.description!);
                  }}
                />
              )}
              <button
                onClick={() => { fetch('/api/spotlight', { method: 'DELETE' }); }}
                className="text-xs text-muted hover:text-danger cursor-pointer"
                title="Hide from players"
              >
                <svg className="w-3.5 h-3.5 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </button>
            </div>
          )}
          {/* Narrative description */}
          {monsterData.description && (
            <div className="flex items-start gap-3">
              <p className="read-aloud text-sm flex-1">{monsterData.description}</p>
              {onSpotlightNarrative && (
                <SpotlightButton onClick={() => onSpotlightNarrative(monsterData.name, monsterData.description!)} />
              )}
            </div>
          )}
          {/* Per-action hit/miss narrative buttons */}
          {monsterData.actions.length > 0 && (monsterData.hitFlavor?.length || monsterData.missFlavor?.length) && (
            <div className="bg-card-alt rounded-md p-3 border border-border">
              <span className="text-xs uppercase tracking-wider text-accent-secondary font-semibold mb-2 block">Quick Narrate</span>
              <div className="space-y-1.5">
                {monsterData.actions.map((action, i) => (
                  <ActionNarrativeRow
                    key={i}
                    actionName={action.name}
                    participantName={participant.name}
                    hitFlavor={monsterData.hitFlavor}
                    missFlavor={monsterData.missFlavor}
                    onSpotlightNarrative={onSpotlightNarrative}
                  />
                ))}
              </div>
            </div>
          )}
          <StatBlock monster={monsterData} expanded combatParticipants={combatParticipants} onApplyDamage={onApplyDamageToTarget} />
        </div>
      )}

      {/* Lair Actions active turn reminder */}
      {isActive && isLair && (
        <div className="mt-3 border-t border-purple-500/30 pt-3">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-md p-3 flex items-center gap-3">
            <span className="text-xl">&#x1F3F0;</span>
            <div>
              <p className="text-sm font-semibold text-purple-400">Lair Actions trigger &mdash; describe environmental effects</p>
              <p className="text-xs text-purple-400/60 mt-0.5">Lair actions occur on initiative count 20 (losing ties).</p>
            </div>
          </div>
        </div>
      )}

      {/* Combat Narrative panel — shows when it's this monster's turn */}
      {isActive && isMonster && !isLair && monsterData && (monsterData.hitFlavor?.length || monsterData.missFlavor?.length) && (
        <div className="mt-3 border-t border-border pt-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-wider text-accent-secondary font-semibold">Combat Narrative</span>
            {monsterData.hitFlavor && monsterData.hitFlavor.length > 0 && (
              <Button variant="primary" size="sm" onClick={() => rollNarrative('hit')}>
                ⚔ Hit
              </Button>
            )}
            {monsterData.missFlavor && monsterData.missFlavor.length > 0 && (
              <Button variant="secondary" size="sm" onClick={() => rollNarrative('miss')}>
                ↩ Miss
              </Button>
            )}
          </div>
          {narrativeText && (
            <div className="flex items-start gap-3 bg-card-alt rounded-md p-3 border border-accent-secondary/20">
              <div className="flex-1">
                <Badge color={narrativeType === 'hit' ? 'danger' : 'muted'}>
                  {narrativeType === 'hit' ? 'HIT' : 'MISS'}
                </Badge>
                <p className="read-aloud text-sm mt-1">{narrativeText}</p>
              </div>
              {onSpotlightNarrative && (
                <SpotlightButton onClick={() => onSpotlightNarrative(
                  `${participant.name} — ${narrativeType === 'hit' ? 'Hit' : 'Miss'}`,
                  narrativeText
                )} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// Per-Action Narrative Row (Hit / Miss)
// ═══════════════════════════════════════════

function ActionNarrativeRow({
  actionName,
  participantName,
  hitFlavor,
  missFlavor,
  onSpotlightNarrative,
}: {
  actionName: string;
  participantName: string;
  hitFlavor?: string[];
  missFlavor?: string[];
  onSpotlightNarrative?: (title: string, text: string) => void;
}) {
  const [result, setResult] = useState<{ type: 'hit' | 'miss'; text: string } | null>(null);

  const roll = (type: 'hit' | 'miss') => {
    const pool = type === 'hit' ? hitFlavor : missFlavor;
    if (!pool || pool.length === 0) return;
    const text = pool[Math.floor(Math.random() * pool.length)];
    setResult({ type, text });
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-xs text-body font-medium flex-1 truncate">{actionName}</span>
        {hitFlavor && hitFlavor.length > 0 && (
          <button
            onClick={() => roll('hit')}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold cursor-pointer transition-colors bg-danger/15 text-danger hover:bg-danger/25 border border-danger/30"
            title={`Roll hit narration for ${actionName}`}
          >
            <DiceIcon className="w-3 h-3" /> Hit
          </button>
        )}
        {missFlavor && missFlavor.length > 0 && (
          <button
            onClick={() => roll('miss')}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold cursor-pointer transition-colors bg-muted/15 text-muted hover:bg-muted/25 border border-muted/30"
            title={`Roll miss narration for ${actionName}`}
          >
            <DiceIcon className="w-3 h-3" /> Miss
          </button>
        )}
      </div>
      {result && (
        <div className="flex items-start gap-2 bg-background rounded px-2 py-1.5 border border-border">
          <Badge color={result.type === 'hit' ? 'danger' : 'muted'}>
            {result.type === 'hit' ? 'HIT' : 'MISS'}
          </Badge>
          <p className="read-aloud text-xs flex-1">{result.text}</p>
          {onSpotlightNarrative && (
            <SpotlightButton onClick={() => onSpotlightNarrative(
              `${participantName} — ${actionName} ${result.type === 'hit' ? 'Hit' : 'Miss'}`,
              result.text
            )} />
          )}
        </div>
      )}
    </div>
  );
}

function DiceIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
