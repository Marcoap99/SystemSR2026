"use client";

/**
 * Dark es el tema base (V1.1 C.1); esto es el toggle a light "por si lo
 * abre de día". Nada de estado de React: el tema real vive en el DOM
 * (atributo data-theme en <html>, ya resuelto antes del primer paint por
 * el script inline de app/layout.tsx) y localStorage. Los dos íconos se
 * muestran/ocultan con CSS puro según ese atributo — evita el flash y el
 * desajuste de hidratación de intentar reflejarlo en un useState.
 */
export function ThemeToggle() {
  function toggle() {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    if (isLight) {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Cambiar tema claro/oscuro"
      title="Cambiar tema"
      className="rounded-card p-2 text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
    >
      {/* Luna: visible en dark (default) */}
      <svg
        viewBox="0 0 20 20"
        className="h-4 w-4 [html[data-theme=light]_&]:hidden"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M17.293 13.293a8 8 0 01-10.586-10.586 8.001 8.001 0 1010.586 10.586z" />
      </svg>
      {/* Sol: visible solo en light */}
      <svg
        viewBox="0 0 20 20"
        className="hidden h-4 w-4 [html[data-theme=light]_&]:block"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm0 14a4 4 0 100-8 4 4 0 000 8zm7-5a1 1 0 100-2h-1a1 1 0 100 2h1zM4 11a1 1 0 100-2H3a1 1 0 100 2h1zm11.657-6.657a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM6.464 14.243a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17.071 15.657a1 1 0 01-1.414 0l-.707-.707a1 1 0 111.414-1.414l.707.707a1 1 0 010 1.414zM5.757 6.464a1 1 0 01-1.414 0l-.707-.707A1 1 0 015.05 4.343l.707.707a1 1 0 010 1.414zM10 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1z" />
      </svg>
    </button>
  );
}
