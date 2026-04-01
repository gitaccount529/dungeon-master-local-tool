'use client';

import { useState, useEffect, useRef } from 'react';
import type { ReadAloudStyle, GuideSectionId, Adventure } from '@/lib/types';
import { DEFAULT_SECTION_ORDER } from '@/lib/types';

const SECTION_LABELS: Record<GuideSectionId, string> = {
  readAloud: 'Read-Aloud Text',
  map: 'Zone Map',
  senses: 'Senses (DM Ref)',
  ambiance: 'Ambiance',
  features: 'Features & Hazards',
  encounters: 'Encounters',
  challenges: 'Linked Challenges',
  npcs: 'NPCs & Dialogue',
  treasure: 'Treasure',
  dmNotes: 'DM Notes',
  campaign: 'Campaign Integration',
};

const READ_ALOUD_STYLES: { id: ReadAloudStyle; label: string; description: string }[] = [
  { id: 'punchy', label: 'Punchy & Direct', description: '60-80 words. Short, clear sentences. Key details first.' },
  { id: 'atmospheric', label: 'Atmospheric Short', description: '80-120 words. One sensory hook per paragraph. Concise mood.' },
  { id: 'immersive', label: 'Immersive Narrative', description: '150-250 words. Full literary descriptions with metaphor.' },
];

type SettingsTab = 'display' | 'adventure';

const SETTINGS_TABS: { id: SettingsTab; label: string }[] = [
  { id: 'display', label: 'Display' },
  { id: 'adventure', label: 'Adventure' },
];

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  readAloudStyle: ReadAloudStyle;
  onReadAloudStyleChange: (style: ReadAloudStyle) => void;
  sectionOrder: GuideSectionId[];
  onSectionOrderChange: (order: GuideSectionId[]) => void;
  sectionVisibility: Record<string, boolean>;
  onSectionVisibilityChange: (visibility: Record<string, boolean>) => void;
  adventure?: Adventure | null;
  onPatchAdventure?: (updates: Record<string, unknown>) => void;
}

