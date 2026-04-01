'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAdventureContext } from '@/lib/AdventureContext';
import { makeImageResolver } from '@/hooks/useAdventure';
import { SpotlightButton } from './SpotlightControls';
import type { GalleryImage } from '@/lib/types';

interface ImageGalleryProps {
  onSpotlightImage?: (title: string, imageUrl: string) => void;
}

export default function ImageGallery({ onSpotlightImage }: ImageGalleryProps) {
  const { data: adventureData, slug, patchImage, addImage, deleteImage, replaceImage } = useAdventureContext();
  const galleryImages = adventureData?.images ?? [];
  const resolveImg = makeImageResolver(slug);
  const [viewerImage, setViewerImage] = useState<GalleryImage | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await addImage(file);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [addImage]);

  // Keep viewer in sync with gallery data
  useEffect(() => {
    if (viewerImage) {
      const updated = galleryImages.find(i => i.id === viewerImage.id);
      if (updated) setViewerImage(updated);
      else setViewerImage(null); // was deleted
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [galleryImages]);

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg p-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xs uppercase tracking-wider text-accent font-semibold mb-1">Image Gallery</h2>
          <p className="text-sm text-muted">
            Player-facing art. Click an image to view fullscreen, then send to the player view.
          </p>
        </div>
        <div className="flex-shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : '+ Upload Image'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {galleryImages.map(image => (
          <div
            key={image.id}
            className="bg-card border border-border rounded-lg overflow-hidden cursor-pointer group hover:border-accent/50 transition-colors"
            onClick={() => setViewerImage(image)}
          >
            {/* Image preview area */}
            <div className="aspect-video bg-card-alt flex items-center justify-center border-b border-border overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveImg(image.filename)}
                alt={image.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  el.style.display = 'none';
                  el.parentElement!.querySelector('.img-fallback')?.classList.remove('hidden');
                }}
              />
              <div className="img-fallback hidden text-center p-4 absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-muted text-2xl mb-1">🖼</p>
                <p className="text-xs text-muted">{image.filename}</p>
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="text-white/0 group-hover:text-white/80 text-sm font-medium transition-colors">
                  View
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <h3 className="text-sm font-semibold text-body mb-1">{image.title}</h3>
              <p className="text-xs text-muted line-clamp-2">{image.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Viewer */}
      {viewerImage && (
        <ImageViewer
          image={viewerImage}
          resolveImg={resolveImg}
          onClose={() => setViewerImage(null)}
          onSpotlight={onSpotlightImage ? (title, url) => {
            onSpotlightImage(title, url);
          } : undefined}
          onEdit={(updates) => {
            patchImage(viewerImage.id, updates);
          }}
          onDelete={() => {
            deleteImage(viewerImage.id);
            setViewerImage(null);
          }}
          onReplace={async (file) => {
            await replaceImage(viewerImage.id, file);
          }}
        />
      )}
    </div>
  );
}

// ── Fullscreen Image Viewer ──

