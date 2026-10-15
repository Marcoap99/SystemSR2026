# Lo que solo puede hacer Marco (≈20 min, desde la compu)

Todo el código, la base `ds_*` y el diseño están listos en la rama `claude/busy-thompson-jxqw07` (PR #1).

## 1. Google (login sin contraseña)
1. Google Cloud Console > APIs y servicios > Credenciales > **Crear ID de cliente OAuth** (tipo *Aplicación web*).
   - URI de redirección autorizada: `https://bvssqamgxpijofrpahgb.supabase.co/auth/v1/callback`
2. Supabase > Authentication > Providers > **Google**: activar y pegar *client id* y *secret*.
3. Supabase > Authentication > URL Configuration:
   - Site URL = URL de producción de Vercel.
   - Redirect URLs: `http://localhost:3000/**`, la URL de producción `/**` y `https://*-marcoap99s-projects.vercel.app/**`.

## 2. Vercel > Settings > Environment Variables (Production **y Preview**)
| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
| `ALLOWED_EMAIL` | `marcoap99@gmail.com` |
| `ICAL_URL` | (solo V2, dirección secreta iCal) |

Luego **Redeploy** del preview.

## 3. Verificar en el preview
- /login > "Continuar con Google" entra con `marcoap99@gmail.com`.
- Se ven los 85 recursos y las notas en Aprender > Archivo (mismo `user_id`).
- Núcleo: marcar un resultado, sumar +0.5 h y ver que el orbe se mueve; probar "qué tengo hoy".

## 4. Cerrar
1. Supabase Auth: desactivar login por correo/contraseña y registros nuevos.
2. Borrar `public/preview.html`, `design/preview.html` y la excepción `preview\\.html$` en `proxy.ts`; quitar el bloque de contraseña en `app/login/page.tsx`.
3. Exportar `tasks` y `study` del artifact Centro de mando (JSON) y dárselo a Claude para importarlos a `ds_tasks`/`ds_study_themes`.
4. Marcar el PR como listo y hacer merge a `claude/plataforma-desarrollo-marco-i5rnnw` (producción).
5. V2: enviar los wireframes W_* (Semana, Red, Evidencia).
