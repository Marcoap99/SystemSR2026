# Proyecto: código + diseño (config agnóstica de stack)

> Este archivo se carga en CADA turno. Mantenerlo < 60 líneas. Detalle largo → `docs/`, no aquí.

## Reglas de tokens (obligatorias)
1. **Buscar antes de leer**: Grep/Glob → luego `Read` con `offset`/`limit`. Nunca leer archivos enteros "por si acaso".
2. **No releer** lo que ya está en contexto ni verificar un Edit leyendo el archivo de nuevo.
3. **Explorar con `scout`** (subagente barato) cuando la respuesta requiera revisar >3 archivos. Pedirle ≤15 líneas.
4. **Salidas acotadas**: `| head -50` / `--quiet` / `--reporter=dot` en tests, builds y logs.
5. **Edits mínimos**: `Edit` sobre `Write`; no reescribir archivos completos ni refactorizar fuera de alcance.
6. **Respuestas cortas**: tabla/lista, sin recap de lo hecho, sin repetir el código mostrado.
7. **Un tema por sesión**: `/clear` al cambiar de tarea; `/compact <foco>` al ~60% de contexto.
8. **Conectores**: solo GitHub y Supabase. No usar WebSearch/Firecrawl/Bright Data salvo pedido explícito.

## Flujo
1. Aclarar con 1–3 preguntas si la tarea es ambigua.
2. Plan de ≤5 pasos para cambios de >3 archivos (`Plan` mode); si no, ejecutar directo.
3. Implementar → correr solo el check más barato que lo valide (lint/test del archivo tocado).
4. Commit pequeño y descriptivo; PR en draft.

## Código
- Simple y mantenible > elegante. Reusar antes de crear; sin abstracciones especulativas.
- Comentarios solo para el "por qué". Seguir el estilo del archivo vecino.
- Nunca commitear `.env*`, llaves ni tokens.

## Diseño
- Tokens de diseño (color, espaciado, tipografía) en UN solo lugar; no valores mágicos en componentes.
- Accesibilidad mínima: contraste AA, foco visible, labels, `alt`. Revisar con el agente `ui-reviewer`.
- Mobile-first; verificar a 375px y 1280px.

## Agentes (`.claude/agents/`)
| Agente | Modelo | Uso |
|---|---|---|
| `scout` | haiku | Explorar/localizar código. Solo lectura. |
| `ui-reviewer` | sonnet | Revisar UI: tokens, a11y, responsive. Solo lectura. |

## Pendiente de definir (completar cuando se decida)
- Stack: _TBD_ · Comandos: dev/build/lint/test: _TBD_ · Estructura de carpetas: _TBD_
