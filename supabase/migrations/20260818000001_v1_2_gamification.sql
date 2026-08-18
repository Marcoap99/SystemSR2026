-- =========================================================
-- PATCH V1.2 — Repriorización por gamificación y behavior design.
-- Dos columnas nuevas en learn_items, una en artifacts (según el
-- parche), más una en artifact_groups (ver nota abajo, no estaba en
-- el parche original).
-- =========================================================

-- `priority`: ordena /aprender dentro de cada track. 1 = máxima.
-- Default 5 para cualquier learn_item que este parche no repriorice
-- explícitamente (hoy solo AM3, ver el diff de seed).
alter table learn_items add column priority int not null default 5;

-- `blocked_by`: otro learn_item que debe estar 'done' antes que este
-- se pueda tocar. FK real porque ambos lados son learn_items.code.
alter table learn_items add column blocked_by text references learn_items(code);

-- `mode` ganó un valor nuevo (AR3 pasa a just_in_time). Sin esto, el
-- INSERT/UPDATE de AR3 en el seed falla contra el CHECK existente.
alter table learn_items drop constraint learn_items_mode_check;
alter table learn_items add constraint learn_items_mode_check
  check (mode in ('bloque', 'chamba', 'tiempo_muerto', 'micro', 'just_in_time'));

-- `blocked_by` en artifacts: a diferencia del de arriba, puede apuntar
-- a un artifact O a un learn_item (dos tablas distintas) -- el parche
-- lo dice explícitamente. No lleva FK por lo mismo, igual que
-- `artifacts.consumes` o `artifact_groups.feeds` ya no la llevan
-- (la referencia cruzada se valida a mano, no en el schema).
alter table artifacts add column blocked_by text;

-- No estaba en el parche (que pedía "2 columnas en learn_items, 1 en
-- artifacts"), lo propongo acá para que se revise junto con el resto:
-- la ficha de G10 necesita mostrar una nota fija del grupo ("G10.4 es
-- el diferencial..."), y artifact_groups no tiene ningún campo de
-- texto libre hoy. La alternativa sin esto es hardcodear ese párrafo
-- en el componente de la página /g/[code], case-por-case por código
-- de grupo -- rompe el patrón ya establecido en el resto de la app
-- (phases.rule, artifacts.note, bosses.criterion son todos texto que
-- vive en la base, no en JSX). Si preferís el hardcode para no tocar
-- el schema más de lo que pedía el parche, avisame y lo saco.
alter table artifact_groups add column note text;
