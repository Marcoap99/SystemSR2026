-- Realineación bloque 3 — import del Centro de mando (export 2026-10-20).
-- Solo las 12 tareas (ds_tasks) + horas planeadas semana 1 (ds_hours_log).
-- El "study" (s01..s10) del export NO se importa: ds_study_themes ya tiene
-- T1..T9, reales y más completos, referenciados por ds_resources -- s01..s10
-- quedarían huérfanos (ningún recurso usa esos códigos). Confirmado con
-- Marco. c01/c02 reformulados para no mencionar "proyecto ancla".
--
-- user_id fijo porque esto corre fuera de una sesión autenticada (auth.uid()
-- sería null acá) -- mismo criterio que el resto del seed de ds_* (no vive
-- en una migración anterior, pero el dato ya está en la base).
do $$
declare uid uuid := '8a00fd19-dc49-404f-9f61-62d651f893bd';
begin
  insert into ds_tasks (user_id, code, lane, title, day, week, status, created_at) values
    (uid, 'a01', 'A', 'Postular a 3 vacantes de Lima (Product Analyst Jr, Analista de Producto, Prompt Analyst)', '2026-10-20', 1, 'pending', '2026-10-10'),
    (uid, 'a02', 'A', 'Seguimiento a Bitel y Laureate (estado del proceso)', '2026-10-20', 1, 'pending', '2026-10-10'),
    (uid, 'a03', 'A', 'Mensaje de seguimiento a contactos de Peru Tech Week (24 h)', null, 1, 'pending', '2026-10-10'),
    (uid, 'a04', 'A', 'Revisar Ruta B: mover POSTULAR YA y registrar acciones', null, 1, 'pending', '2026-10-10'),
    (uid, 'a05', 'A', 'Titular de CV y LinkedIn: PO Jr / Analista de Producto', null, 1, 'pending', '2026-10-10'),
    (uid, 'b01', 'B', 'Reunión de alcance con papá: qué vende la mype, cuánto cobras, 4 preguntas', '2026-10-20', 1, 'pending', '2026-10-10'),
    (uid, 'b02', 'B', 'Diagnóstico de ventas: formato y primer relevamiento', null, 1, 'pending', '2026-10-10'),
    (uid, 'b03', 'B', 'Acuerdo de una página con papá (alcance, tarifa, entregables)', null, 1, 'pending', '2026-10-10'),
    (uid, 'b04', 'B', 'Reporte del viernes a papá: qué se hizo y qué sigue', '2026-10-23', 1, 'pending', '2026-10-10'),
    (uid, 'c01', 'C', 'Abrir el primer recurso núcleo de T1 y tomar notas', '2026-10-20', 1, 'pending', '2026-10-10'),
    (uid, 'c02', 'C', 'Terminar la primera mitad de T1 (4,5 h)', null, 1, 'pending', '2026-10-10'),
    (uid, 'c03', 'C', 'Inglés: escribir y practicar mi presentación de 60 segundos', null, 1, 'pending', '2026-10-10');

  insert into ds_hours_log (user_id, lane, day, planned_h, actual_h) values
    (uid, 'A', '2026-10-19', 8, 0),
    (uid, 'B', '2026-10-19', 10, 0),
    (uid, 'C', '2026-10-19', 9.5, 0)
  on conflict (user_id, lane, day) do update set planned_h = excluded.planned_h;
end $$;
