"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Container } from "./Container";
import { ThemeToggle } from "./ThemeToggle";

const LINKS = [
  { href: "/", label: "Panel", accent: null },
  { href: "/aprender", label: "Aprender", accent: "aprender" },
  { href: "/conectar", label: "Conectar", accent: "conectar" },
  { href: "/exponer", label: "Exponer", accent: "exponer" },
  { href: "/log", label: "Log", accent: null },
] as const;

// C.6: un acento de color por dimensión, consistente en toda la app.
// GENERAR (verde) y LOGRAR (morado) ya son el brand/secondary existentes
// -- Barras y Sellos en el dashboard -- así que solo faltan estas tres.
const ACCENT_CLASS: Record<string, string> = {
  aprender: "bg-dim-aprender/10 text-dim-aprender",
  conectar: "bg-dim-conectar/10 text-dim-conectar",
  exponer: "bg-dim-exponer/10 text-dim-exponer",
};

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-border bg-surface">
      <Container>
        <div className="flex h-14 items-center justify-between gap-6">
          <nav className="flex items-center gap-1">
            {LINKS.map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              const activeClass = link.accent ? ACCENT_CLASS[link.accent] : "bg-brand/10 text-brand-dark";
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    "rounded-card px-3 py-2 text-sm font-medium transition-colors " +
                    (active ? activeClass : "text-text-muted hover:bg-bg hover:text-text")
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm font-medium text-text-muted hover:text-text"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </Container>
    </header>
  );
}
