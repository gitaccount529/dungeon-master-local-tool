import type { Monster } from '@/lib/types';

// ═══════════════════════════════════════════
// Monstrous Crow — Monster Stat Block
// ═══════════════════════════════════════════

export const monstrousCrow: Monster = {
  id: 'monstrous-crow-scarlet-rot',
  name: 'Monstrous Crow of the Scarlet Rot',
  size: 'Gargantuan',
  type: 'Monstrosity',
  alignment: 'Chaotic Evil',
  cr: '21',
  role: 'Leader',
  ac: 20,
  acType: 'natural armor',
  hp: 402,
  hpFormula: '23d20 + 161',
  speed: '50 ft., climb 40 ft., fly 60 ft.',
  stats: { str: 27, dex: 18, con: 24, int: 8, wis: 16, cha: 18 },
  savingThrows: 'CON +14, WIS +10, CHA +11',
  skills: 'Athletics +15, Perception +10, Stealth +18, Deception +11',
  damageResistances: 'Poison; Nonmagical B/P/S',
  conditionImmunities: 'Charmed, Dazed, Frightened, Paralyzed, Petrified, Poisoned, Stunned',
  senses: 'Blindsight 120 ft., Truesight 60 ft., PP 20',
  languages: 'Common, Abyssal (mimicry only)',
  namedNPC: true,
  imageUrl: '/images/encounters/monstrous-crow.png',
  description: 'A towering horror of matted feathers and exposed, tumor-riddled flesh. Its single gleaming eye tracks movement with predatory intelligence while scarlet rot weeps from every wound, leaving a trail of diseased mire in its wake.',

  traits: [
    {
      name: 'Rotting Resilience (3/Day)',
      description: 'When the Monstrous Crow fails a saving throw, it can choose to succeed instead. When it does, its speed is halved, it can\'t take the Disengage action, and it can\'t use Ruin-Hop until the end of its next turn.',
    },
    {
      name: 'Magic Resistance',
      description: 'The Monstrous Crow has advantage on saving throws against spells and other magical effects.',
    },
    {
      name: 'Mimic the Dying',
      description: 'The crow can perfectly mimic Corwyn\'s voice or any creature it has heard — screams, pleas, warnings, spellcasting words. A creature that hears the mimicry can tell it is false with a successful DC 19 Wisdom (Insight) check.',
    },
    {
      name: 'Kenku Recall',
      description: 'The crow remembers every attack used against it. If a creature repeats the same attack type (same spell or same weapon) it already used in a previous round, that attack has disadvantage.',
    },
    {
      name: 'Rogue\'s Instinct',
      description: 'The crow has Evasion (Dex saves: success = no damage, fail = half). It can Hide as a bonus action. Double proficiency on Stealth (included above).',
    },
    {
      name: 'Pounce',
      description: 'If the crow moves at least 20 ft. straight toward a creature and then hits it with a Carrion Talon on the same turn, that target must succeed on a DC 19 Strength save or be knocked prone. If the target is prone, the crow can make one Rending Beak attack against it as a bonus action.',
    },
    {
      name: 'Running Leap',
      description: 'With a 10-foot running start, the crow can long jump up to 30 ft. and high jump up to 20 ft.',
    },
    {
      name: 'Scarlet Mire Strider',
      description: 'Ignores difficult terrain from scarlet rot, ruined stone, corpses, or rubble.',
    },
    {
      name: 'Consumed Rot (3/Day)',
      description: 'On a successful save, the crow hardens itself. Until end of its next turn, scarlet rot doesn\'t affect it and it can\'t be blinded.',
    },
  ],

  actions: [
    {
      name: 'Multiattack',
      description: 'The crow makes one Rending Beak and two Carrion Talon attacks. It can replace one Talon with a Snatch.',
    },
    {
      name: 'Rending Beak',
      description: 'Melee Weapon Attack: +15 to hit, reach 15 ft., one target. Hit: 33 (4d12+8) piercing damage. If the target is Medium or smaller, it is grappled (escape DC 19). Until this grapple ends, the target is restrained, and the crow can\'t bite another target.',
    },
    {
      name: 'Carrion Talon',
      description: 'Melee Weapon Attack: +15 to hit, reach 10 ft., one target. Hit: 20 (3d8+8) slashing damage, and the crow can move the target up to 15 ft. horizontally if the target is Huge or smaller.',
    },
    {
      name: 'Snatch',
      description: 'Melee Weapon Attack: +15 to hit, reach 10 ft., one target. On hit, DC 19 Dex save or the crow steals one held/worn item (weapon, shield, focus, component pouch, etc.) and drops it in scarlet rot 30 ft. away. Action to retrieve.',
    },
    {
      name: 'Blightshriek (Recharge 5\u20136)',
      description: '90 ft. line, 20 ft. wide. DC 19 Con save or 28 (8d6) poison damage and gain 2 Scarlet Rot stacks (half damage, 1 stack on save). Affected area becomes scarlet rot terrain for 1 minute.',
    },
    {
      name: 'Wing Gust (Recharge 5\u20136)',
      description: '60 ft. cone. DC 19 Str save or 24 (7d6) bludgeoning + pushed 30 ft. + prone (half, no push on save). Ranged attacks through the area have disadvantage until end of crow\'s next turn.',
    },
  ],

  bonusActions: [
    {
      name: 'Discordant Squawk',
      description: 'All enemies within 60 ft. that can hear: DC 19 Intelligence save or \u20132 penalty on attack rolls until start of crow\'s next turn.',
    },
    {
      name: 'Bloodmist Veil',
      description: 'One creature within 120 ft. DC 19 Dex save or lightly obscured to itself (disadvantage on Perception and ranged attacks) and gains 1 Scarlet Rot stack. Until start of crow\'s next turn.',
    },
    {
      name: 'Ruin-Hop',
      description: 'Leaps up to half speed without provoking opportunity attacks. Must end on rubble, broken architecture, or in scarlet rot.',
    },
    {
      name: 'Phantom Wall (Illusion)',
      description: 'Creates a 20 ft. \u00d7 20 ft. illusory wall within 120 ft. blocking line of sight. DC 19 Investigation (action) to see through. Lasts 1 minute or until used again. Crow sees through its own illusions.',
    },
  ],

  reactions: [
    {
      name: 'Feint',
      description: 'Trigger: Hit by a melee attack. The crow feigns a stagger. Ask the next player: "The crow looks stunned and vulnerable \u2014 do you want to take advantage?" If they attack with advantage, the crow makes a Rending Beak that automatically hits.',
    },
    {
      name: 'Spoil the Cure',
      description: 'Trigger: A creature within 60 ft. regains HP. DC 19 Con save or regains only half and gains 1 Scarlet Rot stack.',
    },
    {
      name: 'Snatch and Grab',
      description: 'Trigger: A creature within 10 ft. casts a spell using a focus or material component. DC 19 Dex save or the crow steals the focus. Spell fails (slot not expended).',
    },
  ],

  legendaryActions: [
    { name: 'Talon Strike (1)', description: 'Make one Carrion Talon attack.' },
    { name: 'Ruin-Hop (1)', description: 'Leap up to half speed without provoking. End on rubble, architecture, or scarlet rot.' },
    { name: 'Squawk (1)', description: 'Use Discordant Squawk.' },
    { name: 'Snatch (2)', description: 'Make one Snatch attack.' },
    { name: 'Wing Buffet (2)', description: 'Each creature within 15 ft: DC 19 Dex save or 12 (2d6+5) bludgeoning, pushed 10 ft., +1 Scarlet Rot stack. Crow can Ruin-Hop (free).' },
    { name: 'Phantom Wall (2)', description: 'Use Phantom Wall.' },
    { name: 'Blinding Bile (3)', description: 'Spit bile at one creature within 60 ft. +15 to hit. On hit: 14 (4d6) poison damage and 3 Scarlet Rot stacks.' },
  ],

  villainActions: [
    {
      name: 'Villain Action 1 \u2014 Stolen Darkness',
      description: 'Magical Darkness fills the entire lair (300 ft. radius) until end of crow\'s next turn. The crow can see through it. Light spells of 4th level or lower are suppressed. Creatures inside can\'t see unless they have special senses. The crow immediately uses Ruin-Hop (free).',
    },
    {
      name: 'Villain Action 2 \u2014 Rot-Shed Form',
      description: 'Gains resistance to B/P/S and can move through creatures and objects (difficult terrain) until end of next turn. Any creature it passes through: DC 19 Con save or gain 2 Scarlet Rot stacks. Then teleports up to 120 ft. Makes one Snatch attempt (free).',
    },
    {
      name: 'Villain Action 3 \u2014 Death Throes Mimicry (Ultimate)',
      description: 'Trigger: Crow reduced to 100 HP or below (25%) for the first time. Every creature that can hear: DC 19 Wisdom save. Failure = stunned until end of next turn (believes they are killing Corwyn). Crow immediately makes a full Multiattack (1 Rending Beak + 2 Carrion Talons) targeting stunned creatures first. Success = immune and recognizes mimicry.',
    },
  ],

  legendarySaves: 3,

  hitFlavor: [
    'The blow crunches through matted feathers, spattering scarlet ichor.',
    'Steel bites into diseased flesh — the crow shrieks, a sound like tearing metal.',
    'The strike connects with a wet thud. Something inside the crow ruptures and leaks red mist.',
    'Your weapon sinks deep. The wound immediately begins weeping scarlet rot.',
  ],
  missFlavor: [
    'The crow twists with impossible speed, your strike slicing only air and rot-mist.',
    'It hops aside on those grotesque legs — faster than anything that size should move.',
    'Your weapon passes through a cloud of scarlet mist where the crow was a heartbeat ago.',
    'The crow flicks a wing almost lazily, deflecting the blow with a shower of diseased feathers.',
  ],
};

