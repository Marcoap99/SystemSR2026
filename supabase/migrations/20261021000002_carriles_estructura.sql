-- Carriles con estructura real (21/10/2026, mensaje "Estructura por
-- carril en Carriles"): cada carril pasa de una lista plana a un
-- proyecto con objetivo, meta semanal, estrategias/etapas y acciones
-- agrupadas. Todo aditivo, nada se borra ni se renombra.

create table public.ds_strategies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  lane text not null check (lane in ('A', 'B', 'C', 'D')),
  code text not null,
  name text not null,
  weekly_target int not null default 0,
  sort_order int not null default 0,
  active boolean not null default true,
  unique (user_id, lane, code)
);

-- Una fila por carril: objetivo/meta en texto corto, notas largas con el
-- mismo editor genérico (ds_resources/ds_evidence_pieces). Los campos
-- miami_* son puntuales para el carril B (sección "Apoyo deal Miami") --
-- no se usan en los demás carriles, no vale la pena una tabla aparte
-- para dos columnas.
create table public.ds_lane_info (
  user_id uuid not null default auth.uid(),
  lane text not null check (lane in ('A', 'B', 'C', 'D')),
  objective text,
  weekly_goal text,
  notes jsonb,
  notes_plain text,
  notes_updated_at timestamptz,
  miami_weekly_cap_h numeric(4, 2),
  miami_hours_logged numeric(4, 2) not null default 0,
  primary key (user_id, lane)
);

alter table ds_tasks add column strategy_code text;
alter table ds_routeb_actions add column strategy_code text;
-- "Seguimientos pendientes" de Red conectado a Carril A: próxima acción vencida.
alter table ds_connections add column proxima_accion_fecha date;

-- Contenido: banco de ideas filtrable por pilar (sección 6 del mensaje).
alter table ds_content_pieces add column pilar text check (pilar in ('producto', 'ecosistema', 'ia'));

-- Variantes por canal: una pieza cuenta como publicada si al menos una
-- variante tiene published_at. El "estado" de ds_content_pieces queda
-- para el tablero por etapa de producción; el conteo semanal real usa
-- published_at de las variantes, no fecha_objetivo.
create table public.ds_content_variants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  piece_id uuid not null references ds_content_pieces(id) on delete cascade,
  channel text not null check (channel in ('reel', 'tiktok', 'carrusel_li')),
  estado text not null default 'idea' check (estado in ('idea', 'guion', 'grabado', 'editado', 'programado', 'publicado')),
  published_at date,
  created_at timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['ds_strategies', 'ds_lane_info', 'ds_content_variants']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for all using (user_id = auth.uid()) with check (user_id = auth.uid())', t||'_owner_all', t);
  end loop;
end $$;

-- Seed: estrategias de A y etapas de B (Marco las aprobó), ds_lane_info de
-- A/B/D, y etiquetar a01-a05/b01-b04 con su estrategia/etapa.
do $$
declare uid uuid := '8a00fd19-dc49-404f-9f61-62d651f893bd';
begin
  insert into ds_strategies (user_id, lane, code, name, weekly_target, sort_order) values
    (uid, 'A', 'portales', 'Portales y Scout (postulaciones calificadas)', 3, 1),
    (uid, 'A', 'linkedin', 'LinkedIn: mensajes a startups y headhunters', 5, 2),
    (uid, 'A', 'comunidades', 'Comunidades de producto Perú y LATAM', 2, 3),
    (uid, 'A', 'eventos', 'Eventos del ecosistema (solo gratis)', 1, 4),
    (uid, 'A', 'red', 'Red de contactos: seguimientos', 3, 5),
    (uid, 'B', 'etapa1', 'Reuniones con gerencia y ventas', 1, 1),
    (uid, 'B', 'etapa2', 'Entrevistas con otras áreas', 1, 2),
    (uid, 'B', 'etapa3', 'Análisis de la información y diagnóstico de ventas', 1, 3),
    (uid, 'B', 'etapa4', 'Acuerdo de una página (alcance, tarifa, entregables)', 1, 4),
    (uid, 'B', 'etapa5', 'Primer cobro', 1, 5);

  insert into ds_lane_info (user_id, lane, objective, weekly_goal) values
    (uid, 'A', 'Conseguir una entrevista de producto (PM/PO Jr; secundarios BA de producto y Product Growth) por referido.', '5 acciones registradas en Ruta B'),
    (uid, 'B', 'Primer cobro con la mype del papá y dejar listo el siguiente cliente.', 'Avanzar una etapa del cliente 1 esta semana');

  update ds_tasks set strategy_code = 'portales' where code = 'a01';
  update ds_tasks set strategy_code = 'red' where code = 'a02';
  update ds_tasks set strategy_code = 'red' where code = 'a03';
  update ds_tasks set strategy_code = 'linkedin' where code = 'a05';
  -- a04 es admin del propio proceso de Ruta B, no una estrategia puntual -- sin strategy_code.

  update ds_tasks set strategy_code = 'etapa1' where code = 'b01';
  update ds_tasks set strategy_code = 'etapa3' where code = 'b02';
  update ds_tasks set strategy_code = 'etapa4' where code = 'b03';
  -- b04 (reporte del viernes) es tarea recurrente, no una etapa -- queda sin strategy_code.
  insert into ds_tasks (user_id, code, lane, title, day, week, status, strategy_code, created_at) values
    (uid, 'b-etapa2', 'B', 'Entrevistas con otras áreas', '2026-10-22', 1, 'done', 'etapa2', '2026-10-21'),
    (uid, 'b-etapa5', 'B', 'Primer cobro', null, 1, 'pending', 'etapa5', '2026-10-21');
