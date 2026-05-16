# The Grimoire 📜

A grimdark D&D campaign compendium — spell encyclopedia, monster bestiary, character creator, and campaign wiki. Built for GitHub Pages + Supabase.

## Features

- **Spell Encyclopedia** — searchable by level, school, class. DM can add/edit/delete spells.
- **Monster Bestiary** — full stat blocks with CR, type, traits, actions. DM-managed.
- **Character Creator** — players build and save character sheets (ability scores, skills, HP, notes, spells, equipment).
- **Campaign Wiki** — Markdown-powered lore pages organized by category (Locations, NPCs, Factions, etc.). DM writes, players read.
- **Quick Rules Reference** — combat tables, conditions, actions, skills, DCs — all tabbed for fast lookup.
- **Auth** — DM role (full edit access) and Player role (read + own characters) via invite codes.

## Setup

### 1. Fork / Clone

```bash
git clone https://github.com/daymango/grimoire.git
cd grimoire
```

### 2. Enable GitHub Pages

In your repo settings → Pages → Source: **main branch / root**. Your site will be live at `https://daymango.github.io/grimoire`.

### 3. Set Up Supabase

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/kwsyticbuyfytzdijuwd/sql)
2. Create a new query, paste the contents of `supabase_schema.sql`, and run it.
3. Go to **Settings → API** and copy your **anon/public key**.

### 4. Add Your Supabase Key

Open `js/supabase.js` and replace:

```js
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';
```

with your actual anon key from the Supabase dashboard.

### 5. Set Invite Codes

Open `pages/login.html` and find these lines near the bottom. Change the codes to something secret:

```js
const DM_CODE     = 'DUNGEONMASTER';   // ← change this
const PLAYER_CODE = 'GRIMOIRE2025';    // ← change this
```

Share `PLAYER_CODE` with your players. Keep `DM_CODE` to yourself.

### 6. Push to GitHub

```bash
git add .
git commit -m "initial grimoire setup"
git push origin main
```

Your site is now live!

## File Structure

```
grimoire/
├── index.html              ← Homepage
├── css/
│   └── grimoire.css        ← Global styles (dark/grimdark theme)
├── js/
│   ├── supabase.js         ← Supabase client + auth helpers
│   └── nav.js              ← Shared navigation
├── pages/
│   ├── login.html          ← Sign in / sign up
│   ├── spells.html         ← Spell encyclopedia
│   ├── bestiary.html       ← Monster bestiary
│   ├── characters.html     ← Character creator
│   ├── wiki.html           ← Campaign wiki
│   └── rules.html          ← Quick rules reference
└── supabase_schema.sql     ← Run once in Supabase SQL editor
```

## Tech Stack

- **Frontend**: Vanilla HTML/CSS/JS with ES modules — no build step, works on GitHub Pages
- **Fonts**: Cinzel Decorative (headings) + Crimson Pro (body) + UnifrakturMaguntia (logo)
- **Backend**: [Supabase](https://supabase.com) (PostgreSQL + Auth + Row Level Security)
- **Hosting**: GitHub Pages (free)

## Phase Roadmap

- [x] Phase 1: Homepage + nav + global styles + auth
- [x] Phase 2: Spell Encyclopedia
- [x] Phase 3: Monster Bestiary  
- [x] Phase 4: Character Creator
- [x] Phase 5: Campaign Wiki
- [x] Phase 6: Quick Rules Reference
- [ ] Phase 7: Character sheet PDF export
- [ ] Phase 8: Initiative tracker
- [ ] Phase 9: Session notes with timestamps
- [ ] Phase 10: Monster image uploads via Supabase Storage
