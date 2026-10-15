import Link from "next/link";

const TABS = [
  { href: "/ruta", label: "Ruta de la semana" },
  { href: "/habitos", label: "Inglés y SQL" },
  { href: "/aprender", label: "Archivo UX Research" },
  { href: "/backlog", label: "Backlog" },
] as const;

/** Pestañas internas de Aprender (brief sección 6). */
export function AprenderTabs({ active }: { active: (typeof TABS)[number]["href"] }) {
  return (
    <nav aria-label="Aprender" className="flex gap-1 overflow-x-auto border-b border-border pb-2">
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          aria-current={t.href === active ? "page" : undefined}
          className={`min-h-11 flex-none rounded-card px-3 py-2.5 text-sm font-medium ${
            t.href === active ? "bg-dim-aprender/15 text-dim-aprender" : "text-text-muted hover:bg-surface-2"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