// ═══════════════════════════════════════════
// Scarlet Rot Stacking System
// ═══════════════════════════════════════════

export const ROT_MAX_STACKS = 10;

export interface RotTier {
  id: string;
  name: string;
  range: [number, number];
  damage: string;
  effect: string;
  exhaustion?: number;
  color: string;
  tailwindColor: string;
}

export const SCARLET_ROT_TIERS: RotTier[] = [
  {
    id: 'none',
    name: 'Clean',
    range: [0, 0],
    damage: '0',
    effect: 'No effect.',
    color: '#4A5568',
    tailwindColor: 'text-gray-500',
  },
  {
    id: 'festering',
    name: 'Festering',
    range: [1, 2],
    damage: '3 (1d6)',
    effect: 'Poison damage at start of turn. Skin reddens and itches.',
    color: '#C05621',
    tailwindColor: 'text-orange-600',
  },
  {
    id: 'spreading',
    name: 'Spreading',
    range: [3, 4],
    damage: '7 (2d6)',
    effect: 'Poison damage at start of turn. Disadvantage on Perception checks. Passive Perception reduced by 5.',
    color: '#C53030',
    tailwindColor: 'text-red-600',
  },
  {
    id: 'consuming',
    name: 'Consuming',
    range: [5, 6],
    damage: '10 (3d6)',
    effect: 'Poison damage at start of turn. Disadvantage on attack rolls. Speed reduced by 10 ft.',
    color: '#9B2C2C',
    tailwindColor: 'text-red-800',
  },
  {
    id: 'rotting',
    name: 'Rotting',
    range: [7, 8],
    damage: '14 (4d6)',
    effect: 'Poison damage at start of turn. 1 level of exhaustion from rot. Speed halved.',
    exhaustion: 1,
    color: '#742A2A',
    tailwindColor: 'text-red-900',
  },
  {
    id: 'consumed',
    name: 'Consumed',
    range: [9, 10],
    damage: '17 (5d6)',
    effect: 'Poison damage at start of turn. 2 levels of exhaustion from rot. Can\'t regain HP. Death at 6 exhaustion.',
    exhaustion: 2,
    color: '#1A0A0A',
    tailwindColor: 'text-gray-900',
  },
];

