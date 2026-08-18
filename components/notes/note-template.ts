import type { PartialBlock } from "@blocknote/core";

/**
 * V1.3 parche sección 5 — una nota nueva no arranca en blanco: arranca
 * con las 3 preguntas del método de estudio. Solo se usa cuando
 * resource.notes es null (nunca se re-inserta si el usuario la vació,
 * porque en ese caso ya hay un documento no-null guardado).
 */
export const EMPTY_NOTE_TEMPLATE: PartialBlock[] = [
  { type: "heading", props: { level: 2 }, content: "Qué me llevo" },
  { type: "bulletListItem", content: "" },
  { type: "heading", props: { level: 2 }, content: "Cómo lo aplico a un caso mío" },
  { type: "bulletListItem", content: "" },
  { type: "heading", props: { level: 2 }, content: "Qué no me quedó claro" },
  { type: "bulletListItem", content: "" },
];
