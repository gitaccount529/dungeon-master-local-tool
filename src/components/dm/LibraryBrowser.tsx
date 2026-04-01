'use client';

import { useState, useCallback, useMemo } from 'react';
import { useLibrary } from '@/hooks/useLibrary';
import { useAdventureContext } from '@/lib/AdventureContext';
import Button from '@/components/shared/Button';
import EditableText from '@/components/shared/EditableText';
import CreateLibraryItemModal from '@/components/dm/CreateLibraryItemModal';
import BulkImportModal from '@/components/dm/BulkImportModal';
import type {
  LibraryType, LibrarySource, LibraryMonster, TreasureItem, LocationTemplate,
  ChallengeTemplate, AmbiancePreset, CharacterClass,
} from '@/lib/types';

// ═══════════════════════════════════════════
// Sub-tab config
// ═══════════════════════════════════════════

const SUB_TABS: { id: LibraryType; label: string }[] = [
  { id: 'monsters', label: 'Monsters' },
  { id: 'treasures', label: 'Treasures' },
  { id: 'locations', label: 'Locations' },
  { id: 'challenges', label: 'Challenges' },
  { id: 'ambiance', label: 'Ambiance' },
  { id: 'classes', label: 'Classes' },
];

// ═══════════════════════════════════════════
// Rarity color map
// ═══════════════════════════════════════════

