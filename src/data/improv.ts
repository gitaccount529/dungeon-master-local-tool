import type { ImprovData } from '@/lib/types';

export const improvData: ImprovData = {
  giantNames: [
    'Surtr', 'Brynhild', 'Magnar', 'Eldrid', 'Skorr',
    'Ashara', 'Volkar', 'Ignis', 'Thyra', 'Ragnus',
    'Haldra', 'Embris', 'Tormund', 'Keldra', 'Fyris',
    'Grunhild', 'Blazmund', 'Skarla', 'Vrask', 'Cindra',
  ],

  personalityQuirks: [
    'Speaks in a whisper despite enormous size — finds shouting undignified',
    'Constantly sharpening a weapon that is already razor-sharp',
    'Hums an ancient fire giant war hymn under their breath',
    'Collects small shiny objects from fallen enemies as trophies',
    'Deeply superstitious — refuses to step on cracks in the stone',
    'Secretly terrified of water and avoids it at all costs',
    'Obsessively counts everything — enemies, steps, breaths',
    'Laughs at inappropriate moments, especially during combat',
    'Has a pet fire beetle they talk to as if it understands',
    'Quotes Zenith Aastrika constantly, even out of context',
  ],

  battleCries: [
    {
      cry: 'FOR THE CROWN OF FLAME!',
      narrative: 'The giant slams both fists together overhead, sending a shower of embers cascading down its arms. Its skin flares white-hot at the knuckles as it locks eyes with its target, the air between them shimmering with heat.',
    },
    {
      cry: 'THE MOUNTAIN HUNGERS!',
      narrative: 'The giant drops into a low stance, pressing one molten palm flat against the stone floor. The rock beneath its hand glows cherry-red and begins to crack as the giant rises, drawing strength from the volcanic earth itself.',
    },
    {
      cry: 'BY SURTUR\'S FORGE, YOU BURN!',
      narrative: 'The giant extends one arm in a sweeping gesture, trailing fingers of liquid fire through the air. Wherever the molten droplets land, the stone hisses and pops. The giant\'s eyes blaze like twin forge-fires as it advances.',
    },
    {
      cry: 'ROARING PEAK CLAIMS ANOTHER!',
      narrative: 'The giant throws its head back and lets out a roar that resonates with the deep rumble of the volcano itself. The walls vibrate in sympathy, and for a moment the fortress feels alive — hungry and watching.',
    },
    {
      cry: 'ASH AND CINDER — NOTHING REMAINS!',
      narrative: 'The giant drags its foot across the stone, leaving a glowing trail of molten rock in its wake. It raises both fists, skin rippling with inner heat, and the air around its body distorts as the temperature spikes violently.',
    },
    {
      cry: 'THE ENCLAVE WILL NOT FALL!',
      narrative: 'The giant plants its feet wide and beats its chest with both fists in a thunderous rhythm. Each impact sends a pulse of heat outward like a heartbeat, and the nearby lava channels surge in response, as if the fortress itself rallies to the call.',
    },
    {
      cry: 'FEEL THE FURY OF THE MOLTEN HEART!',
      narrative: 'The giant clasps its hands together in a meditative gesture, then slowly pulls them apart to reveal a ball of roiling heat suspended between its palms. Its voice drops to a resonant bass as the glow intensifies, illuminating every crevice of the chamber.',
    },
    {
      cry: 'ZENITH WATCHES — I WILL NOT FALTER!',
      narrative: 'The giant closes its eyes for a single breath, lips moving in a silent invocation. When its eyes snap open, they burn with renewed intensity. It rolls its shoulders, molten cracks spreading across its skin like war paint, and steps forward with absolute conviction.',
    },
    {
      cry: 'THE LAVA FLOWS THROUGH ME!',
      narrative: 'The giant plunges its arm into the nearest lava channel up to the elbow and pulls it free, magma dripping from its fingers like water. It shakes the molten rock from its hand with a flick, spattering the ground, and curls its glowing fist tight.',
    },
    {
      cry: 'I AM THE MOUNTAIN\'S WRATH GIVEN FORM!',
      narrative: 'The giant rises to its full height and spreads its arms wide. Veins of molten light race across its torso and down its limbs as the volcano rumbles in sympathy beneath the floor. Heat pours off its body in visible waves, and the stone at its feet begins to soften and glow.',
    },
  ],

  environmentalEvents: [
    {
      name: 'Tremor — Falling Stones',
      narrative: 'A deep, grinding rumble rolls through the fortress. The walls shudder and loose stones rain down from the vaulted ceiling, clattering off surfaces and shattering on the floor around you.',
      mechanic: 'DC 12 DEX save or take 1d6 bludgeoning damage.',
    },
    {
      name: 'Steam Geyser',
      narrative: 'A crack splits open in the floor with a sharp hiss, and a column of superheated steam erupts upward, scalding the air. The blast is blinding white and carries the acrid smell of sulfur.',
      mechanic: '10 ft radius. DC 13 DEX save or take 2d6 fire damage.',
    },
    {
      name: 'Lava Surge',
      narrative: 'The lava in a nearby channel heaves and surges over its banks, spilling across the stone floor in a slow, glowing tide. The temperature in the room spikes so sharply that metal fixtures begin to glow faintly.',
      mechanic: 'Lava spreads 5 ft from the channel edge. Creatures in the area take 2d10 fire damage. The area becomes difficult terrain until the lava cools (1d4 rounds).',
    },
    {
      name: 'Crumbling Bridge',
      narrative: 'A sickening crack echoes through the chamber as the stone bridge over the lava channel shudders. Fracture lines race across its surface and chunks of rock break free, tumbling into the molten flow below with bright splashes.',
      mechanic: 'Bridge collapses in 1d4 rounds. Creatures on it when it collapses fall into lava (10d10 fire damage). DC 14 DEX save to leap to safety.',
    },
    {
      name: 'Toxic Fumes',
      narrative: 'A cloud of yellowish volcanic gas rolls through the corridor at knee height, then billows upward. The air turns bitter and your eyes begin to water as the fumes thicken around you.',
      mechanic: 'DC 12 CON save or poisoned for 1 minute. Repeat save at end of each turn.',
    },
    {
      name: 'Forge Flare',
      narrative: 'The forge fires across the chamber flare violently, roaring upward in pillars of white-hot flame. For a blinding instant every shadow is burned away, and then the fires die back, leaving the room dimmer than before — all mundane light sources have been snuffed out.',
      mechanic: 'All nonmagical flames and light sources within 60 ft are extinguished. Creatures within 15 ft of a forge make a DC 11 DEX save or take 1d6 fire damage.',
    },
    {
      name: 'Stalactite Collapse',
      narrative: 'A sharp crack rings out overhead. You look up just in time to see a massive stalactite — easily the size of a person — break free from the ceiling and plummet downward, trailing dust and fragments.',
      mechanic: 'Targets one random creature. DC 14 DEX save or take 3d6 bludgeoning damage. On a save, half damage.',
    },
    {
      name: 'Volcanic Vent — Heat Wave',
      narrative: 'The volcano exhales. A wave of oppressive, furnace-like heat rolls through the area, pressing against you like a physical weight. Sweat evaporates instantly from your skin and every breath feels like inhaling embers.',
      mechanic: 'DC 10 CON save or gain 1 level of exhaustion. Creatures with fire resistance automatically succeed.',
    },
    {
      name: 'Lava Pool Eruption',
      narrative: 'One of the lava pools detonates without warning, hurling globs of molten rock into the air. Incandescent projectiles arc across the chamber trailing smoke, splattering against walls and floor with sizzling impacts.',
      mechanic: '20 ft radius around the pool. DC 13 DEX save or take 2d8 fire damage. The pool becomes agitated — any giant within 10 ft of a lava pool can use a reaction to teleport to another pool within 120 ft.',
    },
    {
      name: 'Lava Conduit Activation',
      narrative: 'The network of lava channels carved into the floor suddenly flares with blinding intensity. Molten rock rushes through the channels like blood through veins, and the entire floor pattern ignites in a web of orange-white light. The giants nearby seem to stand taller, their skin pulsing in rhythm with the flow.',
      mechanic: 'All lava pools and channels within 60 ft become supercharged for 1d4 rounds. Giants can teleport between any connected lava pools as a bonus action (no reaction needed). Creatures that start their turn within 5 ft of a supercharged channel take 1d6 fire damage.',
    },
  ],

  flavorText: [
    {
      category: 'Combat Sounds',
      texts: [
        'The clash of obsidian blades rings through the chamber like a funeral bell.',
        'A fire giant roars, the sound reverberating off volcanic glass walls.',
        'Molten sparks shower from an overhead forge as the battle rages below.',
        'The ground trembles with each thunderous footfall of the giant warriors.',
      ],
    },
    {
      category: 'Ambient Atmosphere',
      texts: [
        'The air shimmers with heat, distorting the far walls into wavering mirages.',
        'Rivers of lava cast everything in a hellish orange glow, shadows dancing wildly.',
        'The constant low rumble of the volcano is like a sleeping beast\'s heartbeat.',
        'Ash drifts through the air like black snow, coating everything in a fine gray layer.',
      ],
    },
    {
      category: 'Lava Pool Descriptions',
      texts: [
        'The lava churns sluggishly, its surface cracking into bright orange lines against black crust.',
        'Bubbles of gas break the surface, releasing jets of sulfurous steam with each pop.',
        'The heat radiating from the molten rock is like standing before an open furnace — even at this distance.',
        'Occasionally the lava surges, revealing glimpses of the incandescent fury beneath the dark skin.',
      ],
    },
    {
      category: 'Meditation & Spiritual',
      texts: [
        'The Lightbearers chant in deep, resonant tones — the sound seems to calm the very flames around them.',
        'Incense made from volcanic minerals fills the air with an acrid, otherworldly scent.',
        'Runes carved into obsidian pillars pulse with a faint inner light, synchronized with the chanting.',
        'The spiritual energy here is palpable — even non-magical characters feel a tingling at the base of their skull.',
      ],
    },
  ],
};
