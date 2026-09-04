-- =========================================================
-- V1.7 — integración con Duolingo para daily_english.
-- Duolingo pasa a ser la fuente de "hice inglés hoy": la API pública
-- de perfil (sin login, solo el username) expone `streak`, que se
-- compara contra duolingo_last_streak en cada carga del dashboard. Si
-- creció desde la última vez, se marca daily_english de hoy sola, sin
-- que el usuario tenga que abrir esta app -- resuelve el problema real
-- (finde sin laptop) sin inventar ni pisar ningún número.
-- Tabla aparte (no una columna en streaks) porque es una preferencia de
-- usuario, no un dato de racha.
-- =========================================================
create table user_settings (
  user_id uuid primary key default auth.uid() references auth.users(id),
  duolingo_username text,
  duolingo_last_streak int not null default 0,
  duolingo_last_checked_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table user_settings enable row level security;

create policy "user_settings_owner_all" on user_settings
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
