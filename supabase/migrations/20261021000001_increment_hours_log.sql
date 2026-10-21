-- Feedback de Marco: los botones +/-0.5h de Núcleo se sentían lentos.
-- logHoursAction hacía un SELECT y después un UPDATE (2 viajes a la base,
-- y una ventana de carrera real entre leer y escribir si se clickeaba
-- rápido). Esta función hace el incremento atómico en un solo viaje.
create or replace function public.increment_hours_log(p_lane text, p_day date, p_delta numeric)
returns numeric
language sql
security invoker
set search_path = public
as $$
  insert into ds_hours_log (user_id, lane, day, actual_h)
  values (auth.uid(), p_lane, p_day, greatest(0, p_delta))
  on conflict (user_id, lane, day)
  do update set actual_h = greatest(0, ds_hours_log.actual_h + p_delta)
  returning actual_h;
$$;

grant execute on function public.increment_hours_log(text, date, numeric) to authenticated;
