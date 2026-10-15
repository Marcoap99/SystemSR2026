"use client";

import { useEffect, useState } from "react";

const LINES = ["DAILY SYSTEM MARCO", "CARGANDO CARRILES A · B · C", "SINCRONIZANDO RUTA DE ESTUDIO", "SISTEMA EN LÍNEA"];

/** Secuencia de arranque breve, una vez por sesión del navegador. Se salta con reduced-motion. */
export function BootSequence() {
  const [show, setShow] = useState(false);
  const [n, setN] = useState(0);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("ds-boot") === "1";
      sessionStorage.setItem("ds-boot", "1");
    } catch {
      seen = true;
    }
    if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const start = window.setTimeout(() => setShow(true), 0);
    const t = LINES.map((_, i) => window.setTimeout(() => setN(i + 1), 280 * (i + 1)));
    const end = window.setTimeout(() => setShow(false), 280 * LINES.length + 500);
    return () => {
      clearTimeout(start);
      t.forEach(clearTimeout);
      clearTimeout(end);
    };
  }, []);

  if (!show) return null;
  return (
    <div role="status" aria-label="Iniciando sistema" className="fixed inset-0 z-50 grid place-items-center bg-bg">
      <ul className="font-mono text-sm tracking-[.14em] text-brand">
        {LINES.slice(0, n).map((l) => (
          <li key={l} style={{ animation: "boot-line 200ms ease-out" }}>
            {"> "}
            {l}
          </li>
        ))}
      </ul>
    </div>
  );
}
