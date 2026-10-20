-- Realineación bloque 5 — Red y Evidencia (V2). Mismo patrón RLS que el
-- resto de ds_* (user_id default auth.uid(), una política _owner_all).

create table public.ds_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  persona text not null,
  empresa text,
  rol text,
  canal text,
  etapa text not null default 'nuevo' check (etapa in ('nuevo', 'contactado', 'conversando', 'reunion', 'cerrado')),
  ultimo_contacto date,
  proxima_accion text,
  nota text,
  created_at timestamptz not null default now()
);

-- Mismas columnas de notas que ds_resources/resources (título/url/status en
-- vez de persona/etapa) -- así NotesModal se reusa tal cual, sin adaptar props.
create table public.ds_evidence_pieces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  title text not null,
  kind text not null default 'portafolio' check (kind in ('caso_final', 'portafolio')),
  sort_order int not null default 0,
  url text,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'done')),
  notes jsonb,
  notes_plain text,
  notes_word_count int not null default 0,
  notes_updated_at timestamptz,
  created_at timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['ds_connections', 'ds_evidence_pieces']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for all using (user_id = auth.uid()) with check (user_id = auth.uid())', t||'_owner_all', t);
  end loop;
end $$;
