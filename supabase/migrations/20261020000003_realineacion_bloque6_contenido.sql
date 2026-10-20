-- Realineación bloque 6 — Contenido. Esquema aprobado con Marco durante
-- la planificación: tema, formato, canales[], estado, fecha_objetivo,
-- guion_notas (jsonb + plain), link_publicado.

create table public.ds_content_pieces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  tema text not null,
  formato text,
  canales text[] not null default '{}',
  estado text not null default 'idea'
    check (estado in ('idea', 'guion', 'grabado', 'editado', 'programado', 'publicado')),
  fecha_objetivo date,
  guion_notas jsonb,
  guion_notas_plain text,
  link_publicado text
);

alter table public.ds_content_pieces enable row level security;
create policy ds_content_pieces_owner_all on public.ds_content_pieces
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
