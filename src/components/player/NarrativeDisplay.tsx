'use client';

interface NarrativeDisplayProps {
  title?: string;
  text?: string;
}

// Parse simple markdown image syntax: ![alt](url)
function extractImage(text: string): { imageUrl: string; alt: string; remainingText: string } | null {
  const match = text.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*/);
  if (!match) return null;
  return {
    alt: match[1],
    imageUrl: match[2],
    remainingText: text.slice(match[0].length).trim(),
  };
}

export default function NarrativeDisplay({ title, text }: NarrativeDisplayProps) {
  const imageData = text ? extractImage(text) : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 lava-ambient">
      <div className="max-w-lg w-full text-center space-y-6 spotlight-transition">
        {title && (
          <h2 className="text-2xl md:text-3xl font-bold text-accent tracking-wider uppercase">
            {title}
          </h2>
        )}

        {/* If text contains a markdown image, render it properly */}
        {imageData && (
          <div className="w-full max-w-sm mx-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageData.imageUrl}
              alt={imageData.alt || title || 'Image'}
              className="w-full h-auto rounded-lg border border-border shadow-2xl"
            />
          </div>
        )}

        {/* Remaining text (or full text if no image) */}
        {(imageData ? imageData.remainingText : text) && (
          <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl p-6 md:p-8">
            <p className="text-lg md:text-xl leading-relaxed text-accent-secondary italic font-light">
              {imageData ? imageData.remainingText : text}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
