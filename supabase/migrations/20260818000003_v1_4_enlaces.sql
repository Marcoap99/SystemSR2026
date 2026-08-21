-- =========================================================
-- V1.4 — Enlaces (biblioteca de links) + notas libres.
-- Un resource con learn_code = null no pertenece a ningún learn_item
-- del plan -- es la única señal de "origen libre" que hace falta, no
-- se agrega una columna aparte. tier tampoco aplica a un link suelto
-- (núcleo/utilitario/archivo es un concepto del plan).
-- =========================================================
alter table resources alter column learn_code drop not null;
alter table resources alter column tier drop not null;
