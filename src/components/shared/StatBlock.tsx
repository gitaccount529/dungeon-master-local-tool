'use client';

import { useState, useRef, useEffect } from 'react';
import type { Monster } from '@/lib/types';
import { useOptionalAdventureContext } from '@/lib/AdventureContext';
import { bustImageCache } from '@/hooks/useAdventure';
import Badge from './Badge';
import ActionBlockInteractive from './ActionBlockInteractive';

interface StatBlockProps {
  monster: Monster;
  expanded?: boolean;
  onToggle?: () => void;
  combatParticipants?: Array<{ id: string; name: string; hp_current: number; hp_max: number }>;
  onApplyDamage?: (targetId: string, amount: number) => void;
}

function getModifier(score: number): string {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-xs text-muted uppercase tracking-wider">{label}</p>
      <p className="text-sm text-body font-semibold">{value}</p>
    </div>
  );
}

export default function StatBlock({ monster, expanded: controlledExpanded, onToggle, combatParticipants, onApplyDamage }: StatBlockProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [editingImage, setEditingImage] = useState(false);
  const [imageUrlDraft, setImageUrlDraft] = useState(monster.imageUrl || '');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const ctx = useOptionalAdventureContext();
  const expanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const resolveImg = (url: string | undefined): string => {
    if (!url) return '';
    return ctx?.resolveImageUrl(url) ?? url;
  };

  useEffect(() => {
    if (editingImage && imageInputRef.current) {
      imageInputRef.current.focus();
      imageInputRef.current.select();
    }
  }, [editingImage]);

  const handleImageSave = () => {
    setEditingImage(false);
    if (ctx && imageUrlDraft !== (monster.imageUrl || '')) {
      ctx.patchMonster(monster.id, { imageUrl: imageUrlDraft || undefined });
      bustImageCache();
    }
  };

  const handleImageCancel = () => {
    setImageUrlDraft(monster.imageUrl || '');
    setEditingImage(false);
  };

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={handleToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-card-alt transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {monster.imageUrl && (
            <div className="w-7 h-7 rounded-full overflow-hidden border border-border/50 flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveImg(monster.imageUrl)}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}
          <h3 className="text-accent font-semibold text-sm">{monster.name}</h3>
          <Badge color="danger">CR {monster.cr}</Badge>
          <Badge color="info">{monster.role}</Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted">
          <span>AC {monster.ac}</span>
          <span>HP {monster.hp}</span>
          <span className="text-accent">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Expandable content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-border">
          {/* Monster portrait — floated right so description wraps around it */}
          {monster.imageUrl && (
            <div className="float-right ml-3 mb-2 mt-3">
              <div className="relative w-48 max-w-48 overflow-hidden rounded-lg border border-border group/img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveImg(monster.imageUrl)}
                  alt={monster.name}
                  className="w-full h-auto object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                {/* Edit image URL button */}
                {ctx && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setImageUrlDraft(monster.imageUrl || ''); setEditingImage(true); }}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer hover:bg-background"
                    title="Edit image URL"
                  >
                    <svg className="w-3 h-3 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" />
                    </svg>
                  </button>
                )}
              </div>
              {/* Image URL edit input */}
              {editingImage && (
                <div className="mt-1.5 w-48">
                  <input
                    ref={imageInputRef}
                    type="text"
                    value={imageUrlDraft}
                    onChange={e => setImageUrlDraft(e.target.value)}
                    onBlur={handleImageSave}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleImageSave();
                      if (e.key === 'Escape') handleImageCancel();
                    }}
                    placeholder="Image URL..."
                    className="w-full bg-card-alt border border-accent/40 rounded px-2 py-1 text-xs text-body focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                  />
                </div>
              )}
            </div>
          )}

          {/* Type line */}
          <p className="text-xs text-muted italic mt-3 mb-2">
            {monster.size} {monster.type}, {monster.alignment}
          </p>

          {/* Core stats */}
          <div className="space-y-1 text-sm mb-3">
            <p><span className="text-accent font-semibold">Armor Class</span> <span className="text-body">{monster.ac} ({monster.acType})</span></p>
            <p><span className="text-accent font-semibold">Hit Points</span> <span className="text-body">{monster.hp} ({monster.hpFormula})</span></p>
            <p><span className="text-accent font-semibold">Speed</span> <span className="text-body">{monster.speed}</span></p>
          </div>

          {/* Ability Scores */}
          <div className="border-t border-b border-border py-2 my-3">
            <div className="grid grid-cols-6 gap-2">
              {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map(stat => (
                <StatRow
                  key={stat}
                  label={stat.toUpperCase()}
                  value={`${monster.stats[stat]} (${getModifier(monster.stats[stat])})`}
                />
              ))}
            </div>
          </div>

          {/* Secondary stats */}
          <div className="space-y-1 text-sm mb-3">
            {monster.savingThrows && <p><span className="text-accent font-semibold">Saving Throws</span> <span className="text-body">{monster.savingThrows}</span></p>}
            {monster.skills && <p><span className="text-accent font-semibold">Skills</span> <span className="text-body">{monster.skills}</span></p>}
            {monster.damageImmunities && <p><span className="text-accent font-semibold">Damage Immunities</span> <span className="text-body">{monster.damageImmunities}</span></p>}
            {monster.damageResistances && <p><span className="text-accent font-semibold">Damage Resistances</span> <span className="text-body">{monster.damageResistances}</span></p>}
            {monster.conditionImmunities && <p><span className="text-accent font-semibold">Condition Immunities</span> <span className="text-body">{monster.conditionImmunities}</span></p>}
            <p><span className="text-accent font-semibold">Senses</span> <span className="text-body">{monster.senses}</span></p>
            <p><span className="text-accent font-semibold">Languages</span> <span className="text-body">{monster.languages}</span></p>
            {monster.legendarySaves !== undefined && (
              <p><span className="text-accent font-semibold">Legendary Saves</span> <span className="text-body">{monster.legendarySaves}/day</span></p>
            )}
          </div>

          {/* Clear float before traits/actions sections */}
          <div className="clear-both" />

          {/* Traits */}
          {monster.traits.length > 0 && (
            <div className="border-t border-border pt-2 mb-3">
              <h4 className="text-xs text-accent uppercase tracking-wider mb-2">Traits</h4>
              {monster.traits.map((trait, i) => (
                <ActionBlockInteractive key={i} action={trait} combatParticipants={combatParticipants} onApplyDamage={onApplyDamage} />
              ))}
            </div>
          )}

          {/* Actions */}
          {monster.actions.length > 0 && (
            <div className="border-t border-border pt-2 mb-3">
              <h4 className="text-xs text-danger uppercase tracking-wider mb-2">Actions</h4>
              {monster.actions.map((action, i) => (
                <ActionBlockInteractive key={i} action={action} combatParticipants={combatParticipants} onApplyDamage={onApplyDamage} />
              ))}
            </div>
          )}

          {/* Bonus Actions */}
          {monster.bonusActions && monster.bonusActions.length > 0 && (
            <div className="border-t border-border pt-2 mb-3">
              <h4 className="text-xs text-warning uppercase tracking-wider mb-2">Bonus Actions</h4>
              {monster.bonusActions.map((action, i) => (
                <ActionBlockInteractive key={i} action={action} combatParticipants={combatParticipants} onApplyDamage={onApplyDamage} />
              ))}
            </div>
          )}

          {/* Reactions */}
          {monster.reactions && monster.reactions.length > 0 && (
            <div className="border-t border-border pt-2 mb-3">
              <h4 className="text-xs text-info uppercase tracking-wider mb-2">Reactions</h4>
              {monster.reactions.map((action, i) => (
                <ActionBlockInteractive key={i} action={action} combatParticipants={combatParticipants} onApplyDamage={onApplyDamage} />
              ))}
            </div>
          )}

          {/* Legendary Actions */}
          {monster.legendaryActions && monster.legendaryActions.length > 0 && (
            <div className="border-t border-border pt-2 mb-3">
              <h4 className="text-xs text-magic uppercase tracking-wider mb-2">Legendary Actions</h4>
              {monster.legendaryActions.map((action, i) => (
                <ActionBlockInteractive key={i} action={action} combatParticipants={combatParticipants} onApplyDamage={onApplyDamage} />
              ))}
            </div>
          )}

          {/* Villain Actions */}
          {monster.villainActions && monster.villainActions.length > 0 && (
            <div className="border-t border-border pt-2 mb-3 bg-danger/5 -mx-4 px-4 py-2">
              <h4 className="text-xs text-danger uppercase tracking-wider mb-2 font-bold">Villain Actions</h4>
              {monster.villainActions.map((action, i) => (
                <ActionBlockInteractive key={i} action={action} combatParticipants={combatParticipants} onApplyDamage={onApplyDamage} />
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
