import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Helper estándar de shadcn (clsx + tailwind-merge) -- solo existe para
 * que los componentes copiados de esas librerías (warp-background acá)
 * funcionen tal cual sin reescribirlos. El resto de la app arma sus
 * clases con concatenación simple, sin esto.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
