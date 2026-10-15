"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const MAIN = [
  { href: "/nucleo", label: "Núcleo", match: ["/nucleo"] },
  { href: "/carriles", label: "Carriles", match: ["/carriles"] },
  { href: "/ruta", label: "Aprender", match: ["/ruta", "/habitos", "/aprender", "/backlog"] },
  { href: "/domingo", label: "Domingo", match: ["/domingo"] },
] as const;

const MORE = [
  { href: "/", label: "Panel" },
  { href: "/notas", label: "Notas" },
  { href: "/enlaces", label: "Enlaces" },
  { href: "/conectar", label: "Conectar" },
  { href: "/exponer", label: "Exponer" },
  { href: "/log", label: "Log" },
  { href: "/plan", label: "Plan" },
] as const;

/** Barra inferior móvil: 4 destinos + "Más" (brief sección 7). Solo < md. */
export function MobileTabBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const inMain = MAIN.some((m) => m.match.some((p) => pathname.startsWith(p)));

  return (
    <div className="md:hidden">
      {open ? (
        <div role="dialog" aria-label="Más secciones" className="fixed inset-x-0 bottom-16 z-40 border-t border-border bg-surface p-3 pb-[env(safe-area-inset-bottom)]">
          <ul className="grid grid-cols-3 gap-2">
            {MORE.map((m) => (
              <li key={m.href}>
                <Link href={m.href} onClick={() => setOpen(false)} className="grid min-h-11 place-items-center rounded-card border border-border text-sm text-text hover:border-brand">
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <nav aria-label="Navegación principal" className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        {MAIN.map((m) => {
          const active = m.match.some((p) => pathname.startsWith(p));
          return (
            <Link
              key={m.href}
              href={m.href}
              aria-current={active ? "page" : undefined}
              className={`grid min-h-16 flex-1 place-items-center text-xs font-medium ${active ? "text-brand" : "text-text-muted"}`}
            >
              {m.label}
            </Link>
          );
        })}
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={`grid min-h-16 flex-1 place-items-center text-xs font-medium ${open || !inMain ? "text-brand" : "text-text-muted"}`}
        >
          Más
        </button>
      </nav>
    </div>
  );
}
