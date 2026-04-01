// ═══════════════════════════════════════════
// Adventure Types
// ═══════════════════════════════════════════

export interface AdventureTheme {
  background?: string;
  foreground?: string;
  card?: string;
  cardAlt?: string;
  border?: string;
  accent?: string;
  accentSecondary?: string;
  textMuted?: string;
  textBody?: string;
  textBright?: string;
}

export interface Adventure {
  id: string;
  name: string;
  description: string;
  headerTitle: { primary: string; secondary: string };
  theme?: AdventureTheme;
  system?: string;              // "dnd5e" default, extensible
  dmNotes?: string;             // DM context notes for AI generation
  referencePdf?: string | null; // Legacy single PDF (backward compat)
  referencePdfs?: string[];     // Multiple PDF filenames in reference/ dir
  aiGenerated?: boolean;        // Whether content was AI-generated
  createdAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════════
// Party & Character Types
// ═══════════════════════════════════════════

export interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface SpellSlots {
  [level: number]: { max: number; used: number }; // level 1-9
}

export interface PartyMember {
  id: string;
  name: string;
  class: string;
  level: number;
  ac: number;
  hp_max: number;
  hp_current: number;
  notes: string;
  conditions: string[]; // e.g. ['Blinded', 'Poisoned']
  imageUrl?: string;
  classId?: string;
  created_at?: string;
  // Ability scores & proficiencies
  stats?: AbilityScores;
  proficiencyBonus?: number;  // auto-calculated from level but overridable
  savingThrows?: string[];    // proficient saves, e.g. ['str', 'con']
  skills?: string[];          // proficient skills, e.g. ['athletics', 'perception']
  speed?: string;             // e.g. "30 ft."
  passivePerception?: number;
  // Spell slots
  spellSlots?: SpellSlots;
  cantripsKnown?: string[];   // list of cantrip names (optional, just for reference)
}

// ═══════════════════════════════════════════
// Combat Types
// ═══════════════════════════════════════════

export interface ActiveCondition {
  name: string;
  duration?: 'save-ends' | 'start-of-turn' | 'end-of-turn' | 'timed' | 'permanent';
  turnsRemaining?: number;     // For timed conditions (decrements each round)
  sourceId?: string;           // Who caused the condition
  saveDC?: number;             // DC to end (for save-ends)
  saveAbility?: string;        // Which ability save (for save-ends)
  note?: string;               // DM note about the condition
}

export interface CombatParticipant {
  id: string;
  name: string;
  type: 'pc' | 'monster';
  initiative: number;
  ac: number;
  hp_max: number;
  hp_current: number;
  conditions: string[];              // Keep for backward compat (simple condition names)
  activeConditions?: ActiveCondition[];  // Detailed conditions with duration
  monsterId?: string; // reference to monsters data if monster type
}

export interface CombatState {
  id: number;
  active: boolean;
  round: number;
  turn_index: number;
  participants: CombatParticipant[];
  updated_at?: string;
}

// ═══════════════════════════════════════════
// Spotlight / Socket Types
// ═══════════════════════════════════════════

export interface MonsterPreview {
  name: string;
  ac: number;
  hp_current: number;
  hp_max: number;
  imageUrl?: string;   // Monster portrait for Player View display
}

export interface ChallengeState {
  name: string;
  description: string;
  imageUrl?: string;   // Scene illustration for Player View display
  successes: number;
  failures: number;
  successThreshold: number;
  failureThreshold: number;
  resolved: boolean;
  outcome?: 'success' | 'failure';
}

export interface EncounterOverlay {
  rotStacks?: {
    pcId: string;
    pcName: string;
    stacks: number;
    tier: string;
    tierColor: string;
    damage: string;
    effects: string[];
  }[];
  darkness?: boolean;
}

export interface SpotlightEvent {
  type: 'narrative' | 'image' | 'combat' | 'monster' | 'challenge' | 'custom' | 'clear' | 'encounter-overlay';
  content: {
    title?: string;
    text?: string;
    imageUrl?: string;
    combatState?: {
      round: number;
      participants: {
        name: string;
        type: 'pc' | 'monster';
        hp_current: number;
        hp_max: number;
        conditions: string[];
        isActive: boolean;
      }[];
      timer?: {
        remaining: number;
        duration: number;
      };
    };
    monsterPreview?: MonsterPreview;
    challengeState?: ChallengeState;
    encounterOverlay?: EncounterOverlay;
  };
  timestamp: number;
}

// ═══════════════════════════════════════════
// Monster / Stat Block Types
// ═══════════════════════════════════════════

export interface MonsterAction {
  name: string;
  description: string;
}

export interface MonsterTrait {
  name: string;
  description: string;
}

export interface Monster {
  id: string;
  name: string;
  size: string;
  type: string;
  alignment: string;
  cr: string;
  role: string; // Leader, Support, Soldier, Minion, Controller
  ac: number;
  acType: string;
  hp: number;
  hpFormula: string;
  speed: string;
  stats: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  savingThrows?: string;
  skills?: string;
  damageImmunities?: string;
  damageResistances?: string;
  conditionImmunities?: string;
  senses: string;
  languages: string;
  traits: MonsterTrait[];
  actions: MonsterAction[];
  bonusActions?: MonsterAction[];
  reactions?: MonsterAction[];
  legendaryActions?: MonsterAction[];
  villainActions?: MonsterAction[];
  lairActions?: MonsterAction[];
  legendarySaves?: number;
  description?: string;    // Narrative read-aloud description of appearance/presence
  imageUrl?: string;       // Path to monster portrait image (e.g. /images/monsters/zenith-aastrika.webp)
  hitFlavor?: string[];    // Per-monster randomized hit narrative descriptions
  missFlavor?: string[];   // Per-monster randomized miss narrative descriptions
  namedNPC?: boolean;      // True for adventure-specific named characters (e.g. Zenith Aastrika)
}

// ═══════════════════════════════════════════
// Zone / Guide Types
// ═══════════════════════════════════════════

export interface ZoneFeature {
  name: string;
  description: string;
  dc?: number;
  mechanical?: string;
}

export interface ZoneEncounter {
  name: string;
  monsters: string[];
  notes?: string;
  dialogue?: string[];  // Ready-made in-character lines for DM to read/paraphrase
}

export interface ZoneNPC {
  name: string;
  dialogue: string[];
}

export interface ZoneTreasure {
  name: string;
  description: string;
  value?: string;
}

export interface AmbianceTrack {
  name: string;           // Short label: "Forge Hammering", "Lava Bubbling"
  description: string;    // What it sounds like / when to use it
  searchTerm: string;     // YouTube/Spotify search term for easy lookup
  youtubeUrl?: string;    // Direct YouTube video URL for embedded playback
  tags: ('exploration' | 'combat' | 'tension' | 'stealth' | 'spiritual' | 'rest' | 'boss')[]; // When to use
}

export interface ZoneAmbiance {
  music: AmbianceTrack[];   // Background music tracks/moods
  sounds: AmbianceTrack[];  // Background noise / SFX loops
}

export interface ZoneSenses {
  sight: string;     // Key visual details to call out
  sound: string;     // What you hear
  smell: string;     // What you smell
  touch: string;     // Temperature, texture, vibration
  instinct: string;  // Gut feeling — what feels off or notable
}

export type ReadAloudStyle = 'punchy' | 'atmospheric' | 'immersive';

export type GuideSectionId = 'readAloud' | 'map' | 'senses' | 'ambiance' | 'features' | 'encounters' | 'challenges' | 'npcs' | 'treasure' | 'dmNotes' | 'campaign';

export const DEFAULT_SECTION_ORDER: GuideSectionId[] = [
  'readAloud', 'map', 'senses', 'ambiance', 'features', 'encounters', 'challenges', 'npcs', 'treasure', 'dmNotes', 'campaign',
];

export interface ReadAloudText {
  punchy: string;       // 60-80 words, short and direct
  atmospheric: string;  // 80-120 words, one sensory hook per paragraph
  immersive: string;    // 150-250 words, full literary description
}

export interface Zone {
  id: string;
  name: string;
  readAloud: ReadAloudText;
  description: string;
  features: ZoneFeature[];
  encounters: ZoneEncounter[];
  npcs: ZoneNPC[];
  treasure: ZoneTreasure[];
  dmNotes: string[];
  campaignNotes: string[];
  mapImageUrl?: string;
  senses?: ZoneSenses;
  ambiance?: ZoneAmbiance;
  linkedChallenges?: string[];
}

// ═══════════════════════════════════════════
// NPC / Roleplay Types
// ═══════════════════════════════════════════

export interface NPCQuirk {
  description: string;
  dialogue: string[];  // 1-2 lines the NPC says when exhibiting this quirk
}

export interface NPCSensory {
  appearance: string;   // What they look like — key visual details
  sound: string;        // What you hear around them — voice, ambiance
  smell: string;        // What they smell like
  presence: string;     // How they make you feel — the vibe
}

export interface NPC {
  id: string;
  name: string;
  role: string;
  personality: string;
  voiceNotes: string;
  goals?: string;
  fears?: string;
  quirks?: NPCQuirk[];
  keyDialogue: string[];
  sensory?: NPCSensory;
}

// ═══════════════════════════════════════════
// Skill Challenge Types
// ═══════════════════════════════════════════

export interface SkillCheck {
  skill: string;
  dc: number;
  description: string;
}

export interface Scene {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;       // Path to scene illustration
  successThreshold: number;
  failureThreshold: number;
  skills: SkillCheck[];
  successText: string;
  failureText: string;
}

// ═══════════════════════════════════════════
// Condition Types
// ═══════════════════════════════════════════

export interface Condition {
  name: string;
  description: string;
}

// ═══════════════════════════════════════════
// Improv Toolkit Types
// ═══════════════════════════════════════════

export interface BattleCry {
  cry: string;         // The battle cry itself
  narrative: string;   // 2-3 sentence read-aloud narrative setup
}

export interface EnvironmentalEvent {
  name: string;        // Short label
  narrative: string;   // Read-aloud description for players
  mechanic: string;    // DC/damage/effect (DM-only)
}

export interface ImprovData {
  giantNames?: string[];      // Legacy field (backward compat)
  names?: string[];            // Canonical name pool
  nameLabel?: string;          // Display label (e.g. "Fire Giant Name", "Basilisk Name")
  personalityQuirks: string[];
  battleCries: BattleCry[];
  environmentalEvents: EnvironmentalEvent[];
  flavorText: {
    category: string;
    texts: string[];
  }[];
}

// ═══════════════════════════════════════════
// Image Gallery Types
// ═══════════════════════════════════════════

export interface GalleryImage {
  id: string;
  filename: string;
  title: string;
  description: string;
}

// ═══════════════════════════════════════════
// Global Library Types
// ═══════════════════════════════════════════

export type LibrarySource = 'manual' | 'imported' | 'srd' | 'ai-generated';
export type LibraryType = 'monsters' | 'treasures' | 'locations' | 'challenges' | 'ambiance' | 'classes' | 'parties';

export interface LibraryMonster extends Monster {
  source: LibrarySource;
  tags: string[];
  sourceBook?: string;
}

export interface TreasureItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'potion' | 'scroll' | 'wondrous' | 'ring' | 'wand' | 'staff' | 'other';
  rarity: 'common' | 'uncommon' | 'rare' | 'very-rare' | 'legendary' | 'artifact';
  description: string;
  properties?: string;
  value?: string;
  attunement?: boolean;
  source: LibrarySource;
  tags: string[];
}

