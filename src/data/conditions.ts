import type { Condition } from '@/lib/types';

export const conditions: Condition[] = [
  {
    name: 'Blinded',
    description: "Can't see. Auto-fail sight checks. Attacks vs have advantage, own attacks disadvantage.",
  },
  {
    name: 'Charmed',
    description: "Can't attack charmer. Charmer has advantage on social checks.",
  },
  {
    name: 'Deafened',
    description: "Can't hear. Auto-fail hearing checks.",
  },
  {
    name: 'Frightened',
    description: "Disadvantage on checks/attacks while source visible. Can't move closer.",
  },
  {
    name: 'Grappled',
    description: 'Speed is 0. Ends if grappler incapacitated.',
  },
  {
    name: 'Incapacitated',
    description: "Can't take actions or reactions.",
  },
  {
    name: 'Invisible',
    description: 'Attacks vs disadvantage, own attacks advantage.',
  },
  {
    name: 'Paralyzed',
    description: 'Incapacitated. Auto-fail STR/DEX saves. Hits within 5ft are crits.',
  },
  {
    name: 'Petrified',
    description: 'Turned to stone. Weight x10. Resistance to all damage.',
  },
  {
    name: 'Poisoned',
    description: 'Disadvantage on attacks and ability checks.',
  },
  {
    name: 'Prone',
    description: 'Disadvantage on attacks. Melee vs have advantage. Half movement to stand.',
  },
  {
    name: 'Restrained',
    description: 'Speed 0. Attacks vs advantage. Own attacks disadvantage. DEX saves disadvantage.',
  },
  {
    name: 'Stunned',
    description: 'Incapacitated. Auto-fail STR/DEX. Attacks vs advantage.',
  },
  {
    name: 'Unconscious',
    description: 'Incapacitated, prone. Auto-fail STR/DEX. Melee hits within 5ft crit.',
  },
  {
    name: 'Exhaustion 1',
    description: 'Disadvantage on ability checks.',
  },
  {
    name: 'Exhaustion 2',
    description: 'Speed halved.',
  },
  {
    name: 'Exhaustion 3',
    description: 'Disadvantage on attacks and saves.',
  },
  {
    name: 'Concentrating',
    description: 'CON save on damage (DC 10 or half damage) or lose spell.',
  },
  {
    name: 'On Fire',
    description: 'Takes fire damage at start of turn. Action to extinguish.',
  },
];
