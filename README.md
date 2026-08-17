# Plataforma de Desarrollo Personal

Tablero privado de una sola persona (Next.js App Router + TypeScript +
Tailwind + Supabase) según `PRD_plataforma_desarrollo_marco.md`. No es un
gestor de tareas genérico — ver el PRD para las reglas de negocio.

## Setup

### 1. Base de datos (Supabase)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En **Authentication → Users**, crea el único usuario de la app
   (email/password). No hay pantalla de registro — es a propósito.
3. Corre las migraciones, en orden, desde el SQL Editor de Supabase (o
   `supabase db push` si usas el CLI):
   - `supabase/migrations/20260817000000_schema.sql`
   - `supabase/migrations/20260817000001_rls.sql`
4. Corre `supabase/seed.sql`. Por defecto busca el usuario por el email
   `marcoap99@gmail.com` — cámbialo en el script si es otro.
5. Corre `supabase/validate_seed.sql` para confirmar que las referencias
   cruzadas (`consumes[]`, `feeds[]`, `serves[]`) apuntan a códigos que
   existen. Vuelve a correrlo cada vez que edites esas columnas a mano.

### 2. App

```bash
cp .env.local.example .env.local
# completar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
# (Supabase → Project Settings → API)

npm install
npm run dev
```

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |
| `npm run test` | Corre los tests de `lib/domain` (Vitest) |
| `npm run test:watch` | Tests en modo watch |

## Estructura

```
app/                      Rutas (App Router)
  login/                  Login (única puerta de entrada pública)
  (app)/                  Rutas protegidas — layout con guard de sesión
    page.tsx              Dashboard (7.1)
    g/[code]/              Detalle de grupo (7.2)
    aprender/ conectar/    (7.3, 7.4)
    exponer/ log/          (7.5, 7.6)
components/
  ui/                     Primitivas del design system (Card, Badge, ProgressBar, Seal)
  layout/                 NavBar, Container
lib/
  supabase/               Clientes (browser/server) + middleware de sesión
  domain/                 Lógica de negocio PURA y testeada (ver abajo)
  types.ts                Tipos de la base de datos
supabase/
  migrations/             Esquema + RLS
  seed.sql                Datos semilla (sección 8 del PRD)
  validate_seed.sql        Validador de referencias cruzadas
tests/domain/             Tests de lib/domain (Vitest)
```

## `lib/domain` — por qué está separado

Toda la lógica de negocio sensible (rachas, barras derivadas, semana
actual, contador regresivo, conteo de exposiciones) vive en funciones
puras: reciben estado + la fecha de "hoy" como parámetro y devuelven el
próximo estado, sin tocar la red ni el reloj del sistema. Eso permite
testearlas con Vitest sin mockear nada (`npm test`) y evita que la lógica
de rachas quede dispersa en componentes.

**Zona horaria:** toda la aritmética de fechas asume `America/Lima`
(UTC-5). `lib/domain/dates.ts#today()` es la única función que lee el
reloj real; todo lo demás recibe la fecha como argumento. Esto es
deliberado — si el cálculo corriera en UTC del servidor, marcar la racha
de noche podría contar como el día siguiente y romperla sola.

## Decisiones de esquema fuera de lo literal del PRD

Documentadas también como comentarios en las migraciones:

- `exposures.target_note` (no `target_total`): es una meta orientativa,
  nunca un tope — el nombre lo deja claro para no tentar a construir una
  barra "n/máximo" contra P9. El tope real y numérico es `cap_per_month`.
- `code` es `unique` global por tabla (un solo usuario, un solo plan). Si
  en el futuro se necesita una temporada nueva reutilizando códigos, la
  migración es agregar `season text` y pasar a `unique(season, code)`.
- FKs reales de Postgres donde el PRD solo pedía "FK lógica" (ver el
  comentario de orden de inserción al inicio de `seed.sql`).
- `streak_events` tiene `unique(user_id, kind, period)` — idempotencia:
  marcar dos veces el mismo período no inserta dos eventos.
- `app_events.event_type` queda sin `CHECK` a propósito (telemetría no
  debería poder tirar una excepción en producción por un tipo nuevo).
