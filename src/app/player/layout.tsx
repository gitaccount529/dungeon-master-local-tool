import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Player View',
  description: 'Player display for D&D session',
};

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
