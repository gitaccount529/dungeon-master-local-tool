'use client';

import { useState, useMemo } from 'react';
import { useAdventureContext } from '@/lib/AdventureContext';
import type { LootEntry, PartyMember, Zone } from '@/lib/types';
import Button from '@/components/shared/Button';
import { v4 as uuidv4 } from 'uuid';

interface LootTrackerProps {
  partyMembers: PartyMember[];
}

type LootFilter = 'all' | 'item' | 'currency' | 'magic-item' | 'unclaimed';

const LOOT_TYPE_LABELS: Record<LootEntry['type'], string> = {
  'item': 'Item',
  'currency': 'Currency',
  'magic-item': 'Magic Item',
};

const LOOT_TYPE_COLORS: Record<LootEntry['type'], string> = {
  'item': 'bg-accent/15 text-accent',
  'currency': 'bg-gold/15 text-gold',
  'magic-item': 'bg-magic/15 text-magic',
};

export default function LootTracker({ partyMembers }: LootTrackerProps) {
  const { data: adventureData, setLoot } = useAdventureContext();
  const loot = adventureData?.loot ?? [];
  const allZones: Zone[] = useMemo(() => {
    if (!adventureData) return [];
    const z: Zone[] = [...(adventureData.zones.zones ?? [])];
    if (adventureData.zones.travelSection) z.unshift(adventureData.zones.travelSection);
    if (adventureData.zones.zoneOverview) z.unshift(adventureData.zones.zoneOverview);
    return z;
  }, [adventureData]);

  const [filter, setFilter] = useState<LootFilter>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingClaim, setEditingClaim] = useState<string | null>(null);

  // Add form state
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newQuantity, setNewQuantity] = useState(1);
  const [newValue, setNewValue] = useState('');
  const [newType, setNewType] = useState<LootEntry['type']>('item');

  // Currency summary
  const currencyTotal = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const entry of loot) {
      if (entry.type !== 'currency' || !entry.value) continue;
      // Parse "300 gp", "50 sp", etc.
      const match = entry.value.match(/^([\d,]+)\s*(\w+)$/);
      if (match) {
        const amount = parseInt(match[1].replace(/,/g, ''), 10) * entry.quantity;
        const unit = match[2].toLowerCase();
        totals[unit] = (totals[unit] || 0) + amount;
      }
    }
    return totals;
  }, [loot]);

  // Filtered loot
  const filteredLoot = useMemo(() => {
    if (filter === 'all') return loot;
    if (filter === 'unclaimed') return loot.filter(l => !l.claimedBy);
    return loot.filter(l => l.type === filter);
  }, [loot, filter]);

  const handleAddLoot = () => {
    if (!newName.trim()) return;
    const entry: LootEntry = {
      id: uuidv4(),
      name: newName.trim(),
      description: newDescription.trim() || undefined,
      quantity: newQuantity,
      value: newValue.trim() || undefined,
      type: newType,
    };
    setLoot([...loot, entry]);
    setNewName('');
    setNewDescription('');
    setNewQuantity(1);
    setNewValue('');
    setNewType('item');
    setShowAddForm(false);
  };

  const handleDeleteLoot = (id: string) => {
    setLoot(loot.filter(l => l.id !== id));
  };

  const handleClaimLoot = (id: string, claimedBy: string) => {
    setLoot(loot.map(l => l.id === id ? { ...l, claimedBy: claimedBy || undefined } : l));
    setEditingClaim(null);
  };

  const handleImportZoneTreasure = (zone: Zone) => {
    if (!zone.treasure || zone.treasure.length === 0) return;
    const newEntries: LootEntry[] = zone.treasure.map(t => ({
      id: uuidv4(),
      name: t.name,
      description: t.description,
      quantity: 1,
      value: t.value,
      type: (t.value && /^\d/.test(t.value) ? 'currency' : 'item') as LootEntry['type'],
      zoneId: zone.id,
    }));
    setLoot([...loot, ...newEntries]);
  };

  const zonesWithTreasure = allZones.filter(z => z.treasure && z.treasure.length > 0);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-wider text-gold font-semibold">Loot & Treasure</h3>
          <div className="flex items-center gap-2">
            {zonesWithTreasure.length > 0 && (
              <div className="relative group">
                <button className="text-xs text-accent-secondary hover:text-accent-secondary/80 cursor-pointer px-2 py-1 rounded bg-accent-secondary/10">
                  Import Zone Treasure
                </button>
                <div className="hidden group-hover:block absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-50 w-56 max-h-48 overflow-y-auto">
                  {zonesWithTreasure.map(z => (
                    <button
                      key={z.id}
                      onClick={() => handleImportZoneTreasure(z)}
                      className="w-full text-left px-3 py-2 text-xs text-body hover:bg-card-alt transition-colors cursor-pointer"
                    >
                      {z.name} ({z.treasure.length} items)
                    </button>
                  ))}
                </div>
              </div>
            )}
            <Button variant="primary" size="sm" onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? 'Cancel' : '+ Add Loot'}
            </Button>
          </div>
        </div>

        {/* Currency Summary */}
        {Object.keys(currencyTotal).length > 0 && (
          <div className="mt-2 flex gap-3 text-sm">
            {Object.entries(currencyTotal).map(([unit, amount]) => (
              <span key={unit} className="text-gold font-medium">
                {amount.toLocaleString()} {unit}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="px-4 py-3 bg-card-alt border-b border-border space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Item name"
              className="bg-background border border-border rounded px-3 py-1.5 text-sm text-body focus:outline-none focus:border-accent"
              autoFocus
            />
            <select
              value={newType}
              onChange={e => setNewType(e.target.value as LootEntry['type'])}
              className="bg-background border border-border rounded px-3 py-1.5 text-sm text-body focus:outline-none focus:border-accent"
            >
              <option value="item">Item</option>
              <option value="currency">Currency</option>
              <option value="magic-item">Magic Item</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="number"
              min={1}
              value={newQuantity}
              onChange={e => setNewQuantity(Number(e.target.value))}
              className="bg-background border border-border rounded px-3 py-1.5 text-sm text-body focus:outline-none focus:border-accent"
              placeholder="Qty"
            />
            <input
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              placeholder="Value (e.g. 300 gp)"
              className="bg-background border border-border rounded px-3 py-1.5 text-sm text-body focus:outline-none focus:border-accent"
            />
            <Button variant="primary" size="sm" onClick={handleAddLoot} disabled={!newName.trim()}>
              Add
            </Button>
          </div>
          <input
            value={newDescription}
            onChange={e => setNewDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm text-body focus:outline-none focus:border-accent"
          />
        </div>
      )}

      {/* Filters */}
      <div className="px-4 py-2 border-b border-border flex gap-1">
        {(['all', 'item', 'currency', 'magic-item', 'unclaimed'] as LootFilter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
              filter === f
                ? 'bg-accent/15 text-accent font-medium'
                : 'text-muted hover:text-body hover:bg-card-alt'
            }`}
          >
            {f === 'all' ? 'All' : f === 'magic-item' ? 'Magic' : f === 'unclaimed' ? 'Unclaimed' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted self-center">{filteredLoot.length} items</span>
      </div>

      {/* Loot Table */}
      {filteredLoot.length === 0 ? (
        <div className="px-4 py-8 text-center text-muted text-sm">
          No loot tracked yet. Add items or import from zone treasure.
        </div>
      ) : (
        <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
          {filteredLoot.map(entry => (
            <div key={entry.id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-card-alt/50 transition-colors">
              {/* Name & type */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-body">{entry.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${LOOT_TYPE_COLORS[entry.type]}`}>
                    {LOOT_TYPE_LABELS[entry.type]}
                  </span>
                </div>
                {entry.description && (
                  <p className="text-xs text-muted truncate">{entry.description}</p>
                )}
              </div>

              {/* Qty */}
              <span className="text-xs text-muted w-10 text-center">{entry.quantity > 1 ? `x${entry.quantity}` : ''}</span>

              {/* Value */}
              <span className="text-xs text-gold w-20 text-right">{entry.value || '--'}</span>

              {/* Claimed By */}
              <div className="w-28">
                {editingClaim === entry.id ? (
                  <select
                    autoFocus
                    value={entry.claimedBy || ''}
                    onChange={e => handleClaimLoot(entry.id, e.target.value)}
                    onBlur={() => setEditingClaim(null)}
                    className="w-full bg-background border border-border rounded px-1 py-0.5 text-xs text-body focus:outline-none focus:border-accent"
                  >
                    <option value="">Unclaimed</option>
                    {partyMembers.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                ) : (
                  <button
                    onClick={() => setEditingClaim(entry.id)}
                    className="text-xs text-muted hover:text-body cursor-pointer truncate w-full text-left"
                    title="Click to assign"
                  >
                    {entry.claimedBy || 'Unclaimed'}
                  </button>
                )}
              </div>

              {/* Delete */}
              <button
                onClick={() => handleDeleteLoot(entry.id)}
                className="text-danger/50 hover:text-danger text-xs cursor-pointer flex-shrink-0"
                title="Remove"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
