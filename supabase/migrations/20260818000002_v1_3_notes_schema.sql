-- =========================================================
-- V1.3 — Bloc de notas en /aprender.
-- Alcance: solo resources.notes. No toca artifacts, connections,
-- exposures ni log_entries -- el parche lo acota a aprendizaje.
-- =========================================================

-- 1) La columna vieja se conserva -- se renombra, no se borra. Una
--    migración posterior puede dropearla una vez confirmado que no
--    falta nada (sección 1 del parche).
alter table resources rename column notes to notes_legacy;

-- 2) Notas nuevas: documento BlockNote (jsonb) + lo que deriva de él.
alter table resources add column notes jsonb;
alter table resources add column notes_updated_at timestamptz;
alter table resources add column notes_word_count int not null default 0;
-- notes_plain: texto plano del documento, mantenido al guardar (acción
-- de servidor), usado por la búsqueda full-text de /notas (sección 7).
alter table resources add column notes_plain text;
-- notes_id: preparación para el futuro (log_entries / borrador de post
-- referenciando la nota por id estable). Solo la columna, sin FK ni uso
-- todavía -- así lo pide el parche explícitamente (sección 1).
alter table resources add column notes_id uuid not null default gen_random_uuid();
alter table resources add constraint resources_notes_id_key unique (notes_id);

-- has_notes: columna generada, nunca se escribe a mano.
alter table resources add column has_notes boolean
  generated always as (notes is not null and notes::text <> '[]') stored;

-- 3) Migración de datos: cada nota de texto existente se convierte en
--    un documento BlockNote de un párrafo por línea (sección 1: "no se
--    pierde contenido"). notes_legacy queda intacta al lado como
--    respaldo. notes_updated_at se marca a "ahora" porque es el
--    momento real en que el contenido cambió de forma (de texto plano
--    a bloques) -- no existe un timestamp de última edición real de
--    las notas viejas para reconstruir.
with legacy as (
  select id, notes_legacy
  from resources
  where notes_legacy is not null and btrim(notes_legacy) <> ''
),
lines as (
  select
    l.id,
    l.notes_legacy,
    line,
    ord
  from legacy l
  cross join lateral unnest(regexp_split_to_array(l.notes_legacy, '\r\n|\r|\n'))
    with ordinality as t(line, ord)
),
docs as (
  select
    id,
    notes_legacy,
    jsonb_agg(
      jsonb_build_object(
        'id', gen_random_uuid()::text,
        'type', 'paragraph',
        'props', jsonb_build_object(
          'textColor', 'default',
          'backgroundColor', 'default',
          'textAlignment', 'left'
        ),
        'content', case when btrim(line) = '' then '[]'::jsonb
          else jsonb_build_array(jsonb_build_object('type', 'text', 'text', line, 'styles', '{}'::jsonb))
        end,
        'children', '[]'::jsonb
      )
      order by ord
    ) as doc,
    string_agg(line, ' ' order by ord) as plain
  from lines
  group by id, notes_legacy
)
update resources r
set
  notes = d.doc,
  notes_plain = d.plain,
  notes_word_count = coalesce(array_length(regexp_split_to_array(btrim(d.notes_legacy), '\s+'), 1), 0),
  notes_updated_at = now()
from docs d
where r.id = d.id;

-- 4) Búsqueda full-text (sección 7 del parche).
create index idx_resources_notes_plain_fts
  on resources using gin (to_tsvector('spanish', coalesce(notes_plain, '')));

-- =========================================================
-- Storage: bucket privado para capturas pegadas en las notas
-- (sección 1 del parche).
-- =========================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'notas', 'notas', false, 5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Convención de ruta: {user_id}/{resource_id}/{timestamp}.{ext} -- el
-- primer segmento del path es el owner, así que RLS solo compara ese
-- segmento contra auth.uid(). App de un solo usuario, pero las
-- políticas quedan correctas igual.
create policy "notas_owner_select" on storage.objects
  for select using (bucket_id = 'notas' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "notas_owner_insert" on storage.objects
  for insert with check (bucket_id = 'notas' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "notas_owner_update" on storage.objects
  for update using (bucket_id = 'notas' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "notas_owner_delete" on storage.objects
  for delete using (bucket_id = 'notas' and (storage.foldername(name))[1] = auth.uid()::text);
