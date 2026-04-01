'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface EditableFieldProps {
  value: string | number;
  onSave: (newValue: string) => void;
  type?: 'text' | 'number';
  className?: string;
  label?: string;
}

export default function EditableField({
  value,
  onSave,
  type = 'text',
  className = '',
  label,
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [showSaved, setShowSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync draft when value changes externally
  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);

  // Focus and select all when entering edit mode
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleSave = useCallback(() => {
    setEditing(false);
    const trimmed = draft.trim();

    // Validate number type
    if (type === 'number' && trimmed !== '' && isNaN(Number(trimmed))) {
      setDraft(String(value));
      return;
    }

    if (trimmed !== String(value)) {
      onSave(trimmed);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 1200);
    }
  }, [draft, value, onSave, type]);

  const handleCancel = useCallback(() => {
    setDraft(String(value));
    setEditing(false);
  }, [value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  }, [handleCancel, handleSave]);

  if (editing) {
    return (
      <span className={`inline-flex items-center gap-1 ${className}`}>
        {label && <span className="text-muted text-xs font-medium">{label}</span>}
        <input
          ref={inputRef}
          type={type}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="bg-card-alt border border-accent/40 rounded px-2 py-0.5 text-sm text-body focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors w-full"
        />
      </span>
    );
  }

  return (
    <span
      className={`group relative inline-flex items-center gap-1 cursor-pointer rounded transition-colors hover:bg-card-alt/50 px-0.5 ${className}`}
      onClick={() => setEditing(true)}
      title="Click to edit"
    >
      {label && <span className="text-muted text-xs font-medium">{label}</span>}
      <span>{value}</span>

      {/* Pencil icon on hover */}
      <span className="opacity-0 group-hover:opacity-60 transition-opacity text-muted">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
        </svg>
      </span>

      {/* Saved flash */}
      {showSaved && (
        <span className="absolute -top-4 right-0 text-[10px] text-success font-medium animate-pulse">
          Saved
        </span>
      )}
    </span>
  );
}
