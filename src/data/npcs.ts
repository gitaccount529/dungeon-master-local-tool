import type { NPC } from '@/lib/types';

export const npcs: NPC[] = [
  {
    id: 'zenith-aastrika',
    name: 'Zenith Aastrika',
    role: 'Warlord-Priestess, Zenith of the Sunlight Legion',
    personality: 'Regal, intense, and deeply principled. Once a lieutenant of the Sunlight Legion, she clawed through the ranks only to be sent into a trap by jealous superiors. She deserted, found spiritual enlightenment in a volcanic crater, and returned to depose those who betrayed her. She leads through respect earned in fire and blood — part warlord, part spiritual guru. She is not evil; she genuinely believes balance between martial prowess and spiritual growth is the path forward.',
    voiceNotes: 'Deep, measured cadence. Speaks like a sermon — every word deliberate. Slight pause before important words. Never raises her voice unless truly enraged — then it\'s volcanic. Think a warrior-queen giving a battlefield speech. Quote from the source: "I didn\'t find enlightenment atop some peaceful mountain high in the clouds... I earned it in the hottest fires the earth produces."',
    goals: 'Protect her people. Maintain balance between martial discipline and spiritual growth. Guard the Crater of the Core — the sacred site of her enlightenment. Prove the Sunlight Legion\'s path is righteous.',
    fears: 'That she has become the tyrant she fled from. That the outside world will destroy what she\'s built. That her enlightenment was a delusion.',
    quirks: [
      {
        description: 'Touches the crown reflexively when making decisions',
        dialogue: [
          '"The crown... it speaks to me sometimes. Not in words — in warmth. When a choice is right, it burns brighter."',
          '"You see me reach for it? It is a reminder. Of what I carry. Of who trusted me to carry it."',
        ],
      },
      {
        description: 'Refers to her followers as "my flame" collectively',
        dialogue: [
          '"Every one of my flame chose to be here. Can your Daughter of Ash say the same of her followers?"',
          '"When I speak of my flame, I mean every soul in this mountain. Their fire is my responsibility."',
        ],
      },
      {
        description: 'Pauses before the most important word in each sentence, as if tasting it',
        dialogue: [
          '"I do not rule. I... serve. The difference matters."',
        ],
      },
    ],
    keyDialogue: [
      '"I didn\'t find enlightenment atop some peaceful mountain high in the clouds or while sitting with my eyes closed in a serene field of high grass. I earned it in the hottest fires the earth produces. Would you like to feel that enlightenment for yourself?"',
      '"I did not conquer this place — I freed it. My unit was sent to die by jealous superiors. We chose a different path."',
      '"The crown burns because it must. Power that does not burn is power that does not protect."',
      '"Hunters from the Warrens? We have heard of the shadow queen who rules your land. The Lightbearers warned us she would send her pawns eventually."',
      '"You destroyed your cursed blade — Snicker Snacker, was it? Good. A warrior should choose their own weapon, not be chosen by one. Drake, is it? You have the hands of someone who has held too much fire. I know the look."',
      '"If you can best my champion, the crown is yours. But if you fall — you serve the Legion. Those are my terms."',
    ],
    sensory: {
      appearance: 'Towers above even other fire giants — nearly 20 feet tall. Skin glows with inner molten light, veins of liquid fire tracing her arms and shoulders. The Crown of Flame burns upon her brow, its central stone pulsing with cold blue-white light against the orange heat. Her eyes are steady, burning embers.',
      sound: 'When she speaks, the room quiets. Her voice carries like distant thunder. The crown hums faintly — a vibration more felt than heard. Her footsteps make the floor pulse with heat.',
      smell: 'Clean volcanic heat — not sulfur, but the sharp mineral scent of superheated stone. Like standing near a forge at full blast, but without the soot.',
      presence: 'Authority radiates from her the way the volcano radiates heat. Every giant stands straighter when she enters. You feel smaller, but not threatened — respected, evaluated, measured.',
    },
  },
  {
    id: 'ostios-the-smith',
    name: 'Ostios the Smith',
    role: 'Basalt Stone Giant, Master Smith (hired by Aastrika)',
    personality: 'Quiet, thoughtful, and surprisingly gentle for his size. An artist at heart who sees beauty in the shapes stone takes under extreme heat. Aastrika hired him to teach her smiths — he serves out of genuine admiration for her vision, not fear. His stone flesh is immune to weapon damage unless they\'re adamantine, and his very presence can destroy mundane weapons that strike him poorly.',
    voiceNotes: 'Very slow, deliberate speech. Long pauses between sentences as if carefully weighing each word. Low rumbling voice like stones grinding. Occasionally hums while thinking. When motionless, he\'s indistinguishable from a statue.',
    goals: 'Perfect his craft. Forge something truly worthy of the Zenith. Preserve the old stone giant songs and traditions.',
    fears: 'That the violence will destroy the beautiful things he\'s built. That art has no place in a fortress.',
    quirks: [
      {
        description: 'Always working on something with his hands — shaping stone, polishing obsidian',
        dialogue: [
          '"Sorry, I... cannot stop the hands. They need to be making. Even when the rest of me is talking."',
          '"Here — feel this edge. That is what heat and patience make together. That is what I understand."',
        ],
      },
      {
        description: 'Calls beautiful things "well-shaped" and ugly things "poorly carved"',
        dialogue: [
          '"Your weapons are... poorly carved. Functional, yes. But there is no song in the metal."',
          '"The Zenith\'s crown — now that is well-shaped. Every facet tells a story of the forge."',
        ],
      },
      {
        description: 'When motionless, is literally indistinguishable from a statue — uses this to observe before speaking',
        dialogue: [
          '"...I have been here the entire time. You simply did not see stone where you expected to see nothing."',
        ],
      },
    ],
    keyDialogue: [
      '"Stone remembers everything. Every hammer blow, every crack, every fire. I listen to what it tells me."',
      '"The Zenith hired me to teach her smiths. I stayed because she understands — strength without beauty is just... violence."',
      '"You are... poorly shaped for this place. But perhaps that is not your fault."',
      '"The monument of molten blades in my forge — it is made from the weapons of every adventurer who challenged the Legion and failed. I find it... beautiful and sad in equal measure."',
      '"I heard what Drake did — broke the cursed sword with a wish. That takes a different kind of strength. The strength to unmake. I respect that."',
      '"If you must take the crown, ask the Zenith honestly. Theft in a forge is... the deepest insult one can give."',
    ],
    sensory: {
      appearance: 'Dark gray basalt skin with veins of glittering obsidian running through it like mineral deposits in a cliff face. Moves with a sculptor\'s grace despite his massive size. Rune-signed blades hang at his sides. When still, he is indistinguishable from a natural rock formation.',
      sound: 'Nearly silent. When he speaks, his voice is a low grinding rumble like tectonic plates shifting. You hear him hum tunelessly while working — a sound that vibrates in your teeth.',
      smell: 'Cool stone and mineral dust. The opposite of the fire giants — there\'s no heat-smell from Ostios. Like standing in an old quarry after rain.',
      presence: 'Serene and patient. He makes you feel unhurried, like time moves differently near him. His obsidian eyes study you the way an artist studies a subject — seeing potential shapes in raw material.',
    },
  },
  {
    id: 'hurga-the-apprentice',
    name: 'Hurga the Apprentice',
    role: 'Fire Giant Red Fist, Blacksmith\'s Apprentice',
    personality: 'Eager, brash, and desperate to prove herself. She\'s both a Red Fist warrior and a blacksmith\'s apprentice under Ostios — pounding metal into shape in the forge (Z5). She idolizes the Red Fists and wants to earn her name, but secretly harbors doubts about whether fighting is really all there is.',
    voiceNotes: 'Fast, excited speech. Interrupts herself. Voice cracks with youth and enthusiasm. When nervous, talks even faster. Think an overeager recruit meeting heroes for the first time.',
    goals: 'Earn her full Red Fist name. Prove she belongs. Master smithing under Ostios. Maybe see the world beyond the volcano someday.',
    fears: 'Being seen as weak. Being sent away from the Enclave. That she\'ll never be as strong as the elder Fists or as skilled as Ostios.',
    quirks: [
      {
        description: 'Shadow-boxes constantly, even mid-conversation',
        dialogue: [
          '"Sorry — just staying sharp! The Drill Master says idle hands are dead hands."',
          '"Watch this combo — jab, jab, uppercut! Pretty good, right? I\'ve been practicing."',
        ],
      },
      {
        description: 'Gives everything a combat assessment',
        dialogue: [
          '"That door? I could break it in two swings. Maybe one and a half."',
          '"Your armor is okay but the joints are exposed. I\'d go for the left knee."',
        ],
      },
      {
        description: 'Names her weapons',
        dialogue: [
          '"This hammer is Ember! She\'s for smithing AND fighting. Don\'t tell Ostios I use her for both."',
        ],
      },
    ],
    keyDialogue: [
      '"You\'re the outsiders? I thought you\'d be... bigger. No offense! I just — the stories made you sound huge."',
      '"I\'m going to be a full Red Fist by next season. Hurga the Unyielding. Or maybe Hurga the Fierce. I\'m still deciding."',
      '"Don\'t tell the others, but... have you ever seen the ocean? Is it really just water with no bottom?"',
      '"Wait — you\'re the ones who broke the talking sword? That\'s so cool! Was it scary? Did it scream when it died? Rook, right? And Drake? The one who used to be its champion?"',
      '"The Daughter of Ash... I\'ve heard the Lightbearers whisper about her. They say she\'s not what she seems. Is that why you need the crown?"',
      '"If you fight the Zenith... can I watch? I\'ve never seen anyone challenge her before. I mean, I hope you don\'t die. But it would be amazing to see."',
    ],
    sensory: {
      appearance: 'Smaller than the other Red Fists — still 15 feet tall but leaner, rougher around the edges. Soot-stained skin, cracked knuckles that glow dull red. Constantly in motion — shadow-boxing, stretching, fidgeting. Wears a smith\'s apron over her armor.',
      sound: 'Never stops making noise — tapping, humming, the rhythmic thud-thud of fists hitting imaginary targets. Her voice is fast, excited, tripping over itself. The clang of her hammer Ember echoes from the forge.',
      smell: 'Hot metal and forge smoke. Sweat and sulfur. The smell of someone who works hard and hasn\'t stopped to wash.',
      presence: 'Infectious energy. She makes you want to like her despite everything. There\'s an earnestness that cuts through the intimidation of a 15-foot burning warrior.',
    },
  },
  {
    id: 'the-lightbearers',
    name: 'The Lightbearers',
    role: 'Support Giants — Healers & Spiritual Leaders',
    personality: 'Serene, contemplative, and unsettling in their calm. They serve as healers, spiritual guides, and battlefield support. They can heal fire giants by dealing fire damage to them (Healing Heat trait), and their Molten Flesh burns anyone who touches them. They answer to Aastrika but have their own quiet authority. They know more about the crown and its power than they let on.',
    voiceNotes: 'Soft, resonant voices that carry. Speak in the plural "we" when discussing spiritual matters, singular for personal. Rhythmic cadence, as if every sentence is part of a longer prayer. Their bodies emanate a constant warmth — not aggressive heat, but the comforting warmth of a hearth.',
    quirks: [
      {
        description: 'Speak in the plural "we" for spiritual matters, singular for personal',
        dialogue: [
          '"We have seen this shadow before. I... have feared its return."',
          '"We tend the flame. I tend my doubts. Both are necessary."',
        ],
      },
      {
        description: 'Their hands glow faintly when they sense deception or fey influence',
        dialogue: [
          '"Forgive the light — our hands react to... untruth. It is not always comfortable for visitors."',
        ],
      },
      {
        description: 'Can swap the positions of two willing creatures using Travel by Fire — used casually, almost playfully',
        dialogue: [
          '"Hold still. This won\'t hurt. Well — it will hurt, but only briefly. There. You\'re on the other side now."',
        ],
      },
    ],
    keyDialogue: [
      '"The flame does not judge. It simply reveals what was always within."',
      '"We tend the sick, the burned, the broken. The mountain provides — and the mountain takes."',
      '"You carry something dark with you, hunters. We can see its shadow. The flame could cleanse it... if you are willing to endure the burning."',
      '"The shadow you carry... it smells of the Feywild. Of bog water and broken promises. We know what hunts you, Rook. Bavlorna\'s mark is still on you."',
      '"The crown was not forged — it was taken. The Zenith killed her former commander for it. But the crown chose to stay with her. That is... significant."',
      '"If the Daughter of Ash fears this crown, then she fears the truth. And truth is what the flame was made to reveal."',
    ],
    sensory: {
      appearance: 'Skin radiates a soft white-gold glow that pulses in time with some inner heartbeat. Sacred runes carved into forearms glow like banked coals. Eyes burn with steady, purposeful fire. Where they step, stone briefly turns molten before cooling.',
      sound: 'Their voices carry a harmonic resonance — as if two tones speak at once. A faint hum accompanies them always, like a prayer that never ends. The air around them crackles softly.',
      smell: 'Incense and ozone. Clean, sharp heat — like lightning and temple smoke combined. Not unpleasant, but distinctly otherworldly.',
      presence: 'Calming and unsettling in equal measure. They radiate serenity, but their glowing hands react to deception. You feel seen — not just looked at, but spiritually examined.',
    },
  },
  {
    id: 'the-red-fists',
    name: 'The Red Fists',
    role: 'Elite Soldiers — CR 9 Warrior Monks',
    personality: 'Professional, intimidating, and fiercely loyal to Aastrika. They fight with unarmed strikes that burn — their Molten Flesh and Heat and Pressure abilities make them terrifying in melee. They respect strength and directness. They despise cowardice and deception. Their Guardian Block ability shows their protective nature — they\'ll take hits for each other without hesitation.',
    voiceNotes: 'Clipped military speech. Short sentences. Bark orders even in casual conversation. Think drill sergeants meets monk warriors. Different Fists may have distinct voices but all share the cadence.',
    quirks: [
      {
        description: 'Crack their knuckles before any important statement — their knuckles glow with heat',
        dialogue: [
          '"*crack* ...Right. So here\'s how this is going to go."',
        ],
      },
      {
        description: 'Refer to non-giants as "small-folk" — not always derisively',
        dialogue: [
          '"The small-folk fight well enough. For their size."',
          '"I\'ve seen small-folk do things that would make a trooper faint. Size isn\'t everything. Don\'t tell anyone I said that."',
        ],
      },
    ],
    keyDialogue: [
      '"State your business or become our business."',
      '"The Zenith\'s word is law. Our fists are the enforcement. Simple enough for you?"',
      '"Saw a group of adventurers once. Tried to sneak through the Crucible. We found pieces of them for weeks. Their weapons? Part of the monument now."',
      '"Drake, right? The one who broke the cursed sword? Took guts. Stupid guts, maybe. But guts. I can respect that."',
      '"You want to challenge the Zenith? Fine. But you fight by our rules. And know this — when she says \'This ends now,\' she means it. Every giant in this room explodes."',
      '"The coronation approaches. Whatever you\'re planning, plan it fast."',
    ],
    sensory: {
      appearance: 'Massive, built like siege engines. The Red Fist insignia — a clenched fist wreathed in flame — is branded into their shoulders. Bare fists glow dull red, knuckles cracked and scarred like cooling lava. Eyes scan constantly with military precision.',
      sound: 'Clipped military commands. Heavy, deliberate footsteps that shake the floor. The crack of knuckles echoes like breaking stone. When angry, their fists sizzle audibly.',
      smell: 'Sweat and brimstone. Hot iron and char. The unmistakable scent of warriors who have been fighting and will fight again soon.',
      presence: 'Intimidating professional competence. These are soldiers who have killed more times than they can count. They respect strength and despise weakness. You know immediately that deception would be a fatal mistake.',
    },
  },
  {
    id: 'the-troopers',
    name: 'The Troopers',
    role: 'Rank-and-File Minions — CR 12 (but one hit kills them)',
    personality: 'Common soldiers with the Minion trait — any attack that hits them drops them to 0 HP. They fight in groups, using Pack Tactics and Group Attacks to overwhelm. Despite being mechanically fragile, they\'re still 15-foot-tall fire giants whose Molten Flesh burns you just for touching them. They range from nervous recruits to bored veterans.',
    voiceNotes: 'Varied, casual speech. These are everyday soldiers. Some grumble, some joke, some are barely awake on guard duty. They\'re the most "normal" giants the party will encounter.',
    quirks: [
      {
        description: 'Complain constantly but would die for each other without hesitation',
        dialogue: [
          '"Another double shift. My back is killing me. But hey, at least the lava keeps the cold out, right? Ha."',
          '"If Skorr puts me on gate duty one more time, I swear by Surtur\'s anvil..."',
        ],
      },
      {
        description: 'Trade gossip about everything — the crown, the outsiders, the food',
        dialogue: [
          '"I heard the crown lets you teleport through lava. Through LAVA. That\'s insane, right?"',
          '"Bet you five ingots the small-folk don\'t make it past the Crucible. Nobody does."',
        ],
      },
    ],
    keyDialogue: [
      '"Another shift on the lower tunnels. You\'d think the lava would keep intruders out, but no — they keep coming."',
      '"Heard the Zenith is meditating at the Core again. Hours and hours. Just... sitting in the crater. How does she do that?"',
      '"Look, I don\'t make the rules. I just stand here and poke things that aren\'t supposed to be here. Are you supposed to be here?"',
      '"Small-folk in the Enclave? That hasn\'t happened since... actually, I don\'t think it\'s ever happened. This is weird."',
      '"Hey, you wouldn\'t happen to know anything about a talking sword that got destroyed, would you? The Lightbearers were going on about it during prayers."',
      '"Between you and me? I don\'t care about the crown. I just want the food at the feast. Cook\'s been preparing for weeks."',
    ],
    sensory: {
      appearance: 'Bulky and rough-edged. Cracked, soot-stained skin — molten glow more functional than ornamental. Some look nervous (young recruits), others bored (veterans). They crack their knuckles the way soldiers always have.',
      sound: 'Casual chatter, grumbling, gossip. The clink of gear and the shuffle of enormous feet. Snoring in the barracks shakes pebbles from the ceiling.',
      smell: 'Sulfur and sweat. Leather blankets. The everyday smell of soldiers who live, sleep, and eat in the same volcanic fortress.',
      presence: 'Individually less threatening than the named giants — they feel like regular people doing a job. In groups, the sheer mass of 15-foot-tall fire giants becomes overwhelming regardless of individual skill.',
    },
  },
];