export function getRotTier(stacks: number): RotTier {
  return SCARLET_ROT_TIERS.find(t => stacks >= t.range[0] && stacks <= t.range[1]) || SCARLET_ROT_TIERS[0];
}

export const ROT_SOURCES: Record<string, { stacks: number; note: string }> = {
  terrain: { stacks: 1, note: 'Enter or start turn in scarlet rot terrain (no save)' },
  blightshriek_fail: { stacks: 2, note: 'Blightshriek (failed save)' },
  blightshriek_save: { stacks: 1, note: 'Blightshriek (successful save)' },
  bloodmist_veil: { stacks: 1, note: 'Bloodmist Veil (failed save)' },
  rot_shed_form: { stacks: 2, note: 'Rot-Shed Form (failed save)' },
  wing_buffet: { stacks: 1, note: 'Wing Buffet (failed save)' },
  blinding_bile: { stacks: 3, note: 'Blinding Bile (hit)' },
  spoil_the_cure: { stacks: 1, note: 'Spoil the Cure (failed save)' },
  prone_in_rot: { stacks: 2, note: 'Knocked prone into rot' },
  crumbling_platform: { stacks: 2, note: 'Platform destroyed, fell into rot' },
};

export const ROT_REMOVAL = [
  { method: 'Lesser Restoration', effect: 'Removes ALL stacks and rot-caused exhaustion.' },
  { method: 'DC 15 Medicine (action)', effect: 'Removes 2 stacks from self or adjacent ally.' },
  { method: 'Magical healing 20+ HP', effect: 'Removes 1 stack.' },
  { method: 'Short rest', effect: 'Removes 2 stacks (if not standing in rot).' },
  { method: 'Long rest', effect: 'Removes all stacks and 1 level of rot-caused exhaustion.' },
];

