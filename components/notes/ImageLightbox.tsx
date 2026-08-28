"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * Overlay a pantalla completa para agrandar una imagen de la nota al
 * hacer click. Portaleado a document.body por la misma razón que
 * NotesModal/NewLogEntryModal/AddLinkModal: un `position: fixed` sin
 * portal queda atrapado por el `transform` que aplica PageTransition
 * durante su animación de entrada.
 */
export function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar imagen"
        className="absolute right-4 top-4 rounded-full bg-black/40 p-2 text-lg leading-none text-white hover:bg-black/60"
      >
        ✕
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element -- viene de una signed URL de Supabase, no de assets propios */}
      <img
        src={src}
        alt="Imagen ampliada"
        className="max-h-full max-w-full rounded-card object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>,
    document.body,
  );
}
