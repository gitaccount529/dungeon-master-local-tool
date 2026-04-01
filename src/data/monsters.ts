import type { Monster } from '@/lib/types';

export const monsters: Monster[] = [
  {
    id: 'zenith-aastrika',
    name: 'Zenith Aastrika',
    size: 'Huge',
    type: 'Giant',
    alignment: 'Lawful Neutral',
    cr: '12',
    role: 'Leader',
    ac: 18,
    acType: 'natural armor',
    hp: 225,
    hpFormula: '18d12 + 108',
    speed: '50 ft.',
    stats: { str: 25, dex: 16, con: 23, int: 10, wis: 23, cha: 14 },
    savingThrows: 'STR +11, DEX +7, CON +10, WIS +10',
    skills: 'Athletics +11, Perception +10, Persuasion +6',
    damageImmunities: 'fire',
    conditionImmunities: 'charmed, frightened',
    senses: 'passive Perception 20',
    languages: 'Giant, Primordial',
    legendarySaves: 3,
    traits: [
      {
        name: 'Battle Tranquility (3/Day)',
        description: 'When Aastrika fails a saving throw, she can choose to succeed instead. When she does so, she can\'t use Sweltering Heat until the end of her next turn.',
      },
      {
        name: 'Molten Flesh',
        description: 'The first time a creature other than a fire giant touches Aastrika or hits her with a melee attack on a turn, that creature takes 7 (2d6) fire damage.',
      },
    ],
    actions: [
      {
        name: 'Multiattack',
        description: 'Aastrika takes the Disengage action and makes up to three attacks using Unarmed Strike, Hurl Flame, or both.',
      },
      {
        name: 'Unarmed Strike',
        description: 'Melee Weapon Attack: +11 to hit, reach 10 ft., one target. Hit: 21 (4d6 + 7) bludgeoning damage plus 7 (2d6) fire damage. If the target is a creature, they are outlined in red light until the start of Aastrika\'s next turn, and for the duration, attack rolls against them have advantage.',
      },
      {
        name: 'Hurl Flame',
        description: 'Ranged Spell Attack: +10 to hit, range 180 ft., one target. Hit: 20 (4d6 + 6) fire damage.',
      },
      {
        name: 'Lava Pillar (Recharge 5-6)',
        description: 'Aastrika causes a 20-foot-radius, 60-foot-high cylinder of lava to erupt from the ground at a point she can see within 120 feet of her. Each creature in that area must make a DC 18 Dexterity saving throw, taking 38 (11d6) fire damage on a failed save, or half as much damage on a successful one.',
      },
    ],
    bonusActions: [
      {
        name: 'Sweltering Heat',
        description: 'Aastrika\'s inner flame pulses harshly. Each creature within 20 feet of her who doesn\'t have resistance or immunity to fire damage must succeed on a DC 18 Constitution saving throw or gain a level of exhaustion.',
      },
    ],
    reactions: [
      {
        name: 'Power of Flame',
        description: 'When another fire giant Aastrika can see within 60 feet of her misses with a weapon attack, Aastrika causes flame to trail from the attacker. The attacker rolls damage for the attack as if they had hit, and the target takes half that amount as fire damage instead of taking the full amount of normal damage.',
      },
    ],
    villainActions: [
      {
        name: 'Villain Action 1 — Forward!',
        description: 'Aastrika and up to three creatures she can see can move up to their speed without provoking opportunity attacks and make one melee attack each.',
      },
      {
        name: 'Villain Action 2 — The Manifold Self',
        description: 'Aastrika disappears in a flash of light and teleports to an unoccupied space within 30 feet. Five fire giant troopers appear in unoccupied spaces within 30 feet of the space she teleported from. They act immediately.',
      },
      {
        name: 'Villain Action 3 — This. Ends. Now.',
        description: 'Aastrika and each willing fire giant within 60 feet of her unleashes a burst of heat. Each creature within 10 feet of Aastrika or one of these fire giants must make a DC 18 Dexterity saving throw, taking 55 (10d10) fire damage on a failed save, or half as much damage on a successful one.',
      },
    ],
    namedNPC: true,
    imageUrl: '/images/monsters/zenith-aastrika.webp',
    description: 'Zenith Aastrika towers above even her own kind — a fire giant queen who radiates authority the way the volcano radiates heat. Her skin glows with an inner molten light, veins of liquid fire tracing across her arms and shoulders like cracks in cooling lava. When she moves, the ground itself seems to defer — lava channels brighten, shadows retreat, and every giant in the room stands a little straighter.',
    hitFlavor: [
      'Aastrika\'s massive fist crashes into her target with the force of a volcanic eruption, fire blooming from the point of impact in a ring of orange and white.',
      'The queen drives her knuckles forward with devastating precision, molten flesh searing on contact — the blow leaves a glowing handprint burned into armor and skin alike.',
      'With a warrior\'s roar that shakes dust from the ceiling, Aastrika slams her open palm home, the impact sending a shockwave of heat rippling outward.',
      'Aastrika catches her foe with a backhand strike that would flatten a horse, fire trailing from her knuckles like a comet\'s tail.',
    ],
    missFlavor: [
      'Aastrika\'s fist crashes into stone, sending a shower of sparks and obsidian shards in every direction as the basalt floor cracks under the blow.',
      'The queen\'s strike goes wide, the superheated air rippling in her fist\'s wake as molten knuckles carve a glowing groove into the volcanic wall.',
      'Aastrika\'s punch sweeps through empty air, her passage leaving a momentary ribbon of flame that dissipates with a frustrated hiss of steam.',
      'The queen overextends, her fist slamming into a pillar instead of flesh — the obsidian cracks and glows where her molten hand strikes.',
    ],
  },
  {
    id: 'fire-giant-lightbearer',
    name: 'Fire Giant Lightbearer',
    size: 'Huge',
    type: 'Giant',
    alignment: 'Any Alignment',
    cr: '10',
    role: 'Support',
    ac: 18,
    acType: 'natural armor',
    hp: 137,
    hpFormula: '11d12 + 66',
    speed: '40 ft.',
    stats: { str: 22, dex: 16, con: 23, int: 10, wis: 21, cha: 13 },
    savingThrows: 'STR +10, DEX +7, CON +10',
    skills: 'Athletics +10, Perception +9',
    damageImmunities: 'fire',
    senses: 'passive Perception 19',
    languages: 'Giant',
    traits: [
      {
        name: 'Healing Heat',
        description: 'When the lightbearer targets a fire giant with an attack, spell, or other supernatural effect that deals fire damage, that target instead regains hit points equal to the damage. The target can choose to be hit or fail their save.',
      },
      {
        name: 'Molten Flesh',
        description: 'The first time a creature other than a fire giant touches the lightbearer or hits it with a melee attack on a turn, that creature takes 7 (2d6) fire damage.',
      },
    ],
    actions: [
      {
        name: 'Multiattack',
        description: 'The lightbearer makes two attacks using Slam, Living Blaze, or both. It can replace one attack with Flamelash.',
      },
      {
        name: 'Slam',
        description: 'Melee Weapon Attack: +10 to hit, reach 10 ft., one target. Hit: 16 (3d6 + 6) bludgeoning damage plus 7 (2d6) fire damage. If the target is Huge or smaller, it must choose: be knocked prone or be pushed 10 feet.',
      },
      {
        name: 'Living Blaze',
        description: 'Ranged Spell Attack: +10 to hit, range 180 ft., one target. Hit: 16 (3d6 + 6) fire damage. The lightbearer can cause the blaze to ricochet to another target within 5 feet of the original target, making a second attack roll with disadvantage.',
      },
      {
        name: 'Flamelash',
        description: 'The lightbearer targets a creature within 30 feet. The target must make a DC 18 Dexterity saving throw. On a failure, the target takes 20 (4d6 + 6) fire damage and, if Large or smaller, is moved 10 feet horizontally in a direction of the lightbearer\'s choice.',
      },
    ],
    bonusActions: [
      {
        name: 'Travel by Fire (3/Day)',
        description: 'The lightbearer chooses two willing creatures within 30 feet. Each takes 14 (4d6) fire damage and teleports, swapping places.',
      },
    ],
    imageUrl: '/images/monsters/fire-giant-lightbearer.jpg',
    description: 'The Lightbearer moves with serene purpose, its skin radiating a soft white-gold glow that pulses in time with some inner heartbeat. Sacred runes are carved into its forearms, glowing like banked coals. The air around it shimmers with heat, and where it steps, the stone beneath briefly turns molten before cooling again. Its eyes burn with a steady, purposeful fire — not rage, but conviction.',
    hitFlavor: [
      'The lightbearer\'s open palm crashes into its target with a thunderclap of displaced air, fire erupting from the point of impact like a blast furnace opening.',
      'A ball of living flame streaks from the lightbearer\'s outstretched hand and detonates against its target, white-hot fire splashing outward.',
      'The lightbearer drives its fist forward with crushing force, molten flesh searing on contact — the blow reverberates through the chamber like a struck anvil.',
      'Sacred fire leaps from the lightbearer\'s fingertips, coiling around the target like a serpent before sinking in with a blinding flare.',
    ],
    missFlavor: [
      'The lightbearer\'s slam sweeps through empty air with a rush of heat, fire trailing harmlessly from its fist.',
      'A bolt of living flame streaks wide, splashing against the far wall in a shower of harmless sparks and fading embers.',
      'The lightbearer\'s measured strike goes wide, sacred fire scattering in motes that drift like fireflies before fading.',
    ],
  },
  {
    id: 'fire-giant-red-fist',
    name: 'Fire Giant Red Fist',
    size: 'Huge',
    type: 'Giant',
    alignment: 'Any Alignment',
    cr: '9',
    role: 'Soldier',
    ac: 17,
    acType: 'natural armor',
    hp: 162,
    hpFormula: '13d12 + 78',
    speed: '40 ft.',
    stats: { str: 25, dex: 14, con: 23, int: 10, wis: 14, cha: 13 },
    savingThrows: 'STR +11, DEX +6, CON +10',
    skills: 'Athletics +11, Perception +6',
    damageImmunities: 'fire',
    senses: 'passive Perception 16',
    languages: 'Giant',
    traits: [
      {
        name: 'Heat and Pressure',
        description: 'When an enemy moves out of the red fist\'s reach, the enemy must succeed on a DC 18 Constitution saving throw or gain a level of exhaustion. Creatures with fire resistance or immunity are immune to this effect.',
      },
      {
        name: 'Molten Flesh',
        description: 'The first time a creature other than a fire giant touches the red fist or hits it with a melee attack on a turn, that creature takes 7 (2d6) fire damage.',
      },
    ],
    actions: [
      {
        name: 'Multiattack',
        description: 'The red fist makes two Unarmed Strike attacks.',
      },
      {
        name: 'Unarmed Strike',
        description: 'Melee Weapon Attack: +11 to hit, reach 10 ft., one target. Hit: 21 (4d6 + 7) bludgeoning damage plus 7 (2d6) fire damage. If the same creature is hit twice with Unarmed Strike on the same turn, it is blinded until the end of the red fist\'s next turn.',
      },
      {
        name: 'Hurl Flame',
        description: 'Ranged Spell Attack: +10 to hit, range 180 ft., one target. Hit: 34 (8d6 + 6) fire damage.',
      },
    ],
    reactions: [
      {
        name: 'Guardian Block (3/Day)',
        description: 'When an enemy within 10 feet hits a creature other than the red fist with an attack, the red fist halves the damage dealt. The red fist then makes an Unarmed Strike against the attacker.',
      },
    ],
    imageUrl: '/images/monsters/fire-giant-red-fist.webp',
    description: 'This fire giant is built like a siege engine wrapped in its own molten hide. The Red Fist insignia — a clenched fist wreathed in flame — is branded into its shoulder. Every movement is deliberate, military, precise. Its bare fists glow with a dull red heat, knuckles cracked and scarred like cooling lava, and its eyes scan the battlefield with the cold calculation of a veteran who has fought and killed more times than they can count.',
    hitFlavor: [
      'The red fist\'s massive knuckles connect with a wet crunch, superheated flesh searing on impact as fire flares along the wound.',
      'With a disciplined grunt, the red fist drives a haymaker home — the strike is precise, efficient, and devastating, molten fists cauterizing as they crush.',
      'The red fist catches its target with a brutal uppercut, fire erupting from the point of impact as the blow lifts them off their feet.',
      'The red fist strikes with the practiced efficiency of a soldier who has drilled this exact movement ten thousand times — the burning fist finds its mark with terrible certainty.',
    ],
    missFlavor: [
      'The red fist\'s punch cleaves air, its superheated knuckles leaving a trail of shimmering heat-distortion — it recovers stance instantly.',
      'The disciplined strike goes wide, sparks flying as the fist clips stone instead of flesh, and the red fist grunts in frustration.',
      'The red fist\'s swing passes its target, molten knuckles scorching the air with a sound like tearing cloth — already resetting for the next attack.',
    ],
  },
  {
    id: 'fire-giant-trooper',
    name: 'Fire Giant Trooper',
    size: 'Huge',
    type: 'Giant',
    alignment: 'Any Alignment',
    cr: '12',
    role: 'Minion',
    ac: 18,
    acType: 'natural armor',
    hp: 19,
    hpFormula: 'minion',
    speed: '40 ft.',
    stats: { str: 22, dex: 14, con: 19, int: 10, wis: 14, cha: 13 },
    damageImmunities: 'fire',
    senses: 'passive Perception 12',
    languages: 'Giant',
    traits: [
      {
        name: 'Minion',
        description: 'If the trooper takes damage from an attack or as a result of failing a saving throw, its hit points are reduced to 0. If it takes damage from another effect, it dies only if the damage equals or exceeds its hit point maximum.',
      },
      {
        name: 'Molten Flesh',
        description: 'The first time a creature other than a fire giant touches the trooper or hits it with a melee attack on a turn, that creature takes 7 fire damage.',
      },
    ],
    actions: [
      {
        name: 'Unarmed Strike (Group Attack)',
        description: 'Melee Weapon Attack: +10 to hit, reach 10 ft., one target. Hit: 3 bludgeoning damage plus 3 fire damage. The target must succeed on a Strength saving throw or fall prone. The DC equals 12 + the number of troopers participating in the group attack.',
      },
      {
        name: 'Rock (Group Attack)',
        description: 'Ranged Weapon Attack: +10 to hit, range 60/240 ft., one target. Hit: 6 bludgeoning damage.',
      },
    ],
    imageUrl: '/images/monsters/fire-giant-trooper.jpg',
    description: 'A rank-and-file fire giant soldier, bulky and rough around the edges. Their natural armor is cracked and soot-stained, their molten skin more functional than ornamental. Some look nervous — young recruits on their first real watch. Others are bored veterans who\'ve stood at this post a hundred times. They smell of sulfur and sweat, and they crack their knuckles the way bored soldiers always have.',
    hitFlavor: [
      'The trooper\'s fist shoots forward with surprising speed, superheated knuckles connecting with a sizzle of burning flesh.',
      'The trooper lunges with a grunt, driving a molten fist home with more desperation than skill, searing on contact.',
      'The punch strikes true, the trooper shouting in surprised triumph as its burning knuckles connect with a burst of sparks.',
    ],
    missFlavor: [
      'The trooper swings wide, its burning fist passing harmlessly by, and stumbles a half-step before recovering.',
      'The punch goes high, the trooper overcommitting and having to pull its arm back into guard position.',
      'The trooper\'s fist clangs off armor or stone, flinching at the vibration running up its arm.',
    ],
  },
  {
    id: 'basalt-stone-giant',
    name: 'Basalt Stone Giant',
    size: 'Huge',
    type: 'Giant',
    alignment: 'Any Alignment',
    cr: '8',
    role: 'Controller',
    ac: 16,
    acType: 'natural armor',
    hp: 150,
    hpFormula: '12d12 + 72',
    speed: '40 ft.',
    stats: { str: 24, dex: 15, con: 22, int: 13, wis: 15, cha: 12 },
    savingThrows: 'CON +9, WIS +5',
    skills: 'Athletics +10, Perception +5',
    damageResistances: 'bludgeoning, piercing, slashing from non-adamantine mundane attacks',
    senses: 'darkvision 60 ft., passive Perception 15',
    languages: 'Giant',
    traits: [
      {
        name: 'False Appearance',
        description: 'While the basalt stone giant remains motionless, it is indistinguishable from a statue.',
      },
      {
        name: 'Stone Flesh',
        description: 'When a creature attacks the basalt stone giant with a non-adamantine melee weapon and rolls a 1 on the attack roll, a mundane weapon is destroyed. A supernatural weapon loses its magical properties for 1 hour.',
      },
    ],
    actions: [
      {
        name: 'Multiattack',
        description: 'The basalt stone giant makes two Rune-Signed Blade attacks. It can replace one attack with Forked Knives.',
      },
      {
        name: 'Rune-Signed Blade',
        description: 'Melee Weapon Attack: +10 to hit, reach 10 ft., one target. Hit: 25 (4d8 + 7) slashing damage. Each hit reduces the target\'s movement speed by a cumulative 10 feet (minimum 5 feet) until they are healed.',
      },
      {
        name: 'Forked Knives',
        description: 'Melee or Ranged Weapon Attack: +10 to hit, reach 10 ft. or range 60/240 ft., one target. Hit: 17 (3d6 + 7) piercing damage. If the target is Medium or smaller and on the ground, it is knocked prone and restrained (pinned to the ground). A creature can use an action to make a DC 18 Athletics check to dislodge the knives.',
      },
    ],
    reactions: [
      {
        name: 'Resonate Rune',
        description: 'When the basalt stone giant is hit by a melee attack, each creature within 10 feet of it must succeed on a DC 17 Strength saving throw or be pushed 10 feet away.',
      },
    ],
    imageUrl: '/images/monsters/basalt-stone-giant.jpg',
    description: 'Unlike the fire giants, this stone giant is quiet — eerily so for something so massive. Its skin is the color of cooled basalt, dark gray with veins of glittering obsidian running through it like mineral deposits in a cliff face. It moves with a sculptor\'s grace, each step deliberate and measured. Rune-signed blades hang at its sides, their edges etched with geometric patterns that pulse faintly. When it stands still, it could be mistaken for a natural rock formation — until its eyes, like pools of liquid quartz, open and fix on you.',
    hitFlavor: [
      'The rune-signed blade carves a devastating arc, the geometric etchings flaring with light as the edge bites deep — the wound seems to pull at the target, slowing their movements.',
      'The basalt giant swings with deliberate, inevitable power — the blade connects with a sound like splitting stone, heavy and final.',
      'Moving with surprising speed for something so massive, the stone giant brings its rune-signed blade around in a sweeping arc that connects with bone-jarring force.',
      'The blade strikes with the patient, inevitable force of geology — runes blazing along its edge as it cuts a glowing line through armor and flesh.',
    ],
    missFlavor: [
      'The rune-signed blade sweeps through empty air, its etchings flickering as it carves a fading arc of light where the target stood a moment ago.',
      'The basalt giant\'s swing passes overhead with a whistle of displaced air, the blade leaving a groove in the wall behind.',
      'The stone giant overreaches, its blade slicing through nothing, and pauses for a fraction of a second — recalculating with geological patience.',
    ],
  },
  {
    id: 'hellhound',
    name: 'Hellhound',
    size: 'Medium',
    type: 'Fiend',
    alignment: 'Typically Neutral Evil',
    cr: '3',
    role: 'Soldier',
    ac: 15,
    acType: 'natural armor; 18 with Hardened by Flame',
    hp: 76,
    hpFormula: '9d8 + 36',
    speed: '50 ft.',
    stats: { str: 14, dex: 17, con: 19, int: 11, wis: 8, cha: 10 },
    savingThrows: 'DEX +5, CON +6',
    skills: 'Perception +3, Stealth +7, Survival +3',
    damageImmunities: 'fire',
    senses: 'darkvision 60 ft., passive Perception 13',
    languages: 'understands Common and Infernal but can\'t speak',
    traits: [
      {
        name: 'Hardened by Flame',
        description: 'When the hellhound is subjected to fire damage, it takes no damage instead. Its AC increases to 18 until the end of its next turn.',
      },
      {
        name: 'Stealthy Hunter',
        description: 'The hellhound has advantage on Wisdom (Survival) checks to track creatures and Dexterity (Stealth) checks to hide from creatures that are unaware of it.',
      },
    ],
    actions: [
      {
        name: 'Hellish Bite',
        description: 'Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 6 (1d6 + 3) piercing damage plus 4 (1d8) fire damage.',
      },
      {
        name: 'Hellfire Breath (Recharge 5-6)',
        description: 'The hellhound exhales fire in a 15-foot cone. Each creature in that area must make a DC 14 Dexterity saving throw, taking 14 (3d6 + 4) fire damage on a failed save. On a failed save, the target is also lit on fire for 1 minute (save ends). While on fire, the creature takes 7 (2d6) fire damage at the start of each of its turns.',
      },
    ],
    reactions: [
      {
        name: 'Tug of War',
        description: 'When an enemy within 5 feet hits the hellhound with a melee attack, the hellhound makes a Hellish Bite attack against the attacker. If it hits, the enemy is grappled (escape DC 12) and the weapon used in the triggering attack can\'t be used while the grapple persists.',
      },
    ],
    imageUrl: '/images/monsters/crow.webp',
    description: 'This is no ordinary hound. Its coal-black hide ripples over corded muscle, and between the gaps in its fur, the skin glows a sullen orange-red, like embers barely contained. Its eyes are pits of yellow fire, and when it breathes, smoke curls from its nostrils in lazy spirals. It paces with predatory intelligence, flanks radiating heat like a furnace door left ajar. When it growls, you feel the rumble in your chest before you hear it.',
    hitFlavor: [
      'The hellhound lunges with terrifying speed, jaws clamping down with a sizzle of superheated saliva — fire bursts from the wound like sparks from a struck forge.',
      'Fangs like red-hot pokers sink into flesh, the hellhound shaking its head with savage ferocity as flames lick around the bite.',
      'The beast strikes with a blur of dark fur and fire, its burning jaws snapping shut with a crack that echoes off the volcanic walls.',
    ],
    missFlavor: [
      'The hellhound snaps at empty air, its jaws clashing shut with a sound like a furnace door slamming — smoke venting from its nostrils in frustration.',
      'The beast lunges and misses, skidding on the stone floor, claws leaving glowing scratch marks as it scrambles to redirect.',
      'Fangs close on nothing, a gout of fire-breath escaping the hellhound\'s maw involuntarily as it whips its head back for another strike.',
    ],
  },
];
