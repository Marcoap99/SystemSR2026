"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * C.5: fade + slide de 8px al cambiar de página, 200ms. Se hace con CSS
 * puro (sin librería de transiciones): la clave es usar `pathname` como
 * `key` de un nodo -- eso le indica a React que es un elemento nuevo en
 * cada navegación, así que el navegador vuelve a correr la animación de
 * `.animate-page-enter` cada vez, no solo la primera.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-page-enter">
      {children}
    </div>
  );
}
