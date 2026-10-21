-- Carril B: notas de "Siguiente cliente" y "En pausa" (sección 4 del
-- mensaje "Estructura por carril"), mismo editor genérico que D.
with b_blocks(ord, kind, level, txt) as (
  values
    (1, 'heading', 2, 'Siguiente cliente'),
    (2, 'paragraph', null, 'Pensio y colegios, desde noviembre.'),
    (3, 'heading', 2, 'En pausa'),
    (4, 'paragraph', null, 'Consultoría de colegios y otros proyectos.')
)
update ds_lane_info
set
  notes = (select jsonb_agg(
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
  ) from b_blocks),
  notes_plain = (select string_agg(txt, ' ' order by ord) from b_blocks),
  notes_updated_at = now()
where lane = 'B' and user_id = '8a00fd19-dc49-404f-9f61-62d651f893bd';
