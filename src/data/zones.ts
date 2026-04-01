import type { Zone } from '@/lib/types';

export const travelSection: Zone = {
  id: 'travel',
  name: 'The Approach — Magma Tunnels Beneath Roaring Peak',
  readAloud: {
    punchy:
      'Natural magma tubes bore through the roots of Roaring Peak. The walls are slick with hissing condensation, the floor dusted with soot bearing five-foot-wide footprints. Rising sun symbols are carved into the walls at giant-shoulder height — trail markers of the Sunlight Legion. The heat is relentless. The tunnels groan with deep vibrations that climb through your boots. Something massive walks these passages regularly.',
    atmospheric:
      'The tunnel mouth exhales a breath of sulfur and char. Inside, condensation hisses where it meets stone, and enormous footprints — five feet across — are pressed into dark soot on the floor. Every few hundred feet, a rising sun symbol has been carved into the wall at giant-shoulder height: the Sunlight Legion\'s trail markers, blazed into stone to guide their kin home.\n\nThe heat presses against your skin like a living thing, drawing sweat that evaporates before it can drip. Deeper in, the tunnels groan — not settling stone, but a low resonant vibration that climbs through your boots and settles in your chest.',
    immersive:
      'The tunnel mouth gapes before you like a wound in the mountainside, exhaling a breath of heat that carries the stink of sulfur and char. Inside, the walls are slick with condensation that hisses where it meets the stone, and the floor is dusted with soot — enormous footprints pressed into the dark powder, each one five feet across. Something massive walks these passages regularly.\n\nThe labyrinth unfolds ahead in twisting, branching corridors of black rock. The heat is relentless, pressing against your skin like a living thing, drawing sweat that evaporates before it can drip. Every few hundred feet, a symbol has been carved into the wall at giant-shoulder height: a rising sun, its rays reaching upward like grasping fingers. The marks of the Sunlight Legion, blazed into stone to guide their kin home through these sweltering depths.\n\nDeeper in, the tunnels groan. Not the creak of settling stone, but a low, resonant vibration that climbs up through your boots and settles in your chest. Roaring Peak is alive around you — and it knows you are here.',
  },
  senses: {
    sight: 'Dim orange glow from distant lava veins. Five-foot soot footprints. Rising sun carvings at giant shoulder height.',
    sound: 'Low volcanic groaning. Hissing condensation. Distant hammering and guttural voices echoing from below.',
    smell: 'Sulfur and char. Hot stone. Acrid fumes that sting the eyes and coat the tongue.',
    touch: 'Oppressive heat on exposed skin. Slick condensation on walls. Gritty soot underfoot. Vibration through the floor.',
    instinct: 'The tunnels feel alive — breathing, watching. The footprints are fresh. You are walking into something\'s home.',
  },
  description:
    'The approach to the Molten Enclave leads through a labyrinth of magma tunnels bored through the roots of Roaring Peak. The tunnels are sweltering, stinking of sulfur, and marked with the sooty footprints of fire giants. The Sunlight Legion has carved rising sun symbols into the walls at regular intervals to mark the correct path through the maze. Without these markers — or a guide — navigating the tunnels is nearly impossible.',
  features: [
    {
      name: 'High Heat',
      description:
        'The tunnels radiate oppressive volcanic heat. The air sears the lungs and exposed skin prickles with each breath.',
      dc: 10,
      mechanical:
        'DC 10 CON save every hour or gain one level of exhaustion. Disadvantage in medium/heavy armor. Creatures with fire resistance or immunity automatically succeed.',
    },
    {
      name: 'Sunlight Legion Trail Markers',
      description:
        'Rising sun symbols carved into the tunnel walls at giant shoulder height. They mark the correct path through the labyrinth.',
      dc: 12,
      mechanical:
        'DC 12 Perception to spot in dim conditions. Following the markers avoids getting lost. Without them, DC 16 Survival to navigate.',
    },
    {
      name: 'Sooty Footprints',
      description:
        'Enormous footprints — five feet across — are pressed into the soot coating the tunnel floor. They indicate recent giant traffic.',
      dc: 10,
      mechanical:
        'DC 10 Survival to read. Reveals approximate number and recency of giant patrols.',
    },
    {
      name: 'Labyrinthine Tunnels',
      description:
        'The tunnels branch and reconnect unpredictably. Dead ends, loops, and false passages abound.',
      dc: 16,
      mechanical:
        'DC 16 Survival to navigate without trail markers. Failure wastes 1d4 hours (triggering additional High Heat saves).',
    },
  ],
  encounters: [
    {
      name: 'Tunnel Patrol',
      monsters: ['Fire Giant Trooper x2'],
      notes:
        'A patrol returning to the Enclave. They know the tunnels intimately and will use the branching passages to flank.',
      dialogue: [
        '"Hold. You smell that? Something small has been through here. Check the south fork."',
        '"Hunters from the Warrens, maybe. The Zenith said to expect rats eventually."',
      ],
    },
  ],
  npcs: [],
  treasure: [],
  dmNotes: [
    'The High Heat mechanic is the primary tension driver here. Track hours carefully. Each failed save stacks exhaustion, so the party is incentivized to move quickly rather than explore every branch.',
    'Fire resistance trivializes the heat saves — reward parties who prepared. Potions of Fire Resistance or the Resist Energy spell should feel like smart investments here.',
    'The trail markers are meant to be found. Do not hide them behind high DCs — they ARE the intended path. The labyrinth is the punishment for ignoring them.',
    'Use the tunnel sounds to foreshadow the Enclave: distant hammering, guttural chanting, the groan of the mountain itself.',
  ],
  campaignNotes: [
    'Drake, Rook, and the rogue are hunters from the Warrens — they track for a living. The sooty footprints and trail markers should feel like familiar terrain reading, even in an alien environment. Let them use their skills here.',
    'The Daughter of Ash\'s influence does not extend into the volcano. This is purely fire giant territory. The party should feel the shift — from fey-haunted forests to elemental, primal stone and fire.',
    'Rook\'s hag mark (Bavlorna\'s curse) may react to the proximity of the hagstone. A faint itch, a twinge in old wounds — subtle foreshadowing that they are close to something connected to hag magic.',
  ],
  ambiance: {
    music: [
      {
        name: 'Tunnel Crawl',
        description: 'Low, droning dark ambient for cautious exploration through volcanic passages',
        searchTerm: 'dark ambient volcanic cave exploration',
        tags: ['exploration'],
      },
      {
        name: 'Magma Depths',
        description: 'Deep, oppressive drone with subtle percussive rumbles for tense moments',
        searchTerm: 'deep underground ambient dark drone music',
        tags: ['tension', 'stealth'],
      },
      {
        name: 'Tunnel Ambush',
        description: 'Driving combat music with heavy drums for patrol encounters',
        searchTerm: 'D&D combat music underground dungeon epic',
        tags: ['combat'],
      },
    ],
    sounds: [
      {
        name: 'Volcanic Rumbling',
        description: 'Distant, low-frequency volcanic activity — the mountain breathing',
        searchTerm: 'volcanic rumbling ambient sound effect loop',
        tags: ['exploration', 'tension'],
      },
      {
        name: 'Echoing Footsteps',
        description: 'Footsteps reverberating through stone tunnels, creating unease',
        searchTerm: 'echoing footsteps cave tunnel sound effect',
        tags: ['exploration', 'stealth'],
      },
      {
        name: 'Sulfur Wind',
        description: 'Hot, whistling drafts through narrow passages carrying acrid fumes',
        searchTerm: 'wind through cave tunnel howling ambient',
        tags: ['exploration'],
      },
      {
        name: 'Dripping Condensation',
        description: 'Water hissing and dripping on hot stone surfaces',
        searchTerm: 'water dripping cave echo ambient sound',
        tags: ['exploration', 'stealth'],
      },
    ],
  },
  linkedChallenges: ['entering-the-enclave'],
};

export const zoneOverview: Zone = {
  id: 'overview',
  name: 'Zone Overview — The Molten Enclave',
  readAloud: {
    punchy:
      'The tunnels open into a fortress-monastery carved from the living basalt of Roaring Peak. Everything is sized for Huge creatures — steps three feet high, doors fifteen feet tall. Lava pools connected by carved channels light the complex in shifting orange. Veins of molten rock provide dim light throughout. The air shimmers with heat. The stone thrums with the volcano\'s pulse. Sounds do not carry between areas.',
    atmospheric:
      'The Molten Enclave spreads before you — a fortress carved from the interior of a living volcano. Enormous halls and corridors are lit by rivers of lava flowing through carved channels like molten veins. Everything is built for creatures three times your height. Steps rise to your waist. Doors loom fifteen feet tall. The handles are at your eye level.\n\nLava pools dot the complex, casting everything in shifting orange light. The air shimmers. The stone thrums beneath your feet with the slow pulse of the volcano\'s heart. A deep groan rolls through the walls — not random, not geological. An alarm. The mountain knows when something is wrong.',
    immersive:
      'The tunnels open into a vast hollow space within the volcano, and the scale of what the fire giants have built here steals the breath from your lungs. The Molten Enclave is a fortress-monastery carved from the living basalt of Roaring Peak — enormous halls and corridors lit by rivers of lava that flow through carved channels like molten veins. Everything is built for creatures three times your height. Steps rise to your waist. Doors loom fifteen feet tall. The handles are at your eye level.\n\nLava pools dot the complex, connected by channels cut deep into the stone floor. The molten rock casts everything in shifting orange light and radiating waves of heat. The air shimmers. The stone thrums beneath your feet with the slow pulse of the volcano\'s heart.\n\nAnd then you hear it — or rather, you feel it. A deep, resonant groan that rolls through the walls and floor like the mountain itself is exhaling. It is not random. It is not geological. It is an alarm. The mountain knows when something is wrong, and it tells the giants.',
  },
  senses: {
    sight: 'Shifting orange light from lava channels. Giant-scale architecture everywhere. Rising sun motifs carved into walls and doors.',
    sound: 'Sounds do not carry between areas. Within each zone: lava bubbling, distant hammering, giant voices, mountain groaning.',
    smell: 'Molten rock and heated iron. Sulfur undertone throughout. Cooking smells from the dining hall drifting faintly.',
    touch: 'Constant heat radiating from every surface. Stone vibrating underfoot. Hot updrafts from lava channels.',
    instinct: 'This is a living community, not a dungeon. The giants are home. You are the intruder.',
  },
  description:
    'The Molten Enclave is Zenith Aastrika\'s fortress-monastery built inside Roaring Peak. It serves as both a military stronghold and a spiritual sanctuary for the Sunlight Legion. The architecture is scaled for Huge creatures throughout, and lava pools connected by channels serve as both illumination and a tactical transportation network for the fire giants.',
  features: [
    {
      name: 'Giant-Scale Architecture',
      description:
        'Everything is built for Huge creatures. Steps are 3 feet high, doors are 15 feet tall, and furniture is proportionally massive.',
      dc: 14,
      mechanical:
        'Climbing steps requires DC 14 Athletics. Medium creatures can use giant furniture as full cover. Door handles require a DC 10 Athletics check to reach.',
    },
    {
      name: 'Lava Pools and Channels',
      description:
        'Lava pools are connected by carved channels throughout the Enclave. Bright light 30 ft, dim light 30 ft beyond. Fire giants can TELEPORT through connected lava pools — submerging in one and emerging from another.',
      mechanical:
        'Fire giants treat connected lava pools as a teleportation network. They can submerge in one pool and emerge from any other connected pool on their next turn. Touching lava: 33 (6d10) fire damage.',
    },
    {
      name: 'Iron Portcullises',
      description:
        'Massive iron portcullises sized for Huge creatures block key passages. The bars are wide enough for smaller creatures to squeeze through.',
      dc: 13,
      mechanical:
        'DC 13 Acrobatics to squeeze through (Medium/Small). Small creatures have advantage. Tiny creatures pass automatically.',
    },
    {
      name: 'High Heat',
      description:
        'The entire Enclave radiates volcanic heat. The air sears exposed skin.',
      dc: 10,
      mechanical:
        'DC 10 CON save every hour or gain one level of exhaustion. Disadvantage in medium/heavy armor. Creatures with fire resistance or immunity automatically succeed.',
    },
    {
      name: 'Winches',
      description:
        'Giant-sized winch mechanisms operate portcullises and other heavy mechanisms throughout the Enclave.',
      dc: 24,
      mechanical:
        'DC 24 Strength to turn. On failure, a creature can choose to gain one level of exhaustion to succeed instead. Large creatures have advantage. Huge or larger creatures succeed automatically.',
    },
    {
      name: 'Noisy Environment',
      description:
        'The constant sounds of the volcano, forge, and giant activity create isolated acoustic zones.',
      mechanical:
        'Sounds do not carry between areas. Each zone is effectively soundproofed from its neighbors by the ambient noise of the volcano.',
    },
    {
      name: 'Alarm System',
      description:
        'When the alarm is raised, the mountain itself groans — a deep, resonant vibration that rolls through every wall and corridor. Every giant in the Enclave knows instantly.',
      mechanical:
        'When the alarm is raised, all zones are alerted simultaneously. Giants mobilize within 1d4 rounds. The groaning sound cannot be silenced by mundane means.',
    },
  ],
  encounters: [],
  npcs: [],
  treasure: [],
  dmNotes: [
    'LAVA POOL TELEPORTATION is the defining tactical mechanic of this dungeon. Fire giants will use it aggressively — retreating into lava to reposition, flanking through pools, calling reinforcements from other zones. Telegraph this early (Z1 or Z3) so the party understands before the boss fight.',
    'The portcullis squeeze-through (DC 13 Acrobatics) is a deliberate design choice — the Enclave was built to contain Huge creatures, not Medium ones. Smart parties will exploit this repeatedly.',
    'The alarm system means stealth has consequences. Once blown, the entire dungeon shifts to high alert. Track alarm state globally.',
    'Scale is critical to atmosphere. Constantly remind players that everything is HUGE. They walk under tables. They climb steps like boulders. Door handles are at eye level.',
    'The Enclave should feel like a living community, not a dungeon. Giants eat, train, worship, sleep, and argue here. Not every encounter needs to be combat.',
  ],
  campaignNotes: [
    'The hagstone in Aastrika\'s Crown is the party\'s objective. It can reveal the Daughter of Ash\'s true form — she is a hag masquerading as a benevolent fey protector, and only the hagstone can pierce her illusion.',
    'Drake\'s arc is about honest strength versus the temptation of power. The Crown itself is a temptation — an artifact of immense power. Does he take only the hagstone, or does he want the whole crown?',
    'Rook carries Bavlorna\'s mark. The hagstone is a hag artifact. There may be resonance — the mark may burn, ache, or pulse as they get closer to Z9 and the Crown.',
    'The party destroyed Snicker Snacker (a sentient cursed sword), which enraged the Daughter of Ash. She may have agents watching the volcano\'s approaches, but her power does not extend inside. The Enclave is beyond her reach.',
  ],
  ambiance: {
    music: [
      {
        name: 'Fortress of Fire',
        description: 'Default fortress ambiance — a warm, resonant drone conveying massive scale and ancient stone',
        searchTerm: 'fantasy fortress ambient music fire dungeon',
        tags: ['exploration'],
      },
      {
        name: 'Legion March',
        description: 'Slow, heavy percussion and low brass for scenes of giant activity and military presence',
        searchTerm: 'epic giant march ambient music fantasy',
        tags: ['exploration', 'tension'],
      },
      {
        name: 'Enclave Battle',
        description: 'General-purpose combat music for fights throughout the fortress',
        searchTerm: 'D&D combat music epic fire dungeon battle',
        tags: ['combat'],
      },
    ],
    sounds: [
      {
        name: 'Lava Flow',
        description: 'Bubbling, crackling lava flowing through channels — the heartbeat of the Enclave',
        searchTerm: 'lava flow bubbling ambient sound loop',
        tags: ['exploration'],
      },
      {
        name: 'Distant Hammering',
        description: 'Faint, rhythmic metalwork echoing from the forge through stone corridors',
        searchTerm: 'distant blacksmith hammering echo ambient',
        tags: ['exploration'],
      },
      {
        name: 'Giant Footsteps',
        description: 'Heavy, booming footsteps reverberating through stone — giants moving nearby',
        searchTerm: 'giant heavy footsteps stone floor rumble sound',
        tags: ['exploration', 'tension'],
      },
      {
        name: 'Mountain Groaning',
        description: 'Deep structural vibrations of the living volcano — used for alarm or atmosphere',
        searchTerm: 'deep rumbling earthquake ambient sound effect',
        tags: ['tension'],
      },
    ],
  },
};

