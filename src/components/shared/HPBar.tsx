'use client';

interface HPBarProps {
  current: number;
  max: number;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

function getHPColor(ratio: number): string {
  if (ratio > 0.5) return 'bg-success';
  if (ratio > 0.25) return 'bg-warning';
  return 'bg-danger';
}

function getHPGlow(ratio: number): string {
  if (ratio > 0.5) return 'shadow-[0_0_6px_rgba(68,204,102,0.4)]';
  if (ratio > 0.25) return 'shadow-[0_0_6px_rgba(255,170,68,0.4)]';
  return 'shadow-[0_0_6px_rgba(255,68,68,0.4)]';
}

const sizeClasses = {
  sm: 'h-2',
  md: 'h-4',
  lg: 'h-6',
};

export default function HPBar({ current, max, showText = true, size = 'md' }: HPBarProps) {
  const ratio = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
  const percentage = ratio * 100;

  return (
    <div className="w-full">
      <div className={`w-full bg-card-alt rounded-full overflow-hidden ${sizeClasses[size]} ${getHPGlow(ratio)}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getHPColor(ratio)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showText && (
        <p className="text-xs text-muted mt-1 text-center">
          {current} / {max} HP
        </p>
      )}
    </div>
  );
}
