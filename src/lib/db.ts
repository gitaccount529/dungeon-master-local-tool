import Database from 'better-sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { PartyMember, CombatState, CombatParticipant } from './types';

const DB_PATH = path.join(process.cwd(), 'data', 'session.db');

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    const fs = require('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS party_members (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      class TEXT,
      level INTEGER DEFAULT 1,
      ac INTEGER DEFAULT 10,
      hp_max INTEGER DEFAULT 1,
      hp_current INTEGER DEFAULT 1,
      notes TEXT,
      conditions TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS combat_state (
      id INTEGER PRIMARY KEY DEFAULT 1,
      active BOOLEAN DEFAULT 0,
      round INTEGER DEFAULT 1,
      turn_index INTEGER DEFAULT 0,
      participants TEXT DEFAULT '[]',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS session_state (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS spotlight_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Ensure singleton combat_state row exists
    INSERT OR IGNORE INTO combat_state (id) VALUES (1);
  `);

  // Migration: add level column to existing party_members tables
  try {
    db.exec(`ALTER TABLE party_members ADD COLUMN level INTEGER DEFAULT 1`);
  } catch {
    // Column already exists — ignore
  }

  // Migration: add ability scores, proficiency, and spell slot columns
  const newColumns = [
    { name: 'stats', sql: 'ALTER TABLE party_members ADD COLUMN stats TEXT' },
    { name: 'proficiency_bonus', sql: 'ALTER TABLE party_members ADD COLUMN proficiency_bonus INTEGER' },
    { name: 'saving_throws', sql: 'ALTER TABLE party_members ADD COLUMN saving_throws TEXT' },
    { name: 'skills', sql: 'ALTER TABLE party_members ADD COLUMN skills TEXT' },
    { name: 'speed', sql: "ALTER TABLE party_members ADD COLUMN speed TEXT" },
    { name: 'passive_perception', sql: 'ALTER TABLE party_members ADD COLUMN passive_perception INTEGER' },
    { name: 'spell_slots', sql: 'ALTER TABLE party_members ADD COLUMN spell_slots TEXT' },
    { name: 'cantrips_known', sql: 'ALTER TABLE party_members ADD COLUMN cantrips_known TEXT' },
    { name: 'image_url', sql: 'ALTER TABLE party_members ADD COLUMN image_url TEXT' },
  ];
  for (const col of newColumns) {
    try { db.exec(col.sql); } catch { /* Column already exists */ }
  }
}

// ═══════════════════════════════════════════
// Party Members CRUD
// ═══════════════════════════════════════════

function parsePartyRow(row: Record<string, unknown>): PartyMember {
  return {
    ...row,
    level: (row.level as number) ?? 1,
    conditions: JSON.parse(row.conditions as string || '[]'),
    stats: row.stats ? JSON.parse(row.stats as string) : undefined,
    proficiencyBonus: row.proficiency_bonus as number | undefined,
    savingThrows: row.saving_throws ? JSON.parse(row.saving_throws as string) : undefined,
    skills: row.skills ? JSON.parse(row.skills as string) : undefined,
    speed: row.speed as string | undefined,
    passivePerception: row.passive_perception as number | undefined,
    spellSlots: row.spell_slots ? JSON.parse(row.spell_slots as string) : undefined,
    cantripsKnown: row.cantrips_known ? JSON.parse(row.cantrips_known as string) : undefined,
    imageUrl: row.image_url as string | undefined,
  } as PartyMember;
}

export function getAllPartyMembers(): PartyMember[] {
  const rows = getDb().prepare('SELECT * FROM party_members ORDER BY created_at').all() as Array<Record<string, unknown>>;
  return rows.map(parsePartyRow);
}

export function getPartyMember(id: string): PartyMember | undefined {
  const row = getDb().prepare('SELECT * FROM party_members WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!row) return undefined;
  return parsePartyRow(row);
}

export function createPartyMember(member: Omit<PartyMember, 'id' | 'created_at'>): PartyMember {
  const id = uuidv4();
  getDb().prepare(`
    INSERT INTO party_members (id, name, class, level, ac, hp_max, hp_current, notes, conditions,
      stats, proficiency_bonus, saving_throws, skills, speed, passive_perception, spell_slots, cantrips_known, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, member.name, member.class, member.level ?? 1, member.ac, member.hp_max, member.hp_current,
    member.notes, JSON.stringify(member.conditions),
    member.stats ? JSON.stringify(member.stats) : null,
    member.proficiencyBonus ?? null,
    member.savingThrows ? JSON.stringify(member.savingThrows) : null,
    member.skills ? JSON.stringify(member.skills) : null,
    member.speed ?? null,
    member.passivePerception ?? null,
    member.spellSlots ? JSON.stringify(member.spellSlots) : null,
    member.cantripsKnown ? JSON.stringify(member.cantripsKnown) : null,
    member.imageUrl ?? null,
  );
  return { id, ...member, level: member.level ?? 1 };
}

export function updatePartyMember(id: string, updates: Partial<PartyMember>): PartyMember | undefined {
  const existing = getPartyMember(id);
  if (!existing) return undefined;

  const merged = { ...existing, ...updates };
  getDb().prepare(`
    UPDATE party_members SET name=?, class=?, level=?, ac=?, hp_max=?, hp_current=?, notes=?, conditions=?,
      stats=?, proficiency_bonus=?, saving_throws=?, skills=?, speed=?, passive_perception=?,
      spell_slots=?, cantrips_known=?, image_url=?
    WHERE id=?
  `).run(
    merged.name, merged.class, merged.level ?? 1, merged.ac, merged.hp_max, merged.hp_current,
    merged.notes, JSON.stringify(merged.conditions),
    merged.stats ? JSON.stringify(merged.stats) : null,
    merged.proficiencyBonus ?? null,
    merged.savingThrows ? JSON.stringify(merged.savingThrows) : null,
    merged.skills ? JSON.stringify(merged.skills) : null,
    merged.speed ?? null,
    merged.passivePerception ?? null,
    merged.spellSlots ? JSON.stringify(merged.spellSlots) : null,
    merged.cantripsKnown ? JSON.stringify(merged.cantripsKnown) : null,
    merged.imageUrl ?? null,
    id,
  );
  return merged;
}

export function deletePartyMember(id: string): boolean {
  const result = getDb().prepare('DELETE FROM party_members WHERE id = ?').run(id);
  return result.changes > 0;
}

// ═══════════════════════════════════════════
// Combat State
// ═══════════════════════════════════════════

export function getCombatState(): CombatState {
  const row = getDb().prepare('SELECT * FROM combat_state WHERE id = 1').get() as Record<string, unknown>;
  return {
    ...row,
    active: Boolean(row.active),
    participants: JSON.parse(row.participants as string || '[]'),
  } as CombatState;
}

export function updateCombatState(state: Partial<CombatState>): CombatState {
  const existing = getCombatState();
  const merged = { ...existing, ...state };
  getDb().prepare(`
    UPDATE combat_state SET active=?, round=?, turn_index=?, participants=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=1
  `).run(merged.active ? 1 : 0, merged.round, merged.turn_index, JSON.stringify(merged.participants));
  return merged;
}

// ═══════════════════════════════════════════
// Session State (key-value store)
// ═══════════════════════════════════════════

export function getSessionValue(key: string): string | null {
  const row = getDb().prepare('SELECT value FROM session_state WHERE key = ?').get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function setSessionValue(key: string, value: string): void {
  getDb().prepare(`
    INSERT INTO session_state (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=CURRENT_TIMESTAMP
  `).run(key, value);
}

// ═══════════════════════════════════════════
// Spotlight History
// ═══════════════════════════════════════════

export function addSpotlightHistory(type: string, content: object): void {
  getDb().prepare('INSERT INTO spotlight_history (type, content) VALUES (?, ?)').run(type, JSON.stringify(content));
}

export function getSpotlightHistory(limit = 50) {
  return getDb().prepare('SELECT * FROM spotlight_history ORDER BY sent_at DESC LIMIT ?').all(limit);
}
