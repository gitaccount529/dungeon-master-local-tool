'use client';

import { useState, useMemo } from 'react';
import { useAdventureContext } from '@/lib/AdventureContext';
import { makeImageResolver } from '@/hooks/useAdventure';
import type { Handout, Zone } from '@/lib/types';
import Button from '@/components/shared/Button';
import { v4 as uuidv4 } from 'uuid';

interface HandoutsProps {
  onSpotlightNarrative?: (title: string, text: string) => void;
  onSpotlightImage?: (title: string, imageUrl: string) => void;
}

const TYPE_BADGES: Record<Handout['type'], { label: string; color: string }> = {
  text: { label: 'Text', color: 'bg-accent/15 text-accent' },
  image: { label: 'Image', color: 'bg-info/15 text-info' },
  letter: { label: 'Letter', color: 'bg-accent-secondary/15 text-accent-secondary' },
  map: { label: 'Map', color: 'bg-gold/15 text-gold' },
  note: { label: 'Note', color: 'bg-warning/15 text-warning' },
};

export default function Handouts({ onSpotlightNarrative, onSpotlightImage }: HandoutsProps) {
  const { data: adventureData, slug, setHandouts } = useAdventureContext();
  const handouts = adventureData?.handouts ?? [];
  const resolveImg = makeImageResolver(slug);

  const allZones: Zone[] = useMemo(() => {
    if (!adventureData) return [];
    const z: Zone[] = [...(adventureData.zones.zones ?? [])];
    if (adventureData.zones.travelSection) z.unshift(adventureData.zones.travelSection);
    if (adventureData.zones.zoneOverview) z.unshift(adventureData.zones.zoneOverview);
    return z;
  }, [adventureData]);

  const [showCreate, setShowCreate] = useState(false);
  const [viewingHandout, setViewingHandout] = useState<Handout | null>(null);

  // Create form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<Handout['type']>('text');
  const [newContent, setNewContent] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newZoneId, setNewZoneId] = useState('');

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    const handout: Handout = {
      id: uuidv4(),
      title: newTitle.trim(),
      type: newType,
      content: newContent.trim(),
      imageUrl: newImageUrl.trim() || undefined,
      playerVisible: false,
      zoneId: newZoneId || undefined,
    };
    setHandouts([...handouts, handout]);
    setNewTitle('');
    setNewContent('');
    setNewImageUrl('');
    setNewZoneId('');
    setShowCreate(false);
  };

  const handleDelete = (id: string) => {
    setHandouts(handouts.filter(h => h.id !== id));
    if (viewingHandout?.id === id) setViewingHandout(null);
  };

  const handleToggleVisibility = (id: string) => {
    setHandouts(handouts.map(h => h.id === id ? { ...h, playerVisible: !h.playerVisible } : h));
  };

  const handleShowToPlayers = (handout: Handout) => {
    if (handout.type === 'image' && handout.imageUrl && onSpotlightImage) {
      onSpotlightImage(handout.title, resolveImg(handout.imageUrl));
    } else if (onSpotlightNarrative) {
      // For text/letter/note types, send as narrative
      const styledContent = handout.type === 'letter'
        ? `--- ${handout.title} ---\n\n${handout.content}`
        : handout.content;
      onSpotlightNarrative(handout.title, styledContent);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-wider text-accent-secondary font-semibold">Handouts</h2>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'Cancel' : '+ New Handout'}
        </Button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Handout title"
              className="bg-background border border-border rounded px-3 py-1.5 text-sm text-body focus:outline-none focus:border-accent"
              autoFocus
            />
            <select
              value={newType}
              onChange={e => setNewType(e.target.value as Handout['type'])}
              className="bg-background border border-border rounded px-3 py-1.5 text-sm text-body focus:outline-none focus:border-accent"
            >
              <option value="text">Text</option>
              <option value="image">Image</option>
              <option value="letter">Letter</option>
              <option value="map">Map</option>
              <option value="note">Note</option>
            </select>
          </div>

          {(newType === 'image' || newType === 'map') && (
            <input
              value={newImageUrl}
              onChange={e => setNewImageUrl(e.target.value)}
              placeholder="Image filename or URL"
              className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm text-body focus:outline-none focus:border-accent"
            />
          )}

          <textarea
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            placeholder={newType === 'letter' ? 'Letter text (will be styled with parchment frame)...' : 'Content text...'}
            rows={4}
            className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-body focus:outline-none focus:border-accent resize-y"
          />

          <div className="flex gap-3 items-center">
            <select
              value={newZoneId}
              onChange={e => setNewZoneId(e.target.value)}
              className="flex-1 bg-background border border-border rounded px-3 py-1.5 text-sm text-body focus:outline-none focus:border-accent"
            >
              <option value="">Link to zone (optional)</option>
              {allZones.map(z => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
            <Button variant="primary" size="sm" onClick={handleCreate} disabled={!newTitle.trim()}>
              Create
            </Button>
          </div>
        </div>
      )}

      {/* Handout Grid */}
      {handouts.length === 0 ? (
        <div className="text-center text-muted text-sm py-8 bg-card border border-border rounded-lg">
          No handouts yet. Create one to get started.
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {handouts.map(handout => {
            const badge = TYPE_BADGES[handout.type];
            const zone = handout.zoneId ? allZones.find(z => z.id === handout.zoneId) : null;
            return (
              <div
                key={handout.id}
                className="bg-card border border-border rounded-lg overflow-hidden hover:border-accent-secondary/50 transition-colors group"
              >
                {/* Preview area */}
                <div
                  className="aspect-video bg-card-alt flex items-center justify-center border-b border-border overflow-hidden relative cursor-pointer"
                  onClick={() => setViewingHandout(handout)}
                >
                  {(handout.type === 'image' || handout.type === 'map') && handout.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveImg(handout.imageUrl)}
                      alt={handout.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : handout.type === 'letter' ? (
                    <div className="p-3 w-full h-full bg-gradient-to-br from-amber-900/20 to-amber-800/10 flex items-center justify-center">
                      <p className="text-xs text-body/60 italic line-clamp-4 font-serif">{handout.content.slice(0, 120)}...</p>
                    </div>
                  ) : (
                    <div className="p-3 w-full h-full flex items-center justify-center">
                      <p className="text-xs text-muted line-clamp-4">{handout.content.slice(0, 120)}</p>
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="text-white/0 group-hover:text-white/80 text-sm font-medium transition-colors">View</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-body truncate flex-1">{handout.title}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${badge.color}`}>{badge.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    {zone && <span>{zone.name}</span>}
                    {handout.playerVisible && <span className="text-success">Visible</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Handout Viewer Modal */}
      {viewingHandout && (
        <HandoutViewer
          handout={viewingHandout}
          resolveImg={resolveImg}
          onClose={() => setViewingHandout(null)}
          onShowToPlayers={() => handleShowToPlayers(viewingHandout)}
          onToggleVisibility={() => handleToggleVisibility(viewingHandout.id)}
          onDelete={() => handleDelete(viewingHandout.id)}
          hasSpotlight={!!onSpotlightNarrative || !!onSpotlightImage}
        />
      )}
    </div>
  );
}

// ── Handout Viewer Modal ──

function HandoutViewer({
  handout,
  resolveImg,
  onClose,
  onShowToPlayers,
  onToggleVisibility,
  onDelete,
  hasSpotlight,
}: {
  handout: Handout;
  resolveImg: (path: string) => string;
  onClose: () => void;
  onShowToPlayers: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
  hasSpotlight: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative max-w-3xl w-full mx-4 bg-card border border-border rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-card-alt hover:bg-card text-muted hover:text-body flex items-center justify-center text-lg cursor-pointer"
        >
          &times;
        </button>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-body">{handout.title}</h2>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${TYPE_BADGES[handout.type].color}`}>
              {TYPE_BADGES[handout.type].label}
            </span>
          </div>

          {/* Image content */}
          {(handout.type === 'image' || handout.type === 'map') && handout.imageUrl && (
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveImg(handout.imageUrl)}
                alt={handout.title}
                className="max-h-[60vh] max-w-full object-contain rounded-lg"
              />
            </div>
          )}

          {/* Text content */}
          {handout.content && (
            <div className={`rounded-lg p-4 ${
              handout.type === 'letter'
                ? 'bg-gradient-to-br from-amber-900/20 to-amber-800/10 border border-amber-700/30 font-serif italic'
                : 'bg-card-alt border border-border'
            }`}>
              <p className="text-sm text-body whitespace-pre-wrap leading-relaxed">{handout.content}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            {hasSpotlight && (
              <Button variant="spotlight" size="sm" onClick={onShowToPlayers}>
                Show to Players
              </Button>
            )}
            <button
              onClick={onToggleVisibility}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                handout.playerVisible
                  ? 'bg-success/15 text-success'
                  : 'bg-card-alt text-muted hover:text-body border border-border'
              }`}
            >
              {handout.playerVisible ? 'Player Visible' : 'Hidden from Players'}
            </button>
            <div className="flex-1" />
            <button
              onClick={onDelete}
              className="text-xs text-danger/60 hover:text-danger px-2 py-1 rounded hover:bg-danger/10 transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
