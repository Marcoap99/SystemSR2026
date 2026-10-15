/**
 * Solo entra el correo de ALLOWED_EMAIL (variable de servidor en Vercel).
 * Si no está definida no se restringe, para no bloquear entornos sin configurar.
 */
export function isAllowedEmail(email: string | null | undefined): boolean {
  const allowed = process.env.ALLOWED_EMAIL?.trim().toLowerCase();
  if (!allowed) return true;
  return email?.trim().toLowerCase() === allowed;
}
