'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => void;
  multiline?: boolean;
  className?: string;
  editClassName?: string;
  placeholder?: string;
}

export default function EditableText({
  value,
  onSave,
  multiline = false,
  className = '',
  editClassName = '',
  placeholder = 'Click to edit...',
}: EditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [showSaved, setShowSaved] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  // Sync draft when value changes externally
  useEffect(() => {
    if (!editing) setDraft(value);
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
    if (draft !== value) {
      onSave(draft);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 1200);
    }
  }, [draft, value, onSave]);

  const handleCancel = useCallback(() => {
    setDraft(value);
    setEditing(false);
  }, [value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || !multiline)) {
      e.preventDefault();
      handleSave();
    }
  }, [handleCancel, handleSave, multiline]);

  if (editing) {
    const sharedClasses = `w-full bg-card-alt border border-accent/40 rounded-md px-3 py-2 text-sm text-body focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors ${editClassName}`;

    return multiline ? (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`${sharedClasses} min-h-[6rem] resize-y`}
        placeholder={placeholder}
      />
    ) : (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={sharedClasses}
        placeholder={placeholder}
      />
    );
  }

  return (
    <div
      className={`group relative cursor-pointer rounded-md transition-colors hover:bg-card-alt/50 ${className}`}
      onClick={() => setEditing(true)}
      title="Click to edit"
    >
      {value ? (
        <span>{value}</span>
      ) : (
        <span className="text-muted/50 italic">{placeholder}</span>
      )}

      {/* Pencil icon on hover */}
      <span className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-60 transition-opacity text-muted">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
        </svg>
      </span>

      {/* Saved flash */}
      {showSaved && (
        <span className="absolute -top-5 right-0 text-[10px] text-success font-medium animate-pulse">
          Saved
        </span>
      )}
    </div>
  );
}
