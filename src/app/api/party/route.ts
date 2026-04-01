import { NextRequest, NextResponse } from 'next/server';
import { getAllPartyMembers, createPartyMember, updatePartyMember, deletePartyMember } from '@/lib/db';

export async function GET() {
  const members = getAllPartyMembers();
  return NextResponse.json(members);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const member = createPartyMember({
    name: body.name || 'New Character',
    class: body.class || '',
    level: body.level || 1,
    ac: body.ac || 10,
    hp_max: body.hp_max || 1,
    hp_current: body.hp_current || body.hp_max || 1,
    notes: body.notes || '',
    conditions: body.conditions || [],
    stats: body.stats,
    proficiencyBonus: body.proficiencyBonus,
    savingThrows: body.savingThrows,
    skills: body.skills,
    speed: body.speed,
    passivePerception: body.passivePerception,
    spellSlots: body.spellSlots,
    cantripsKnown: body.cantripsKnown,
    imageUrl: body.imageUrl,
  });
  return NextResponse.json(member, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const member = updatePartyMember(id, updates);
  if (!member) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(member);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const deleted = deletePartyMember(id);
  if (!deleted) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
