"use client";

import { useEffect, useRef } from "react";

/**
 * Fondo vivo del tema oscuro: gradientes verde/morado, grilla en
 * perspectiva que avanza, campo de estrellas en canvas 2D (liviano: ~90
 * partículas, DPR 1, pausa con la pestaña oculta) y una línea de escaneo.
 * Con prefers-reduced-motion queda estático.
 */
export function HudBackground() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    const stars = Array.from({ length: 90 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: 0.2 + Math.random() * 0.8,
      hue: Math.random() < 0.18 ? 268 : 155,
    }));
    const resize = () => {
      w = c.width = window.innerWidth;
      h = c.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        if (!reduced) {
          s.y -= 0.00006 * s.z;
          s.x += 0.00002 * s.z;
          if (s.y < 0) s.y = 1;
          if (s.x > 1) s.x = 0;
        }
        ctx.fillStyle = `hsla(${s.hue}, 90%, 65%, ${0.15 + s.z * 0.45})`;
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, 0.6 + s.z * 1.1, 0, 6.2832);
        ctx.fill();
      }
      // rAF ya se pausa solo con la pestaña oculta.
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-bg">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 500px at 80% -8%, rgba(0,203,117,.13), transparent 62%), radial-gradient(800px 480px at 4% 20%, rgba(155,107,255,.11), transparent 60%), radial-gradient(700px 400px at 50% 110%, rgba(77,166,255,.07), transparent 60%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[55%] opacity-[.22]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,203,117,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,203,117,.5) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          transform: "perspective(420px) rotateX(62deg)",
          transformOrigin: "50% 100%",
          maskImage: "linear-gradient(to top, black, transparent 85%)",
          WebkitMaskImage: "linear-gradient(to top, black, transparent 85%)",
          animation: "hud-grid-scroll 6s linear infinite",
        }}
      />
      <canvas ref={canvas} className="absolute inset-0" />
      <div
        className="absolute inset-x-0 top-0 h-px bg-brand/40"
        style={{ animation: "hud-scan 9s linear infinite", boxShadow: "0 0 18px 2px var(--color-brand-glow)" }}
      />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.55))" }} />
    </div>
  );
}