// ═══════════════════════════════════════════
// Trinkets (Shiny Trophies)
// ═══════════════════════════════════════════

export interface CrowTrinket {
  id: string;
  name: string;
  effect: string;
  description: string;
  stealDC: number;
  stealSkills: string[];
  destroyAC: number;
  destroyHP: number;
}

export const CROW_TRINKETS: CrowTrinket[] = [
  {
    id: 'gleaming-eye',
    name: 'Gleaming Eye',
    effect: 'Foresight',
    description: 'Can\'t be surprised. Advantage on attack rolls. Attacks against it have disadvantage.',
    stealDC: 19,
    stealSkills: ['Athletics', 'Sleight of Hand'],
    destroyAC: 18,
    destroyHP: 15,
  },
  {
    id: 'rattling-chain',
    name: 'Rattling Chain',
    effect: 'Haste',
    description: '+2 AC. Speed doubled. One extra action each turn (Attack [one attack only], Dash, Disengage, Hide, or Use Object).',
    stealDC: 19,
    stealSkills: ['Athletics', 'Sleight of Hand'],
    destroyAC: 18,
    destroyHP: 15,
  },
  {
    id: 'feathered-charm',
    name: 'Feathered Charm',
    effect: 'Flight + Gust',
    description: 'Fly 60 ft. Ranged weapon attacks within 15 ft. have disadvantage. Casting a spell without an attack roll requires DC 19 Athletics or the spell fails (slot not expended).',
    stealDC: 19,
    stealSkills: ['Athletics', 'Sleight of Hand'],
    destroyAC: 18,
    destroyHP: 15,
  },
];

// ═══════════════════════════════════════════
// Legendary Action Options (with costs)
// ═══════════════════════════════════════════

export interface LegendaryOption {
  name: string;
  cost: number;
  description: string;
}

export const CROW_LEGENDARY_OPTIONS: LegendaryOption[] = [
  { name: 'Talon Strike', cost: 1, description: 'Make one Carrion Talon attack.' },
  { name: 'Ruin-Hop', cost: 1, description: 'Leap up to half speed without provoking. End on rubble, architecture, or scarlet rot.' },
  { name: 'Squawk', cost: 1, description: 'Use Discordant Squawk.' },
  { name: 'Snatch', cost: 2, description: 'Make one Snatch attack.' },
  { name: 'Wing Buffet', cost: 2, description: 'Each creature within 15 ft: DC 19 Dex save or 12 (2d6+5) bludgeoning, pushed 10 ft., +1 Scarlet Rot stack. Crow can Ruin-Hop (free).' },
  { name: 'Phantom Wall', cost: 2, description: 'Use Phantom Wall.' },
  { name: 'Blinding Bile', cost: 3, description: 'Spit bile at one creature within 60 ft. +15 to hit. On hit: 14 (4d6) poison damage and 3 Scarlet Rot stacks.' },
];

