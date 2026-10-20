-- Daily System Marco: migración ADITIVA (ya aplicada en producción el 12/10/2026).
-- 1) Respaldo de Temporada 1 -> archive_* (RLS activado, sin políticas = no accesible por API)
do $$
declare t text;
begin
  foreach t in array array['learn_items','resources','weeks','phases','bosses','artifact_groups','artifacts','results','connections','exposures','quests','streaks','streak_events','log_entries','user_settings']
  loop
    execute format('create table if not exists public.archive_%I as select * from public.%I', t, t);
    execute format('alter table public.archive_%I enable row level security', t);
  end loop;
end $$;

-- 2) Tablas nuevas ds_* (RLS por user_id = auth.uid(), mismo patrón que las existentes)
create table public.ds_phases (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(), number int not null, name text not null, starts_on date not null, ends_on date not null, unique (user_id, number));
create table public.ds_weeks (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(), number int not null, phase_number int, starts_on date not null, ends_on date not null, theme_codes text[] not null default '{}', study_minutes int not null default 240, unique (user_id, number));
create table public.ds_milestones (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(), number int not null, title text not null, due_on date not null, criteria jsonb not null default '[]', status text not null default 'pending' check (status in ('pending','done')), unique (user_id, number));
create table public.ds_study_themes (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(), code text not null, title text not null, week_from int not null, week_to int not null, planned_min int not null default 0, piece text, unique (user_id, code));
create table public.ds_resources (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(), theme_code text not null, week int, sort_order int not null default 0, title text not null, url text, format text, language text, duration_min int, tier text not null default 'utilitario' check (tier in ('nucleo','utilitario','archivo')), verified text, status text not null default 'pending' check (status in ('pending','in_progress','done')), notes jsonb, notes_plain text, created_at timestamptz not null default now());
create table public.ds_tasks (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(), code text, lane text not null check (lane in ('A','B','C')), title text not null, day date, week int, status text not null default 'pending' check (status in ('pending','done','skipped')), result_rank int, created_at timestamptz not null default now());
create table public.ds_habit_log (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(), habit text not null check (habit in ('english','sql')), day date not null, minutes int not null default 0, note text, unique (user_id, habit, day));
create table public.ds_reviews (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(), week int not null, answers jsonb not null default '{}', next_results jsonb not null default '[]', created_at timestamptz not null default now(), unique (user_id, week));
create table public.ds_routeb_actions (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(), day date not null default current_date, week int, description text not null, created_at timestamptz not null default now());
create table public.ds_hours_log (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(), lane text not null check (lane in ('A','B','C','comodin')), day date not null, planned_h numeric(4,2) not null default 0, actual_h numeric(4,2) not null default 0, unique (user_id, lane, day));
create table public.ds_note_tags (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(), resource_id uuid not null, tag text not null, unique (user_id, resource_id, tag));
create table public.ds_jarvis_events (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(), kind text not null, payload jsonb not null default '{}', created_at timestamptz not null default now());
do $$
declare t text;
begin
  foreach t in array array['ds_phases','ds_weeks','ds_milestones','ds_study_themes','ds_resources','ds_tasks','ds_habit_log','ds_reviews','ds_routeb_actions','ds_hours_log','ds_note_tags','ds_jarvis_events']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for all using (user_id = auth.uid()) with check (user_id = auth.uid())', t||'_owner_all', t);
  end loop;
end $$;
