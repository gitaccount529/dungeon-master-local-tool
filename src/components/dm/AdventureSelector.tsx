'use client';

import { useState } from 'react';
import Button from '@/components/shared/Button';
import AdventureWizard from './AdventureWizard';
import type { Adventure } from '@/lib/types';

interface AdventureSelectorProps {
  adventures: Adventure[];
  loading: boolean;
  onSelect: (slug: string) => void;
  onRefresh: () => void;
}

export default function AdventureSelector({ adventures, loading, onSelect, onRefresh }: AdventureSelectorProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setCreating(true);
    setError('');
    try {
      const id = newName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const res = await fetch('/api/adventures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: newName.trim(), description: newDescription.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create adventure');
      }
      const adventure = await res.json();
      onRefresh();
      onSelect(adventure.id);
      setShowCreate(false);
      setNewName('');
      setNewDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create adventure');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">
        Loading adventures...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-accent tracking-wider mb-2">Select an Adventure</h2>
        <p className="text-sm text-muted">Choose an adventure to load or create a new one.</p>
      </div>

      {/* Adventure grid */}
      {adventures.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {adventures.map(adv => (
            <button
              key={adv.id}
              onClick={() => onSelect(adv.id)}
              className="bg-card border border-border rounded-lg p-5 text-left hover:border-accent/50 hover:bg-card-alt transition-all cursor-pointer group"
            >
              <h3 className="text-sm font-bold text-accent tracking-wider uppercase group-hover:text-accent/80 mb-2">
                {adv.name}
              </h3>
              {adv.description && (
                <p className="text-xs text-muted line-clamp-3">{adv.description}</p>
              )}
              <p className="text-[10px] text-muted/50 mt-3">
                {new Date(adv.updatedAt).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      )}

      {adventures.length === 0 && !showCreate && (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <p className="text-muted mb-4">No adventures found. Create your first one to get started.</p>
        </div>
      )}

      {/* Create new adventure */}
      {showCreate ? (
        <AdventureWizard
          onComplete={(slug) => {
            onRefresh();
            onSelect(slug);
            setShowCreate(false);
          }}
          onCancel={() => setShowCreate(false)}
        />
      ) : (
        <div className="flex justify-center">
          <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
            + Create New Adventure
          </Button>
        </div>
      )}
    </div>
  );
}
