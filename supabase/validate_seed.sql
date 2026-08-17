-- =========================================================
-- Validador de referencias — corre DESPUÉS de seed.sql.
--
-- consumes[], feeds[] y serves[] son text[] sin FK real de Postgres
-- (no se puede declarar FK sobre un array). Con 48+ elementos sembrados
-- a mano, un typo es cuestión de tiempo, y sin este chequeo la app no
-- falla: simplemente no muestra la relación, que es peor y más difícil
-- de detectar. Corre esto cada vez que edites datos de esas columnas.
--
-- Uso: supabase db execute -f supabase/validate_seed.sql
--  (o pegarlo en el SQL Editor de Supabase). Si algo falla, la
--  excepción lista exactamente los códigos inválidos.
-- =========================================================

do $$
declare
  bad_consumes text[];
  bad_feeds text[];
  bad_serves text[];
begin
  -- artifacts.consumes debe apuntar a learn_items.code
  select array_agg(distinct x)
  into bad_consumes
  from artifacts a, unnest(a.consumes) as x
  where not exists (select 1 from learn_items li where li.code = x);

  if bad_consumes is not null then
    raise exception 'artifacts.consumes contiene códigos inexistentes en learn_items: %', bad_consumes;
  end if;

  -- artifact_groups.feeds debe apuntar a results.code
  select array_agg(distinct x)
  into bad_feeds
  from artifact_groups g, unnest(g.feeds) as x
  where not exists (select 1 from results r where r.code = x);

  if bad_feeds is not null then
    raise exception 'artifact_groups.feeds contiene códigos inexistentes en results: %', bad_feeds;
  end if;

  -- connections.serves debe apuntar a artifacts.code o results.code
  select array_agg(distinct x)
  into bad_serves
  from connections c, unnest(c.serves) as x
  where not exists (select 1 from artifacts a where a.code = x)
    and not exists (select 1 from results r where r.code = x);

  if bad_serves is not null then
    raise exception 'connections.serves contiene códigos inexistentes en artifacts/results: %', bad_serves;
  end if;

  raise notice 'Validación OK: consumes[]/feeds[]/serves[] apuntan a códigos que existen.';
end $$;
