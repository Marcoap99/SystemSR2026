import type { ReactNode } from "react";

/** Grid centrado, máximo 1200px (sección 4 del PRD). */
export function Container({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">{children}</div>;
}
