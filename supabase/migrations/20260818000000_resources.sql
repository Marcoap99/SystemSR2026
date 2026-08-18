-- =========================================================
-- V1.1 — Bloque A: biblioteca de recursos.
-- Cada learn_item puede tener varios recursos concretos (video, pdf,
-- curso...) en vez de un string plano en learn_items.source. El campo
-- learn_items.source original queda tal cual (no se borra), esta tabla
-- es la fuente nueva para /aprender.
-- =========================================================

create table resources (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null default auth.uid() references auth.users(id),
  learn_code text not null references learn_items(code),
  title text not null,
  url text,
  format text not null check (format in (
    'video', 'podcast', 'curso', 'interactivo', 'web', 'ppt', 'app',
    'pdf', 'docx', 'md', 'otro'
  )),
  language text check (language in ('es', 'en')),
  duration_min int,
  week int references weeks(number),
  tier text not null check (tier in ('nucleo', 'utilitario', 'archivo')),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'done')),
  notes text,
  -- "order" es palabra reservada en SQL; sort_order evita tener que
  -- citarla entre comillas en cada query.
  sort_order int not null default 0
);

alter table resources enable row level security;

create policy "resources_owner_all" on resources
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create index idx_resources_learn_code on resources(learn_code);
create index idx_resources_tier on resources(tier);
create index idx_resources_status on resources(status);
create index idx_resources_week on resources(week);
