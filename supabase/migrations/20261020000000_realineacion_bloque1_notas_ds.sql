-- Realineación bloque 1 — paridad de notas en ds_resources (mismo patrón
-- que resources, ver 20260818000002_v1_3_notes_schema.sql). ds_resources ya
-- tiene notes/notes_plain (migración daily_system_ds); solo faltan estas.
alter table ds_resources add column notes_word_count int not null default 0;
alter table ds_resources add column notes_updated_at timestamptz;

alter table ds_resources add column has_notes boolean
  generated always as (notes is not null and notes::text <> '[]') stored;

-- Mismo índice que resources (20260818000002) -- textSearch() de PostgREST
-- arma to_tsvector('spanish', notes_plain) sin coalesce, tiene que calzar.
create index idx_ds_resources_notes_plain_fts
  on ds_resources using gin (to_tsvector('spanish', notes_plain));