const RARITY_COLORS: Record<string, string> = {
  common: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  uncommon: 'bg-green-500/20 text-green-400 border-green-500/30',
  rare: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'very-rare': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  legendary: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  artifact: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const SOURCE_COLORS: Record<string, string> = {
  srd: 'bg-blue-500/20 text-blue-400',
  manual: 'bg-gray-500/20 text-gray-400',
  'ai-generated': 'bg-purple-500/20 text-purple-400',
  imported: 'bg-green-500/20 text-green-400',
};

// ═══════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════

export default function LibraryBrowser() {
  const [activeType, setActiveType] = useState<LibraryType>('monsters');
  const [createOpen, setCreateOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {SUB_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveType(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase transition-colors cursor-pointer
                ${activeType === tab.id
                  ? 'bg-accent text-background'
                  : 'bg-card-alt text-muted hover:text-body border border-border'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
            + Add Item
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setBulkOpen(true)}>
            Bulk Import
          </Button>
        </div>
      </div>

      {/* Type-specific panel */}
      <LibraryPanel type={activeType} />

      {/* Modals */}
      {createOpen && (
        <CreateLibraryItemModal
          type={activeType}
          onClose={() => setCreateOpen(false)}
        />
      )}
      {bulkOpen && (
        <BulkImportModal
          type={activeType}
          onClose={() => setBulkOpen(false)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// LibraryPanel — uses the hook with proper generic
// ═══════════════════════════════════════════

function LibraryPanel({ type }: { type: LibraryType }) {
  switch (type) {
    case 'monsters': return <MonsterPanel />;
    case 'treasures': return <TreasurePanel />;
    case 'locations': return <LocationPanel />;
    case 'challenges': return <ChallengePanel />;
    case 'ambiance': return <AmbiancePanel />;
    case 'classes': return <ClassesPanel />;
  }
}

// ═══════════════════════════════════════════
// Shared search bar + grid wrapper
// ═══════════════════════════════════════════

interface LibraryGridProps<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearch: (q: string, tags?: string[]) => void;
  emptyLabel: string;
  renderCard: (item: T) => React.ReactNode;
}

function LibraryGrid<T extends { id: string; source?: string; tags?: string[] }>({
  items, loading, error, searchQuery, setSearch, emptyLabel, renderCard,
}: LibraryGridProps<T>) {
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string[]>([]);

  // Gather all unique tags from items
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const item of items) {
      if (item.tags) {
        for (const tag of item.tags) tagSet.add(tag);
      }
    }
    return Array.from(tagSet).sort();
  }, [items]);

  // Apply client-side source and tag filters
  const filteredItems = useMemo(() => {
    let result = items;
    if (sourceFilter !== 'all') {
      result = result.filter(i => i.source === sourceFilter);
    }
    if (tagFilter.length > 0) {
      result = result.filter(i => i.tags && tagFilter.some(t => i.tags!.includes(t)));
    }
    return result;
  }, [items, sourceFilter, tagFilter]);

  const toggleTag = useCallback((tag: string) => {
    setTagFilter(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }, []);

  return (
    <>
      {/* Search bar + source filter */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          defaultValue={searchQuery}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, tags..."
          className="flex-1 bg-background border border-border rounded px-3 py-2 text-sm text-body
                     placeholder:text-muted/50 focus:outline-none focus:border-accent"
        />
        <select
          value={sourceFilter}
          onChange={e => setSourceFilter(e.target.value)}
          className="bg-background border border-border rounded px-3 py-2 text-sm text-body
                     focus:outline-none focus:border-accent cursor-pointer"
        >
          <option value="all">All Sources</option>
          <option value="manual">Manual</option>
          <option value="imported">Imported</option>
          <option value="srd">SRD</option>
          <option value="ai-generated">AI-Generated</option>
        </select>
      </div>

      {/* Tag chips */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium transition-colors cursor-pointer
                ${tagFilter.includes(tag)
                  ? 'bg-accent text-background'
                  : 'bg-card-alt text-muted hover:text-body border border-border'
                }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Loading / error */}
      {loading && (
        <div className="text-center py-12 text-muted text-sm">Loading...</div>
      )}
      {error && (
        <div className="text-center py-8 text-danger text-sm">{error}</div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredItems.length === 0 && (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <p className="text-muted">{emptyLabel}</p>
        </div>
      )}

      {/* Card grid */}
      {!loading && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <div key={item.id}>{renderCard(item)}</div>
          ))}
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════
// Shared card wrapper with source badge, edit, delete
// ═══════════════════════════════════════════

function CardShell({
  source, editing, onEdit, onDelete, onImport, children,
}: {
  source: string;
  editing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onImport: () => void;
  children: React.ReactNode;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:border-accent/30 transition-all relative group">
      {/* Source badge */}
      <span className={`absolute top-2 right-2 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${SOURCE_COLORS[source] ?? SOURCE_COLORS.manual}`}>
        {source === 'ai-generated' ? 'AI' : source}
      </span>

      {children}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
        <button onClick={onImport} className="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-accent/20 text-accent hover:bg-accent/30 transition-colors cursor-pointer font-medium">
          Import to Adventure
        </button>
        <div className="flex-1" />
        <button onClick={onEdit} className="p-1 text-muted hover:text-accent transition-colors cursor-pointer" title="Edit">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
        </button>
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <button onClick={onDelete} className="text-[10px] px-1.5 py-0.5 rounded bg-danger/20 text-danger hover:bg-danger/30 cursor-pointer">Yes</button>
            <button onClick={() => setConfirmDelete(false)} className="text-[10px] px-1.5 py-0.5 rounded bg-card-alt text-muted hover:text-body cursor-pointer">No</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} className="p-1 text-muted hover:text-danger transition-colors cursor-pointer" title="Delete">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Badge helper
// ═══════════════════════════════════════════

function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-block text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-medium ${className}`}>
      {children}
    </span>
  );
}

// ═══════════════════════════════════════════
// Monster Panel
// ═══════════════════════════════════════════

function MonsterPanel() {
  const lib = useLibrary<LibraryMonster>('monsters');
  const { activeSlug } = useAdventureContext();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleImport = useCallback(async (id: string) => {
    if (!activeSlug) return;
    try { await lib.importToAdventure(id, activeSlug); } catch { /* handled by hook */ }
  }, [lib, activeSlug]);

  return (
    <LibraryGrid
      items={lib.items}
      loading={lib.loading}
      error={lib.error}
      searchQuery={lib.searchQuery}
      setSearch={lib.setSearch}
      emptyLabel="No monsters in library yet. Add manually or bulk import."
      renderCard={(m: LibraryMonster) => (
        <CardShell
          source={m.source}
          editing={editingId === m.id}
          onEdit={() => setEditingId(editingId === m.id ? null : m.id)}
          onDelete={() => lib.deleteItem(m.id)}
          onImport={() => handleImport(m.id)}
        >
          <div className="cursor-pointer" onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}>
            <div className="flex items-start gap-3">
              {m.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.imageUrl}
                  alt={m.name}
                  className="w-10 h-10 rounded object-cover flex-shrink-0 border border-border"
                />
              )}
              <div className="min-w-0 flex-1">
                {editingId === m.id ? (
                  <EditableText value={m.name} onSave={v => lib.patchItem(m.id, { name: v })} className="text-sm font-bold text-accent" />
                ) : (
                  <h4 className="text-sm font-bold text-accent tracking-wider pr-12">{m.name}</h4>
                )}
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <Badge className="bg-accent/20 text-accent">CR {m.cr}</Badge>
                  {m.role && <Badge className="bg-info/20 text-info">{m.role}</Badge>}
                  <Badge className="bg-card-alt text-muted border border-border">{m.type}</Badge>
                </div>
              </div>
            </div>
          </div>
          {expandedId === m.id && (
            <div className="mt-3 pt-3 border-t border-border text-xs text-muted space-y-1">
              {m.imageUrl && (
                <div className="mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.imageUrl}
                    alt={m.name}
                    className="w-full max-h-48 object-contain rounded border border-border"
                  />
                </div>
              )}
              <p><span className="text-body font-medium">AC:</span> {m.ac} {m.acType && `(${m.acType})`} | <span className="text-body font-medium">HP:</span> {m.hp} {m.hpFormula && `(${m.hpFormula})`}</p>
              <p><span className="text-body font-medium">Speed:</span> {m.speed}</p>
              {m.stats && (
                <div className="flex gap-2 text-[10px]">
                  {Object.entries(m.stats).map(([k, v]) => (
                    <span key={k} className="bg-card-alt px-1.5 py-0.5 rounded"><span className="uppercase text-body">{k}</span> {v as number}</span>
                  ))}
                </div>
              )}
              {m.traits && m.traits.length > 0 && (
                <div className="mt-2">
                  <span className="text-body font-medium">Traits:</span>
                  {m.traits.map((t, i) => <p key={i} className="ml-2"><span className="text-body">{t.name}:</span> {t.description}</p>)}
                </div>
              )}
              {m.actions && m.actions.length > 0 && (
                <div className="mt-2">
                  <span className="text-body font-medium">Actions:</span>
                  {m.actions.map((a, i) => <p key={i} className="ml-2"><span className="text-body">{a.name}:</span> {a.description}</p>)}
                </div>
              )}
            </div>
          )}
        </CardShell>
      )}
    />
  );
}

// ═══════════════════════════════════════════
// Treasure Panel
// ═══════════════════════════════════════════

function TreasurePanel() {
  const lib = useLibrary<TreasureItem>('treasures');
  const { activeSlug } = useAdventureContext();
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleImport = useCallback(async (id: string) => {
    if (!activeSlug) return;
    try { await lib.importToAdventure(id, activeSlug); } catch { /* */ }
  }, [lib, activeSlug]);

  return (
    <LibraryGrid
      items={lib.items}
      loading={lib.loading}
      error={lib.error}
      searchQuery={lib.searchQuery}
      setSearch={lib.setSearch}
      emptyLabel="No treasures in library yet. Add manually or bulk import."
      renderCard={(t: TreasureItem) => (
        <CardShell
          source={t.source}
          editing={editingId === t.id}
          onEdit={() => setEditingId(editingId === t.id ? null : t.id)}
          onDelete={() => lib.deleteItem(t.id)}
          onImport={() => handleImport(t.id)}
        >
          {editingId === t.id ? (
            <EditableText value={t.name} onSave={v => lib.patchItem(t.id, { name: v })} className="text-sm font-bold text-accent" />
          ) : (
            <h4 className="text-sm font-bold text-accent tracking-wider pr-12">{t.name}</h4>
          )}
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <Badge className={RARITY_COLORS[t.rarity] ?? RARITY_COLORS.common}>{t.rarity.replace('-', ' ')}</Badge>
            <Badge className="bg-card-alt text-muted border border-border">{t.type}</Badge>
            {t.attunement && <Badge className="bg-warning/20 text-warning">Attunement</Badge>}
          </div>
          {t.description && (
            <p className="text-xs text-muted mt-2 line-clamp-2">{t.description}</p>
          )}
        </CardShell>
      )}
    />
  );
}

// ═══════════════════════════════════════════
// Location Panel
// ═══════════════════════════════════════════

function LocationPanel() {
  const lib = useLibrary<LocationTemplate>('locations');
  const { activeSlug } = useAdventureContext();
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleImport = useCallback(async (id: string) => {
    if (!activeSlug) return;
    try { await lib.importToAdventure(id, activeSlug); } catch { /* */ }
  }, [lib, activeSlug]);

  return (
    <LibraryGrid
      items={lib.items}
      loading={lib.loading}
      error={lib.error}
      searchQuery={lib.searchQuery}
      setSearch={lib.setSearch}
      emptyLabel="No locations in library yet. Add manually or bulk import."
      renderCard={(loc: LocationTemplate) => (
        <CardShell
          source={loc.source}
          editing={editingId === loc.id}
          onEdit={() => setEditingId(editingId === loc.id ? null : loc.id)}
          onDelete={() => lib.deleteItem(loc.id)}
          onImport={() => handleImport(loc.id)}
        >
          {editingId === loc.id ? (
            <EditableText value={loc.name} onSave={v => lib.patchItem(loc.id, { name: v })} className="text-sm font-bold text-accent" />
          ) : (
            <h4 className="text-sm font-bold text-accent tracking-wider pr-12">{loc.name}</h4>
          )}
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <Badge className="bg-green-500/20 text-green-400">{loc.environment}</Badge>
          </div>
          {loc.description && (
            <p className="text-xs text-muted mt-2 line-clamp-2">{loc.description}</p>
          )}
        </CardShell>
      )}
    />
  );
}

// ═══════════════════════════════════════════
// Challenge Panel
// ═══════════════════════════════════════════

function ChallengePanel() {
  const lib = useLibrary<ChallengeTemplate>('challenges');
  const { activeSlug } = useAdventureContext();
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleImport = useCallback(async (id: string) => {
    if (!activeSlug) return;
    try { await lib.importToAdventure(id, activeSlug); } catch { /* */ }
  }, [lib, activeSlug]);

  return (
    <LibraryGrid
      items={lib.items}
      loading={lib.loading}
      error={lib.error}
      searchQuery={lib.searchQuery}
      setSearch={lib.setSearch}
      emptyLabel="No challenges in library yet. Add manually or bulk import."
      renderCard={(ch: ChallengeTemplate) => (
        <CardShell
          source={ch.source}
          editing={editingId === ch.id}
          onEdit={() => setEditingId(editingId === ch.id ? null : ch.id)}
          onDelete={() => lib.deleteItem(ch.id)}
          onImport={() => handleImport(ch.id)}
        >
          {editingId === ch.id ? (
            <EditableText value={ch.name} onSave={v => lib.patchItem(ch.id, { name: v })} className="text-sm font-bold text-accent" />
          ) : (
            <h4 className="text-sm font-bold text-accent tracking-wider pr-12">{ch.name}</h4>
          )}
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <Badge className="bg-success/20 text-success">{ch.successThreshold} to pass</Badge>
            <Badge className="bg-danger/20 text-danger">{ch.failureThreshold} to fail</Badge>
          </div>
          {ch.skills && ch.skills.length > 0 && (
            <p className="text-xs text-muted mt-2 line-clamp-1">
              Skills: {ch.skills.map(s => s.skill).join(', ')}
            </p>
          )}
        </CardShell>
      )}
    />
  );
}

// ═══════════════════════════════════════════
// Ambiance Panel
// ═══════════════════════════════════════════

function AmbiancePanel() {
  const lib = useLibrary<AmbiancePreset>('ambiance');
  const { activeSlug } = useAdventureContext();
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleImport = useCallback(async (id: string) => {
    if (!activeSlug) return;
    try { await lib.importToAdventure(id, activeSlug); } catch { /* */ }
  }, [lib, activeSlug]);

  return (
    <LibraryGrid
      items={lib.items}
      loading={lib.loading}
      error={lib.error}
      searchQuery={lib.searchQuery}
      setSearch={lib.setSearch}
      emptyLabel="No ambiance presets in library yet. Add manually or bulk import."
      renderCard={(a: AmbiancePreset) => {
        const musicCount = a.music?.length ?? 0;
        const soundCount = a.sounds?.length ?? 0;
        return (
          <CardShell
            source={a.source}
            editing={editingId === a.id}
            onEdit={() => setEditingId(editingId === a.id ? null : a.id)}
            onDelete={() => lib.deleteItem(a.id)}
            onImport={() => handleImport(a.id)}
          >
            {editingId === a.id ? (
              <EditableText value={a.name} onSave={v => lib.patchItem(a.id, { name: v })} className="text-sm font-bold text-accent" />
            ) : (
              <h4 className="text-sm font-bold text-accent tracking-wider pr-12">{a.name}</h4>
            )}
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <Badge className="bg-green-500/20 text-green-400">{a.environment}</Badge>
              <Badge className="bg-card-alt text-muted border border-border">
                {musicCount} music + {soundCount} sounds
              </Badge>
            </div>
            {a.description && (
              <p className="text-xs text-muted mt-2 line-clamp-2">{a.description}</p>
            )}
          </CardShell>
        );
      }}
    />
  );
}

// ═══════════════════════════════════════════
// Classes Panel
// ═══════════════════════════════════════════

function ClassesPanel() {
  const lib = useLibrary<CharacterClass>('classes');
  const { activeSlug } = useAdventureContext();
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleImport = useCallback(async (id: string) => {
    if (!activeSlug) return;
    try { await lib.importToAdventure(id, activeSlug); } catch { /* */ }
  }, [lib, activeSlug]);

  return (
    <LibraryGrid
      items={lib.items}
      loading={lib.loading}
      error={lib.error}
      searchQuery={lib.searchQuery}
      setSearch={lib.setSearch}
      emptyLabel="No classes in library yet. Add manually or bulk import."
      renderCard={(c: CharacterClass) => (
        <CardShell
          source={c.source}
          editing={editingId === c.id}
          onEdit={() => setEditingId(editingId === c.id ? null : c.id)}
          onDelete={() => lib.deleteItem(c.id)}
          onImport={() => handleImport(c.id)}
        >
          <div className="flex gap-3">
            {/* Class image or placeholder */}
            {c.imageUrl ? (
              <img src={c.imageUrl} alt={c.name} className="w-12 h-12 rounded object-cover flex-shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded bg-card-alt border border-border flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M12 2L2 7l10 5 10-5-10-5Z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              {editingId === c.id ? (
                <EditableText value={c.name} onSave={v => lib.patchItem(c.id, { name: v })} className="text-sm font-bold text-accent" />
              ) : (
                <h4 className="text-sm font-bold text-accent tracking-wider pr-12">{c.name}</h4>
              )}
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <Badge className="bg-red-500/20 text-red-400">{c.hitDie}</Badge>
                <Badge className="bg-blue-500/20 text-blue-400">{c.primaryAbility}</Badge>
              </div>
            </div>
          </div>
          {c.description && (
            <p className="text-xs text-muted mt-2 line-clamp-2">{c.description}</p>
          )}
        </CardShell>
      )}
    />
  );
}
