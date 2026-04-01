'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Button from '@/components/shared/Button';

// ═══════════════════════════════════════════
// Types
// ═══════════════════════════════════════════

interface SessionNoteContent {
  whatHappened: string;
  plotHooks: string;
  npcNotes: string;
  lootAwarded: string;
  nextSession: string;
}

interface SessionNote {
  id: string;
  title: string;
  date: string;
  content: SessionNoteContent;
}

interface SpotlightHistoryEntry {
  id: number;
  type: string;
  content: string;
  sent_at: string;
}

const EMPTY_CONTENT: SessionNoteContent = {
  whatHappened: '',
  plotHooks: '',
  npcNotes: '',
  lootAwarded: '',
  nextSession: '',
};

// ═══════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════

interface SessionNotesProps {
  onSpotlightNarrative?: (title: string, text: string) => void;
}

export default function SessionNotes({ onSpotlightNarrative }: SessionNotesProps = {}) {
  const [sessions, setSessions] = useState<SessionNote[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [spotlightHistory, setSpotlightHistory] = useState<SpotlightHistoryEntry[]>([]);
  const [showSpotlightHistory, setShowSpotlightHistory] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load sessions from session_state
  useEffect(() => {
    async function loadSessions() {
      try {
        const res = await fetch('/api/session?key=session_notes');
        if (res.ok) {
          const { value } = await res.json();
          if (value) {
            const parsed: SessionNote[] = JSON.parse(value);
            setSessions(parsed);
            if (parsed.length > 0) {
              setActiveSessionId(parsed[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load session notes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, []);

  // Save sessions (debounced)
  const saveSessions = useCallback((updatedSessions: SessionNote[]) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      fetch('/api/session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'session_notes', value: JSON.stringify(updatedSessions) }),
      }).catch(err => console.error('Failed to save session notes:', err));
    }, 1000);
  }, []);

  const activeSession = sessions.find(s => s.id === activeSessionId) ?? null;

  const createNewSession = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const newSession: SessionNote = {
      id: `session-${Date.now()}`,
      title: `Session - ${dateStr}`,
      date: dateStr,
      content: { ...EMPTY_CONTENT },
    };
    const updated = [newSession, ...sessions];
    setSessions(updated);
    setActiveSessionId(newSession.id);
    saveSessions(updated);
  };

  const updateSessionTitle = (title: string) => {
    if (!activeSessionId) return;
    const updated = sessions.map(s =>
      s.id === activeSessionId ? { ...s, title } : s
    );
    setSessions(updated);
    saveSessions(updated);
  };

  const updateSessionContent = (field: keyof SessionNoteContent, value: string) => {
    if (!activeSessionId) return;
    const updated = sessions.map(s =>
      s.id === activeSessionId
        ? { ...s, content: { ...s.content, [field]: value } }
        : s
    );
    setSessions(updated);
    saveSessions(updated);
  };

  const deleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    if (activeSessionId === id) {
      setActiveSessionId(updated.length > 0 ? updated[0].id : null);
    }
    saveSessions(updated);
  };

  const loadSpotlightHistory = async () => {
    try {
      const res = await fetch('/api/spotlight?history=10');
      if (res.ok) {
        const data = await res.json();
        setSpotlightHistory(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load spotlight history:', err);
    }
    setShowSpotlightHistory(true);
  };

  if (loading) {
    return <div className="text-muted text-center py-8">Loading session notes...</div>;
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-160px)]">
      {/* Session list sidebar */}
      <nav className="w-[200px] flex-shrink-0 overflow-y-auto bg-card border border-border rounded-lg flex flex-col">
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs uppercase tracking-wider text-accent font-semibold">Sessions</h2>
          </div>
          <Button variant="primary" size="sm" onClick={createNewSession} className="w-full">
            + New Session
          </Button>
        </div>
        <div className="p-1 flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <p className="text-xs text-muted px-3 py-4 text-center">No sessions yet. Click &quot;New Session&quot; to start.</p>
          ) : (
            sessions.map(session => (
              <button
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors cursor-pointer mb-0.5
                  ${activeSessionId === session.id
                    ? 'bg-accent/15 text-accent border-l-2 border-accent'
                    : 'text-muted hover:text-body hover:bg-card-alt'
                  }`}
              >
                <span className="block font-medium text-xs truncate">{session.title}</span>
                <span className="block text-[10px] text-muted">{session.date}</span>
              </button>
            ))
          )}
        </div>
      </nav>

      {/* Note editor */}
      <main className="flex-1 overflow-y-auto">
        {!activeSession ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <p className="text-muted">No session selected.</p>
              <Button variant="primary" size="sm" onClick={createNewSession}>
                Create Your First Session
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Session title */}
            <div className="flex items-center gap-3">
              <input
                value={activeSession.title}
                onChange={e => updateSessionTitle(e.target.value)}
                className="flex-1 bg-background border border-border rounded px-4 py-2 text-lg font-semibold text-body focus:outline-none focus:border-accent"
              />
              <span className="text-xs text-muted">{activeSession.date}</span>
              <button
                onClick={() => deleteSession(activeSession.id)}
                className="text-xs text-danger/60 hover:text-danger px-2 py-1 rounded hover:bg-danger/10 transition-colors cursor-pointer"
                title="Delete session"
              >
                Delete
              </button>
            </div>

            {/* Spotlight import button */}
            <div className="flex gap-2">
              <button
                onClick={loadSpotlightHistory}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium bg-accent-secondary/15 text-accent-secondary hover:bg-accent-secondary/25 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 2v10l4.24 4.24" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                Import Recent Spotlights
              </button>
            </div>

            {/* Spotlight history panel */}
            {showSpotlightHistory && (
              <div className="bg-card border border-accent-secondary/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs uppercase tracking-wider text-accent-secondary font-semibold">Recent Spotlight Events</h4>
                  <button
                    onClick={() => setShowSpotlightHistory(false)}
                    className="text-xs text-muted hover:text-body cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                {spotlightHistory.length === 0 ? (
                  <p className="text-xs text-muted">No spotlight history found.</p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {spotlightHistory.map(entry => {
                      let parsed: Record<string, unknown> = {};
                      try { parsed = JSON.parse(entry.content); } catch { /* ignore */ }
                      const summary = (parsed.title as string) || (parsed.text as string) || entry.type;
                      return (
                        <div key={entry.id} className="flex items-start gap-2 text-xs">
                          <span className="text-muted flex-shrink-0 w-16">{new Date(entry.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="px-1.5 py-0.5 rounded bg-accent-secondary/15 text-accent-secondary font-medium flex-shrink-0">{entry.type}</span>
                          <span className="text-body truncate flex-1">{String(summary)}</span>
                          <button
                            onClick={() => {
                              const current = activeSession.content.whatHappened;
                              updateSessionContent('whatHappened', current + (current ? '\n' : '') + `[${entry.type}] ${String(summary)}`);
                            }}
                            className="text-accent hover:text-accent/80 cursor-pointer flex-shrink-0"
                            title="Add to What Happened"
                          >
                            + Add
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Note sections */}
            <NoteSection
              title="What Happened"
              accent="accent"
              value={activeSession.content.whatHappened}
              onChange={v => updateSessionContent('whatHappened', v)}
              placeholder="Main session recap — what did the party do?"
              tall
            />
            <NoteSection
              title="Plot Hooks"
              accent="accent-secondary"
              value={activeSession.content.plotHooks}
              onChange={v => updateSessionContent('plotHooks', v)}
              placeholder="Bullet list of hooks introduced or advanced..."
            />
            <NoteSection
              title="NPC Notes"
              accent="info"
              value={activeSession.content.npcNotes}
              onChange={v => updateSessionContent('npcNotes', v)}
              placeholder="Notes about NPCs encountered this session..."
            />
            <NoteSection
              title="Loot Awarded"
              accent="gold"
              value={activeSession.content.lootAwarded}
              onChange={v => updateSessionContent('lootAwarded', v)}
              placeholder="Items and gold given to the party..."
              onSendToPlayers={onSpotlightNarrative && activeSession.content.lootAwarded.trim()
                ? () => onSpotlightNarrative!('Rewards & Loot', activeSession.content.lootAwarded)
                : undefined
              }
            />
            <NoteSection
              title="TODO for Next Session"
              accent="warning"
              value={activeSession.content.nextSession}
              onChange={v => updateSessionContent('nextSession', v)}
              placeholder="Prep notes for the next session..."
            />
          </div>
        )}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════
// Collapsible Note Section
// ═══════════════════════════════════════════

function NoteSection({
  title,
  accent,
  value,
  onChange,
  placeholder,
  tall = false,
  onSendToPlayers,
}: {
  title: string;
  accent: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  tall?: boolean;
  onSendToPlayers?: () => void;
}) {
  const [open, setOpen] = useState(true);

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
      <div className="px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <h3 className={`text-xs uppercase tracking-wider font-semibold ${colorMap[accent] || 'text-accent'}`}>
            {title}
          </h3>
          <span className="text-muted text-xs">{open ? '\u25B2' : '\u25BC'}</span>
        </button>
        {onSendToPlayers && (
          <button
            onClick={onSendToPlayers}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold bg-info/15 text-info hover:bg-info/25 transition-colors cursor-pointer uppercase tracking-wider"
            title="Send to player screen"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Send to Players
          </button>
        )}
      </div>
      {open && (
        <div className="px-4 pb-4">
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full bg-background border border-border rounded px-3 py-2 text-sm text-body
                       placeholder:text-muted/50 focus:outline-none focus:border-accent resize-y
                       ${tall ? 'min-h-[200px]' : 'min-h-[100px]'}`}
          />
        </div>
      )}
    </div>
  );
}
