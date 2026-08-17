-- =========================================================
-- Seed — datos semilla de la sección 8 del PRD.
--
-- Requisito: el usuario ya debe existir en Supabase Auth (créalo desde
-- el dashboard o con supabase.auth.admin antes de correr este script).
-- Ajusta el email de abajo si no es marcoap99@gmail.com.
--
-- Corre esto en el SQL Editor de Supabase (o `supabase db execute -f`)
-- DESPUÉS de aplicar las migraciones.
-- =========================================================

do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id
  from auth.users
  where email = 'marcoap99@gmail.com'
  limit 1;

  if v_user_id is null then
    raise exception 'No se encontró un usuario con ese email en auth.users. Crea el usuario primero.';
  end if;

  -- ---------- 8.10 Boss fights (van antes por la FK de phases) ----------
  insert into bosses (user_id, number, name, date, criterion, status) values
    (v_user_id, 1, 'Fin de periodo de prueba', '2026-11-10', 'Cero cabos sueltos en lo asignado. G1 adoptado', 'pending'),
    (v_user_id, 2, 'El expediente', '2026-12-18', 'G9.1 compilado y presentado a Jhoanna antes de vacaciones', 'pending'),
    (v_user_id, 3, 'La renovación', '2027-01-20', 'Contrato renovado sin "Jr"', 'pending');

  -- ---------- 8.1 Fases ----------
  insert into phases (user_id, number, name, rule, unlocked, unlocked_by_boss) values
    (v_user_id, 1, 'Encajar', 'No brillar, ser confiable. No abrir frentes nuevos', true, null),
    (v_user_id, 2, 'Construir', 'Prueba superada = licencia para proponer', false, 1),
    (v_user_id, 3, 'Cobrar', 'Presentar el expediente y negociar', false, 2);

  -- ---------- 8.2 Semanas ----------
  insert into weeks (user_id, number, start_date, end_date, phase_number, focus, load, note) values
    (v_user_id, 2, '2026-08-17', '2026-08-23', 1, 'Arranque de 4 hábitos', 'alta', 'Arranque de 4 hábitos'),
    (v_user_id, 3, '2026-08-24', '2026-08-30', 1, '', 'alta', null),
    (v_user_id, 4, '2026-08-31', '2026-09-06', 1, '', 'media', null),
    (v_user_id, 5, '2026-09-07', '2026-09-13', 1, 'Punto de decisión 1', 'alta', 'Punto de decisión 1'),
    (v_user_id, 6, '2026-09-14', '2026-09-20', 1, '', 'media', null),
    (v_user_id, 7, '2026-09-21', '2026-09-27', 1, '', 'media', null),
    (v_user_id, 8, '2026-09-28', '2026-10-04', 1, '', 'alta', null),
    (v_user_id, 9, '2026-10-05', '2026-10-11', 1, '', 'media', 'Jue 8 feriado'),
    (v_user_id, 10, '2026-10-12', '2026-10-18', 1, 'Evaluar V1 → V2', 'alta', 'Evaluar V1 → V2'),
    (v_user_id, 11, '2026-10-19', '2026-10-25', 1, '', 'media', null),
    (v_user_id, 12, '2026-10-26', '2026-11-01', 1, '', 'colchon', null),
    (v_user_id, 13, '2026-11-02', '2026-11-08', 1, 'Preparar Boss 1', 'colchon', 'Preparar Boss 1'),
    (v_user_id, 14, '2026-11-09', '2026-11-15', 2, 'Boss 1', 'alta', 'Boss 1'),
    (v_user_id, 15, '2026-11-16', '2026-11-22', 2, '', 'media', null),
    (v_user_id, 16, '2026-11-23', '2026-11-29', 2, '', 'media', null),
    (v_user_id, 17, '2026-11-30', '2026-12-06', 2, '', 'media', null),
    (v_user_id, 18, '2026-12-07', '2026-12-13', 2, '', 'alta', 'Mar 8 feriado'),
    (v_user_id, 19, '2026-12-14', '2026-12-20', 2, 'Boss 2 — cierre real', 'alta', 'Boss 2 — cierre real'),
    (v_user_id, 20, '2026-12-21', '2026-12-27', 2, 'No planificar', 'fiestas', 'No planificar'),
    (v_user_id, 21, '2026-12-28', '2027-01-03', 2, 'No planificar', 'fiestas', 'No planificar'),
    (v_user_id, 22, '2027-01-04', '2027-01-10', 3, '', 'media', null),
    (v_user_id, 23, '2027-01-11', '2027-01-17', 3, 'SQL e inglés output arrancan', 'media', 'SQL e inglés output arrancan'),
    (v_user_id, 24, '2027-01-18', '2027-01-24', 3, 'Boss 3', 'alta', 'Boss 3'),
    (v_user_id, 25, '2027-01-25', '2027-01-31', 3, 'Punto de decisión 2', 'media', 'Punto de decisión 2');

  -- ---------- 8.3 Aprendizaje — A-ROL ----------
  insert into learn_items (user_id, code, track, title, mode, block, source, status, target_week) values
    (v_user_id, 'AR1', 'rol', 'Método de research y criterio de selección', 'bloque', 'A', 'Video "¿Cómo saber qué método y cuándo?" + Módulo 2 Colectivo 23', 'pending', null),
    (v_user_id, 'AR2', 'rol', 'Entrevistas a usuarios', 'bloque', 'A', 'Video de entrevistas UX', 'pending', null),
    (v_user_id, 'AR3', 'rol', 'Guerrilla testing y usabilidad', 'bloque', 'A', 'Platzi — curso Usabilidad UX', 'pending', null),
    (v_user_id, 'AR4', 'rol', 'Síntesis: de notas crudas a insights', 'bloque', 'A', 'Uxcel affinity diagrams + User Interviews', 'pending', null),
    (v_user_id, 'AR5', 'rol', 'Medición cuantitativa (SUS, success rate, time on task)', 'bloque', 'A', 'NN/g video SUS + Flat 101', 'pending', null),
    (v_user_id, 'AR6', 'rol', 'Principios y heurísticas UX', 'bloque', 'A', '10 Leyes de Nielsen + growth.design + lawsofux', 'pending', null),
    (v_user_id, 'AR7', 'rol', 'Behavior design y gamificación', 'bloque', 'B', 'Yu-kai Chou (Octalysis) + BJ Fogg', 'pending', null),
    (v_user_id, 'AR8', 'rol', 'Comunicación de resultados', 'bloque', 'A', 'Módulo 7 Colectivo 23 + Aguayo', 'pending', null),
    (v_user_id, 'AR9', 'rol', 'Figma y FigJam operativo', 'bloque', 'A', 'Videos Figma vs FigJam + Design System vs UI Kit', 'pending', null),
    (v_user_id, 'AR10', 'rol', 'Fundamentos del negocio fintech (PGH, factoring, unit economics)', 'chamba', null, 'Preguntar internamente + Módulo 3 Colectivo 23', 'pending', null);

  -- ---------- 8.4 Aprendizaje — A-MERCADO ----------
  insert into learn_items (user_id, code, track, title, mode, block, source, status, target_week) values
    (v_user_id, 'AM1', 'mercado', 'Inglés — input', 'tiempo_muerto', null, 'Podcasts de producto en traslado y gym', 'pending', null),
    (v_user_id, 'AM2', 'mercado', 'Inglés — output', 'micro', null, '10 min post-almuerzo. Duolingo. Racha diaria', 'pending', null),
    (v_user_id, 'AM3', 'mercado', 'SQL', 'bloque', 'A', 'Arranca en semana 23 (enero 2027)', 'pending', 23);

  -- ---------- 8.5 Aprendizaje — A-TOOL ----------
  insert into learn_items (user_id, code, track, title, mode, block, source, status, target_week) values
    (v_user_id, 'AT1', 'tool', 'Proyectos con contexto persistente', 'bloque', 'B', null, 'pending', 2),
    (v_user_id, 'AT2', 'tool', 'Skills (empaquetar formatos recurrentes)', 'bloque', 'B', null, 'pending', 5),
    (v_user_id, 'AT3', 'tool', 'Conexiones / MCP (Drive, Calendar, Jira)', 'bloque', 'B', null, 'pending', 10),
    (v_user_id, 'AT4', 'tool', 'Automatizaciones', 'bloque', 'B', null, 'pending', 16),
    (v_user_id, 'AT5', 'tool', 'Prompting para research (detección de sesgos)', 'bloque', 'B', 'Permanente', 'pending', null);

  -- ---------- 8.6 Grupos de artefactos ----------
  insert into artifact_groups (user_id, code, title, feeds, target_week, starred) values
    (v_user_id, 'G1', 'Sistema de intake de research', array['L1'], 10, false),
    (v_user_id, 'G2', 'Repositorio de research útil', array['L4'], 17, false),
    (v_user_id, 'G3', 'Primer research end-to-end', array['L2'], 14, true),
    (v_user_id, 'G4', 'Test de usabilidad medido', array['L2', 'L3'], 11, false),
    (v_user_id, 'G5', 'Un experimento', array['L3'], 18, false),
    (v_user_id, 'G6', 'Tablero de desarrollo', array['L5', 'G9'], 2, false),
    (v_user_id, 'G7', 'Skills empaquetadas', array[]::text[], 10, false),
    (v_user_id, 'G8', 'Contenido público', array['EXPONER'], null, false),
    (v_user_id, 'G9', 'Expediente', array['L6'], 19, false);

  -- ---------- Artefactos G1 (fase 1, salvo G1.7 = fase 2) ----------
  insert into artifacts (user_id, code, group_code, title, consumes, status, phase_number, note) values
    (v_user_id, 'G1.1', 'G1', 'Spec del formulario (docx, campo por campo)', array['AR1', 'AR6'], 'done', 1, null),
    (v_user_id, 'G1.2', 'G1', 'Prototipo clickeable HTML', array['AR9', 'AR7'], 'done', 1, null),
    (v_user_id, 'G1.3', 'G1', 'Protocolo de validación (guerrilla test o medición post-deploy)', array['AR3', 'AR5'], 'pending', 1, null),
    (v_user_id, 'G1.4', 'G1', 'Informe de la validación', array['AR4', 'AR5'], 'pending', 1, null),
    (v_user_id, 'G1.5', 'G1', 'Formulario V2 con hallazgos aplicados', array['AR6'], 'pending', 1, null),
    (v_user_id, 'G1.6', 'G1', 'Doc de blindaje del proceso (scope freeze, SLA, fuera de alcance)', array['AR1'], 'in_progress', 1, null),
    (v_user_id, 'G1.7', 'G1', 'Integración formulario → Jira por API', array['AT3'], 'pending', 2, null);

  -- ---------- Artefactos G2 (fase 2) ----------
  insert into artifacts (user_id, code, group_code, title, consumes, status, phase_number, note) values
    (v_user_id, 'G2.1', 'G2', 'Auditoría del repo: qué hay, qué falta, qué nadie consulta', array['AR4'], 'pending', 2, null),
    (v_user_id, 'G2.2', 'G2', 'Taxonomía de insights', array['AR4'], 'pending', 2, null),
    (v_user_id, 'G2.3', 'G2', 'Conexión repo ↔ Jira', array['AT3'], 'pending', 2, null);

  -- ---------- Artefactos G3 ⭐ (fase 1) ----------
  insert into artifacts (user_id, code, group_code, title, consumes, status, phase_number, note) values
    (v_user_id, 'G3.1', 'G3', 'Set up: objetivos, hipótesis, entregables, roadmap', array['AR1'], 'pending', 1, 'Dependencia crítica: requiere que le asignen un research propio antes de mediados de octubre (semana 10).'),
    (v_user_id, 'G3.2', 'G3', 'Guía de entrevista sin sesgo', array['AR2'], 'pending', 1, null),
    (v_user_id, 'G3.3', 'G3', 'Informe con síntesis (temas → insights → recomendaciones)', array['AR4'], 'pending', 1, null),
    (v_user_id, 'G3.4', 'G3', 'Presentación que mueva una decisión', array['AR8'], 'pending', 1, null),
    (v_user_id, 'G3.5', 'G3', 'Cierre con impacto estimado en S/ o métrica', array['AR10'], 'pending', 1, null);

  -- ---------- Artefactos G4 (fase 1) ----------
  insert into artifacts (user_id, code, group_code, title, consumes, status, phase_number, note) values
    (v_user_id, 'G4.1', 'G4', 'Protocolo con métricas (SUS + success rate + time on task)', array['AR3', 'AR5'], 'pending', 1, null),
    (v_user_id, 'G4.2', 'G4', 'Resultados con números y comparativa', array['AR5'], 'pending', 1, null);

  -- ---------- Artefactos G5 (fase 2) ----------
  insert into artifacts (user_id, code, group_code, title, consumes, status, phase_number, note) values
    (v_user_id, 'G5.1', 'G5', 'Hipótesis y diseño del test', array['AR7'], 'pending', 2, null),
    (v_user_id, 'G5.2', 'G5', 'Resultado medido', array['AR5'], 'pending', 2, null);

  -- ---------- Artefactos G6 ----------
  insert into artifacts (user_id, code, group_code, title, consumes, status, phase_number, note) values
    (v_user_id, 'G6.1', 'G6', 'La plataforma (esta app)', array[]::text[], 'in_progress', 1, null),
    (v_user_id, 'G6.2', 'G6', 'Log de evidencia semanal', array[]::text[], 'pending', 1, null),
    (v_user_id, 'G6.3', 'G6', 'Retro del diseño: qué mecánica funcionó y qué abandoné', array[]::text[], 'pending', 2, null);

  -- ---------- Artefactos G7 (fase 1) ----------
  insert into artifacts (user_id, code, group_code, title, consumes, status, phase_number, note) values
    (v_user_id, 'G7.1', 'G7', 'Skill: informe de research', array[]::text[], 'pending', 1, null),
    (v_user_id, 'G7.2', 'G7', 'Skill: guía de entrevista sin sesgo', array[]::text[], 'pending', 1, null),
    (v_user_id, 'G7.3', 'G7', 'Skill: síntesis de notas crudas', array[]::text[], 'pending', 1, null);

  -- ---------- Artefactos G8 (fase según semana objetivo) ----------
  insert into artifacts (user_id, code, group_code, title, consumes, status, phase_number, note) values
    (v_user_id, 'G8.1', 'G8', 'Post 1', array[]::text[], 'pending', 1, 'Semana objetivo: 4'),
    (v_user_id, 'G8.2', 'G8', 'Post 2', array[]::text[], 'pending', 1, 'Semana objetivo: 6'),
    (v_user_id, 'G8.3', 'G8', 'Post 3', array[]::text[], 'pending', 1, 'Semana objetivo: 8'),
    (v_user_id, 'G8.4', 'G8', 'Post 4', array[]::text[], 'pending', 1, 'Semana objetivo: 10'),
    (v_user_id, 'G8.5', 'G8', 'Post 5', array[]::text[], 'pending', 1, 'Semana objetivo: 12'),
    (v_user_id, 'G8.6', 'G8', 'Post 6', array[]::text[], 'pending', 2, 'Semana objetivo: 14'),
    (v_user_id, 'G8.7', 'G8', 'Post 7', array[]::text[], 'pending', 2, 'Semana objetivo: 16'),
    (v_user_id, 'G8.8', 'G8', 'Post 8 — cierre de año', array[]::text[], 'pending', 2, 'Semana objetivo: 19');

  -- ---------- Artefactos G9 (fase 2) ----------
  insert into artifacts (user_id, code, group_code, title, consumes, status, phase_number, note) values
    (v_user_id, 'G9.1', 'G9', 'One-pager: 3 hitos con evidencia y número. Se compila del log', array[]::text[], 'pending', 2, null);

  -- ---------- 8.7 Resultados ----------
  insert into results (user_id, code, title, criterion, achieved, achieved_at, target_month) values
    (v_user_id, 'L1', 'El proceso de intake está adoptado', '≥3 tickets entraron por el formulario y al menos 1 PO lo llenó sin ayuda', false, null, 'Octubre'),
    (v_user_id, 'L2', 'Una decisión de producto se movió por mi research', 'Existe una decisión documentada que cambió, con un número mío detrás', false, null, 'Noviembre'),
    (v_user_id, 'L3', 'Corrí un experimento', 'Hay hipótesis, test ejecutado y resultado medido. Resultado negativo cuenta igual', false, null, 'Diciembre'),
    (v_user_id, 'L4', 'El repositorio se usa', 'Alguien que no soy yo consultó el repo y lo dijo', false, null, 'Noviembre'),
    (v_user_id, 'L5', 'Reconocimiento explícito', 'Jhoanna u Omar citan mi trabajo frente a otros', false, null, 'Continuo'),
    (v_user_id, 'L6', 'Cambio de puesto', 'Contrato renovado sin "Jr"', false, null, 'Enero 2027');

  -- ---------- 8.8 Conexiones ----------
  insert into connections (user_id, code, person, role, unlocks, serves, target_month, status, unlocked_note) values
    (v_user_id, 'CN1', 'Jadira Mellado', 'Strategic Research (par)', 'Cómo funciona el área en la práctica y qué esperan de un entregable', array[]::text[], 'Agosto', 'pending', null),
    (v_user_id, 'CN2', 'Cesar Altamirano', 'Product Analytics Specialist', 'La data y la fórmula de impacto en S/', array[]::text[], 'Agosto', 'pending', null),
    (v_user_id, 'CN3', 'Victor Rodriguez', 'Customer Experience Lead', 'Histórico de quejas → evita duplicar research', array[]::text[], 'Agosto', 'pending', null),
    (v_user_id, 'CN4', 'Jhoanna Panaifo', 'Strategic Research Specialist (jefa)', 'Las reglas reales de ascenso. Y pedir un research propio', array[]::text[], 'Septiembre', 'pending', null),
    (v_user_id, 'CN5', 'Kevin Vilcherres', 'Product Growth Lead', 'Participar en un experimento + primer adoptante del intake', array[]::text[], 'Septiembre', 'pending', null),
    (v_user_id, 'CN6', 'Un PO piloto', 'Product Owner', 'El primer ticket real por el formulario', array[]::text[], 'Sep-Oct', 'pending', null),
    (v_user_id, 'CN7', 'GDP / RRHH', null, 'Ciclo de evaluación, si requiere vacante, si la banda es trámite aparte', array[]::text[], 'Sep-Oct', 'pending', null),
    (v_user_id, 'CN8', 'César Chihuán / Shirley Chavez', 'Arquitectura y Transformación', 'Revisión de BPMN + entrada a la cantera de PO', array[]::text[], 'Octubre', 'pending', null),
    (v_user_id, 'CN9', 'Equipo de Riesgos', null, 'Entender el negocio de crédito', array[]::text[], 'Octubre', 'pending', null),
    (v_user_id, 'CN10', 'Geraldine Suarez', 'PO Nuevos Productos', 'La puerta de innovación', array[]::text[], 'Noviembre', 'pending', null),
    (v_user_id, 'CN11', 'Ariana Morales', 'Head of Product', 'Visibilidad ante quien firma', array[]::text[], 'Diciembre', 'pending', null);

  -- ---------- 8.9 Exposiciones ----------
  insert into exposures (user_id, code, type, required_output, cap_per_month, target_total) values
    (v_user_id, 'EX1', 'Evento del ecosistema (meetup, panel, demo day)', '1 insight traído al equipo + 1 contacto nuevo con nombre', 2, '4-6'),
    (v_user_id, 'EX2', 'Evento de producto / UX / research', '1 aprendizaje aplicable a un artefacto en curso', 2, '2-3'),
    (v_user_id, 'EX3', 'Hackathon', 'Prototipo + experimento medido (→ G5)', null, '1-2 en el semestre'),
    (v_user_id, 'EX4', 'Facilitar o hablar en un evento', 'Charla dada + material propio (→ G8)', null, '1 antes de diciembre');

  -- ---------- 8.11 Quests semana 2 ----------
  insert into quests (user_id, week_number, type, title, ref_code, done) values
    (v_user_id, 2, 'ejecutar', 'Apoyar el research de Jadira + ofrecer las notas estructuradas / primera síntesis', 'CN1', false),
    (v_user_id, 2, 'aprender', 'Bloque A: video de método + 10 leyes de Nielsen · Bloque B: AT1', 'AR1, AR6, AT1', false),
    (v_user_id, 2, 'conectar', 'CN1 Jadira', 'CN1', false),
    (v_user_id, 2, 'bonus', '—', null, false);

  -- ---------- 8.12 Rachas (estado inicial) ----------
  insert into streaks (user_id, kind, current, longest, last_marked, freezes_total, freezes_used, quarter) values
    (v_user_id, 'daily_english', 0, 0, null, 2, 0, '2026-Q3'),
    (v_user_id, 'weekly_log', 0, 0, null, 2, 0, '2026-Q3');

end $$;