export const LEGENDARY_ACTIONS_PER_ROUND = 4;

// ═══════════════════════════════════════════
// Villain Actions (with tells & spotlight)
// ═══════════════════════════════════════════

export interface CrowVillainAction {
  id: string;
  name: string;
  label: string;
  tell: string;
  effect: string;
  spotlightText: string;
  dmNote?: string;
  autoTrigger?: boolean;
  hpThreshold?: number;
}

export const CROW_VILLAIN_ACTIONS: CrowVillainAction[] = [
  {
    id: 'stolen-darkness',
    name: 'Stolen Darkness',
    label: 'Opener',
    tell: 'The crow\'s single glowing eye pulses and dies. Every light in the temple gutters and goes out. An unnatural, choking blackness swallows everything.',
    effect: 'Magical Darkness fills the entire lair (300 ft. radius) until end of crow\'s next turn. The crow can see through it. Light spells of 4th level or lower are suppressed. Creatures inside can\'t see unless they have special senses. The crow immediately uses Ruin-Hop (free).',
    spotlightText: 'Darkness swallows the temple. Every torch, every spell-light gutters and dies. You can\'t see anything.',
  },
  {
    id: 'rot-shed-form',
    name: 'Rot-Shed Form',
    label: 'Crowd Control',
    tell: 'Diseased flesh and feathers slough off the crow in wet sheets. Its body becomes half-vaporous, trailing scarlet mist as it surges through the ruins.',
    effect: 'Gains resistance to B/P/S and can move through creatures and objects (difficult terrain) until end of next turn. Any creature it passes through: DC 19 Con save or gain 2 Scarlet Rot stacks. Then teleports up to 120 ft. Makes one Snatch attempt (free).',
    spotlightText: 'The crow\'s body tears apart \u2014 flesh and feathers raining down \u2014 and surges forward as a vaporous horror trailing scarlet mist.',
  },
  {
    id: 'death-throes-mimicry',
    name: 'Death Throes Mimicry',
    label: 'Ultimate \u2014 Reactive',
    tell: 'The crow staggers. Its grotesque form twists and shudders \u2014 and then it screams. Not a screech. Not a shriek. Corwyn\'s voice rips from its throat, raw and desperate: "Please \u2014 stop! It\'s me! You\'re killing me! I\'m still in here!" The voice cracks. It sounds real. It sounds like your friend.',
    effect: 'Every creature that can hear: DC 19 Wisdom save. Failure = stunned until end of next turn (believes they are killing Corwyn). Crow immediately makes a full Multiattack (1 Rending Beak + 2 Carrion Talons) targeting stunned creatures first. Success = immune and recognizes mimicry.',
    spotlightText: '"Please \u2014 stop! It\'s me! You\'re killing me! I\'m still in here!"',
    dmNote: 'This is the moment the fight turns. Narrate it hard. Let it breathe before you roll the Multiattack.',
    autoTrigger: true,
    hpThreshold: 100,
  },
];

// ═══════════════════════════════════════════
// Lair: Ruined Temple of Scarlet Rot
// ═══════════════════════════════════════════

