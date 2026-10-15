# Handoff: Daily System Marco (V1) — estado al 12/10/2026

Brief completo: ver mensaje original (v2). Referencias: `design/ref/Home1.dc.html` (Núcleo), `design/ref/Home3.dc.html` (Aprender), `docs/plan_estudio_resources.md` (recursos T1–T9, SQL, inglés).
Marco dio GO total: no volver a preguntar; decidir con criterio. Login Google = marcoap99@gmail.com. Recorte: V1 ahora, V2 tras aprobación (continuo).

## Hecho
- Respaldo `archive_*` (15 tablas, conteos verificados: 85 resources, 24 weeks, 39 artifacts) con RLS sin políticas.
- 12 tablas `ds_*` creadas con RLS (`supabase/migrations/20261012000000_daily_system_ds.sql`). Ninguna tabla existente fue modificada.
- Seed: 3 `ds_phases`, 10 `ds_weeks`, 3 `ds_milestones`, 9 `ds_study_themes`.
- Hallazgo: `resources` usa `status` (done/in_progress/pending) y `has_notes`, no `done`. Hoy: 11 done, 1 in_progress, 73 pending; 12 con notas.

## Hecho (actualización)
- `ds_resources`: 66 recursos cargados del .md (T1–T9, SQL, ING) con tier; `ds_study_themes.piece` rellenado (9). Falta: validar 1 núcleo + 1 utilitario por tema (T3/T5/T7/T8/T9 ok; SQL e ING tienen 1 núcleo).
- Login Google en código: botón en /login, `app/auth/callback/route.ts`, `lib/auth/allowed.ts` (ALLOWED_EMAIL), gate en middleware. El formulario de contraseña queda como respaldo en `<details>` hasta verificar Google; retirarlo después y desactivar registros en Supabase Auth. test/lint/build en verde.
- `design/ref/Centro_de_mando.html` guardado. OJO: NO trae las 12 tareas ni los 10 temas (viven en la base del artifact, colección tasks/study). Marco debe exportarlas (ver pendiente 3).

- Núcleo (V1) en `/nucleo`: `lib/domain/ds.ts` (+tests), `lib/data/ds-nucleo.ts`, `lib/actions/ds.ts`, `components/nucleo/{Orb,Results,CommandBar}.tsx`, link en NavBar. Aditivo: el Panel viejo (`/`) sigue intacto. Jarvis V1 con comandos de texto y voz (es-PE). Las tablas `ds_*` se leen con cliente sin tipos (`lib/supabase/ds.ts`) hasta regenerar `lib/types.ts`.
- Falta del Núcleo: probarlo en el preview con login real, calendario de hoy (V2/iCal), racha Duolingo, ajuste fino vs `design/ref/Home1.dc.html`.

- Carriles (`/carriles`), Domingo (`/domingo`, guarda en `ds_reviews`) y Ruta de la semana (`/ruta?s=N`, recursos de `ds_resources` con check y pieza). Todo aditivo. Falta: unificar Ruta + Inglés diario + Archivo + Backlog como pestañas dentro de Aprender (hoy `/aprender` viejo sigue intacto), página de Inglés/SQL con `ds_habit_log`, sembrar `ds_hours_log`/tareas reales.

- Registro de horas en Núcleo (`HoursButtons`, +/-0.5 h por carril -> `ds_hours_log`) y página `/habitos` (inglés 25 min / SQL 30 min -> `ds_habit_log`). NavBar: Núcleo, Carriles, Domingo, Ruta, Inglés/SQL, Archivo (= `/aprender` viejo), Notas, Enlaces, Conectar, Exponer, Log, Plan, Panel.
- Falta V1: unificar nav final (ocultar pantallas viejas tras aprobación), aviso "ayer en cero", racha Duolingo en Núcleo, regenerar `lib/types.ts` con `ds_*`, ajuste visual contra Home1/Home3 en el preview.

- Núcleo: aviso "ayer en cero" (`zeroDayAlert`, con tests), cuenta regresiva al 19/10 y racha Duolingo (`streaks.kind=daily_english`). 109 tests verdes.
- Advisors de seguridad de Supabase (12/10): solo INFO por las 15 `archive_*` con RLS sin políticas (intencional: respaldo inaccesible por API) y WARN de contraseñas filtradas (se vuelve irrelevante al desactivar el login por contraseña).

- Aprender unificado: pestañas (`AprenderTabs`) Ruta de la semana (`/ruta`), Inglés y SQL (`/habitos`), Archivo UX Research (`/aprender` viejo, intacto) y Backlog (`/backlog`: AR3/4/5/8, AR7.x, AT1-4; AM1-3 "por decidir"). NavBar: un solo link "Aprender". Maqueta estática temporal en `public/preview.html` (excluida del proxy): BORRAR antes de producción junto con `design/preview.html` si ya no hace falta.

## Pendiente (orden)
1. Línea base: `npm ci && npm run test && npm run lint && npm run build`.
2. Cargar `docs/plan_estudio_resources.md` a `ds_resources` (tier: nucleo/utilitario; verificar 1 núcleo + 1 utilitario por tema; Skillshop = parcial). Rellenar `ds_study_themes.piece`.
3. (Marco exporta tasks/study del artifact a JSON) Importar 12 tareas y 10 temas del Centro de mando a `ds_tasks` (necesitan el artifact; pedir a Marco el export si no está).
4. Login Google (sección 2.1): `signInWithOAuth`, `ALLOWED_EMAIL`, proxy.ts; Marco configura Google Cloud + Supabase providers + Redirect URLs + env en Preview.
5. UI en rama + preview Vercel: layout barra superior, tokens HUD, Núcleo (sin scroll 1360x800), Carriles, Aprender (4 pestañas), Domingo, comandos de voz (es-PE, Web Speech).
6. Tests/lint/build en verde -> preview -> aprobación de Marco -> producción. Luego V2 (Semana/iCal, Red, Evidencia); Marco enviará wireframes W_* cuando se llegue a V2.

## Reglas
Migraciones solo aditivas; sin ramas de Supabase; secretos solo en env; no tocar producción sin preview aprobado; no escribir en `app_events` (usar `ds_jarvis_events`).
