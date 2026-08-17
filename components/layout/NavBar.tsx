"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Container } from "./Container";

const LINKS = [
  { href: "/", label: "Panel" },
  { href: "/aprender", label: "Aprender" },
  { href: "/conectar", label: "Conectar" },
  { href: "/exponer", label: "Exponer" },
  { href: "/log", label: "Log" },
] as const;

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
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    "rounded-card px-3 py-2 text-sm font-medium transition-colors " +
                    (active
                      ? "bg-brand/10 text-brand-dark"
                      : "text-text-muted hover:bg-bg hover:text-text")
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleSignOut}
            className="text-sm font-medium text-text-muted hover:text-text"
          >
            Cerrar sesión
          </button>
        </div>
      </Container>
    </header>
  );
}
