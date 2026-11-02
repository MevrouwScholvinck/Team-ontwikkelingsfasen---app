create extension if not exists pgcrypto;

create table if not exists public.rounds (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text,
  group_sizes jsonb not null default '{"1":0,"2":0,"3":0,"4":0,"5":0}'::jsonb,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.student_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  round_id uuid not null references public.rounds(id) on delete cascade,
  group_number integer not null check (group_number between 1 and 5),
  initials text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references public.rounds(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  group_number integer not null check (group_number between 1 and 5),
  aspect_key text not null,
  current_choice text not null check (current_choice in ('A', 'B', 'C')),
  desired_choice text not null check (desired_choice in ('A', 'B', 'C')),
  submitted_at timestamptz not null default now(),
  unique (round_id, user_id, aspect_key)
);

create table if not exists public.group_decisions (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references public.rounds(id) on delete cascade,
  group_number integer not null check (group_number between 1 and 5),
  aspect_key text not null,
  selected_choice text not null check (selected_choice in ('A', 'B', 'C')),
  updated_at timestamptz not null default now(),
  unique (round_id, group_number, aspect_key)
);

create table if not exists public.action_plans (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references public.rounds(id) on delete cascade,
  group_number integer not null check (group_number between 1 and 5),
  aspect_key text not null,
  decision_choice text not null check (decision_choice in ('A', 'B', 'C')),
  what_text text not null default '',
  how_text text not null default '',
  where_text text not null default '',
  when_text text not null default '',
  who_text text not null default '',
  scrum_owner text not null default '',
  updated_at timestamptz not null default now(),
  unique (round_id, group_number, aspect_key)
);

alter table public.rounds enable row level security;
alter table public.student_profiles enable row level security;
alter table public.responses enable row level security;
alter table public.group_decisions enable row level security;
alter table public.action_plans enable row level security;

drop policy if exists "rounds_all_authenticated" on public.rounds;
create policy "rounds_all_authenticated"
on public.rounds
for all
to authenticated
using (true)
with check (true);

drop policy if exists "student_profiles_all_authenticated" on public.student_profiles;
create policy "student_profiles_all_authenticated"
on public.student_profiles
for all
to authenticated
using (true)
with check (true);

drop policy if exists "responses_all_authenticated" on public.responses;
create policy "responses_all_authenticated"
on public.responses
for all
to authenticated
using (true)
with check (true);

drop policy if exists "group_decisions_all_authenticated" on public.group_decisions;
create policy "group_decisions_all_authenticated"
on public.group_decisions
for all
to authenticated
using (true)
with check (true);

drop policy if exists "action_plans_all_authenticated" on public.action_plans;
create policy "action_plans_all_authenticated"
on public.action_plans
for all
to authenticated
using (true)
with check (true);

create index if not exists idx_responses_round_group on public.responses(round_id, group_number);
create index if not exists idx_profiles_round_group on public.student_profiles(round_id, group_number);
create index if not exists idx_decisions_round_group on public.group_decisions(round_id, group_number);
create index if not exists idx_action_plans_round_group on public.action_plans(round_id, group_number);
