import type { Theme } from "@blocknote/mantine";

/**
 * V1.3 — el editor hereda los tokens del design system en vez de traer
 * los suyos (parche sección 3). Referenciar var(--color-*) en vez de
 * valores fijos hace que el mismo objeto sirva para los dos temas: el
 * toggle de <ThemeToggle> pisa las variables en :root y BlockNote las
 * relee porque son var(), no un color resuelto de una vez.
 */
export const noteEditorTheme: Theme = {
  colors: {
    editor: { text: "var(--color-text)", background: "var(--color-surface)" },
    menu: { text: "var(--color-text)", background: "var(--color-surface)" },
    tooltip: { text: "var(--color-text)", background: "var(--color-surface-2)" },
    hovered: { text: "var(--color-text)", background: "var(--color-surface-2)" },
    selected: { text: "var(--color-bg)", background: "var(--color-brand)" },
    disabled: { text: "var(--color-text-muted)", background: "var(--color-surface-2)" },
    shadow: "var(--color-border)",
    border: "var(--color-border)",
    sideMenu: "var(--color-text-muted)",
  },
  borderRadius: 8,
  fontFamily: "var(--font-sans)",
};
