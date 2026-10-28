import Link from "next/link";
import { createDsClient } from "@/lib/supabase/ds";
import { TechWeekTable, type TechWeekContact } from "@/components/red/TechWeekTable";

export const dynamic = "force-dynamic";

const LEVEL_LABEL: Record<string, string> = { A: "Nivel A", B: "Nivel B", C: "Nivel C", sin_nivel: "Sin nivel" };

/** 27/10 — Contactos Perú Tech Week: canal dedicado dentro de ds_connections. */
export default async function TechWeekPage() {
  const db = await createDsClient();
  const { data } = await db
    .from("ds_connections")
    .select("id,nivel,empresa,persona,nota,proxima_accion,etapa,ultimo_contacto")
    .eq("canal", "Perú Tech Week")
    .order("created_at", { ascending: true });
  const contacts = (data ?? []) as TechWeekContact[];
  const groups: [string, TechWeekContact[]][] = ["A", "B", "C", "sin_nivel"].map((level) => [
    level,
    contacts.filter((c) => (c.nivel ?? "sin_nivel") === level),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/red" className="text-sm text-text-muted hover:text-text">
        ← Red
      </Link>
      <header>
        <h1 className="text-xl font-semibold text-text">Contactos Perú Tech Week</h1>
        <p className="mt-1 text-sm text-text-muted">Contacto directo con personas, no solo postulaciones por link.</p>
      </header>

      {groups.map(([level, rows]) =>
        rows.length > 0 ? (
          <section key={level} className="hud-panel flex flex-col gap-2 p-4">
            <h2 className="hud-label">
              {LEVEL_LABEL[level]} <span className="font-mono">({rows.length})</span>
            </h2>
            <TechWeekTable contacts={rows} />
          </section>
        ) : null,
      )}
    </div>
  );
}