export interface LocationTemplate {
  id: string;
  name: string;
  environment: string;  // dungeon, wilderness, urban, underground, planar, etc.
  readAloud: ReadAloudText;
  description: string;
  features: ZoneFeature[];
  senses?: ZoneSenses;
  ambiance?: ZoneAmbiance;
  source: LibrarySource;
  tags: string[];
}

export interface ChallengeTemplate {
  id: string;
  name: string;
  description: string;
  successThreshold: number;
  failureThreshold: number;
  skills: SkillCheck[];
  successText: string;
  failureText: string;
  source: LibrarySource;
  tags: string[];
}

export interface CharacterClass {
  id: string;
  name: string;
  imageUrl?: string;
  description: string;
  hitDie: string;
  primaryAbility: string;
  savingThrows?: string[];     // proficient saves for this class
  skillChoices?: string[];     // skills available to choose from
  numSkillChoices?: number;    // how many skills to pick
  source: LibrarySource;
  tags: string[];
}

export interface AmbiancePreset {
  id: string;
  name: string;
  description: string;
  environment: string;  // volcanic, forest, dungeon, urban, underwater, etc.
  music: AmbianceTrack[];
  sounds: AmbianceTrack[];
  source: LibrarySource;
  tags: string[];
}

export interface LibraryParty {
  id: string;
  name: string;
  description?: string;
  members: Omit<PartyMember, 'hp_current' | 'conditions' | 'created_at'>[];
  source: LibrarySource;
  tags: string[];
}

// ═══════════════════════════════════════════
// Loot Tracker Types
// ═══════════════════════════════════════════

export interface LootEntry {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  value?: string;         // "300 gp", "priceless"
  type: 'item' | 'currency' | 'magic-item';
  claimedBy?: string;     // party member name
  sessionId?: string;     // which session it was found
  zoneId?: string;        // where it was found
}

// ═══════════════════════════════════════════
// Handout Types
// ═══════════════════════════════════════════

export interface Handout {
  id: string;
  title: string;
  type: 'text' | 'image' | 'letter' | 'map' | 'note';
  content: string;        // Text content or image path
  imageUrl?: string;      // For image-type handouts
  playerVisible: boolean; // Whether players can see this
  zoneId?: string;        // Optionally linked to a zone
}

// ═══════════════════════════════════════════
// Session State Types
// ═══════════════════════════════════════════

export interface SessionState {
  key: string;
  value: string;
  updated_at?: string;
}