export const RUINED_TEMPLE = {
  name: 'Ruined Temple of Scarlet Rot',
  image: '/images/encounters/ruined-temple.png',

  readAloud: {
    approach: 'The air thickens with a wet, coppery stench long before you see the temple. Through the red mist, broken arches emerge \u2014 the skeleton of a cathedral half-swallowed by something worse than time. The floor is gone. In its place, a shallow lake of foul scarlet mire stretches from wall to crumbling wall. It moves. Not like water. Like something alive and spreading. Broken columns and fallen slabs of stone jut from the rot like islands \u2014 the only dry ground in sight. And somewhere in the mist, above the soft wet sounds of the rot, you hear a voice. Corwyn\'s voice. Screaming.',
    darkness: 'Every light dies. The torches. The spell-glow. Even the faint red luminescence of the rot itself. You are blind. The only thing left is sound \u2014 the wet shifting of the mire, the scrape of talons on stone, and somewhere in the dark, that horrible mimicry of your friend\'s voice.',
    deluge: 'The crow convulses. Something inside it ruptures \u2014 and a torrent of blistering scarlet bile erupts from its maw, its wounds, its eyes. The rot surges across the temple floor in a rising tide, swallowing the last safe ground.',
  },

  terrain: [
    {
      name: 'Scarlet Rot Terrain',
      description: 'Temple floor drowned in foul red mire. +1 Scarlet Rot stack when entering or starting turn in it. No save \u2014 automatic contact.',
      effect: '+1 Scarlet Rot stack per exposure',
    },
    {
      name: 'Safe Footing',
      description: 'Elevated debris, broken columns, fallen slabs, altar fragments, broken pews. Difficult terrain but safe from rot.',
      effect: 'The crow always knows which spaces are safe.',
    },
    {
      name: 'Crumbling Architecture',
      description: 'Columns and platforms can be destroyed (AC 15, 30 HP). Creature standing on destroyed platform falls into rot: +2 Scarlet Rot stacks.',
      effect: 'AC 15, 30 HP to destroy',
    },
    {
      name: 'Visibility',
      description: 'Red mist fills the temple. Creatures more than 60 ft. away are lightly obscured. Crow\'s blindsight 120 ft. and truesight 60 ft. ignore this.',
      effect: '>60 ft. = lightly obscured',
    },
  ],

  features: [
    {
      name: 'Elevated Ruins',
      description: 'Scattered rubble, broken columns, and fallen masonry provide platforms above the rot. Difficult terrain but safe from stacking. The crow moves freely through both.',
    },
    {
      name: 'Corwyn\'s Voice',
      description: 'The crow periodically mimics Corwyn\'s screams, pleas, or warnings to lure the Keepers into the rot or away from safe footing. DC 19 Insight to realize it\'s the crow.',
    },
    {
      name: 'Crumbling Architecture',
      description: 'Columns and platforms: AC 15, 30 HP. If destroyed while a creature stands on it, creature falls into rot and gains +2 Scarlet Rot stacks.',
    },
    {
      name: 'Visibility',
      description: 'Red mist. >60 ft. = lightly obscured. Crow\'s blindsight 120 ft. and truesight 60 ft. ignore this.',
    },
  ],
};

// ═══════════════════════════════════════════
// Encounter Guide (DM Flow)
// ═══════════════════════════════════════════

export interface GuidePhase {
  id: string;
  name: string;
  label: string;
  notes: string[];
  readAloud?: string;
  dmTips?: string[];
}