function ImageViewer({
  image,
  resolveImg,
  onClose,
  onSpotlight,
  onEdit,
  onDelete,
  onReplace,
}: {
  image: GalleryImage;
  resolveImg: (path: string) => string;
  onClose: () => void;
  onSpotlight?: (title: string, imageUrl: string) => void;
  onEdit?: (updates: Partial<GalleryImage>) => void;
  onDelete?: () => void;
  onReplace?: (file: File) => Promise<void>;
}) {
  const { slug } = useAdventureContext();
  const [editingUrl, setEditingUrl] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(image.title);
  const [urlDraft, setUrlDraft] = useState(image.filename);
  const [downloading, setDownloading] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // Sync drafts when image prop changes (e.g. after replace)
  useEffect(() => {
    setUrlDraft(image.filename);
    setTitleDraft(image.title);
  }, [image.filename, image.title]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingTitle) { setEditingTitle(false); return; }
        if (editingUrl) { setEditingUrl(false); return; }
        if (confirmDelete) { setConfirmDelete(false); return; }
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, editingTitle, editingUrl, confirmDelete]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  const handleSaveTitle = () => {
    const trimmed = titleDraft.trim();
    if (!trimmed || trimmed === image.title || !onEdit) {
      setEditingTitle(false);
      return;
    }
    onEdit({ title: trimmed });
    setEditingTitle(false);
  };

  const handleSaveUrl = async () => {
    const trimmed = urlDraft.trim();
    if (!trimmed || trimmed === image.filename || !onEdit) {
      setEditingUrl(false);
      return;
    }

    // If it's a remote URL, download it first
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      setDownloading(true);
      try {
        const res = await fetch(`/api/adventures/${slug}/images/download`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: trimmed }),
        });
        const data = await res.json();
        if (res.ok && data.filename) {
          onEdit({ filename: data.filename });
        } else {
          console.error('Download failed:', data.error);
          onEdit({ filename: trimmed });
        }
      } catch (err) {
        console.error('Download failed:', err);
        onEdit({ filename: trimmed });
      } finally {
        setDownloading(false);
      }
    } else {
      onEdit({ filename: trimmed });
    }
    setEditingUrl(false);
  };

  const handleReplace = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onReplace) return;
    setReplacing(true);
    try {
      await onReplace(file);
    } finally {
      setReplacing(false);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  }, [onReplace]);

  const imageUrl = resolveImg(image.filename);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-5xl w-full mx-4 flex flex-col items-center gap-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center text-xl cursor-pointer transition-colors"
          title="Close"
        >
          &times;
        </button>

        {/* Image — clickable to replace */}
        <div className="w-full flex items-center justify-center relative group/img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={image.title}
            className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl"
          />
          {/* Replace overlay on hover */}
          {onReplace && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover/img:bg-black/40 transition-colors rounded-lg cursor-pointer"
              onClick={(e) => { e.stopPropagation(); replaceInputRef.current?.click(); }}
            >
              <span className="text-white/0 group-hover/img:text-white/90 text-sm font-medium bg-black/0 group-hover/img:bg-black/60 px-4 py-2 rounded-lg transition-all">
                {replacing ? 'Uploading...' : 'Click to Replace Image'}
              </span>
            </div>
          )}
          <input
            ref={replaceInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleReplace}
          />
        </div>

        {/* Title — editable */}
        <div className="flex items-center gap-3 bg-card/90 backdrop-blur border border-border rounded-lg px-4 py-3 w-full max-w-3xl">
          {editingTitle ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={titleDraft}
                onChange={e => setTitleDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
                className="flex-1 bg-background border border-border rounded px-3 py-1 text-sm text-body focus:outline-none focus:border-accent/50"
                autoFocus
              />
              <button
                onClick={handleSaveTitle}
                className="px-2 py-1 rounded text-xs font-medium bg-accent/20 text-accent hover:bg-accent/30 cursor-pointer"
              >
                Save
              </button>
              <button
                onClick={() => { setTitleDraft(image.title); setEditingTitle(false); }}
                className="px-2 py-1 rounded text-xs font-medium text-muted hover:text-body cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div
              className="flex-1 min-w-0 cursor-pointer group/title"
              onClick={() => setEditingTitle(true)}
              title="Click to rename"
            >
              <h3 className="text-sm font-semibold text-body truncate group-hover/title:text-accent transition-colors">
                {image.title}
                <span className="text-muted text-[10px] ml-2 opacity-0 group-hover/title:opacity-100 transition-opacity">edit</span>
              </h3>
              {image.description && (
                <p className="text-xs text-muted truncate">{image.description}</p>
              )}
            </div>
          )}

          {!editingTitle && (
            <>
              {onSpotlight && (
                <SpotlightButton
                  size="md"
                  label="Show to Players"
                  onClick={() => onSpotlight(image.title, imageUrl)}
                />
              )}

              {onEdit && (
                <button
                  onClick={() => { setUrlDraft(image.filename); setEditingUrl(!editingUrl); }}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                    editingUrl
                      ? 'bg-accent-secondary/20 text-accent-secondary'
                      : 'bg-card-alt text-muted hover:text-body border border-border'
                  }`}
                >
                  Edit Image URL
                </button>
              )}

              {onDelete && !confirmDelete && (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="px-3 py-1.5 rounded text-xs font-medium text-danger/70 hover:text-danger hover:bg-danger/10 border border-transparent hover:border-danger/30 transition-colors cursor-pointer"
                  title="Delete image"
                >
                  Delete
                </button>
              )}

              {onDelete && confirmDelete && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-danger mr-1">Delete?</span>
                  <button
                    onClick={onDelete}
                    className="px-2 py-1 rounded text-xs font-bold bg-danger/20 text-danger hover:bg-danger/30 border border-danger/30 cursor-pointer"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1 rounded text-xs font-medium text-muted hover:text-body cursor-pointer"
                  >
                    No
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Edit URL input */}
        {editingUrl && (
          <div className="flex items-center gap-2 bg-card/90 backdrop-blur border border-border rounded-lg px-4 py-3 w-full max-w-2xl">
            <input
              type="text"
              value={urlDraft}
              onChange={e => setUrlDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSaveUrl(); if (e.key === 'Escape') setEditingUrl(false); }}
              className="flex-1 bg-background border border-border rounded px-3 py-1.5 text-sm text-body focus:outline-none focus:border-accent-secondary/50"
              autoFocus
              placeholder="Image filename or URL"
            />
            <button
              onClick={handleSaveUrl}
              disabled={downloading}
              className="px-3 py-1.5 rounded text-xs font-medium bg-accent-secondary/20 text-accent-secondary hover:bg-accent-secondary/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? 'Downloading...' : 'Save'}
            </button>
            <button
              onClick={() => setEditingUrl(false)}
              className="px-3 py-1.5 rounded text-xs font-medium text-muted hover:text-body cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
