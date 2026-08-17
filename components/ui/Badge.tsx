type BadgeVariant = "yellow" | "blue" | "green";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  yellow: "bg-badge-yellow-bg text-badge-yellow-text",
  blue: "bg-badge-blue-bg text-badge-blue-text",
  green: "bg-badge-green-bg text-badge-green-text",
};

/** Badge pastel (sección 4). Amarillo=pendiente, azul=en curso, verde=hecho. */
export function Badge({ variant, children }: { variant: BadgeVariant; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-badge px-2 py-0.5 text-xs font-medium ${VARIANT_CLASSES[variant]}`}
    >
      {children}
    </span>
  );
}

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  pending: "yellow",
  in_progress: "blue",
  done: "green",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  in_progress: "En curso",
  done: "Hecho",
  blocked: "Bloqueado",
};

/** Badge derivado directamente de un status de la base (pending/in_progress/done). */
export function StatusBadge({ status }: { status: string }) {
  const variant = STATUS_VARIANT[status] ?? "yellow";
  return <Badge variant={variant}>{STATUS_LABEL[status] ?? status}</Badge>;
}
