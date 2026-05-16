-- ============================================================
--  The Grimoire — Supabase Database Schema
--  Run this in: Supabase Dashboard > SQL Editor > New Query
--  https://supabase.com/dashboard/project/kwsyticbuyfytzdijuwd/sql
-- ============================================================


-- ── 1. Profiles (extends auth.users) ──────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  role        text not null default 'player' check (role in ('dm', 'player')),
  created_at  timestamptz default now()
);
alter table public.profiles enable row level security;

-- Anyone can read profiles (for name/role display)
create policy "Public read profiles"
  on public.profiles for select using (true);

-- Users can only update their own profile
create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Service role can insert (triggered on signup)
create policy "Service insert profiles"
  on public.profiles for insert with check (true);


-- ── 2. Spells ─────────────────────────────────────────────
create table if not exists public.spells (
  id              bigserial primary key,
  name            text not null,
  level           int not null default 1 check (level between 0 and 9),
  school          text,
  casting_time    text,
  range           text,
  duration        text,
  components      text,
  classes         text,          -- comma-separated: "Wizard, Warlock"
  description     text,
  higher_levels   text,
  ritual          boolean default false,
  concentration   boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
alter table public.spells enable row level security;

-- Everyone can read spells
create policy "Public read spells"
  on public.spells for select using (true);

-- Only DMs can insert/update/delete spells
create policy "DM manage spells"
  on public.spells for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'dm'
    )
  );


-- ── 3. Monsters ───────────────────────────────────────────
create table if not exists public.monsters (
  id                    bigserial primary key,
  name                  text not null,
  type                  text,
  size                  text,
  alignment             text,
  cr                    text,          -- stored as text to support 1/8, 1/4, 1/2
  ac                    text,
  hp                    text,
  speed                 text,
  str                   int default 10,
  dex                   int default 10,
  con                   int default 10,
  int                   int default 10,
  wis                   int default 10,
  cha                   int default 10,
  senses                text,
  languages             text,
  immunities            text,          -- damage immunities
  condition_immunities  text,
  lore                  text,          -- flavour/lore text
  traits                text,          -- newline-separated "Name. Description."
  actions               text,          -- newline-separated
  legendary_actions     text,
  image_url             text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);
alter table public.monsters enable row level security;

create policy "Public read monsters"
  on public.monsters for select using (true);

create policy "DM manage monsters"
  on public.monsters for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'dm'
    )
  );


-- ── 4. Wiki Pages ─────────────────────────────────────────
create table if not exists public.wiki_pages (
  id          bigserial primary key,
  title       text not null,
  category    text not null default 'Other',
  summary     text,
  content     text,             -- Markdown
  is_secret   boolean default false,   -- if true, only DM can see
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
alter table public.wiki_pages enable row level security;

-- Public pages visible to all authenticated users
create policy "Authenticated read wiki"
  on public.wiki_pages for select
  using (
    auth.uid() is not null
    and (
      is_secret = false
      or exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'dm'
      )
    )
  );

create policy "DM manage wiki"
  on public.wiki_pages for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'dm'
    )
  );


-- ── 5. Characters ─────────────────────────────────────────
create table if not exists public.characters (
  id              bigserial primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  player_name     text,
  race            text,
  class           text,
  subclass        text,
  level           int default 1 check (level between 1 and 20),
  background      text,
  alignment       text,
  xp              int default 0,
  avatar          text,           -- emoji or URL

  -- Ability scores
  str             int default 10,
  dex             int default 10,
  con             int default 10,
  int             int default 10,
  wis             int default 10,
  cha             int default 10,

  -- Combat stats
  hp_max          int default 8,
  hp_current      int default 8,
  hp_temp         int default 0,
  ac              int default 10,
  speed           int default 30,
  initiative      int default 0,

  -- Freeform text fields
  skills_prof     jsonb default '{}',   -- {"Perception": true, "Stealth": true}
  proficiencies   jsonb default '[]',   -- list of proficiency strings
  features        text,
  equipment       text,
  spells_known    text,
  spell_slots     jsonb default '{}',
  notes           text,

  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
alter table public.characters enable row level security;

-- Users can only see and edit their own characters
create policy "Users manage own characters"
  on public.characters for all
  using (auth.uid() = user_id);

-- DM can read all characters
create policy "DM read all characters"
  on public.characters for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'dm'
    )
  );


-- ── 6. Auto-updated timestamps ────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger spells_updated   before update on public.spells      for each row execute procedure update_updated_at();
create trigger monsters_updated before update on public.monsters     for each row execute procedure update_updated_at();
create trigger wiki_updated     before update on public.wiki_pages   for each row execute procedure update_updated_at();
create trigger chars_updated    before update on public.characters   for each row execute procedure update_updated_at();


-- ── 7. Seed: a couple of starter spells ───────────────────
insert into public.spells (name, level, school, casting_time, range, duration, components, classes, description, ritual, concentration)
values
  (
    'Chill Touch', 0, 'Necromancy', '1 action', '120 feet',
    '1 round', 'V, S', 'Sorcerer, Warlock, Wizard',
    'You create a ghostly skeletal hand in the space of a creature within range. Make a ranged spell attack. On a hit, the creature takes 1d8 necrotic damage, can''t regain hit points until start of your next turn, and undead targets have disadvantage on attack rolls against you.',
    false, false
  ),
  (
    'Animate Dead', 3, 'Necromancy', '1 minute', '10 feet',
    'Instantaneous', 'V, S, M (a drop of blood, a piece of flesh, and a pinch of bone dust)',
    'Cleric, Wizard',
    'This spell creates an undead servant. Choose a pile of bones or a corpse of a Medium or Small humanoid within range. Your spell imbues the target with a foul mimicry of life, raising it as an undead creature. The target becomes a skeleton if bones or a zombie if a corpse (the DM has the creature''s game statistics).',
    false, false
  ),
  (
    'Finger of Death', 7, 'Necromancy', '1 action', '60 feet',
    'Instantaneous', 'V, S', 'Sorcerer, Warlock, Wizard',
    'You send negative energy coursing through a creature that you can see within range, causing it searing pain. The target must make a Constitution saving throw. It takes 7d8 + 30 necrotic damage on a failed save, or half as much damage on a successful one. A humanoid killed by this spell rises at the start of your next turn as a zombie permanently under your command.',
    false, false
  )
on conflict do nothing;
