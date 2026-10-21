-- Carril C: meta semanal visible en el resumen de /carriles (sección 5
-- del mensaje) -- mismo ds_lane_info que A/B/D, sin cambios de estructura.
insert into ds_lane_info (user_id, lane, objective, weekly_goal)
values ('8a00fd19-dc49-404f-9f61-62d651f893bd', 'C', 'Cerrar la ruta de 10 semanas con hábito diario de inglés y SQL.', 'Tema de la semana + inglés y SQL diarios')
on conflict (user_id, lane) do nothing;
