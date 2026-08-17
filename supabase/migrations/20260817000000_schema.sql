-- =========================================================
-- Plataforma de Desarrollo Personal — esquema inicial
-- PRD sección 5. Un solo usuario, RLS por user_id = auth.uid().
--
-- Toda la aritmética de fechas de la app (racha, semana actual, contador
-- regresivo) se hace en America/Lima vía una única función today() en
-- lib/domain/dates.ts — no hay lógica de zona horaria en SQL.
--
-- Ruta de migración de `code` (V2, fuera de alcance ahora): hoy `code` es
-- `unique` global por tabla porque hay un solo usuario y un solo plan. Si
-- en el futuro se necesita una temporada/plan nuevo reutilizando códigos
-- (AR1, G1, ...), la migración correcta es agregar una columna
-- `season text` (o `plan_id`) y mover el `unique` a `unique(season, code)`
-- — NO a `unique(user_id, code)`, porque seguiría siendo el mismo usuario.
-- =========================================================

create extension if not exists pgcrypto;

-- ---------- phases ----------
create table phases (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null default auth.uid() references auth.users(id),
  number int not null unique,
  name text not null,
  rule text not null,
  unlocked boolean not null default false,
  unlocked_by_boss int
);

-- ---------- bosses ----------
create table bosses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null default auth.uid() references auth.users(id),
  number int not null unique,
  name text not null,
  date date not null,
  criterion text not null,
  status text not null default 'pending' check (status in ('pending', 'won', 'lost'))
);

alter table phases
  add constraint phases_unlocked_by_boss_fkey
  foreign key (unlocked_by_boss) references bosses(number);

-- ---------- weeks ----------
create table weeks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null default auth.uid() references auth.users(id),
  number int not null unique,
  start_date date not null,
  end_date date not null,
  phase_number int not null references phases(number),
  focus text not null default '',
  load text not null check (load in ('alta', 'media', 'colchon', 'fiestas')),
  note text
);

-- ---------- learn_items ----------
create table learn_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null default auth.uid() references auth.users(id),
  code text not null unique,
  track text not null check (track in ('rol', 'mercado', 'tool')),
  title text not null,
  mode text not null check (mode in ('bloque', 'chamba', 'tiempo_muerto', 'micro')),
  block text check (block in ('A', 'B', 'C')),
  chain text,
  source text,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'done')),
  target_week int references weeks(number)
);

-- ---------- artifact_groups ----------
create table artifact_groups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null default auth.uid() references auth.users(id),
  code text not null unique,
  title text not null,
  feeds text[] not null default '{}',
  target_week int references weeks(number),
  starred boolean not null default false
);

-- ---------- artifacts ----------
-- La barra de progreso de un grupo se DERIVA de estas filas
-- (count status='done' / count total). Nunca se guarda un porcentaje.
create table artifacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null default auth.uid() references auth.users(id),
  code text not null unique,
  group_code text not null references artifact_groups(code),
  title text not null,
  consumes text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'done', 'blocked')),
  phase_number int not null references phases(number),
  note text
);

-- ---------- results ----------
create table results (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null default auth.uid() references auth.users(id),
  code text not null unique,
  title text not null,
  criterion text not null,
  achieved boolean not null default false,
  achieved_at date,
  target_month text
);

-- ---------- connections ----------
create table connections (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null default auth.uid() references auth.users(id),
  code text not null unique,
  person text not null,
  role text,
  unlocks text,
  serves text[] not null default '{}',
  target_month text,
  status text not null default 'pending' check (status in ('pending', 'done')),
  unlocked_note text
);

-- ---------- exposures ----------
-- target_note es texto ("4-6", "1 antes de diciembre"): es una meta
-- orientativa, nunca un tope. Se llama target_note (no target_total) a
-- propósito — P9 prohíbe mostrar techos como cuota ("n/máximo"), y un
-- campo int con nombre "total" invita a construir esa barra tarde o
-- temprano. El tope real y numérico, el único que puede deshabilitar un
-- botón, es cap_per_month.
create table exposures (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null default auth.uid() references auth.users(id),
  code text not null unique,
  type text not null,
  required_output text not null,
  cap_per_month int,
  target_note text
);

-- ---------- exposure_events ----------
-- Un evento sin output no cuenta (P9 / regla 6.8): columna generada.
create table exposure_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null default auth.uid() references auth.users(id),
  exposure_code text not null references exposures(code),
  date date not null default current_date,
  name text not null,
  output text,
  counts boolean generated always as (output is not null and output <> '') stored
);

-- ---------- quests ----------
create table quests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null default auth.uid() references auth.users(id),
  week_number int not null references weeks(number),
  type text not null check (type in ('ejecutar', 'aprender', 'conectar', 'bonus')),
  title text not null,
  ref_code text,
  done boolean not null default false,
  unique (user_id, week_number, type) -- máximo 1 quest por tipo por semana (7.1 / sección 8.11)
);

-- ---------- streaks ----------
-- Estado consolidado. La lógica de transición (tolerancia, reset, freeze,
-- reset trimestral) vive en lib/domain/streaks.ts, no acá.
create table streaks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null default auth.uid() references auth.users(id),
  kind text not null unique check (kind in ('daily_english', 'weekly_log')),
  current int not null default 0,
  longest int not null default 0,
  last_marked date,
  freezes_total int not null default 2,
  freezes_used int not null default 0,
  quarter text not null
);

-- ---------- streak_events ----------
-- unique(kind, period): idempotencia. Marcar dos veces el mismo día (o la
-- misma semana, para weekly_log) no debe poder insertar dos eventos.
create table streak_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null default auth.uid() references auth.users(id),
  kind text not null references streaks(kind),
  period date not null,
  action text not null check (action in ('marked', 'freeze', 'missed')),
  unique (user_id, kind, period)
);

-- ---------- log_entries ----------
-- El corazón del sistema: de acá se compila el expediente (G9.1).
create table log_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null default auth.uid() references auth.users(id),
  week_number int not null references weeks(number),
  date date not null default current_date,
  what text not null,
  evidence text not null,
  ref_code text
);

-- ---------- app_events ----------
-- Instrumentación. event_type queda libre (sin CHECK): un CHECK en
-- telemetría es un antipatrón (un evento nuevo o tira excepción en
-- producción o se pierde en silencio). Tipos conocidos hoy (PRD 5):
-- app_open, section_view, log_created, streak_marked, freeze_used,
-- artifact_done, result_achieved. Nuevos tipos se agregan sin migración.
create table app_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null default auth.uid() references auth.users(id),
  event_type text not null,
  payload jsonb not null default '{}'::jsonb
);

-- =========================================================
-- Índices
-- =========================================================
create index idx_weeks_phase_number on weeks(phase_number);
create index idx_learn_items_status on learn_items(status);
create index idx_learn_items_track on learn_items(track);
create index idx_artifacts_group_code on artifacts(group_code);
create index idx_artifacts_status on artifacts(status);
create index idx_artifacts_phase_number on artifacts(phase_number);
create index idx_connections_status on connections(status);
create index idx_exposure_events_exposure_code on exposure_events(exposure_code);
create index idx_exposure_events_date on exposure_events(date);
create index idx_quests_week_number on quests(week_number);
-- (kind, period) ya queda indexado por el unique(user_id, kind, period) de arriba.
create index idx_log_entries_week_number on log_entries(week_number);
create index idx_log_entries_date on log_entries(date);
-- Compuesto (no dos índices separados): la retro de diciembre (G6.3)
-- consulta "este tipo de evento a lo largo del tiempo", no cada campo solo.
create index idx_app_events_type_created_at on app_events(event_type, created_at);
