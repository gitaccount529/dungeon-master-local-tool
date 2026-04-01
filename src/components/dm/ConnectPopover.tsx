'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import Button from '@/components/shared/Button';

interface NetworkAddress {
  name: string;
  address: string;
}

interface ConnectPopoverProps {
  open: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement>;
}

export default function ConnectPopover({ open, onClose }: ConnectPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [addresses, setAddresses] = useState<NetworkAddress[]>([]);
  const [selectedIP, setSelectedIP] = useState<string>('');
  const [port, setPort] = useState('3000');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch network addresses on open
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch('/api/network')
      .then(r => r.json())
      .then(data => {
        setAddresses(data.addresses || []);
        if (data.addresses?.length > 0 && !selectedIP) {
          setSelectedIP(data.addresses[0].address);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [open, selectedIP]);

  // Detect current port from window.location
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPort(window.location.port || '3000');
    }
  }, []);

  // Generate QR code when IP/port changes
  useEffect(() => {
    if (!selectedIP) {
      setQrDataUrl('');
      return;
    }
    const url = `http://${selectedIP}:${port}/player`;
    QRCode.toDataURL(url, {
      width: 160,
      margin: 2,
      color: { dark: '#ff6b35', light: '#1a1110' },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [selectedIP, port]);

  // Click-outside handler
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay to prevent the opening click from immediately closing
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handler);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handler);
    };
  }, [open, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const playerUrl = selectedIP ? `http://${selectedIP}:${port}/player` : '';

  const handleCopy = async () => {
    if (!playerUrl) return;
    try {
      await navigator.clipboard.writeText(playerUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = playerUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!playerUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'D&D Session Tool — Player View',
          text: 'Open this link on your device to connect as a player',
          url: playerUrl,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  if (!open) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute top-full right-0 mt-2 z-50 bg-card border border-border rounded-xl shadow-2xl p-4 w-80"
    >
      {loading ? (
        <div className="text-center py-4 text-muted text-sm">Detecting network...</div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-danger text-sm mb-1">No network interfaces detected</p>
          <p className="text-muted text-xs">Make sure your computer is connected to a network.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* IP Selection as dropdown */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted font-semibold block mb-1">
              Network Interface
            </label>
            <select
              value={selectedIP}
              onChange={e => setSelectedIP(e.target.value)}
              className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm text-body focus:outline-none focus:border-accent/50 cursor-pointer"
            >
              {addresses.map(addr => (
                <option key={`${addr.name}-${addr.address}`} value={addr.address}>
                  {addr.address} ({addr.name})
                </option>
              ))}
            </select>
          </div>

          {/* Player URL with copy */}
          {playerUrl && (
            <div>
              <label className="text-xs uppercase tracking-wider text-muted font-semibold block mb-1">
                Player URL
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-background border border-border rounded px-2 py-1.5 text-xs font-mono text-info truncate">
                  {playerUrl}
                </code>
                <Button variant="secondary" size="sm" onClick={handleCopy}>
                  {copied ? '✓' : 'Copy'}
                </Button>
              </div>
            </div>
          )}

          {/* QR Code */}
          {qrDataUrl && (
            <div className="flex flex-col items-center gap-2 pt-1">
              <p className="text-[11px] text-muted uppercase tracking-wider">Scan with player device</p>
              <div className="bg-background rounded-lg p-2 border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt="Player View QR Code"
                  width={160}
                  height={160}
                  className="rounded"
                />
              </div>
              <Button variant="spotlight" size="sm" onClick={handleShare}>
                Share Link
              </Button>
            </div>
          )}
        </div>
      )}

      <p className="text-[10px] text-muted text-center mt-3">
        Both devices must be on the same WiFi network.
      </p>
    </div>
  );
}
