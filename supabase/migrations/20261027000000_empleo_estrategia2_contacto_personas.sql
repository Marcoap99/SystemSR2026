-- Carril A -- Estrategia 2: contacto con personas. Pasar de postular solo
-- por links (1 contacto humano en 19 postulaciones) a canales con persona
-- de por medio: Perú Tech Week, incubadoras como conectores, teardowns.
-- Todo aditivo: no se borra ni se renombra nada existente.

-- Perú Tech Week necesita nivel (A/B/C), que ds_connections no tenía.
alter table ds_connections add column nivel text check (nivel in ('A', 'B', 'C'));

-- "Sin respuesta" no estaba en el vocabulario de etapa (nuevo/contactado/
-- conversando/reunion/cerrado). Se agrega sin tocar los valores existentes,
-- así /red y /carriles/a (seguimientos) siguen funcionando igual.
alter table ds_connections drop constraint ds_connections_etapa_check;
alter table ds_connections add constraint ds_connections_etapa_check
  check (etapa in ('nuevo', 'contactado', 'conversando', 'reunion', 'cerrado', 'sin_respuesta'));

do $$
declare uid uuid := '8a00fd19-dc49-404f-9f61-62d651f893bd';
begin
  -- 4 estrategias nuevas en el carril A, mismo patrón que las 5 que ya
  -- tiene. A diferencia de esas 5 (recurrentes, se miden con Ruta B cada
  -- semana), estas son un checklist finito de esta tanda de contactos --
  -- weekly_target acá es el tamaño del checklist, el avance real se mide
  -- por tareas hechas (ver comentario en app/(app)/carriles/a/page.tsx).
  insert into ds_strategies (user_id, lane, code, name, weekly_target, sort_order) values
    (uid, 'A', 'mensajes', 'Estrategia 2: Mensajes directos', 7, 6),
    (uid, 'A', 'ventia', 'Estrategia 2: Teardown a Ventia', 3, 7),
    (uid, 'A', 'postulaciones', 'Estrategia 2: Postulaciones pendientes', 3, 8),
    (uid, 'A', 'sistema', 'Estrategia 2: Sistema (baja prioridad)', 1, 9);

  insert into ds_tasks (user_id, lane, title, strategy_code, status, created_at) values
    (uid, 'A', 'Escribir a Kevin (UTEC Ventures): pedir intro a 2-3 startups', 'mensajes', 'pending', now()),
    (uid, 'A', 'Escribir a Marita (Emprende UP): fijar visita a la incubadora la próxima semana', 'mensajes', 'pending', now()),
    (uid, 'A', 'Escribir al head de Kushki: pedir 15 min de feedback de perfil', 'mensajes', 'pending', now()),
    (uid, 'A', 'Follow-up a Sprinta', 'mensajes', 'pending', now()),
    (uid, 'A', 'Follow-up a Manzana Verde', 'mensajes', 'pending', now()),
    (uid, 'A', 'Mensaje corto a StartUPC', 'mensajes', 'pending', now()),
    (uid, 'A', 'Escribir al ponente de Riqra', 'mensajes', 'pending', now()),
    (uid, 'A', 'Confirmar web y contacto de Ventia', 'ventia', 'pending', now()),
    (uid, 'A', 'Preparar teardown de 1 página para Ventia', 'ventia', 'pending', now()),
    (uid, 'A', 'Enviar el teardown al founder de Ventia', 'ventia', 'pending', now()),
    (uid, 'A', 'SANNA -- Analista de Producto de Canales Digitales', 'postulaciones', 'pending', now()),
    (uid, 'A', 'Auna -- Analista de Producto', 'postulaciones', 'pending', now()),
    (uid, 'A', 'Inchcape -- Product Analyst F&I', 'postulaciones', 'pending', now()),
    (uid, 'A', 'Decidir si Dommies recibe teardown', 'sistema', 'pending', now());

  -- Contactos de Perú Tech Week (canal los separa del resto de /red).
  -- Estado inferido de tu nota -- revísalos, son mi mejor lectura, no un
  -- hecho confirmado. nivel C: solo saludo, sin acción por ahora.
  insert into ds_connections (user_id, persona, empresa, canal, nivel, etapa, proxima_accion, nota) values
    (uid, 'Marita', 'Emprende UP', 'Perú Tech Week', 'A', 'reunion', 'Ir la próxima semana', 'Incubadora, me invitó a visitar'),
    (uid, 'Kevin', 'UTEC Ventures', 'Perú Tech Week', 'A', 'conversando', 'Pedir intro a 2 o 3 startups', 'Conector, dijo "avísame"'),
    (uid, 'Founder', 'Sprinta', 'Perú Tech Week', 'A', 'conversando', 'Conversación + mini análisis de producto', 'Conversación larga'),
    (uid, 'Founder', 'Ventia', 'Perú Tech Week', 'A', 'nuevo', 'Teardown de 1 página', 'IA de ventas por WhatsApp, sin perfiles de producto visibles'),
    (uid, 'Por completar', 'Manzana Verde', 'Perú Tech Week', 'A', 'conversando', 'Follow-up', 'Conversamos, me preguntó por mi trabajo'),
    (uid, 'Head + otro chico', 'Kushki', 'Perú Tech Week', 'A', 'contactado', 'Pedir 15 min de feedback', 'Intercambiamos LinkedIn'),
    (uid, 'Contacto + Nuevo Lima', 'StartUPC', 'Perú Tech Week', 'B', 'conversando', 'Mensaje corto', 'Conversación corta'),
    (uid, 'Ponente', 'Riqra', 'Perú Tech Week', 'B', 'nuevo', 'Escribir citando su charla', 'SaaS B2B, seed'),
    (uid, 'Yanel Ulpiano', 'Dommies', 'Perú Tech Week', 'B', 'nuevo', 'Evaluar si enviar teardown', 'Coliving con IA, founder sola'),
    (uid, 'Amiga de Analytics', 'Geocito', 'Perú Tech Week', 'B', 'nuevo', 'Grabar contenido', 'Proyecto UTEC'),
    (uid, 'Amigo dueño', 'Indrox', 'Perú Tech Week', 'B', 'nuevo', 'Posible cliente carril B', 'Software a medida e IA'),
    (uid, 'Amigo', 'Núcleo Lab', 'Perú Tech Week', 'B', 'nuevo', 'Aprender de la comunidad', 'Comunidad no-code'),
    (uid, 'Solo saludo', 'HubUdep, NTT Data, Globant', 'Perú Tech Week', 'C', 'contactado', null, 'Solo saludo, sin acción por ahora'),
    (uid, 'Por completar', 'Cognitia', 'Perú Tech Week', null, 'nuevo', null, 'Sin datos todavía -- completar si hubo contacto'),
    (uid, 'Por completar', 'LatamGPT', 'Perú Tech Week', null, 'nuevo', null, 'Sin datos todavía -- completar si hubo contacto');
end $$;
