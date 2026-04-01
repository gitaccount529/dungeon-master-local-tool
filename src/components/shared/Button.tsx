'use client';

import { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'spotlight';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-accent hover:bg-accent-secondary text-background font-semibold',
  secondary: 'bg-card hover:bg-card-alt text-body border border-border',
  danger: 'bg-danger/20 hover:bg-danger/30 text-danger border border-danger/40',
  ghost: 'bg-transparent hover:bg-card text-muted hover:text-body',
  spotlight: 'bg-info/20 hover:bg-info/30 text-info border border-info/40',
};

const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        rounded-md transition-all duration-200 cursor-pointer
        uppercase tracking-wider
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
