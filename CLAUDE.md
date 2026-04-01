# DM Session Tool

Real-time multi-device D&D 5e session management tool. DM View on laptop, Player View on phones/tablets.

**Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, SQLite (better-sqlite3), Socket.IO

---

## Terminology

| Term | Meaning |
|------|---------|
| **DM View** | The main tabbed interface at `/`. Tabs: Guide, Party, Combat, Challenges, RP Notes, Notes, Improv, Images, Libraries |
| **Player View** | The `/player` page displayed on player devices |
| **Spotlight** | An event/data payload sent TO the Player View (narrative, image, combat, overlay) |
| **Adventure** | A complete data module (zones, monsters, NPCs, etc.) in `data/adventures/[slug]/` |
| **Campaign** | The overarching story across multiple adventures |
| **Encounter Sidebar** | The right-side boss panel during boss fights (e.g., CrowEncounterSidebar, EmerEncounterSidebar) |

---

## Architecture

### Data Flow

```
AdventureProvider (Context)
  └── useAdventure hook
        └── API routes (src/app/api/adventures/[slug]/...)
              └── JSON files (data/adventures/[slug]/*.json)

Session state → SQLite (data/session.db)
Real-time    → Socket.IO or HTTP polling (/api/spotlight)
```

### Key Files

| Path | Purpose |
|------|---------|
| `src/lib/types.ts` | All TypeScript interfaces (Monster, Zone, Adventure, etc.) |
| `src/lib/AdventureContext.tsx` | Global adventure state + CRUD methods |
| `src/hooks/useAdventure.ts` | Adventure data fetching, `makeImageResolver()`, `bustImageCache()` |
| `src/lib/theme.ts` | `applyTheme()` / `resetTheme()` — shared between DM and Player views |
| `src/app/page.tsx` | DM View (tab routing, AdventureProvider) |
| `src/app/player/page.tsx` | Player View (spotlight polling) |

### Adventure Data Structure

```
data/adventures/[slug]/
  adventure.json    # Metadata, theme, header title
  zones.json        # Zone guide (travelSection, zoneOverview, zones[])
  monsters.json     # Monster stat blocks
  npcs.json         # NPC definitions
  scenes.json       # Skill challenges
  improv.json       # Random tables (names, quirks, etc.)
  images.json       # Gallery metadata
  loot.json         # Treasure tracker
  handouts.json     # Player handouts
  images/           # Image files (monsters/, scenes/, gallery/)
  reference/        # Source PDFs
```

### Component Organization

```
src/components/
  dm/               # DM-only panels (GuidePanel, CombatTracker, ImprovToolkit, etc.)
    encounters/     # Boss-specific encounter sidebars
  player/           # Player-only (SpotlightDisplay, PlayerCombatView)
  shared/           # Reusable (StatBlock, Badge, Button, ThemeApplier, etc.)
```

---

## Conventions

### Styling
- **Always use CSS variable classes** (`text-accent`, `bg-card`, `border-border`, etc.)
- **Never hardcode hex colors** in components — use the theme system
- Theme is applied via CSS variables on `:root` (see `src/lib/theme.ts`)

### Images
- **Always use `resolveImageUrl()`** from adventure context — never render raw `monster.imageUrl` in `<img src>`
- Adventure images use relative paths resolved by `makeImageResolver(slug)`
- Library images use absolute `/api/libraries/images/...` paths (pass through unchanged)
- Call `bustImageCache()` after any image URL mutation

### Data Safety
- Adventure data arrays (`features`, `encounters`, `npcs`, `treasure`, `dmNotes`, `campaignNotes`) can be `undefined` — always use optional chaining (`?.`)
- Zone objects require `id` and `name` fields (not `title`)
- `zoneOverview` must be a Zone object, not a plain string

### Monster Actions
- **Lair actions** belong in encounter sidebars (EmerEncounterSidebar, CrowEncounterSidebar), NOT in StatBlock
- **Villain actions** and **legendary actions** render in both StatBlock and encounter sidebars (sidebars add state tracking)
- MonsterBuilder supports editing lair actions — they're stored in `monster.lairActions`

### Components
- All components are functional with hooks (no class components)
- Client components marked with `'use client'`
- Section separators: `// ═══════════════` comments
- Adventure-agnostic — never hardcode adventure-specific content in components

---

## Working With Me

- **Explain key decisions** — brief notes on architecture/trade-offs, skip obvious stuff
- **Adventure content is collaborative** — Claude creates structure, I review and tweak (especially read-aloud and NPC dialogue)
- **Source material**: MCDM PDF in `data/adventures/[slug]/reference/` plus my campaign modifications
- **Read-aloud style**: Concise "Atmospheric Short" (80-120 words). Lead with concrete details (room dimensions, creature positions, notable features). One sensory hook per paragraph for mood. Never flowery.
- **Code quality**: Clean code matters, but don't over-engineer — this is a personal tool. Gradually adding tests for critical paths (combat state, spotlight system).

---

## Watch Out For

1. **Theme consistency** — every new component must respect adventure theme CSS variables
2. **Player View performance** — must stay fast on mobile. Minimal JS, no heavy re-renders
3. **Adventure-agnostic code** — components work with any adventure, no hardcoded Molten Enclave or Cloud Fang Keep references
4. **Optional chaining** — adventure data arrays can be undefined
5. **Image resolution** — always resolve through context, never use raw URLs

---

## Dev Commands

```bash
npm run dev              # Next.js dev server (port 3000)
npm run dev:socket       # Dev with Socket.IO real-time
npm run build            # Production build (verifies TypeScript)
npx tsc --noEmit         # Quick type check without full build
```

---

## Project Direction

Evolving into a **general-purpose DM tool** for any adventure or system. Currently using MCDM "Where Evil Lives" as source content, but the architecture is adventure-agnostic. Campaign-specific context (party members, plot points, story arcs) lives in memory files, not here.
