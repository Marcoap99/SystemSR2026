import { Skeleton } from "@/components/ui/Skeleton";

/**
 * C.5: carga inicial de cualquier pantalla bajo (app) — shimmer, no
 * spinner. Genérico a propósito (no imita cada layout final): el objetivo
 * es que la primera pintura no sea una pantalla en blanco ni un ícono
 * girando, no reproducir pixel a pixel cada pantalla.
 */
export default function AppLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-32" />
      <Skeleton className="h-24" />
      <Skeleton className="h-48" />
      <Skeleton className="h-48" />
    </div>
  );
}
