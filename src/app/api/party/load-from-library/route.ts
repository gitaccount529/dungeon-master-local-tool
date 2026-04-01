import { NextRequest, NextResponse } from 'next/server';
import { loadLibrary } from '@/lib/libraries';
import { getAllPartyMembers, createPartyMember, deletePartyMember } from '@/lib/db';
import type { LibraryParty, PartyMember } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { partyId, mode } = await request.json() as { partyId: string; mode: 'replace' | 'append' };

    if (!partyId || !['replace', 'append'].includes(mode)) {
      return NextResponse.json({ error: 'partyId and mode (replace|append) are required' }, { status: 400 });
    }

    const parties = loadLibrary('parties') as LibraryParty[];
    const party = parties.find(p => p.id === partyId);
    if (!party) {
      return NextResponse.json({ error: 'Party not found in library' }, { status: 404 });
    }

    // In replace mode, delete all existing party members
    if (mode === 'replace') {
      const existing = getAllPartyMembers();
      for (const member of existing) {
        deletePartyMember(member.id);
      }
    }

    // Create each member with fresh IDs, full HP, and no conditions
    const created: PartyMember[] = [];
    for (const template of party.members) {
      const member = createPartyMember({
        name: template.name,
        class: template.class,
        level: template.level,
        ac: template.ac,
        hp_max: template.hp_max,
        hp_current: template.hp_max, // Start at full HP
        notes: template.notes,
        conditions: [],              // Start with no conditions
        imageUrl: template.imageUrl,
        classId: template.classId,
        stats: template.stats,
        proficiencyBonus: template.proficiencyBonus,
        savingThrows: template.savingThrows,
        skills: template.skills,
        speed: template.speed,
        passivePerception: template.passivePerception,
        spellSlots: template.spellSlots,
        cantripsKnown: template.cantripsKnown,
      });
      created.push(member);
    }

    return NextResponse.json({ members: created, count: created.length });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