export const zones: Zone[] = [
  {
    id: 'z1',
    name: 'Z1 — Entrance Stairs',
    readAloud: {
      punchy:
        'The natural magma tubes give way to worked stone stairs, each no less than 3 feet high. The steps narrow as they lead down toward a towering portcullis of wrought iron. A gigantic winch is set into the ground next to the portcullis. The air rising from below carries the smell of molten rock and iron. The Molten Enclave awaits at the bottom.',
      atmospheric:
        'The rough magma tubes end abruptly where worked stone begins. Carved stairs descend into orange-lit haze, each step a slab of dark basalt three feet high — trivial for a fire giant, a climbing challenge for you. The steps narrow as they lead down toward a towering portcullis of wrought iron, its bars thick as tree trunks.\n\nA gigantic winch is set into the ground beside the portcullis, its iron spokes sized for hands three times yours. The air rising from below carries the smell of molten rock and iron, and faint sounds drift upward: the ring of hammers, the rumble of voices.',
      immersive:
        'The tunnel opens onto a breathtaking descent: a staircase carved from the interior wall of the volcano, each step a slab of dark basalt three feet high and ten feet deep. The stairs wind downward in a long, curving arc, descending a hundred feet into the orange-lit haze below. The air rising from the depths carries the smell of molten rock and iron.\n\nTwo enormous figures stand at the top of the stairs, silhouetted against the glow from below. Fire giants, each fifteen feet tall, clad in dark iron armor that radiates heat. They lean on greatswords planted point-first into the stone, and their eyes — ember-bright, the color of cooling lava — track every shadow in the tunnel mouth.\n\nBeyond them, the staircase descends into the heart of Roaring Peak. The Molten Enclave awaits below, its sounds drifting upward: the ring of hammers, the rumble of voices, the slow pulse of the living mountain.',
    },
    senses: {
      sight: 'Worked stone stairs descending into orange haze. Towering wrought-iron portcullis. Giant-sized winch mechanism. Lava glow from below.',
      sound: 'Wind funneling up the stairwell. Distant forge echoes and giant voices from below. Grit crunching underfoot.',
      smell: 'Molten rock and heated iron rising from below. Clean stone dust where the stairs are freshly worn.',
      touch: 'Each step is waist-high — a physical climb. The iron portcullis radiates faint heat. The winch spokes are too large for human hands.',
      instinct: 'This is a chokepoint. The stairs are built to be defended from above. You are approaching from the wrong direction.',
    },
    description:
      'Wide stone steps descend into the volcano. Each step is 3 feet high — trivial for a fire giant, a climbing challenge for Medium creatures. A towering wrought-iron portcullis blocks the passage, operated by a giant-sized winch.',
    features: [
      {
        name: 'Giant-Scaled Steps',
        description:
          'Each step is a 3-foot-high slab of basalt. Giants descend normally; Medium creatures must climb.',
        dc: 14,
        mechanical:
          'DC 14 Athletics to climb each step at normal speed. Failure: half speed for that step. Falling while climbing: 1d6 bludgeoning per 10 feet fallen.',
      },
      {
        name: 'Iron Portcullis',
        description:
          'A towering portcullis of wrought iron blocks the passage at the bottom of the stairs.',
        dc: 13,
        mechanical:
          'DC 13 Acrobatics to squeeze through (Medium/Small). Small creatures have advantage. Tiny creatures pass automatically. Can be raised via the winch.',
      },
      {
        name: 'Giant Winch',
        description:
          'A gigantic winch set into the ground next to the portcullis, used to raise and lower it.',
        dc: 24,
        mechanical:
          'DC 24 Strength to turn. On failure, can choose to gain one level of exhaustion to succeed. Large creatures have advantage. Huge+ creatures succeed automatically.',
      },
      {
        name: 'Echoing Stairwell',
        description:
          'Sound carries up and down the staircase. Combat or loud noises here will be heard in Z2.',
        mechanical:
          'Any combat or loud noise alerts Z2 within 2 rounds. Stealth past the guards: DC 14 group Stealth check.',
      },
    ],
    encounters: [
      {
        name: 'Stair Guard',
        monsters: ['Fire Giant Trooper x2'],
        notes:
          'Standard guard post. Alert and disciplined. If combat begins, one trooper fights while the other retreats down the stairs to raise the alarm in Z2. They will use the stairs to their advantage — shoving Medium creatures off the edge.',
        dialogue: [
          '"Something moved in the tunnel. You see it? Small shapes. Could be rock rats... could be worse."',
          '"Stand where you are, little things. No one enters the Enclave without the Zenith\'s word. Speak your purpose or burn."',
          '"Get word to the barracks. Tell them we have visitors — the small kind."',
        ],
      },
    ],
    npcs: [],
    treasure: [],
    dmNotes: [
      'The step-climbing mechanic (DC 14 Athletics) is meant to reinforce scale, not to be a serious obstacle. Do not make it a grind — one check to establish the difficulty, then narrate the rest unless they are in combat or being chased.',
      'The guards are disciplined but bored. A creative distraction or disguise might work. They are expecting threats from BELOW (adventurers who snuck in through lava tubes), not from the tunnel approach.',
      'If one guard escapes to raise the alarm, the entire Enclave goes on alert. This is a critical decision point. Emphasize that the second guard is moving to flee, not fight.',
      'The staircase is a natural chokepoint. A clever party could use this defensively if they need to retreat.',
    ],
    campaignNotes: [
      'This is the party\'s first encounter with fire giants in their home territory. Let the scale sink in — these are fifteen-foot-tall warriors in dark iron armor standing on steps that come up to the party\'s chests.',
      'Drake and Rook are hunters. They understand sentries and patrol patterns. Let them use Survival or Insight to read the guards\' alertness and rotation timing.',
    ],
    ambiance: {
      music: [
        {
          name: 'Echoing Descent',
          description: 'Reverberant, slowly building ambient music evoking a long downward journey into darkness',
          searchTerm: 'dark ambient descent staircase dungeon music',
          tags: ['exploration'],
        },
        {
          name: 'Stair Guard Clash',
          description: 'Urgent combat music with echoing percussion for the entrance fight',
          searchTerm: 'D&D combat music intense dungeon entrance battle',
          tags: ['combat'],
        },
        {
          name: 'Careful Approach',
          description: 'Tense, quiet ambient for sneaking past the sentries',
          searchTerm: 'stealth tension ambient music fantasy sneaking',
          tags: ['stealth', 'tension'],
        },
      ],
      sounds: [
        {
          name: 'Stairwell Wind',
          description: 'Wind funneling up from the depths, carrying heat and distant sounds',
          searchTerm: 'wind tunnel echo cave ambient sound',
          tags: ['exploration'],
        },
        {
          name: 'Distant Forge Echoes',
          description: 'Faint metalwork and giant voices drifting up from the Enclave below',
          searchTerm: 'distant echoing forge hammering ambient',
          tags: ['exploration'],
        },
        {
          name: 'Stone Crumbling',
          description: 'Small rocks and grit falling from the stairwell walls',
          searchTerm: 'rocks crumbling falling debris cave sound effect',
          tags: ['exploration', 'tension'],
        },
      ],
    },
  },
  {
    id: 'z2',
    name: 'Z2 — Trapped Atrium',
    readAloud: {
      punchy:
        'Two 25-foot-tall statues with rubies for eyes flank the lava pool. The west statue depicts a fire giant in a battle stance with fists raised. The east one depicts a giant with hands clasped in prayer. The domed ceiling rises 40 feet overhead. Two 20-foot-cube stone blocks hang suspended by chains in the shadows above the entry corridors. A faint gleam of chain catches the lava-light.',
      atmospheric:
        'Two towering statues — 25 feet tall with rubies for eyes — flank the central lava pool. The western figure stands in a battle stance, stone fists raised. The eastern one clasps its hands in prayer. The domed ceiling arches 40 feet overhead, its upper reaches lost in shadow.\n\nSomething glints in those shadows. If you look carefully, you can see chains — and suspended above the entry corridors, two massive blocks of stone, each a 20-foot cube, waiting to drop. The statues\' arms look hinged. This room was built to kill.',
      immersive:
        'The stairs empty into a wide chamber with a domed ceiling that arches forty feet above. The room is dominated by two massive statues of fire giants flanking the central lava pool — each carved from a single block of dark stone, standing twenty-five feet tall, their eyes set with rubies that catch the molten light. The west statue depicts a fire giant in a battle stance with their fists up. The east one depicts a fire giant with their hands clasped in prayer.\n\nBetween the statues, the passage narrows to a single corridor twenty feet wide — generous by human standards, but sized for a single giant to pass through comfortably. The floor here is smooth, polished basalt, and your footsteps echo off the curved walls. Something about the geometry of this room feels deliberate. Designed.\n\nAbove the narrowed passage, the ceiling is lost in darkness. But if you look carefully — very carefully — you might notice the faintest gleam of chain catching the lava-light. Something is up there.',
    },
    senses: {
      sight: 'Two 25-ft statues with ruby eyes flanking a lava pool. Domed ceiling 40 ft high. Faint gleam of chains in the shadows above.',
      sound: 'Echoing drips. Faint creaking of chains under tension. The low bubble of the central lava pool.',
      smell: 'Hot stone and faint metallic tang from the iron chains. Sulfur from the lava pool.',
      touch: 'Smooth polished basalt underfoot. The statues\' arms feel subtly different — seams where they connect, a slight give.',
      instinct: 'The geometry feels deliberate. This room was designed. Something is wrong with the ceiling.',
    },
    description:
      'A wide chamber with a 40-foot domed ceiling serving as the entry atrium to the Enclave proper. Two 25-foot-tall fire giant statues with ruby eyes flank a lava pool. Two 20-foot-cube stone blocks are suspended by chains above the entry corridors — a crushing trap triggered by the statues\' hinged arms.',
    features: [
      {
        name: 'Stone Block Trap',
        description:
          'Two 20-foot-cube stone blocks hang suspended by chains above the east and west entry corridors. Triggered when weight is placed on the statues\' hinged arms.',
        dc: 16,
        mechanical:
          'DC 16 DEX save or take 55 (10d10) bludgeoning damage. Winches in the east and west corridors can raise the blocks back up. DC 17 Athletics to climb the blocks once fallen.',
      },
      {
        name: 'Fire Giant Statues (Hinged Arms)',
        description:
          'Two 25-foot-tall statues with rubies for eyes. Their arms are hinged — placing weight on an arm triggers the stone block trap.',
        dc: 20,
        mechanical:
          'DC 20 Perception to notice the arms are hinged. DC 15 Athletics to climb a statue. Placing weight on a hinged arm: DC 16 STR save or fall 20 ft prone, taking 7 (2d6) fall damage. The arm also triggers the stone block trap in the corresponding corridor.',
      },
      {
        name: 'Lava Pool',
        description:
          'A lava pool sits between the two statues, connected to the Enclave\'s lava network.',
        mechanical:
          'Bright light 30 ft, dim light 30 ft beyond. Touching the lava: 33 (6d10) fire damage. Fire giants can teleport through connected pools.',
      },
      {
        name: 'Corridor Winches',
        description:
          'Winches in the east and west corridors can raise the fallen stone blocks.',
        dc: 24,
        mechanical:
          'DC 24 Strength to turn. On failure, can choose to gain one level of exhaustion to succeed. Large creatures have advantage. Huge+ auto-succeed.',
      },
      {
        name: 'Red Fist Response',
        description:
          'If the trap triggers, the noise draws a Red Fist from Z6 to investigate.',
        mechanical:
          'A Red Fist from the Dining Hall (Z6) arrives approximately 1 minute after a stone block drops. They come ready for a fight.',
      },
    ],
    encounters: [
      {
        name: 'Atrium Ambush (if alarm raised)',
        monsters: ['Fire Giant Trooper x2'],
        notes:
          'If the alarm was raised in Z1, two troopers wait in ambush behind the statues. They let the party trigger the trap, then engage.',
        dialogue: [
          '"Wait for it... let the stones do the work. Then we finish what\'s left."',
          '"The Zenith built this room to break armies. You are not an army."',
        ],
      },
      {
        name: 'Red Fist Response',
        monsters: ['Fire Giant Red Fist x1'],
        notes:
          'Arrives from Z6 approximately 1 minute after a stone block drops. Comes prepared for combat and will call for reinforcements if outnumbered.',
        dialogue: [
          '"Another group of treasure-seekers. How many does that make this season?"',
          '"Someone tripped the atrium. Get me a detail from the barracks — I want this corridor swept."',
        ],
      },
    ],
    npcs: [],
    treasure: [
      {
        name: 'Ruby Eyes (4 total)',
        description:
          'The four rubies set into the statues\' eye sockets. Requires jeweler\'s tools or thieves\' tools to extract without shattering.',
        value: '300 gp each (1,200 gp total)',
      },
    ],
    dmNotes: [
      '55 (10d10) bludgeoning is devastating damage. This trap is meant to punish carelessness and reward investigation. Let the players know the room feels "designed" and "deliberate" — this is the clue.',
      'The statues are a trap, not a red herring. The hinged arms are the trigger — DC 20 Perception to notice. Players conditioned by dungeon-crawling may investigate them, which is good — but climbing and putting weight on the arms triggers the trap.',
      'If the trap triggers, the noise draws a Red Fist from Z6 within 1 minute. The party has limited time to recover before reinforcements arrive.',
      'A rogue or ranger with high Investigation/Perception is the hero of this room. Let them shine.',
      'The rubies (300 gp each, 4 total) require jeweler\'s or thieves\' tools to extract. A nice reward for a party that handles the room carefully.',
    ],
    campaignNotes: [
      'The rogue in the party should be the one to spot this. Give them the chance — ask specifically what the rogue is doing as they enter the atrium.',
      'If the trap triggers and someone gets hurt, that is a real resource drain before the dungeon has even begun in earnest. The tension is the point.',
    ],
    ambiance: {
      music: [
        {
          name: 'Held Breath',
          description: 'Nearly silent, tension-building ambient with occasional deep tones — the calm before the trap',
          searchTerm: 'tense silence ambient suspense music dungeon',
          tags: ['tension', 'stealth'],
        },
        {
          name: 'Atrium Ambush',
          description: 'Sudden, sharp combat music for when the trap springs or ambush triggers',
          searchTerm: 'D&D ambush combat music sudden intense',
          tags: ['combat'],
        },
      ],
      sounds: [
        {
          name: 'Dripping Condensation',
          description: 'Slow, echoing drips of water condensing on cold stone — the only sound in the room',
          searchTerm: 'water dripping echo large room ambient',
          tags: ['exploration', 'tension'],
        },
        {
          name: 'Settling Stone',
          description: 'Faint creaks and groans of ancient masonry under pressure',
          searchTerm: 'stone settling creaking building ambient sound',
          tags: ['tension', 'stealth'],
        },
        {
          name: 'Faint Wire Hum',
          description: 'An almost imperceptible metallic vibration — the trap wire resonating in still air',
          searchTerm: 'thin wire vibrating metallic hum sound effect',
          tags: ['tension'],
        },
      ],
    },
  },
  {
    id: 'z3',
    name: 'Z3 — The Crucible',
    readAloud: {
      punchy:
        'In the center of this room, an iron railing surrounds a 20-foot-deep fighting pit. Stairs lead into the pit. Seven enormous fire giants are present — two bruised Red Fists duel in the pit below while six Troopers cheer around the perimeter. A Lightbearer stands apart by the north stairs, watching with calm detachment. The pyramidal ceiling rises 50 feet above.',
      atmospheric:
        'An iron railing surrounds a 20-foot-deep fighting pit in the center of this chamber. Stairs lead down into the pit, where two bruised fire giants circle each other, fists wrapped in smoldering cloth, trading blows that crack like thunder. The pyramidal ceiling rises fifty feet above, amplifying every impact.\n\nSix Troopers pound the iron bars in rhythm, bellowing encouragement in guttural Giant. A lone Lightbearer stands apart by the north stairs, robed and calm, watching the fight with the detachment of a judge. This is ritual combat — where rank is earned and warriors are tested.',
      immersive:
        'The corridor opens into a massive chamber, and the first thing you hear is the roar of the crowd. The ceiling rises to a pyramidal peak fifty feet above, and the space below is dominated by a sunken fighting pit — twenty feet deep, ringed by an iron railing that comes up to a fire giant\'s waist. Down in the pit, two enormous figures circle each other, their fists wrapped in smoldering cloth, trading blows that crack like thunder.\n\nAround the railing, six more giants pound the iron bars in rhythm, bellowing encouragement in a guttural language that reverberates off the angled ceiling. Sparks fly from the pit as a fist connects with an iron pauldron. A figure standing apart from the crowd — taller, clad in robes stitched with glowing sigils — watches the fight with the calm detachment of a judge.\n\nThis is not a brawl. This is ritual. This is where warriors are tested, where rank is earned, and where the Sunlight Legion forges its champions in blood and bruise.',
    },
    senses: {
      sight: 'Iron-railed fighting pit 20 ft deep with stairs. Two bruised giants dueling below. Six spectators pounding the rails. Robed Lightbearer by north stairs.',
      sound: 'Thunderous impacts from the pit. Rhythmic pounding on iron rails. Bellowing in Giant echoing off the pyramidal ceiling.',
      smell: 'Sweat and heated iron. Smoldering cloth wrappings. The metallic tang of blood.',
      touch: 'The floor vibrates with each heavy blow from below. The iron railing is warm to the touch and shakes with the spectators\' pounding.',
      instinct: 'The crowd is completely absorbed in the fight. Their attention is a window — if you move now, they might not notice.',
    },
    description:
      'A massive training chamber with a pyramidal ceiling fifty feet high. The centerpiece is a 20-foot-deep iron-railed fighting pit where warriors spar and prove themselves. The Crucible is where the Sunlight Legion\'s warriors train and earn their rank. The Zenith sometimes offers challengers a trial by combat here.',
    features: [
      {
        name: 'Fighting Pit',
        description:
          'A 20-foot-deep sunken pit ringed with iron railing. Used for formal sparring and trial by combat. Stairs lead down into it.',
        mechanical:
          'Climbing in or out: DC 14 Athletics (giant-scaled walls). Being thrown in: 2d6 bludgeoning from the fall. The railing provides half cover for creatures behind it.',
      },
      {
        name: 'Pyramidal Ceiling',
        description:
          'The ceiling rises to a sharp peak 50 feet above, amplifying sound within the chamber.',
        mechanical:
          'Sound is amplified — Intimidation checks made in the Crucible have advantage. Stealth checks have disadvantage due to acoustic amplification.',
      },
      {
        name: 'Iron Railing',
        description:
          'Waist-height iron railing (for giants) surrounds the pit. For Medium creatures, it provides substantial cover.',
        mechanical:
          'Three-quarters cover for Medium creatures standing behind it. Can be used as an improvised weapon: DC 14 STR to break off a section (1d8 bludgeoning, heavy).',
      },
    ],
    encounters: [
      {
        name: 'Crucible Training Session',
        monsters: [
          'Fire Giant Red Fist x2 (80 HP each, dueling in pit)',
          'Fire Giant Trooper x6 (spectators)',
          'Fire Giant Lightbearer x1 (by north stairs)',
        ],
        notes:
          'The two Red Fists are sparring in the pit (80 HP each from the duel). Six Troopers cheer at the railing. One Lightbearer stands ready to heal injuries. DC 19 group Stealth to sneak past. The Troopers are distracted by the fight. The Red Fists are the real threat if combat begins — they are already warmed up and in fighting mode.',
        dialogue: [
          '"FINISH HIM! One more blow and the rank is yours! Show the Zenith you are worthy!"',
          '"What was that? Something moved by the east passage. Probably a rat. Eyes on the fight."',
          '"Small creatures. In the Crucible. Either they came to challenge, or they came to die. Let us find out which."',
        ],
      },
    ],
    npcs: [],
    treasure: [],
    dmNotes: [
      'The Crucible is a social encounter disguised as a combat zone. If the party is discovered here, the giants may offer a challenge rather than attacking outright — the Crucible is for TESTING, and the giants respect strength.',
      'The Zenith (Aastrika) sometimes offers captured intruders a trial by combat in the pit. This is a potential alternative to the Z9 boss fight — earn the right to an audience through the Crucible.',
      'The six Troopers are spectators, not soldiers. They are distracted by the fight. DC 19 group Stealth to sneak past.',
      'The Lightbearer is the most dangerous enemy here if the alarm is raised — they will heal the Red Fists and cast support spells while the melee fighters engage.',
      'Lava pool teleportation: if there is a lava pool in this room, giants will use it to summon reinforcements from connected zones.',
    ],
    campaignNotes: [
      'Drake\'s arc — honest strength vs. temptation — is perfectly served by the Crucible. If Drake is challenged to a pit fight, this is his moment to prove himself without cursed weapons or shortcuts. Let him feel the weight of that choice.',
      'A trial by combat victory here could earn the party safe passage deeper into the Enclave and possibly even an audience with Aastrika — bypassing several zones of stealth or combat.',
    ],
    ambiance: {
      music: [
        {
          name: 'Arena Energy',
          description: 'Pounding, rhythmic percussion building excitement — the crowd is fired up',
          searchTerm: 'arena combat drums tribal percussion fantasy music',
          tags: ['combat', 'exploration'],
        },
        {
          name: 'Champion\'s Trial',
          description: 'Epic, dramatic combat music for formal pit fights and trial by combat',
          searchTerm: 'D&D boss arena combat music epic gladiator',
          tags: ['combat', 'boss'],
        },
        {
          name: 'Crucible Tension',
          description: 'Heavy, anticipatory music for the moments before a fight begins',
          searchTerm: 'pre-battle tension music fantasy arena suspense',
          tags: ['tension'],
        },
      ],
      sounds: [
        {
          name: 'Roaring Crowd',
          description: 'Deep-voiced giants bellowing, pounding iron rails, cheering fighters on',
          searchTerm: 'arena crowd roaring cheering deep voices ambient',
          tags: ['exploration', 'combat'],
        },
        {
          name: 'Combat Impacts',
          description: 'Fists on flesh, iron clashing, thunderous blows echoing off the pyramidal ceiling',
          searchTerm: 'fist fighting impact melee combat sound effects',
          tags: ['combat'],
        },
        {
          name: 'Iron Railing Percussion',
          description: 'Giants rhythmically pounding the iron railing around the pit',
          searchTerm: 'metal banging rhythmic industrial percussion sound',
          tags: ['exploration', 'combat'],
        },
      ],
    },
    linkedChallenges: ['sneaking-past-the-crucible'],
  },
  {
    id: 'z4',
    name: 'Z4 — Gym',
    readAloud: {
      punchy:
        'Huge stone benches line the walls between racks of enormous barbell weights. A burn-marked leather sandbag hangs from the ceiling, a slow trickle of sand escaping a burst seam. The benches are 10 feet high. On one of them sits a jar of restorative ointment — six doses. The room is empty of giants.',
      atmospheric:
        'Huge stone benches line the walls, interspersed with racks of enormous barbell weights sized for Huge hands. A burn-marked leather sandbag hangs from the ceiling, slowly leaking sand from a burst seam — the result of one too many fire-fueled punches.\n\nThe benches rise 10 feet off the ground. On one of them, partially hidden behind a stack of iron weights, sits a clay jar. Inside: six doses of a thick, restorative ointment, its herbal smell cutting through the sulfur. The room is quiet. No giants train here right now.',
      immersive:
        'This open space stretches wide and long, its floor scuffed and scarred from years of heavy use. Weapon racks line the walls — greatswords taller than a human, halberds that could serve as siege equipment, shields the size of dining tables. Training dummies made from iron-banded logs stand in rows, their surfaces dented and cracked from countless impacts.\n\nAn obstacle course of sorts fills the far end of the room: stone pillars to weave through, weighted chains to duck under, and a series of raised platforms connected by narrow beams. All of it sized for fifteen-foot-tall warriors. To a Medium creature, it looks like a playground designed by a mad architect.\n\nA handful of giants move through drills with mechanical precision, their formations tight and practiced. But the energy here is different from the Crucible — less spectacle, more discipline. This is where soldiers are made, not where champions perform.',
    },
    senses: {
      sight: 'Huge stone benches 10 ft high. Racks of giant barbell weights. Burn-marked leather sandbag leaking sand. Clay jar on a bench.',
      sound: 'Sand trickling from the burst sandbag. Distant sounds from other zones muffled through stone. Faint creaking of the sandbag chain.',
      smell: 'Leather and sweat. Char marks on the sandbag. Herbal ointment from the clay jar.',
      touch: 'Stone benches worn smooth from use. The weights are warm — everything here holds heat. Gritty sand underfoot from the leaking bag.',
      instinct: 'This room is between uses. The giants will be back. Take what you need and move.',
    },
    description:
      'A giant-sized gymnasium with huge stone benches, barbell weight racks, and a burn-marked sandbag. The benches are 10 feet high (DC 15 Athletics to climb). A jar of 6 doses of restorative ointment sits on one of the benches.',
    features: [
      {
        name: 'Stone Benches',
        description:
          'Huge stone benches line the walls, each 10 feet high. Racks of giant barbell weights sit between them.',
        dc: 15,
        mechanical:
          'DC 15 Athletics to climb the 10-foot benches. Medium creatures can hide behind or beneath them.',
      },
      {
        name: 'Burn-Marked Sandbag',
        description:
          'A giant leather sandbag hangs from the ceiling, covered in scorch marks, slowly leaking sand from a burst seam.',
        mechanical:
          'Can be cut down as an improvised trap or distraction. Weighs several hundred pounds.',
      },
    ],
    encounters: [
      {
        name: 'Empty Gym',
        monsters: [],
        notes:
          'The gym is currently unoccupied. Giants use it between training sessions in the Crucible. A patrol may pass through every 1d4 hours.',
        dialogue: [],
      },
    ],
    npcs: [],
    treasure: [
      {
        name: 'Jar of Restorative Ointment',
        description:
          'A clay jar sitting on one of the stone benches containing 6 doses of thick restorative ointment.',
        value: '6 doses of restorative ointment (on a 10-ft-high bench, DC 15 Athletics to reach)',
      },
    ],
    dmNotes: [
      'This zone is deliberately low-threat. It is a relief valve — a zone the party can pass through without a major encounter if they are smart about timing.',
      'The restorative ointment on the bench is a nice reward but requires a DC 15 Athletics check to climb up and grab it. Make the party work for it.',
      'The gym terrain is useful for creative combat if a fight does break out. Giant-scaled equipment creates gaps and shadows that Medium creatures can exploit.',
      'If the party needs to hide, this zone has plenty of cover behind the oversized benches and weight racks.',
    ],
    campaignNotes: [
      'This zone is a good opportunity for the party to observe fire giant culture without immediate threat. The discipline and physical conditioning on display here should reinforce that these are not mindless brutes — they are a trained military force.',
    ],
    ambiance: {
      music: [
        {
          name: 'Military Discipline',
          description: 'Steady, marching rhythm with a martial tone — drills and formations in progress',
          searchTerm: 'military march ambient music fantasy training',
          tags: ['exploration'],
        },
        {
          name: 'Training Grounds Combat',
          description: 'Mid-tempo combat music for skirmishes in the gymnasium',
          searchTerm: 'D&D combat music training fight medium intensity',
          tags: ['combat'],
        },
      ],
      sounds: [
        {
          name: 'Rhythmic Drilling',
          description: 'Heavy, synchronized footsteps and weapon strikes in cadence',
          searchTerm: 'military drill marching cadence heavy footsteps',
          tags: ['exploration'],
        },
        {
          name: 'Training Cadence',
          description: 'A deep voice calling out commands in Giant, troops responding in unison',
          searchTerm: 'military training call response chanting deep voice',
          tags: ['exploration'],
        },
        {
          name: 'Weapon Impacts',
          description: 'Greatswords and halberds striking training dummies — heavy, rhythmic thuds',
          searchTerm: 'sword hitting wood training dummy impact sound',
          tags: ['exploration', 'combat'],
        },
      ],
    },
  },
  {
    id: 'z5',
    name: 'Z5 — The Forge',
    readAloud: {
      punchy:
        'A magma forge dominates the west wall. The air is thick with sulfur and painful to breathe. At one of the anvils, a fire giant pounds on an enormous iron door while a stone giant with obsidian skin supervises. A storage area to the north contains metal ingots, a mound of charcoal with a giant-sized shovel, and a statue of an iron hand clutching an orb of volcanic glass — the Monument of Molten Blades.',
      atmospheric:
        'Thanks to the magma forge dominating the west wall, the air in this room is thick with sulfur and painful to breathe. The forge is built into the living rock, channeling magma itself as fuel into a basin that glows white-hot.\n\nAt one of the anvils, a fire giant in a scorched leather apron pounds on an enormous iron door with precise, ringing blows. A stone giant with obsidian skin watches with folded arms, supervising. To the north, a storage area holds stacks of metal ingots, a mound of charcoal with a giant-sized shovel, and a statue of an iron hand clutching an orb of volcanic glass — the Monument of Molten Blades.',
      immersive:
        'The heat hits you like a wall. The west side of this chamber is dominated by a forge built into the living rock of the volcano — a yawning maw of stone where magma itself serves as the fuel, channeled from deep below into a basin that glows white-hot. The air here is thick with sulfur fumes that sting the eyes and coat the tongue with the taste of brimstone.\n\nAt the anvil — a block of black iron the size of a horse — a fire giant in a scorched leather apron hammers a blade into shape with precise, ringing blows. Each strike sends a constellation of sparks arcing through the haze. Behind the smith, a massive figure of grey stone watches with folded arms: a stone giant, broader than the fire giants, skin like cracked basalt, standing with the patience of a mountain.\n\nAnd there, near the forge\'s entrance, stands a monument that stops you cold. It is a sculpture — a twisted, melted mass of swords, axes, maces, and shields, fused together into a towering pillar of dead metal. Each weapon belonged to an adventurer who came to the Molten Enclave. None of them left. The Monument of Molten Blades is a warning, and it is very, very effective.',
    },
    senses: {
      sight: 'White-hot magma forge in the west wall. Sparks arcing from the anvil. Obsidian-skinned stone giant supervising. Stacks of ingots in the north storage area. Monument of Molten Blades.',
      sound: 'Ringing hammer blows on iron. Roaring forge fire. Low conversation in Giant between smith and supervisor.',
      smell: 'Sulfur so thick it coats the tongue. Hot iron and brimstone. DC 15 CON save or poisoned.',
      touch: 'Heat radiates from every surface. The air itself burns exposed skin. Eyes sting from the fumes.',
      instinct: 'The fumes will kill you faster than the giants will. Get in, get out, or find a way to clear the air.',
    },
    description:
      'The Enclave\'s primary forge, built around a magma-fed furnace in the west wall. Toxic sulfur fumes fill the air (DC 15 CON save or poisoned; success = immune 24 hrs; 30 cold damage or 50 gallons water clears fumes). Hurga, a Red Fist apprentice, works the anvil while Ostios, a Basalt Stone Giant master smith, supervises. DC 16 group Stealth to avoid notice. Storage area to the north holds ingots and the Monument of Molten Blades.',
    features: [
      {
        name: 'Toxic Forge Fumes',
        description:
          'Toxic fumes from the magma forge fill the chamber, stinging eyes and burning lungs.',
        dc: 15,
        mechanical:
          'DC 15 CON save upon entering or become poisoned. On success, immune for 24 hours. Fumes can be cleared with 30 cold damage to the forge or 50 gallons of water.',
      },
      {
        name: 'Magma Forge',
        description:
          'A forge built into the west wall, fueled by channeled magma from deep within the volcano.',
        mechanical:
          'The forge basin contains magma — 33 (6d10) fire damage for creatures touching it. The area within 10 feet of the forge deals 2d6 fire damage at the start of each turn.',
      },
      {
        name: 'Monument of Molten Blades',
        description:
          'A statue of an iron hand clutching an orb of volcanic glass, surrounded by fused weapons of dead adventurers. A deliberate warning to intruders.',
        dc: 13,
        mechanical:
          'DC 13 History or Investigation to identify specific weapon types and estimate how many adventurers died here (dozens over the years). The monument is not magical, but its psychological effect is real.',
      },
      {
        name: 'Northern Storage Area',
        description:
          'Stacks of metal ingots, a mound of charcoal with a giant-sized shovel. Contains the bulk of the forge\'s raw materials.',
        mechanical:
          'Contains 25 steel ingots and 50 iron ingots. Partial cover available behind stacks.',
      },
    ],
    encounters: [
      {
        name: 'Forge Workers',
        monsters: ['Fire Giant Red Fist (Hurga) x1', 'Basalt Stone Giant (Ostios) x1'],
        notes:
          'Hurga works the anvil; Ostios supervises. DC 16 group Stealth to avoid notice. Ostios is the greater threat in combat — a stone giant is a formidable opponent. However, neither is expecting intruders in the forge. Surprise is possible if the party can endure the fumes.',
        dialogue: [
          '"More metal. Always more metal. The Zenith wants blades, I make blades. Hand me that ingot."',
          '"You are very small to be here. And very brave. Or very stupid. The fumes alone should have turned you back."',
          '"Ostios, we have guests. Small ones. What do you think — monument material, or do they have something interesting to say?"',
        ],
      },
    ],
    npcs: [
      {
        name: 'Hurga',
        dialogue: [
          '"More metal. Always more metal. The Zenith wants blades, I make blades."',
          '"You are very small to be here. And very brave. Or very stupid."',
        ],
      },
      {
        name: 'Ostios',
        dialogue: [
          '"I have shaped stone since before your grandparents\' grandparents drew breath. You are... interesting."',
          '"The forge does not care who you are. It shapes all things equally."',
        ],
      },
    ],
    treasure: [
      {
        name: 'Steel Ingots',
        description:
          '25 steel ingots stacked in the northern storage area.',
        value: '50 gp each (1,250 gp total)',
      },
      {
        name: 'Iron Ingots',
        description:
          '50 iron ingots stacked in the northern storage area.',
        value: '25 gp each (1,250 gp total)',
      },
      {
        name: 'Monument of Molten Blades',
        description:
          'The monument itself — a statue of an iron hand clutching an orb of volcanic glass, fused with the weapons of fallen adventurers. Could be claimed as a trophy or art piece.',
        value: 'Priceless to the right collector, but weighs several tons',
      },
    ],
    dmNotes: [
      'The sulfur fumes (DC 15 CON) are a constant pressure in this zone. On success, immune for 24 hours. 30 cold damage or 50 gallons of water clears the fumes entirely. Parties without poison resistance will struggle to fight effectively here.',
      'Ostios is a potential wildcard. As a stone giant, his loyalties to the Sunlight Legion may be more pragmatic than ideological. He respects craftsmanship and patience over martial prowess.',
      'The Monument of Molten Blades is a narrative beat, not a mechanical one. Describe it in detail. Let the party count the weapons. Let them understand what it means.',
      'Hurga is a Red Fist apprentice — skilled but not a hardened warrior. She may be more approachable than other Red Fists if the party does not threaten the forge.',
      'DC 16 group Stealth to pass through unnoticed.',
    ],
    campaignNotes: [
      'The Monument of Molten Blades is a perfect moment for the party to reckon with the danger they are in. These are not the first adventurers to come here. They could easily be the next additions to the sculpture.',
      'Drake destroyed Snicker Snacker — a weapon. Seeing a monument of dead weapons might resonate with that arc. What does it mean to define yourself by what you carry?',
    ],
    ambiance: {
      music: [
        {
          name: 'Heart of the Forge',
          description: 'Deep, industrial drone mixed with rhythmic hammering — the forge as a living thing',
          searchTerm: 'fantasy forge ambient music dark industrial smithing',
          tags: ['exploration'],
        },
        {
          name: 'Forge Fight',
          description: 'Intense combat music with metallic overtones for fighting amid the forge',
          searchTerm: 'D&D combat music forge fire intense battle',
          tags: ['combat'],
        },
      ],
      sounds: [
        {
          name: 'Anvil Hammering',
          description: 'Ringing, rhythmic blows of a massive hammer on a giant anvil',
          searchTerm: 'blacksmith anvil hammering rhythmic sound effect',
          tags: ['exploration'],
        },
        {
          name: 'Bellows Breathing',
          description: 'Deep, rhythmic whooshing of enormous bellows feeding the forge fire',
          searchTerm: 'forge bellows breathing whoosh ambient sound',
          tags: ['exploration'],
        },
        {
          name: 'Quenching Hiss',
          description: 'Hot metal plunged into water — violent hissing and steam bursts',
          searchTerm: 'hot metal quenching water hiss steam sound effect',
          tags: ['exploration'],
        },
        {
          name: 'Crackling Forge Fire',
          description: 'Roaring, popping magma-fed furnace fire filling the chamber with heat',
          searchTerm: 'large fire crackling roaring furnace ambient loop',
          tags: ['exploration'],
        },
      ],
    },
    linkedChallenges: ['the-forge-fumes'],
  },
  {
    id: 'z6',
    name: 'Z6 — Dining Hall',
    readAloud: {
      punchy:
        'A mural of fire giants traveling a vast desert adorns the carved walls. Two gigantic stone banquet tables run the length of the chamber, accompanied by chairs. The arched ceiling rises 40 feet. Two fire giants sit at a table sharing a meal and chatting quietly. A dog made of flame and ash patiently begs for scraps at their heels. The tables are 10 feet high.',
      atmospheric:
        'A mural of fire giants traveling a vast desert adorns the carved walls of this chamber, its colors still vivid despite the heat. Two gigantic stone banquet tables run the length of the hall, accompanied by chairs. The arched ceiling rises 40 feet above.\n\nTwo fire giants sit at a table sharing a meal and chatting quietly — one a Lightbearer in sigil-stitched robes, the other a Red Fist in scorched armor. A dog made of flame and ash patiently begs for scraps at their heels, its tail leaving scorch marks on the stone. They notice anyone who is not hidden the moment they enter.',
      immersive:
        'The smell of cooking meat and volcanic salt washes over you as you enter a vast hall lined with long basalt tables, each one twenty feet long and four feet off the ground. Enormous iron pots hang over cooking fires built into recesses in the walls, their contents bubbling and sending up plumes of fragrant steam. The walls are stained with decades of soot and grease.\n\nA handful of giants sit at the tables, hunched over platters of roasted meat and dark bread the size of wagon wheels. They eat with the unhurried ease of soldiers between shifts — no urgency, no vigilance. Conversation rumbles between them in low Giant, punctuated by barking laughter and the scrape of iron utensils on stone plates.\n\nThis is the domestic heart of the Molten Enclave. Here, in the clatter of dishes and the smell of food, the fire giants are not warriors or zealots or monsters. They are just people eating dinner.',
    },
    senses: {
      sight: 'Desert mural on carved walls. Two stone banquet tables (10 ft high). Lightbearer and Red Fist eating. Hellhound begging for scraps, tail scorching the floor.',
      sound: 'Quiet conversation in Giant. Scrape of iron utensils on stone. The hellhound whining softly. Bubbling from cooking fires.',
      smell: 'Roasted meat and volcanic salt. Dark bread. The sulfur-and-ash smell of the hellhound.',
      touch: 'Warm air from cooking fires. Grease-slick surfaces on the tables. The tables are 10 ft high — DC 15 Athletics to climb.',
      instinct: 'They will see you the moment you enter unless you are hidden. The hellhound will smell you even sooner.',
    },
    description:
      'The communal dining hall with a 40-foot arched ceiling. A mural of fire giants crossing a desert adorns the walls. Two giant stone banquet tables (10 ft high, DC 15 Athletics to climb) run the length of the room. Currently occupied by 1 Lightbearer, 1 Red Fist, and 1 Hellhound eating a meal. They notice non-hidden characters immediately.',
    features: [
      {
        name: 'Desert Mural',
        description:
          'A mural depicting fire giants traveling a vast desert adorns the carved walls. It depicts the Sunlight Legion\'s history.',
        mechanical:
          'DC 14 History to recognize the scene as the Legion\'s founding march. Provides context about the giants\' culture and self-image.',
      },
      {
        name: 'Stone Banquet Tables',
        description:
          'Two gigantic stone tables run the length of the hall, 10 feet high with chairs to match.',
        dc: 15,
        mechanical:
          'DC 15 Athletics to climb. Full cover for Medium creatures hiding beneath. The space under the tables is effectively a hidden corridor running the length of the hall.',
      },
      {
        name: 'Cooking Fires',
        description:
          'Open flames built into wall recesses, with iron pots hanging above them.',
        dc: 12,
        mechanical:
          'Can be weaponized: DC 12 Athletics to knock a pot. 10-ft area, 3d6 fire damage, DC 13 DEX save for half.',
      },
    ],
    encounters: [
      {
        name: 'Dining Giants',
        monsters: ['Fire Giant Lightbearer x1', 'Fire Giant Red Fist x1', 'Hellhound x1'],
        notes:
          'A Lightbearer, a Red Fist, and a Hellhound eating a meal. They notice non-hidden characters immediately upon entry. The Hellhound\'s keen senses make stealth very difficult. If combat starts, the Red Fist from here responds to trap triggers in Z2 within 1 minute.',
        dialogue: [
          '"Did you hear something from the atrium? Probably another rock fall. Pass the salt."',
          '"The Zenith has been meditating more than usual. Three days at the Core without food. Something is troubling her."',
          '"Hunters from the Warrens, I heard. Small things with sharp eyes. The patrols should have caught them in the tunnels. Sloppy."',
        ],
      },
    ],
    npcs: [],
    treasure: [],
    dmNotes: [
      'This is an intelligence-gathering zone. The off-duty giants gossip freely — patrol schedules, complaints about duties, rumors about the Zenith, opinions about recent events. A party that listens (Stealth + Perception, or disguise/invisibility) can learn a great deal.',
      'Possible intelligence: guard rotations for Z1 and Z8, when Aastrika meditates at the Core (Z9), how many giants are in the garrison, rumors about the secret sanctum.',
      'The under-table crawl is a legitimate stealth route. Ten-foot tables with giants sitting at them create a covered passage. Emphasize this if the party is stuck.',
      'Combat here is a bad idea. The noise carries, reinforcements arrive quickly, and the party gains nothing tactically. Reward stealth and patience.',
      'The Hellhound\'s keen senses (advantage on Perception checks relying on smell/hearing) make this zone harder to sneak through than most.',
    ],
    campaignNotes: [
      'If the party listens to gossip, they might hear giants discussing "the hunters from the Warrens" — the party\'s reputation may have preceded them. This can be a tense moment of recognition.',
      'The domestic normalcy of the dining hall should make the party uncomfortable. These giants are not evil cultists. They are soldiers eating dinner. This complicates the moral equation of the heist.',
    ],
    ambiance: {
      music: [
        {
          name: 'Hearth and Hall',
          description: 'Warm, low ambient music evoking a communal gathering — almost cozy despite the scale',
          searchTerm: 'fantasy tavern ambient music warm deep low',
          tags: ['exploration'],
        },
        {
          name: 'Under the Table',
          description: 'Tense stealth music for crawling beneath giant furniture while giants eat above',
          searchTerm: 'stealth sneaking tension ambient music fantasy',
          tags: ['stealth', 'tension'],
        },
      ],
      sounds: [
        {
          name: 'Giant Conversation',
          description: 'Deep, rumbling voices in casual conversation — indistinct but animated',
          searchTerm: 'crowd murmur deep voices tavern ambient loop',
          tags: ['exploration'],
        },
        {
          name: 'Eating and Drinking',
          description: 'Iron utensils scraping stone plates, liquid pouring, heavy chewing',
          searchTerm: 'medieval eating drinking feast ambient sound',
          tags: ['exploration'],
        },
        {
          name: 'Cooking Fires',
          description: 'Crackling fires, bubbling pots, and sizzling meat from the wall recesses',
          searchTerm: 'cooking fire sizzling bubbling pot ambient sound',
          tags: ['exploration'],
        },
        {
          name: 'Barking Laughter',
          description: 'Occasional eruptions of deep, booming laughter punctuating the meal',
          searchTerm: 'deep booming laughter crowd ambient sound',
          tags: ['exploration'],
        },
      ],
    },
  },
  {
    id: 'z7',
    name: 'Z7 — Storage Area',
    readAloud: {
      punchy:
        'Crates and barrels line the walls of this storeroom. Leather sacks contain a variety of provisions. Two skinned giant lizard carcasses hang in the northeast corner, their meat drying over a stone brazier of smoldering rocks. The room holds roughly 2,000 pounds of provisions — enough for 500 days for a Medium creature. No guards are present.',
      atmospheric:
        'Crates and barrels line the walls of this storeroom, organized with a quartermaster\'s precision. Leather sacks stuffed with provisions are stacked against every surface. Labels in Giant script are burned into each container.\n\nIn the northeast corner, two skinned giant lizard carcasses hang from iron hooks, their meat drying slowly over a stone brazier of smoldering rocks. The air here is drier and slightly cooler than the rest of the Enclave. Nothing moves. No guards patrol between the rows. Roughly 2,000 pounds of provisions are stored here.',
      immersive:
        'This section of the Enclave opens into a series of interconnected rooms stacked floor to ceiling with supplies. Barrels the size of water towers hold preserved meat and grain. Weapon crates — each one large enough to park a wagon inside — are stacked three high against the walls, their contents visible through slotted openings: greatswords, spearheads, bundled arrows thick as broomsticks.\n\nThe air here is cooler than the rest of the Enclave, and drier. The provisions are stored carefully, organized with a quartermaster\'s precision. Labels in Giant script are burned into the wood and stone of each container.\n\nNothing moves. No guards patrol between the rows. The storage rooms are quiet, still, and very, very useful for someone who does not want to be found.',
    },
    senses: {
      sight: 'Crates, barrels, and leather sacks lining walls. Two skinned lizard carcasses hanging from hooks in the northeast. Stone brazier glowing with smoldering rocks.',
      sound: 'Near silence. Faint popping from the smoldering brazier. Muffled Enclave sounds through stone walls.',
      smell: 'Drying meat and charcoal smoke. Preserved grain. Leather and wood. Noticeably less sulfur here.',
      touch: 'Cooler and drier air than the rest of the Enclave. Rough crate wood. Smooth leather sacks.',
      instinct: 'This is the safest room you have found. No guards, no patrols, plenty of hiding spots. Rest here if you can.',
    },
    description:
      'Supply rooms containing provisions, leather sacks, crates, and barrels. Two skinned giant lizard carcasses dry over a stone brazier in the northeast corner. Contains approximately 2,000 pounds of provisions (enough for 500 days for a Medium creature). Unguarded — a safe harbor zone.',
    features: [
      {
        name: 'Giant Provisions',
        description:
          'Approximately 2,000 pounds of provisions — preserved meat, grain, and other supplies. Enough to sustain a Medium creature for 500 days.',
        mechanical:
          'Medium creatures can hide inside empty barrels or crates (DC 8 Stealth when inside — the container does most of the work). Provisions could be poisoned or sabotaged as a diversion.',
      },
      {
        name: 'Drying Lizard Carcasses',
        description:
          'Two skinned giant lizard carcasses hang in the northeast corner, drying over a stone brazier of smoldering rocks.',
        mechanical:
          'The brazier can be knocked over to create a smoke screen or fire hazard. The carcasses are too large to move easily but provide partial cover.',
      },
      {
        name: 'Unguarded',
        description:
          'The storage rooms are not regularly patrolled. Giants come here only to retrieve supplies.',
        mechanical:
          'No passive guard presence. A patrol passes through once every 1d4 hours to retrieve supplies. Safe for short rests if the party is not being actively hunted.',
      },
    ],
    encounters: [
      {
        name: 'Supply Run (if patrol passes)',
        monsters: ['Fire Giant Trooper x1'],
        notes:
          'A single Trooper may come to grab provisions every 1d4 hours. They are not expecting intruders and are focused on their task.',
        dialogue: [
          '"Where did they put the salt? I swear someone reorganized this room. Third time this month."',
          '"Smells different in here. Smaller. Like... wet dog and steel. Hmm."',
        ],
      },
    ],
    npcs: [],
    treasure: [
      {
        name: 'Provisions',
        description:
          '2,000 pounds of preserved food — dried meat, grain, hard bread, and giant lizard jerky.',
        value: 'Practical value: 500 days of rations for a Medium creature',
      },
    ],
    dmNotes: [
      'This is a safe harbor zone. Let the party rest here, hide here, plan here. The lack of guards is intentional — the giants do not expect intruders to reach the interior.',
      'The inside-a-barrel stealth tactic is there to be used. If the party asks about hiding spots, point out the enormous containers.',
      'Previous adventurers\' gear can be found here — confiscated and stored. This is a minor treasure opportunity and a narrative echo of the Monument of Molten Blades in Z5.',
      'If the party needs to set up an ambush or lay a trap, the storage rooms offer ideal terrain: narrow rows, stackable crates, and chokepoints between rooms.',
    ],
    campaignNotes: [
      'A short rest opportunity. After the tension of the previous zones, the party may need to catch their breath. Let them have this — the real challenge is still ahead in Z9.',
    ],
    ambiance: {
      music: [
        {
          name: 'Quiet Refuge',
          description: 'Subdued, calm ambient for a brief respite — muffled and enclosed',
          searchTerm: 'quiet ambient music rest calm dungeon safe room',
          tags: ['exploration', 'rest'],
        },
        {
          name: 'Something Stirs',
          description: 'Low tension music for when a patrol approaches the storage rooms',
          searchTerm: 'suspense ambient music quiet tension approaching danger',
          tags: ['tension', 'stealth'],
        },
      ],
      sounds: [
        {
          name: 'Muffled Enclave',
          description: 'Distant, muted sounds from other rooms — hammering, voices, rumbling — all filtered through stone walls',
          searchTerm: 'muffled sounds through walls distant ambient',
          tags: ['exploration', 'rest'],
        },
        {
          name: 'Creaking Crates',
          description: 'Wood and rope settling under enormous weight — faint groans and pops',
          searchTerm: 'wooden crate creaking settling ambient sound',
          tags: ['exploration'],
        },
        {
          name: 'Dripping Water',
          description: 'Condensation dripping slowly in the cooler storage area',
          searchTerm: 'slow water dripping quiet room ambient',
          tags: ['exploration', 'rest'],
        },
      ],
    },
  },
  {
    id: 'z8',
    name: 'Z8 — Barracks',
    readAloud: {
      punchy:
        'Two rows of gigantic stone slabs line the walls — eight beds per room, each covered with a leather blanket. A fire giant lays in each bed, chest rising and falling. Two rooms, 15 Troopers and 1 Red Fist total. Three beds have leather pouches the size of halflings hanging at the end. DC 10 group Stealth per room to pass through. The snoring shakes pebbles from the ceiling.',
      atmospheric:
        'Two rows of gigantic stone slabs line the walls of this room, four on each side, each covered with a leather blanket. A fire giant lays in each bed, chest rising and falling in deep sleep. Three beds have leather pouches the size of halflings hanging at their ends.\n\nThe snoring is seismic. The walls vibrate. Pebbles shake loose from the ceiling in a constant, tiny rain. Two connected rooms hold 15 Troopers and 1 Red Fist between them. DC 10 group Stealth per room — easy, but failure means waking sixteen professional soldiers in a confined space.',
      immersive:
        'Two long rooms branch off from the corridor, each lined with enormous stone slab beds — eight per room, each carved from a single block of basalt and covered with thick leather blankets. The beds are ten feet long and five feet wide, their surfaces worn smooth by years of use. Personal effects are stowed beneath each slab: bundles of clothing, whetstones the size of bricks, carved bone trinkets.\n\nThe sound is overwhelming. Fifteen fire giants sleep in shifts, and their snoring is not a gentle rumble — it is a seismic event. The walls vibrate. Pebbles shake loose from the ceiling and patter to the floor in a constant, tiny rain. The floor itself seems to pulse with each thunderous exhalation.\n\nAnd yet, despite the cacophony, this is a room full of professional soldiers. They sleep light by instinct. The snoring masks footsteps — but one dropped weapon, one stumbled step, one whispered curse too loud, and those ember eyes will snap open.',
    },
    senses: {
      sight: 'Two rows of 8 stone slab beds per room, leather blankets. Giants sleeping. Three beds with halfling-sized leather pouches. Pebbles raining from the ceiling.',
      sound: 'Seismic snoring that shakes the walls. Pebbles pattering down. Occasional heavy shifting as a giant rolls over.',
      smell: 'Giant body heat — like standing near a furnace. Leather and iron. The stale air of too many bodies in an enclosed space.',
      touch: 'Floor vibrating with each snore. Warm air. Pebble grit underfoot that might crunch at the wrong moment.',
      instinct: 'DC 10 sounds easy. It is not. One bad roll and sixteen angry giants wake up in a confined space with you in the middle.',
    },
    description:
      'Two connected barracks rooms, each containing 8 enormous stone slab beds. Total: 15 Troopers + 1 Red Fist sleeping. Three beds have leather pouches the size of halflings hanging at the end. DC 10 group Stealth per room. DC 15 Athletics to climb a bed and reach a pouch. The snoring provides sound cover but the soldiers wake at genuine disturbance.',
    features: [
      {
        name: 'Thunderous Snoring',
        description:
          'The combined snoring of fifteen fire giants creates a constant, deep vibration that masks most sounds.',
        mechanical:
          'Advantage on Stealth checks relying on sound. However, sudden sharp sounds (dropped metal, combat, shouts) are distinct enough to wake giants regardless.',
      },
      {
        name: 'Pebble Rain',
        description:
          'The snoring vibration shakes loose pebbles from the ceiling in a constant patter.',
        mechanical:
          'The pebble rain provides visual and audio "noise" that helps mask movement. It also makes the ceiling structurally suspect — loud impacts might cause larger collapses.',
      },
      {
        name: 'Stone Slab Beds',
        description:
          'Enormous basalt slabs with leather blankets. Medium creatures can hide beneath them. Three beds have leather pouches the size of halflings hanging at the end.',
        dc: 15,
        mechanical:
          'Full cover underneath. DC 15 Athletics to climb a bed and reach a pouch. Space beneath each bed is cramped but passable for Medium creatures.',
      },
    ],
    encounters: [
      {
        name: 'Sleeping Garrison',
        monsters: ['Fire Giant Trooper x15', 'Fire Giant Red Fist x1'],
        notes:
          'All sleeping. DC 10 group Stealth check per room to pass through without waking anyone. The DC is deceptively easy — but failure is CATASTROPHIC. Waking one giant wakes adjacent giants within 1 round, and the entire barracks within 3 rounds. 16 angry giants in a confined space is a TPK scenario.',
        dialogue: [
          '"INTRUDERS! Wake up, you slugs! Small things in the barracks — WAKE UP!"',
          '"Grab your blades! They came for the Zenith — do not let them reach the Core!"',
          '"Block the corridor! Nothing gets through! FOR THE SUNLIGHT LEGION!"',
        ],
      },
    ],
    npcs: [],
    treasure: [
      {
        name: 'Personal Stash — Feather Token',
        description: 'A feather token found in one of the leather pouches.',
        value: 'Uncommon magic item',
      },
      {
        name: 'Personal Stash — Eagle Talon',
        description: 'An eagle talon enchanted with continual flame, found in a leather pouch.',
        value: 'Minor magical curio',
      },
      {
        name: 'Personal Stash — Fine Wine',
        description: 'A bottle of fine giant wine in a leather pouch.',
        value: '25 gp',
      },
      {
        name: 'Personal Stash — Prayer Beads',
        description: 'A string of carved stone prayer beads in a leather pouch.',
        value: '70 gp',
      },
      {
        name: 'Personal Stash — Golden Brooch',
        description: 'A golden brooch depicting the rising sun of the Sunlight Legion.',
        value: '100 gp',
      },
      {
        name: 'Personal Stash — Spinel Gem',
        description: 'A deep red spinel gemstone hidden in a leather pouch.',
        value: '200 gp',
      },
    ],
    dmNotes: [
      'DC 10 group Stealth per room. Read that again. DC 10. This is deliberate — the DC is EASY, but the consequences of failure are extreme. This creates tension not through difficulty but through stakes. Even a well-built party will sweat a DC 10 when sixteen giants are on the line.',
      'If a giant wakes, do NOT immediately have all giants wake. One wakes, groggy and confused. The party has ONE round to silence them (grapple, Sleep spell, fast talking) before adjacent giants stir. This creates a cascading failure that is dramatic rather than instant.',
      'The snoring advantage on Stealth is a gift. Let the party feel clever for recognizing it — but remind them that the advantage only applies to gradual, quiet movement. Combat sounds cut through instantly.',
      'Two rooms means two checks. A party might pass the first room and fail the second. Plan for partial success — they are deep in the barracks with waking giants behind them.',
      'The leather pouches (6 total across both rooms) require DC 15 Athletics to climb a bed and reach. Each contains a different personal treasure. Looting while giants sleep is extremely risky but rewarding.',
    ],
    campaignNotes: [
      'This is a classic heist-movie tension scene. Play it beat by beat. Who goes first? Who carries the heavy armor? Who trips on a pebble? The DC 10 should feel like the longest, sweatiest roll of the campaign.',
      'If the party is clever, they can avoid this zone entirely by finding an alternate route. But the direct path to Z9 runs through here. Reward creative routing.',
    ],
    ambiance: {
      music: [
        {
          name: 'Sleeping Giants',
          description: 'Almost-silent ambient with barely perceptible low tones — maximum tension through quietness',
          searchTerm: 'ultra quiet tension ambient music stealth suspense',
          tags: ['stealth', 'tension'],
        },
        {
          name: 'They Wake',
          description: 'Erupting, chaotic combat music for the catastrophic scenario of waking the barracks',
          searchTerm: 'D&D combat music chaotic panic overwhelming battle',
          tags: ['combat'],
        },
      ],
      sounds: [
        {
          name: 'Deep Rumbling Snores',
          description: 'Seismic, overlapping snoring from fifteen fire giants — a wall of sound',
          searchTerm: 'deep loud snoring rumbling multiple people sleeping',
          tags: ['exploration', 'stealth'],
        },
        {
          name: 'Shifting Giants',
          description: 'Occasional heavy movements — a giant rolling over, leather blankets rustling',
          searchTerm: 'heavy body shifting bed movement ambient sound',
          tags: ['stealth', 'tension'],
        },
        {
          name: 'Pebble Rain',
          description: 'Tiny rocks and grit pattering down from the vibrating ceiling',
          searchTerm: 'small rocks pebbles falling debris ambient sound',
          tags: ['stealth', 'exploration'],
        },
      ],
    },
    linkedChallenges: ['the-sleeping-barracks'],
  },
  {
    id: 'z9',
    name: 'Z9 — Crater of the Core',
    readAloud: {
      punchy:
        'Intense heat radiates from an enormous magma crater at the east end of the room. The ceiling angles up 60 feet, brightly lit. Four massive support pillars rise to the ceiling, each with a hollow base holding a brazier billowing black smoke. Seven fire giants are present — six Troopers and one wearing an obsidian crown who stands taller than the rest. They meditate in the room. A 20-foot-cube stone block hides in the entry corridor ceiling.',
      atmospheric:
        'Intense heat radiates from an enormous magma crater at the east end of this chamber. The angled ceiling rises 60 feet above, the room brightly lit by the Core\'s molten glow. Four massive support pillars rise to the ceiling — the hollow base of each holds a brazier that billows with black smoke, not yet filling the room but waiting.\n\nSeven fire giants meditate here. Five Troopers and one Lightbearer form a loose perimeter. And there — seated at the edge of the Core, wearing an obsidian crown set with a single pale stone that pulses with cold light — is Zenith Aastrika. The hagstone. The reason you are here. A stone block trap hides in the entry corridor ceiling above.',
      immersive:
        'The passage opens into a natural cavern so vast that the far walls dissolve into shadow and heat-haze. The ceiling is lost above — an open chimney rising into the throat of the volcano itself. And at the center of this cathedral of stone, the Core: a bubbling pool of lava thirty feet across, its surface rolling with slow, hypnotic convulsions of molten rock. The light it throws is blinding white at the center, fading to angry orange at the edges, painting every surface in shifting firelight.\n\nSacred braziers ring the cavern — enormous iron bowls on tripod legs, each one filled with coals that smolder with a faint conjuration aura. A haze of sweet, acrid smoke drifts from them, not yet ignited but waiting. Around the Core, five fire giants stand in a loose perimeter, and one robed figure tends the nearest brazier with ritualistic precision. And there, at the edge of the lava pool, seated cross-legged on a stone platform with her back to the entrance, is a figure who radiates authority like the Core radiates heat.\n\nZenith Aastrika. Her armor is dark iron chased with gold. Her back is straight as a pillar. And upon her brow sits a crown of black metal set with a single pale stone that pulses with an inner light — cold and alien against the volcanic heat. The hagstone. The reason you are here.',
    },
    senses: {
      sight: 'Enormous magma crater (the Core) at the east end, brightly lit. Four pillars with smoking braziers. Aastrika seated at the Core\'s edge wearing the obsidian crown with the pale hagstone. Five Troopers, one Lightbearer.',
      sound: 'Bubbling, churning lava. Low meditative chanting. Brazier coals hissing. Hot wind roaring up the open chimney above.',
      smell: 'Molten rock and superheated air. Sweet, acrid smoke from the conjuration braziers. The metallic tang of the Core.',
      touch: 'Blinding heat from the Core. The floor is warm enough to feel through boot soles. The air shimmers and distorts vision at distance.',
      instinct: 'This is sacred ground. Aastrika is not surprised you are here — she is waiting. The braziers are weapons. The Core is a teleportation hub. You are surrounded.',
    },
    description:
      'THE BOSS ROOM. A massive natural cavern with a 60-foot angled ceiling, brightly lit by the Core — an enormous magma crater at the east end. Fire giants touching the Core regain 20 HP; others take 44 (8d10) fire damage. Four support pillars hold conjuration braziers that fill the room with blinding smoke in combat (+5 ft/round on initiative 20, blinded unless fire resistant/immune; doused with 1 gallon water, dispel magic, or cold damage). A hidden 20-foot-cube stone block trap in the entry corridor ceiling (DC 15 DEX, 55 (10d10) bludgeoning). Aastrika fights to the death; others flee when she falls. Double iron doors require combined STR 50 to open, or 4+ creatures spending 1 minute + exhaustion.',
    features: [
      {
        name: 'The Core (Magma Crater)',
        description:
          'An enormous magma crater at the east end of the room, sacred to the Sunlight Legion. Connected to every other lava pool in the Enclave.',
        mechanical:
          'Fire giants touching the Core regain 20 HP. Non-fire-giant creatures touching it take 44 (8d10) fire damage. Fire giants can teleport through the Core to any connected lava pool (and vice versa). Reinforcements can arrive from ANY zone with a lava pool.',
      },
      {
        name: 'Sacred Braziers (4 pillars)',
        description:
          'Four massive support pillars rise to the ceiling. The hollow base of each holds a brazier billowing black smoke with conjuration magic.',
        mechanical:
          'When combat begins, smoke fills 10 ft around each pillar, then expands +5 ft per round on initiative 20. Creatures without fire resistance or immunity are blinded in the smoke. Dousing: 1 gallon of water, dispel magic, or any cold damage clears one brazier\'s smoke.',
      },
      {
        name: 'Entry Corridor Stone Block Trap',
        description:
          'A 20-foot-cube stone block is hidden in the ceiling of the entry corridor, ready to drop on intruders.',
        dc: 15,
        mechanical:
          'DC 15 DEX save or take 55 (10d10) bludgeoning damage on a failed save.',
      },
      {
        name: 'Aastrika\'s Crown',
        description:
          'A crown of dark iron set with a pale stone — the hagstone. It sits on Aastrika\'s brow. The hagstone pulses with cold light.',
        mechanical:
          'The Crown grants fire immunity, +2 CHA, and advantage on saves vs. magic to its wearer. The hagstone can be pried from the Crown (DC 16 Sleight of Hand or Thieves\' Tools if removed from an incapacitated wearer). The hagstone itself reveals the true form of shapechangers and pierces illusions within 30 feet.',
      },
      {
        name: 'Double Iron Doors',
        description:
          'Massive double iron doors seal the chamber. Built to withstand siege-level force.',
        mechanical:
          'Combined STR 50 to open, or 4+ creatures working together for 1 minute (each gains one level of exhaustion).',
      },
      {
        name: 'Open Chimney',
        description:
          'The ceiling is open to the volcano\'s throat above — a natural chimney rising hundreds of feet.',
        mechanical:
          'Flying creatures can ascend to escape. Hot updrafts provide advantage on Fly checks to ascend, disadvantage to descend. The chimney is an emergency escape route but leads to the open caldera of Roaring Peak.',
      },
    ],
    encounters: [
      {
        name: 'Zenith Aastrika and Guard',
        monsters: [
          'Zenith Aastrika',
          'Fire Giant Trooper x5',
          'Fire Giant Lightbearer x1',
        ],
        notes:
          'Aastrika meditates at the Core\'s edge. 5 Troopers in a loose perimeter. 1 Lightbearer tends the braziers. When combat begins: the Lightbearer ignites the braziers (smoke fills 10 ft/pillar, +5 ft/round on init 20, blinding non-fire-resistant creatures), Troopers form a defensive ring around Aastrika, and Aastrika uses her Villain Actions across the first 3 rounds. Aastrika will use the Core to teleport. Aastrika fights to the death. Others flee when she falls. Reinforcements may arrive through the Core from other zones if the alarm was raised.',
        dialogue: [
          '"So. The hunters arrive at last. I wondered when the outside world would come knocking."',
          '"You want the stone in my crown. I see it in your eyes. Tell me — what right do you have to take what fire has forged?"',
          '"If you can best my champion in the Crucible, I will hear your petition. But if you draw steel in this sacred place, you will join the monument."',
        ],
      },
    ],
    npcs: [
      {
        name: 'Zenith Aastrika',
        dialogue: [
          '"So. The hunters arrive at last. I wondered when the outside world would come knocking."',
          '"You want the stone in my crown. I see it in your eyes. Tell me — what right do you have to take what fire has forged?"',
          '"If you can best my champion in the Crucible, I will hear your petition. But if you draw steel in this sacred place, you will join the monument."',
        ],
      },
    ],
    treasure: [
      {
        name: 'Aastrika\'s Crown',
        description:
          'A crown of dark iron chased with gold, set with the hagstone. An artifact of the Sunlight Legion.',
        value:
          'Very Rare magic item — fire immunity, +2 CHA, advantage on saves vs. magic. The hagstone can be removed separately.',
      },
      {
        name: 'Hagstone',
        description:
          'A pale, cold stone set in the Crown. Reveals the true form of shapechangers and pierces illusions within 30 feet. The key to exposing the Daughter of Ash.',
        value:
          'Legendary quest item — reveals the Daughter of Ash\'s true hag form.',
      },
    ],
    dmNotes: [
      'This is the climax. Three key mechanics define this fight: (1) Lava pool teleportation — Aastrika and her troops use the Core to reposition, flank, and summon reinforcements. (2) Brazier smoke — fills 10 ft/pillar, +5 ft/round on init 20, blinding non-fire-resistant creatures. Douse with 1 gallon water, dispel magic, or cold damage per brazier. (3) Aastrika\'s Villain Actions — use all three across rounds 1-3 for maximum dramatic pacing.',
      'The Core heals fire giants who touch it (20 HP). Aastrika will use this tactically — retreating to the Core\'s edge to heal, then teleporting to flank. Others take 44 (8d10) fire damage.',
      'Stone block trap in the entry corridor: DC 15 DEX, 55 (10d10) bludgeoning. This can soften the party before the boss fight even begins.',
      'Lava pool reinforcements: if the alarm was raised earlier, 1d4 Troopers arrive through the Core every 3 rounds. If the alarm was NOT raised, no reinforcements come. This is the payoff for earlier stealth.',
      'Aastrika WILL offer diplomacy first, unless the party has been openly hostile throughout the dungeon. She is a leader, not a berserker. The trial-by-combat offer (fight a champion in the Crucible) is the honorable alternative to a bloodbath.',
      'Aastrika fights to the death. When she falls, the remaining giants flee. This is the key morale break.',
      'The Crown is a temptation. Aastrika wears it. The party needs only the hagstone. Do they take the whole crown? Do they destroy it? This choice matters.',
    ],
    campaignNotes: [
      'The hagstone is the objective. Everything else is optional. The party needs it to reveal the Daughter of Ash\'s true hag form — she is masquerading as a benevolent fey protector, and only the hagstone can pierce her deception.',
      'Drake\'s arc culminates here. Honest strength vs. temptation of power. If he fights Aastrika\'s champion in the Crucible, he does it on his own terms — no cursed weapons, no shortcuts. If he takes the whole Crown instead of just the hagstone, that is a different choice with different consequences.',
      'Rook\'s hag mark (Bavlorna\'s curse) should react to the hagstone. Burning pain, visions, the mark writhing — the stone and the curse are kin. This is dramatic and may give Rook insight into what the stone can do.',
      'Aastrika\'s question — "what right do you have to take what fire has forged?" — has no easy answer. The party IS stealing from someone who is not evil. They need the stone to stop a greater threat, but the moral weight should be felt. This is not a simple heist.',
      'After obtaining the hagstone (by combat, theft, or diplomacy), the party must escape the Enclave. If they earned it peacefully, they walk out. If they stole or killed for it, the entire garrison is between them and the exit.',
    ],
    ambiance: {
      music: [
        {
          name: 'Meditation at the Core',
          description: 'Deep, spiritual drone with subtle chanting — Aastrika in communion with the volcano',
          searchTerm: 'deep meditative chanting drone spiritual ambient',
          tags: ['spiritual', 'exploration'],
        },
        {
          name: 'Volcano\'s Wrath',
          description: 'Massive, overwhelming boss combat music with volcanic intensity',
          searchTerm: 'D&D boss fight music epic volcanic fire giant battle',
          tags: ['boss', 'combat'],
        },
        {
          name: 'Sacred Ground',
          description: 'Reverent, ominous ambient for the moment of seeing Aastrika and the Crown',
          searchTerm: 'ominous sacred ambient music dark temple revelation',
          tags: ['tension', 'spiritual'],
        },
      ],
      sounds: [
        {
          name: 'Bubbling Lava Core',
          description: 'A massive lava pool churning and popping — the dominant sound of the chamber',
          searchTerm: 'lava bubbling large pool volcanic ambient loop',
          tags: ['exploration', 'spiritual', 'combat'],
        },
        {
          name: 'Meditative Chanting',
          description: 'Low, resonant fire giant chanting in a ritualistic cadence around the Core',
          searchTerm: 'deep monk chanting ritual meditation ambient',
          tags: ['spiritual', 'exploration'],
        },
        {
          name: 'Brazier Flames',
          description: 'Sacred braziers crackling and hissing with conjuration-infused fire',
          searchTerm: 'magical fire crackling brazier torch ambient loop',
          tags: ['exploration', 'combat'],
        },
        {
          name: 'Volcanic Updraft',
          description: 'Hot wind roaring up through the open chimney above — the volcano breathing',
          searchTerm: 'strong wind updraft roaring chimney ambient sound',
          tags: ['exploration', 'combat'],
        },
      ],
    },
    linkedChallenges: ['hagstone-extraction'],
  },
  {
    id: 'z10',
    name: 'Z10 — Secret Sanctum',
    readAloud: {
      punchy:
        'Six 20-foot-high shelves carved into the walls hold massive stone tablets — 87 of them, each 25 pounds, recording the Sunlight Legion\'s history in Giant. The ceiling rises 80 feet above. To the north, a small chamber holds a pile of precious metals, plundered goods, and coin. Access is only possible via lava pool while wearing Aastrika\'s Crown. The air is cool. The silence is absolute.',
      atmospheric:
        'Six towering shelves — 20 feet high — are carved into the walls of this chamber, holding massive stone tablets. Eighty-seven of them, each weighing 25 pounds, inscribed in Giant with the history of the Sunlight Legion. The ceiling rises 80 feet above, lit by phosphorescent lichen casting pale blue-green light.\n\nTo the north, a small chamber holds the hoard: precious metals, plundered goods, and coin — neatly stacked and carefully arranged. The air here is cool, shockingly so. The silence is absolute. There is no door. The only way in is through the lava, wearing Aastrika\'s Crown.',
      immersive:
        'There is no door. There is no passage. There is only lava — and then, impossibly, you are somewhere else. The molten rock parts around you like a curtain, and you stumble onto dry stone in a chamber that should not exist. The air here is cool — shockingly so after the inferno of the Enclave. The silence is absolute. No hammering. No snoring. No groaning mountain. Just the faint drip of mineral water and the quiet gleam of treasure.\n\nThe chamber is modest by giant standards — perhaps forty feet across — but what it contains is anything but modest. Gold. Platinum. Gems that catch the light from phosphorescent lichen on the ceiling and throw it back in fractured rainbows. Neatly stacked ingots. Carefully arranged chests. And on a stone pedestal at the far wall, three items displayed with obvious reverence: a shield that gleams with magical light, a crystal pendant on a silver chain, and a scroll case sealed with wax.\n\nThis is the Sunlight Legion\'s hoard. Their wealth, their legacy, their insurance against a hostile world. And you are the first outsiders to see it in a very, very long time.',
    },
    senses: {
      sight: 'Six 20-ft-high carved shelves holding 87 stone tablets. Phosphorescent lichen casting pale blue-green light. Northern alcove gleaming with gold, platinum, and gems.',
      sound: 'Absolute silence. The faint drip of mineral water. Your own breathing sounds deafening after the Enclave\'s constant noise.',
      smell: 'Clean stone and mineral water. No sulfur. No smoke. The air is startlingly fresh.',
      touch: 'Cool stone — almost cold. Dry air. The tablets are heavy — 25 pounds each. The temperature change is jarring.',
      instinct: 'This place is sacred and secret. Taking from it is not just theft — it is violation. The weight of that choice should be felt.',
    },
    description:
      'Accessible ONLY via lava pool teleportation using Aastrika\'s Crown (which grants fire immunity). The ceiling rises 80 feet. Six 20-foot-high shelves hold 87 stone tablets (25 lbs each) recording the Sunlight Legion\'s history in Giant. DC 15 Athletics to climb the shelves. A northern chamber contains Aastrika\'s full treasure hoard.',
    features: [
      {
        name: 'Lava Pool Access Only',
        description:
          'The only way in or out is through a lava pool while wearing Aastrika\'s Crown. There is no door, passage, or other entrance.',
        mechanical:
          'Requires fire immunity to enter via lava (33 (6d10) fire damage per round otherwise). Also requires knowledge that the sanctum exists — DC 20 Investigation to discover references in the Enclave, or Aastrika/a Lightbearer can reveal it. Aastrika\'s Crown grants the necessary fire immunity.',
      },
      {
        name: 'Stone Tablet Archive',
        description:
          'Six 20-foot-high shelves carved into the walls hold 87 massive stone tablets, each weighing 25 pounds. They record the Sunlight Legion\'s complete history, written in Giant.',
        dc: 15,
        mechanical:
          'DC 15 Athletics to climb the shelves. Each tablet weighs 25 lbs. Reading requires literacy in Giant. The archive represents centuries of history — a scholar\'s dream.',
      },
      {
        name: 'Cooled Chamber',
        description:
          'Unlike the rest of the Enclave, this chamber is cool and dry. The ceiling rises 80 feet. Phosphorescent lichen provides dim blue-green light.',
        mechanical:
          'No High Heat saves required. No environmental fire damage. Dim light throughout from lichen.',
      },
    ],
    encounters: [
      {
        name: 'Empty Sanctum',
        monsters: [],
        notes:
          'No creatures guard the sanctum. Its only defense is secrecy and the lava barrier. If the party reaches this room, they have already overcome the dungeon\'s primary challenges.',
        dialogue: [],
      },
    ],
    npcs: [],
    treasure: [
      {
        name: 'Efreeti Bottle',
        description: 'A brass bottle containing a bound efreeti, displayed on a stone pedestal.',
        value: 'Very Rare magic item',
      },
      {
        name: 'Flame Tongue Greatsword',
        description: 'A greatsword that ignites with flame on command, sized for a giant but could be resized.',
        value: 'Rare magic item',
      },
      {
        name: 'Beads of Force (6)',
        description: 'Six small glass beads that explode into spheres of force on impact.',
        value: 'Rare consumable (6 uses)',
      },
      {
        name: 'Elemental Gem',
        description: 'A gem that summons a fire elemental when shattered.',
        value: 'Rare consumable',
      },
      {
        name: 'Potion of Fire Giant Strength',
        description: 'A potion that grants the drinker the strength of a fire giant (STR 25) for 1 hour.',
        value: 'Rare consumable',
      },
      {
        name: 'Coin Hoard',
        description: 'Neatly stacked and sorted coins in stone trays.',
        value: '25,872 cp / 1,589 sp / 876 gp',
      },
      {
        name: 'Gemstones and Precious Metals',
        description:
          'An assortment of precious gems and metal ingots — sorted by type and size in stone trays.',
        value: 'Assorted gems and metals (DM determines exact value based on party level)',
      },
    ],
    dmNotes: [
      'This room is ENTIRELY OPTIONAL. The party may never find it. That is fine. It is a reward for thoroughness, creativity, or successful negotiation with Aastrika or the Lightbearers.',
      'The primary barrier is KNOWLEDGE, not access. Fire immunity can be obtained from Aastrika\'s Crown, potions, or spells. But the party must first learn the sanctum exists. Sources: interrogating a Lightbearer, finding records in the Enclave, Aastrika revealing it as part of a deal, or a very high Investigation check.',
      'Taking the treasure has consequences. This is the Sunlight Legion\'s accumulated wealth. Stealing it is a declaration of war against the entire community, even if the party negotiated for the hagstone peacefully. Let the players make that choice with full awareness.',
      'The Scroll of Greater Restoration is a deliberate plant for Rook\'s curse. Greater Restoration can remove Bavlorna\'s mark. If the party finds this, they have a choice: use it now on Rook, or save it for a more critical moment later.',
      'The 87 stone tablets represent the Sunlight Legion\'s cultural heritage. Destroying or stealing them would be a deeply hostile act. A party that reads them (in Giant) learns valuable lore about fire giant civilization.',
    ],
    campaignNotes: [
      'The treasure hoard creates a moral dilemma. The party came for the hagstone. They did not come to rob the Sunlight Legion blind. Taking the full hoard from a community that is not evil is a character-defining choice.',
      'If Drake takes a weapon here (the flame tongue greatsword), it represents choosing a new path — an honest weapon earned through the crucible of this adventure, in contrast to Snicker Snacker\'s cursed temptation.',
      'The sanctum\'s existence can be used as a bargaining chip. If the party learns about it, they can offer to keep its location secret in exchange for the hagstone — a diplomatic resolution that costs Aastrika nothing but trust.',
      'The potion of fire giant strength is a callback to the scale theme — for one hour, a party member could operate the Enclave\'s mechanisms as the giants do. Strategic use during an escape could be dramatic.',
    ],
    ambiance: {
      music: [
        {
          name: 'Hidden Wonder',
          description: 'Ethereal, awe-inspiring ambient — the shock of discovering a secret treasure vault',
          searchTerm: 'discovery wonder ambient music treasure cave ethereal',
          tags: ['exploration'],
        },
        {
          name: 'Sanctum Silence',
          description: 'Nearly inaudible drone creating a sense of sacred, untouched stillness',
          searchTerm: 'eerie silence ambient music sacred hidden chamber',
          tags: ['exploration', 'spiritual'],
        },
      ],
      sounds: [
        {
          name: 'Eerie Silence',
          description: 'The near-total absence of sound after the Enclave\'s constant noise — deafening quiet',
          searchTerm: 'quiet room tone ambient silence cave',
          tags: ['exploration'],
        },
        {
          name: 'Lava Glow Hum',
          description: 'A faint, low-frequency hum from the lava pool entrance — the only connection to the outside',
          searchTerm: 'low frequency hum drone ambient subtle',
          tags: ['exploration'],
        },
        {
          name: 'Mineral Water Drip',
          description: 'Crystal-clear water droplets falling slowly in the cool, still chamber',
          searchTerm: 'water dripping cave crystal clear echo ambient',
          tags: ['exploration'],
        },
        {
          name: 'Treasure Glitter',
          description: 'Faint, high-pitched shimmering tones — the phosphorescent light reflecting off gold and gems',
          searchTerm: 'magical shimmer sparkle treasure sound effect ambient',
          tags: ['exploration'],
        },
      ],
    },
  },
];
