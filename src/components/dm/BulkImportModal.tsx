'use client';

import { useState, useEffect, useRef } from 'react';
import Button from '@/components/shared/Button';
import { useLibrary } from '@/hooks/useLibrary';
import type { LibraryType } from '@/lib/types';

interface BulkImportModalProps {
  type: LibraryType;
  onClose: () => void;
}

export default function BulkImportModal({ type, onClose }: BulkImportModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const lib = useLibrary<{ id: string }>(type);
  const [jsonText, setJsonText] = useState('');
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [successCount, setSuccessCount] = useState<number | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleImport = async () => {
    setError('');
    setSuccessCount(null);
    setImporting(true);

    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        throw new Error('Input must be a JSON array of items.');
      }
      // Ensure each item has an id
      const items: { id: string }[] = parsed.map((item: Record<string, unknown>, i: number) => ({
        ...item,
        id: String(item.id || `bulk-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`),
        source: String(item.source || 'imported'),
        tags: (Array.isArray(item.tags) ? item.tags : []) as string[],
      }));
      const count = await lib.bulkImport(items);
      setSuccessCount(count);
      setJsonText('');
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON. Please paste a valid JSON array.');
      } else {
        setError(err instanceof Error ? err.message : 'Import failed');
      }
    } finally {
      setImporting(false);
    }
  };

  return (
    <div ref={overlayRef} onClick={handleOverlayClick} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative bg-card border border-border rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto m-4">
        <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-md bg-card-alt hover:bg-border text-muted hover:text-body transition-colors cursor-pointer z-10">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="p-6 space-y-4">
          <h3 className="text-xs uppercase tracking-wider text-accent font-semibold">
            Bulk Import {type}
          </h3>
          <p className="text-xs text-muted">
            Paste a JSON array of {type} items below. Each item should match the expected schema.
          </p>

          <textarea
            value={jsonText}
            onChange={e => setJsonText(e.target.value)}
            className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-body font-mono
                       placeholder:text-muted/50 focus:outline-none focus:border-accent min-h-[16rem] resize-y"
            placeholder={`[\n  { "name": "Example", ... },\n  ...\n]`}
          />

          {error && <p className="text-xs text-danger">{error}</p>}
          {successCount !== null && (
            <p className="text-xs text-success">Successfully imported {successCount} item{successCount !== 1 ? 's' : ''}.</p>
          )}

          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleImport} disabled={importing || !jsonText.trim()}>
              {importing ? 'Importing...' : 'Import'}
            </Button>
            <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
