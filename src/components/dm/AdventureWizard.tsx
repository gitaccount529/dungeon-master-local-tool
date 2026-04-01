'use client';

import { useState } from 'react';
import Button from '@/components/shared/Button';

interface AdventureWizardProps {
  onComplete: (slug: string) => void;
  onCancel: () => void;
}

type WizardStep = 1 | 2 | 3 | 4;

const STEPS = [
  { num: 1, label: 'Basics' },
  { num: 2, label: 'References' },
  { num: 3, label: 'Context' },
  { num: 4, label: 'Summary' },
] as const;

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

export default function AdventureWizard({ onComplete, onCancel }: AdventureWizardProps) {
  const [step, setStep] = useState<WizardStep>(1);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Step 1: Basics
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [system, setSystem] = useState('dnd5e');

  // Step 2: References
  const [pdfPath, setPdfPath] = useState('');
  const [addedPdfs, setAddedPdfs] = useState<string[]>([]);

  // Step 3: Context
  const [dmNotes, setDmNotes] = useState('');

  // Created adventure slug
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  // ── Step 1: Create adventure ──

  const handleBasicsNext = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    try {
      const id = slugify(name);
      const res = await fetch('/api/adventures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: name.trim(), description: description.trim(), system }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create adventure');
      }
      const adventure = await res.json();
      setCreatedSlug(adventure.id);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create adventure');
    } finally {
      setSaving(false);
    }
  };

  // ── Step 2: Add PDF reference ──

  const handleAddPdf = async () => {
    if (!pdfPath.trim() || !createdSlug) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/adventures/${createdSlug}/reference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: pdfPath.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add reference');
      }
      setAddedPdfs(prev => [...prev, pdfPath.trim()]);
      setPdfPath('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add reference');
    } finally {
      setSaving(false);
    }
  };

  // ── Step 3: Save DM notes ──

  const handleContextNext = async () => {
    if (!createdSlug) return;
    if (dmNotes.trim()) {
      setSaving(true);
      setError('');
      try {
        const res = await fetch(`/api/adventures/${createdSlug}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dmNotes: dmNotes.trim() }),
        });
        if (!res.ok) throw new Error('Failed to save notes');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save notes');
        setSaving(false);
        return;
      } finally {
        setSaving(false);
      }
    }
    setStep(4);
  };

  // ── Step indicator ──

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((s, i) => (
        <div key={s.num} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                ${step >= s.num
                  ? 'bg-accent border-accent text-background'
                  : 'bg-card border-border text-muted'
                }
              `}
            >
              {step > s.num ? '\u2713' : s.num}
            </div>
            <span className={`text-[10px] mt-1 ${step >= s.num ? 'text-accent' : 'text-muted'}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`w-12 h-0.5 mx-1 mb-4 transition-all ${
                step > s.num ? 'bg-accent' : 'bg-border'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-lg p-6 max-w-xl mx-auto">
      <StepIndicator />

      {error && <p className="text-xs text-danger mb-4">{error}</p>}

      {/* ── Step 1: Basics ── */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-wider text-accent font-semibold">Adventure Basics</h3>

          <div>
            <label className="text-xs text-muted block mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. The Sunken Citadel"
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-body placeholder:text-muted/50 focus:outline-none focus:border-accent"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="A brief description of the adventure..."
              rows={3}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-body placeholder:text-muted/50 focus:outline-none focus:border-accent resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">System</label>
            <select
              value={system}
              onChange={e => setSystem(e.target.value)}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-body focus:outline-none focus:border-accent"
            >
              <option value="dnd5e">D&D 5e</option>
              <option value="pf2e">Pathfinder 2e</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="secondary" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" disabled={saving || !name.trim()} onClick={handleBasicsNext}>
              {saving ? 'Creating...' : 'Next'}
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 2: References ── */}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-wider text-accent font-semibold">Reference PDFs</h3>
          <p className="text-xs text-muted">Add paths to source PDFs for this adventure. File upload coming soon.</p>

          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <p className="text-muted text-xs mb-3">Drag & drop PDF files here (coming soon)</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={pdfPath}
                onChange={e => setPdfPath(e.target.value)}
                placeholder="Path to PDF file..."
                className="flex-1 bg-background border border-border rounded px-3 py-2 text-sm text-body placeholder:text-muted/50 focus:outline-none focus:border-accent"
              />
              <Button variant="primary" size="sm" disabled={saving || !pdfPath.trim()} onClick={handleAddPdf}>
                {saving ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </div>

          {addedPdfs.length > 0 && (
            <div className="space-y-1">
              {addedPdfs.map((pdf, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-body bg-background rounded px-3 py-1.5 border border-border">
                  <span className="text-accent">PDF</span>
                  <span className="truncate">{pdf}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="secondary" size="sm" onClick={() => setStep(1)}>
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStep(3)}>
                Skip
              </Button>
              <Button variant="primary" size="sm" onClick={() => setStep(3)} disabled={addedPdfs.length === 0}>
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Context ── */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-wider text-accent font-semibold">DM Context</h3>
          <p className="text-xs text-muted">What should this adventure be about? Any specific themes, monsters, locations?</p>

          <textarea
            value={dmNotes}
            onChange={e => setDmNotes(e.target.value)}
            placeholder="Describe the adventure themes, key locations, important NPCs, monster types, tone..."
            rows={8}
            className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-body placeholder:text-muted/50 focus:outline-none focus:border-accent resize-none"
            autoFocus
          />

          <div className="flex justify-between pt-2">
            <Button variant="secondary" size="sm" onClick={() => setStep(2)}>
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStep(4)}>
                Skip
              </Button>
              <Button variant="primary" size="sm" disabled={saving} onClick={handleContextNext}>
                {saving ? 'Saving...' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 4: Summary ── */}
      {step === 4 && (
        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-wider text-accent font-semibold">Summary</h3>

          <div className="bg-background border border-border rounded-lg p-4 space-y-3">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted">Name</span>
              <p className="text-sm text-body font-medium">{name}</p>
            </div>
            {description && (
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted">Description</span>
                <p className="text-xs text-body">{description}</p>
              </div>
            )}
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted">System</span>
              <p className="text-xs text-body">
                {system === 'dnd5e' ? 'D&D 5e' : system === 'pf2e' ? 'Pathfinder 2e' : 'Other'}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted">Reference PDFs</span>
              <p className="text-xs text-body">{addedPdfs.length > 0 ? `${addedPdfs.length} file(s)` : 'None'}</p>
            </div>
            {dmNotes && (
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted">DM Context</span>
                <p className="text-xs text-body line-clamp-3">{dmNotes}</p>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="secondary" size="sm" onClick={() => setStep(3)}>
              Back
            </Button>
            <div className="flex gap-2">
              <div className="relative group">
                <Button variant="ghost" size="sm" disabled>
                  Generate with AI
                </Button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-background border border-border rounded text-[10px] text-muted whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Coming soon
                </div>
              </div>
              <Button variant="primary" size="sm" onClick={() => createdSlug && onComplete(createdSlug)}>
                Start Empty
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
