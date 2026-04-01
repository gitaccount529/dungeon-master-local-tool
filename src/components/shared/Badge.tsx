'use client';

type BadgeColor = 'accent' | 'danger' | 'success' | 'info' | 'magic' | 'gold' | 'warning' | 'muted';

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
}

const colorClasses: Record<BadgeColor, string> = {
  accent: 'bg-accent/20 text-accent border-accent/40',
  danger: 'bg-danger/20 text-danger border-danger/40',
  success: 'bg-success/20 text-success border-success/40',
  info: 'bg-info/20 text-info border-info/40',
  magic: 'bg-magic/20 text-magic border-magic/40',
  gold: 'bg-gold/20 text-gold border-gold/40',
  warning: 'bg-warning/20 text-warning border-warning/40',
  muted: 'bg-card text-muted border-border',
};

export default function Badge({ children, color = 'muted', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
        border ${colorClasses[color]} ${className}
      `}
    >
      {children}
    </span>
  );
}