export default function SettingsModal({ open, onClose, readAloudStyle, onReadAloudStyleChange, sectionOrder, onSectionOrderChange, sectionVisibility, onSectionVisibilityChange, adventure, onPatchAdventure }: SettingsModalProps) {
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>('display');
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <h2 className="text-sm font-bold uppercase tracking-wider text-accent">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-body cursor-pointer text-lg leading-none"
          >
            &times;
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-border flex-shrink-0">
          {SETTINGS_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSettingsTab(tab.id)}
              className={`flex-1 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                activeSettingsTab === tab.id
                  ? 'text-accent border-b-2 border-accent bg-accent/5'
                  : 'text-muted hover:text-body'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-6 overflow-y-auto flex-1">
          {activeSettingsTab === 'display' && (
            <DisplayTab
              readAloudStyle={readAloudStyle}
              onReadAloudStyleChange={onReadAloudStyleChange}
              sectionOrder={sectionOrder}
              onSectionOrderChange={onSectionOrderChange}
              sectionVisibility={sectionVisibility}
              onSectionVisibilityChange={onSectionVisibilityChange}
            />
          )}

          {activeSettingsTab === 'adventure' && (
            <AdventureTab
              adventure={adventure}
              onPatchAdventure={onPatchAdventure}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border bg-card-alt flex-shrink-0">
          <p className="text-[11px] text-muted text-center">
            {activeSettingsTab === 'adventure'
              ? 'Changes are saved automatically.'
              : 'Customize how the Session Guide displays information.'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Display Tab ──

function DisplayTab({
  readAloudStyle,
  onReadAloudStyleChange,
  sectionOrder,
  onSectionOrderChange,
  sectionVisibility,
  onSectionVisibilityChange,
}: {
  readAloudStyle: ReadAloudStyle;
  onReadAloudStyleChange: (style: ReadAloudStyle) => void;
  sectionOrder: GuideSectionId[];
  onSectionOrderChange: (order: GuideSectionId[]) => void;
  sectionVisibility: Record<string, boolean>;
  onSectionVisibilityChange: (visibility: Record<string, boolean>) => void;
}) {
  return (
    <>
      {/* Read-Aloud Style */}
      <div>
        <label className="text-xs uppercase tracking-wider text-accent-secondary font-semibold block mb-2">
          Read-Aloud Style
        </label>
        <div className="space-y-1.5">
          {READ_ALOUD_STYLES.map(style => (
            <label
              key={style.id}
              className={`flex items-start gap-3 p-2.5 rounded-md border cursor-pointer transition-all ${
                readAloudStyle === style.id
                  ? 'bg-accent-secondary/10 border-accent-secondary/40'
                  : 'bg-card-alt border-border/50 hover:border-border'
              }`}
            >
              <input
                type="radio"
                name="readAloudStyle"
                value={style.id}
                checked={readAloudStyle === style.id}
                onChange={() => onReadAloudStyleChange(style.id)}
                className="accent-accent-secondary mt-0.5"
              />
              <div>
                <span className={`text-sm font-medium ${readAloudStyle === style.id ? 'text-accent-secondary' : 'text-body'}`}>
                  {style.label}
                </span>
                <p className="text-xs text-muted mt-0.5">{style.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Guide Section Order */}
      <div>
        <label className="text-xs uppercase tracking-wider text-warning font-semibold block mb-2">
          Guide Section Order
        </label>
        <p className="text-[11px] text-muted mb-2">Drag or use arrows to reorder sections in the Session Guide.</p>
        <div className="space-y-1">
          {sectionOrder.map((id, idx) => {
            const isVisible = sectionVisibility[id] !== false;
            return (
            <div key={id} className={`flex items-center gap-2 bg-card-alt rounded-md px-2.5 py-1.5 border border-border/50 ${!isVisible ? 'opacity-50' : ''}`}>
              <button
                onClick={() => onSectionVisibilityChange({ ...sectionVisibility, [id]: !isVisible })}
                className={`flex-shrink-0 cursor-pointer transition-colors ${isVisible ? 'text-accent-secondary' : 'text-muted/40 hover:text-muted'}`}
                title={isVisible ? 'Hide section' : 'Show section'}
              >
                {isVisible ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
              <span className={`text-sm flex-1 ${isVisible ? 'text-body' : 'text-muted'}`}>{SECTION_LABELS[id]}</span>
              <button
                disabled={idx === 0}
                onClick={() => {
                  const next = [...sectionOrder];
                  [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                  onSectionOrderChange(next);
                }}
                className="text-muted hover:text-accent disabled:opacity-20 cursor-pointer disabled:cursor-default text-xs px-1"
                title="Move up"
              >&#9650;</button>
              <button
                disabled={idx === sectionOrder.length - 1}
                onClick={() => {
                  const next = [...sectionOrder];
                  [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                  onSectionOrderChange(next);
                }}
                className="text-muted hover:text-accent disabled:opacity-20 cursor-pointer disabled:cursor-default text-xs px-1"
                title="Move down"
              >&#9660;</button>
            </div>
            );
          })}
        </div>
        <button
          onClick={() => onSectionOrderChange([...DEFAULT_SECTION_ORDER])}
          className="text-[11px] text-muted hover:text-accent cursor-pointer mt-2"
        >
          Reset to default order
        </button>
      </div>
    </>
  );
}

// ── Adventure Tab ──

function AdventureTab({
  adventure,
  onPatchAdventure,
}: {
  adventure?: Adventure | null;
  onPatchAdventure?: (updates: Record<string, unknown>) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [headerPrimary, setHeaderPrimary] = useState('');
  const [headerSecondary, setHeaderSecondary] = useState('');
  const [referencePdf, setReferencePdf] = useState('');

  // Sync local state when adventure changes
  useEffect(() => {
    if (adventure) {
      setName(adventure.name);
      setDescription(adventure.description);
      setHeaderPrimary(adventure.headerTitle.primary);
      setHeaderSecondary(adventure.headerTitle.secondary);
      setReferencePdf(adventure.referencePdf ?? '');
    }
  }, [adventure]);

  const handleBlur = (field: string, value: string) => {
    if (!onPatchAdventure || !adventure) return;
    switch (field) {
      case 'name':
        if (value !== adventure.name) onPatchAdventure({ name: value });
        break;
      case 'description':
        if (value !== adventure.description) onPatchAdventure({ description: value });
        break;
      case 'headerPrimary':
        if (value !== adventure.headerTitle.primary) onPatchAdventure({ headerTitle: { primary: value, secondary: headerSecondary } });
        break;
      case 'headerSecondary':
        if (value !== adventure.headerTitle.secondary) onPatchAdventure({ headerTitle: { primary: headerPrimary, secondary: value } });
        break;
      case 'referencePdf':
        if (value !== (adventure.referencePdf ?? '')) onPatchAdventure({ referencePdf: value || null });
        break;
    }
  };

  if (!adventure) {
    return (
      <div className="text-center py-8 text-muted">
        <p className="text-sm">No adventure loaded.</p>
        <p className="text-xs mt-1">Select an adventure first to edit its settings.</p>
      </div>
    );
  }

  return (
    <>
      <div>
        <label className="text-xs uppercase tracking-wider text-accent-secondary font-semibold block mb-2">
          Adventure Name
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onBlur={() => handleBlur('name', name)}
          className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-body focus:outline-none focus:border-accent-secondary/50"
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-wider text-accent-secondary font-semibold block mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          onBlur={() => handleBlur('description', description)}
          rows={3}
          className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-body focus:outline-none focus:border-accent-secondary/50 resize-none"
        />
      </div>

      <div className="border-t border-border pt-4">
        <label className="text-xs uppercase tracking-wider text-warning font-semibold block mb-2">
          Header Title
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-muted block mb-1">Primary</label>
            <input
              type="text"
              value={headerPrimary}
              onChange={e => setHeaderPrimary(e.target.value)}
              onBlur={() => handleBlur('headerPrimary', headerPrimary)}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-body focus:outline-none focus:border-accent-secondary/50"
            />
          </div>
          <div>
            <label className="text-[11px] text-muted block mb-1">Secondary</label>
            <input
              type="text"
              value={headerSecondary}
              onChange={e => setHeaderSecondary(e.target.value)}
              onBlur={() => handleBlur('headerSecondary', headerSecondary)}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-body focus:outline-none focus:border-accent-secondary/50"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-wider text-accent font-semibold block mb-2">
          Reference PDF Path
        </label>
        <input
          type="text"
          value={referencePdf}
          onChange={e => setReferencePdf(e.target.value)}
          onBlur={() => handleBlur('referencePdf', referencePdf)}
          placeholder="e.g. reference/where-evil-lives.pdf"
          className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-body placeholder:text-muted/50 focus:outline-none focus:border-accent-secondary/50"
        />
        <p className="text-[11px] text-muted mt-1">Path relative to the adventure data folder.</p>
      </div>
    </>
  );
}
