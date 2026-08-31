/**
 * V1.6 — un recurso queda "atrasado" cuando es de una semana ya pasada
 * y sigue sin terminar. No es una penalidad (PRD): solo cambia dónde
 * aparece (se cuela en la vista "Esta semana", antes que lo de la
 * semana en curso) y cómo se etiqueta, para que ponerse al día sea lo
 * primero que se ve en vez de algo que hay que ir a buscar cambiando el
 * filtro de semana a mano.
 */
export function isOverdueResource(
  resource: { week: number | null; status: string },
  currentWeekNumber: number | null,
): boolean {
  return (
    currentWeekNumber !== null &&
    resource.week !== null &&
    resource.week < currentWeekNumber &&
    resource.status !== "done"
  );
}
