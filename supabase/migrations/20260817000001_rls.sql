-- =========================================================
-- Row Level Security — app de un solo usuario.
-- Toda tabla filtra por user_id = auth.uid(). Sin sesión, no se ve nada
-- (criterio de aceptación #1).
-- =========================================================

alter table phases enable row level security;
alter table bosses enable row level security;
alter table weeks enable row level security;
alter table learn_items enable row level security;
alter table artifact_groups enable row level security;
alter table artifacts enable row level security;
alter table results enable row level security;
alter table connections enable row level security;
alter table exposures enable row level security;
alter table exposure_events enable row level security;
alter table quests enable row level security;
alter table streaks enable row level security;
alter table streak_events enable row level security;
alter table log_entries enable row level security;
alter table app_events enable row level security;

-- Una política por tabla: el dueño de la fila puede seleccionar/insertar/
-- actualizar/borrar. Al ser una sola persona no hace falta separar por
-- comando; se deja así por si algún día se necesita granularidad extra.
do $$
declare t text;
begin
  foreach t in array array[
    'phases', 'bosses', 'weeks', 'learn_items', 'artifact_groups', 'artifacts',
    'results', 'connections', 'exposures', 'exposure_events', 'quests',
    'streaks', 'streak_events', 'log_entries', 'app_events'
  ]
  loop
    execute format(
      'create policy "%1$s_owner_all" on %1$s
         for all using (user_id = auth.uid()) with check (user_id = auth.uid());',
      t
    );
  end loop;
end $$;