export const ENCOUNTER_GUIDE: GuidePhase[] = [
  {
    id: 'pre-combat',
    name: 'Pre-Combat',
    label: 'Setup',
    notes: [
      'Read aloud the approach text. Spotlight the ruined temple art to players.',
      'Describe the scarlet rot, the broken columns, Corwyn\'s voice.',
      'Let players position themselves on safe footing.',
      'The crow is perched on a high ruin, watching. It mimics Corwyn: "Help me... I\'m up here..."',
    ],
    readAloud: RUINED_TEMPLE.readAloud.approach,
    dmTips: [
      'All three trinkets are visibly dangling from the crow. Describe them glowing.',
      'Corwyn\'s voice should sound desperate and real. Don\'t reveal the mimicry.',
    ],
  },
  {
    id: 'round-1',
    name: 'Round 1',
    label: 'Stolen Darkness',
    notes: [
      'Crow acts. Villain Action 1: Stolen Darkness (magical darkness fills lair).',
      'Spotlight darkness text to players. Optionally dim their screens.',
      'Crow Ruin-Hops to new position in the dark.',
      'Players act blind unless they have special senses.',
    ],
    readAloud: RUINED_TEMPLE.readAloud.darkness,
    dmTips: [
      'Use the Darkness toggle to dim player screens.',
      'The crow has blindsight 120 ft. \u2014 it can fight in its own darkness.',
    ],
  },
  {
    id: 'round-2',
    name: 'Round 2',
    label: 'Rot-Shed Form',
    notes: [
      'Crow uses Villain Action 2: Rot-Shed Form.',
      'Phases through party, applies rot stacks, teleports, Snatches an item.',
      'Spotlight the Rot-Shed tell text.',
      'Players now dealing with stolen items in rot pools + rising stacks.',
    ],
    dmTips: [
      'Target the healer\'s focus or the fighter\'s shield with Snatch.',
      'The phase-through applies 2 stacks per PC it passes \u2014 this can spike fast.',
    ],
  },
  {
    id: 'round-3-plus',
    name: 'Round 3+',
    label: 'Legendary Pressure',
    notes: [
      'Legendary action pressure: 4 actions per round.',
      'Talon Strike and Ruin-Hop for mobility. Wing Buffet when they cluster.',
      'Blinding Bile (3 actions) to spike rot stacks on key targets.',
      'Use Feint reaction to bait melee attackers.',
      'Use Spoil the Cure whenever someone heals.',
      'Discordant Squawk to debuff attack rolls.',
      'Track Kenku Recall \u2014 punish repeated attacks.',
    ],
    dmTips: [
      'Rotate targets. Don\'t focus one PC unless they have a trinket.',
      'If a PC has 5+ stacks, Spoil the Cure becomes devastating.',
      'Phantom Wall to split the party or block line of sight to healers.',
    ],
  },
  {
    id: 'death-throes',
    name: 'Death Throes',
    label: 'Ultimate',
    notes: [
      'AUTO-TRIGGERS at 100 HP. Do not delay.',
      'Spotlight Corwyn\'s scream text to all players.',
      'DC 19 Wis save. Stunned on fail.',
      'Full Multiattack into stunned targets.',
    ],
    readAloud: CROW_VILLAIN_ACTIONS[2].tell,
    dmTips: [
      'Let the moment breathe. This is the emotional peak.',
      'Players who fail genuinely believed they were murdering Corwyn.',
      'Narrate it hard before rolling the Multiattack.',
    ],
  },
  {
    id: 'post-combat',
    name: 'Post-Combat',
    label: 'Aftermath',
    notes: [
      'The crow collapses. The rot begins to recede slowly.',
      'Trinkets can be recovered from the corpse.',
      'If Corwyn is alive somewhere in the temple, this is the rescue moment.',
      'Scarlet rot stacks persist \u2014 players need to address them before resting.',
    ],
    dmTips: [
      'PCs still have rot stacks. Lesser Restoration or a Medicine check.',
      'Exhaustion from rot doesn\'t go away with a short rest.',
    ],
  },
];

// ═══════════════════════════════════════════
// Encounter State Types (for session_state KV)
// ═══════════════════════════════════════════

export interface ScarletRotPCState {
  pcId: string;
  pcName: string;
  stacks: number;
  exhaustionFromRot: number;
}

export interface TrinketState {
  id: string;
  status: 'active' | 'stolen' | 'destroyed';
  holderPcId?: string;
  currentHp: number;
}

export interface VillainActionState {
  id: string;
  used: boolean;
  usedAtRound?: number;
}

export interface LegendaryPoolState {
  remaining: number;
  max: number;
}

export interface KenkuRecallState {
  round: number;
  currentRound: Record<string, string[]>;
  previousRound: Record<string, string[]>;
}

export interface CrowEncounterState {
  rotStacks: ScarletRotPCState[];
  trinkets: TrinketState[];
  villainActions: VillainActionState[];
  legendaryPool: LegendaryPoolState;
  kenkuRecall: KenkuRecallState;
  darknessActive: boolean;
}

export function createInitialEncounterState(partyMembers: { id: string; name: string }[]): CrowEncounterState {
  return {
    rotStacks: partyMembers.map(pc => ({
      pcId: pc.id,
      pcName: pc.name,
      stacks: 0,
      exhaustionFromRot: 0,
    })),
    trinkets: CROW_TRINKETS.map(t => ({
      id: t.id,
      status: 'active' as const,
      currentHp: t.destroyHP,
    })),
    villainActions: CROW_VILLAIN_ACTIONS.map(va => ({
      id: va.id,
      used: false,
    })),
    legendaryPool: {
      remaining: LEGENDARY_ACTIONS_PER_ROUND,
      max: LEGENDARY_ACTIONS_PER_ROUND,
    },
    kenkuRecall: {
      round: 1,
      currentRound: {},
      previousRound: {},
    },
    darknessActive: false,
  };
}
