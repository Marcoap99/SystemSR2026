-- Realineación (20/10, 2da pasada) — Carril D (Contenido) se integra al
-- sistema de carriles: ds_tasks.lane y ds_hours_log.lane ahora aceptan 'D'.
-- Aditivo: solo se ensancha el CHECK, no se tocan filas existentes.

alter table ds_tasks drop constraint ds_tasks_lane_check;
alter table ds_tasks add constraint ds_tasks_lane_check check (lane in ('A', 'B', 'C', 'D'));

alter table ds_hours_log drop constraint ds_hours_log_lane_check;
alter table ds_hours_log add constraint ds_hours_log_lane_check check (lane in ('A', 'B', 'C', 'D', 'comodin'));

-- D: 2,5 h/semana en dos bloques de 75 min (martes y jueves, semana 1).
-- Comodín baja a 1,25 h, solo viernes (antes eran los bloques de D).
do $$
declare uid uuid := '8a00fd19-dc49-404f-9f61-62d651f893bd';
begin
  insert into ds_hours_log (user_id, lane, day, planned_h, actual_h) values
    (uid, 'D', '2026-10-20', 1.25, 0),
    (uid, 'D', '2026-10-22', 1.25, 0),
    (uid, 'comodin', '2026-10-23', 1.25, 0)
  on conflict (user_id, lane, day) do update set planned_h = excluded.planned_h;
end $$;
