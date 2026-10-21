-- Realineación 21/10 — Semana pasa de ICAL_URL (solo lectura) a una
-- conexión OAuth real con Google Calendar (lectura + escritura), pedida
-- por Marco. Tokens en user_settings (ya es la tabla de preferencias/
-- integraciones de un solo usuario -- mismo criterio que Duolingo).
alter table user_settings add column google_calendar_access_token text;
alter table user_settings add column google_calendar_refresh_token text;
alter table user_settings add column google_calendar_token_expires_at timestamptz;
alter table user_settings add column google_calendar_connected_at timestamptz;
