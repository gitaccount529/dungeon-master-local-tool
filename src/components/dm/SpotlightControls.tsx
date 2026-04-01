'use client';

interface SpotlightButtonProps {
  onClick: () => void;
  label?: string;
  size?: 'sm' | 'md';
}

export function SpotlightButton({ onClick, label = 'Show to Players', size = 'sm' }: SpotlightButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`inline-flex items-center gap-1 rounded-md transition-all duration-200 cursor-pointer
        bg-info/10 hover:bg-info/25 text-info border border-info/30 hover:border-info/50
        ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1.5 text-sm'}
      `}
    >
      <EyeIcon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {size === 'md' && <span>{label}</span>}
    </button>
  );
}

function EyeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