end $$;

-- Borrador de estrategia de D (sección 6 del mensaje), como notas editables
-- con el mismo editor genérico -- Marco quiere profundizarla después.
with d_blocks(ord, kind, level, txt) as (
  values
    (1, 'heading', 2, 'Objetivo'),
    (2, 'paragraph', null, 'Que el ecosistema startup lo asocie con un tema y lo contacte. La señal de éxito son oportunidades (mensajes entrantes, invitaciones, conversaciones, colaboraciones con startups y marcas), no vistas.'),
    (3, 'heading', 2, 'Posicionamiento'),
    (4, 'paragraph', null, 'Producto y ecosistema startup, visto por alguien que viene del emprendimiento, entra a producto y construye con IA. Aprender en público.'),
    (5, 'heading', 2, 'Pilares'),
    (6, 'paragraph', null, 'Producto en práctica. Ecosistema startup Perú y LATAM. Construir con IA.'),
    (7, 'heading', 2, 'Canales'),
    (8, 'paragraph', null, 'Instagram Reels y TikTok como video nativo para alcance. LinkedIn para el aprendizaje en formato carrusel con el design system propio de Marco. Una idea = una pieza con variantes por canal.'),
    (9, 'heading', 2, 'Hacer'),
    (10, 'paragraph', null, 'Una idea por pieza, un video adaptado a varios canales, IA para cortes, subtítulos y portadas (cara y voz reales), constancia sobre perfección.'),
    (11, 'heading', 2, 'No hacer por ahora'),
    (12, 'paragraph', null, 'Más de 2 piezas por semana, perseguir viralidad, inflar experiencia, hablar de empleadores anteriores.'),
    (13, 'heading', 2, 'Meta'),
    (14, 'paragraph', null, '2 piezas por semana (se mantiene). 6 piezas y 1 formato repetible en las 3 semanas de prueba.')
)
insert into ds_lane_info (user_id, lane, objective, weekly_goal, notes, notes_plain, notes_updated_at)
select
  '8a00fd19-dc49-404f-9f61-62d651f893bd'::uuid,
  'D',
  'Que el ecosistema startup lo asocie con un tema y lo contacte (oportunidades, no vistas).',
  '2 piezas publicadas por semana',
  jsonb_agg(
    jsonb_build_object(
      'id', gen_random_uuid()::text,
      'type', kind,
      'props', case when kind = 'heading'
        then jsonb_build_object('level', level, 'textColor', 'default', 'backgroundColor', 'default', 'textAlignment', 'left')
        else jsonb_build_object('textColor', 'default', 'backgroundColor', 'default', 'textAlignment', 'left')
      end,
      'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', txt, 'styles', '{}'::jsonb)),
      'children', '[]'::jsonb
    ) order by ord
  ),
  string_agg(txt, ' ' order by ord),
  now()
from d_blocks;
