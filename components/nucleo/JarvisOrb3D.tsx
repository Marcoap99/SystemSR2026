"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { isSoftwareRenderer } from "@/lib/webgl-quality";
import { LANE_COLOR, laneProgress, type Lane } from "@/lib/domain/ds";
import { JARVIS_EVENT, type JarvisState } from "@/lib/jarvis-events";

const STATE_LOOK: Record<JarvisState, { speed: number; pulse: number; color: string }> = {
  idle: { speed: 1, pulse: 0.15, color: "#00cb75" },
  listening: { speed: 1.9, pulse: 0.5, color: "#22d3ee" },
  processing: { speed: 3.2, pulse: 0.85, color: "#ffb020" },
  responding: { speed: 1.5, pulse: 0.6, color: "#00cb75" },
};

const LANES: { lane: Lane; radius: number; tilt: number; thin?: boolean }[] = [
  { lane: "A", radius: 1.8, tilt: 1.15 },
  { lane: "B", radius: 2.05, tilt: 0.55 },
  { lane: "C", radius: 2.3, tilt: -0.35 },
  // Carril D (realineación 20/10): anillo fino extra, afuera de C, no toca A/B/C.
  { lane: "D", radius: 2.45, tilt: -0.75, thin: true },
];

const VERT = /* glsl */ `
  uniform float uTime; uniform float uPulse;
  attribute float aSeed;
  varying float vGlow;
  void main() {
    vec3 p = position;
    float n = sin(p.x * 3.1 + uTime * 0.9) * sin(p.y * 2.7 - uTime * 0.7) * sin(p.z * 3.3 + uTime * 0.5);
    float breathe = 1.0 + 0.04 * sin(uTime * 1.3 + aSeed * 6.2831) + uPulse * 0.10 * n;
    p *= breathe;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = (2.6 + aSeed * 2.2 + uPulse * 2.0) * (6.0 / -mv.z);
    vGlow = 0.55 + 0.45 * n + uPulse * 0.4;
    gl_Position = projectionMatrix * mv;
  }
`;
const FRAG = /* glsl */ `
  uniform vec3 uColor; varying float vGlow;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor * (0.6 + vGlow), a * 0.85);
  }
`;

function fibonacciSphere(n: number, radius: number) {
  const pos = new Float32Array(n * 3);
  const seed = new Float32Array(n);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = golden * i;
    pos.set([Math.cos(t) * r * radius, y * radius, Math.sin(t) * r * radius], i * 3);
    seed[i] = (Math.sin(i * 12.9898) * 43758.5453) % 1;
  }
  return { pos, seed: seed.map(Math.abs) };
}

/**
 * Orbe 3D vivo (Three.js): núcleo de partículas que respira, un anillo
 * orbital por carril cuyo arco es el avance de horas de la semana, y un
 * cinturón de partículas. Reacciona al estado de Jarvis. Si el equipo no
 * puede (reduced-motion o WebGL por software) avisa con `onFallback` para
 * que se pinte el orbe SVG estático.
 */
export function JarvisOrb3D({
  hours,
  onFallback,
  allowSoftware = false,
}: {
  hours: Record<Lane, number>;
  onFallback: () => void;
  /** Solo para pruebas headless (SwiftShader). En producción cae al orbe SVG. */
  allowSoftware?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const ringsApi = useRef<((h: Record<Lane, number>) => void) | null>(null);
  const fallback = useRef(onFallback);

  useEffect(() => {
    fallback.current = onFallback;
  }, [onFallback]);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      fallback.current();
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      fallback.current();
      return;
    }
    if (!allowSoftware && isSoftwareRenderer(renderer.getContext())) {
      renderer.dispose();
      fallback.current();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "width:100%;height:100%;display:block";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
    camera.position.set(0, 0, 7.2);
    const root = new THREE.Group();
    scene.add(root);

    // Núcleo de partículas
    const { pos, seed } = fibonacciSphere(3400, 1.3);
    const coreGeo = new THREE.BufferGeometry();
    coreGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    coreGeo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    const coreMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uPulse: { value: 0.15 }, uColor: { value: new THREE.Color("#00cb75") } },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const core = new THREE.Points(coreGeo, coreMat);
    root.add(core);

    // Halo: sprite con gradiente radial, se tiñe con el estado
    const glowCanvas = document.createElement("canvas");
    glowCanvas.width = glowCanvas.height = 128;
    const gctx = glowCanvas.getContext("2d")!;
    const grad = gctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(255,255,255,0.9)");
    grad.addColorStop(0.35, "rgba(255,255,255,0.25)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    gctx.fillStyle = grad;
    gctx.fillRect(0, 0, 128, 128);
    const glowTex = new THREE.CanvasTexture(glowCanvas);
    const glowMat = new THREE.SpriteMaterial({ map: glowTex, color: "#00cb75", transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending });
    const glow = new THREE.Sprite(glowMat);
    glow.scale.set(4.2, 4.2, 1);
    root.add(glow);

    // Malla interior (holograma)
    const wireGeo = new THREE.IcosahedronGeometry(0.8, 1);
    const wireMat = new THREE.MeshBasicMaterial({ color: "#00cb75", wireframe: true, transparent: true, opacity: 0.3 });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    root.add(wire);

    // Anillos de carriles (pista + arco de avance). Los "finos" (carril D)
    // usan un tubo más delgado -- visualmente subordinados a A/B/C, que no cambian.
    const ringGroups = LANES.map(({ lane, radius, tilt, thin }) => {
      const trackTube = thin ? 0.004 : 0.008;
      const arcTube = thin ? 0.01 : 0.022;
      const g = new THREE.Group();
      g.rotation.x = tilt;
      const trackGeo = new THREE.TorusGeometry(radius, trackTube, 8, 200);
      const trackMat = new THREE.MeshBasicMaterial({ color: LANE_COLOR[lane], transparent: true, opacity: 0.16 });
      g.add(new THREE.Mesh(trackGeo, trackMat));
      const arcMat = new THREE.MeshBasicMaterial({ color: LANE_COLOR[lane] });
      const arc = new THREE.Mesh(new THREE.TorusGeometry(radius, arcTube, 12, 200, 0.001), arcMat);
      g.add(arc);
      root.add(g);
      return { lane, radius, arcTube, g, arc, trackGeo, trackMat, arcMat };
    });
    ringsApi.current = (h) => {
      for (const r of ringGroups) {
        const p = Math.max(0.012, laneProgress(r.lane, h[r.lane]));
        r.arc.geometry.dispose();
        r.arc.geometry = new THREE.TorusGeometry(r.radius, r.arcTube, 12, 200, p * Math.PI * 2);
      }
    };
    ringsApi.current(hours);

    // Cinturón de partículas orbitales
    const beltN = 520;
    const beltPos = new Float32Array(beltN * 3);
    for (let i = 0; i < beltN; i++) {
      const a = Math.random() * Math.PI * 2;
      const rad = 2.5 + Math.random() * 0.4;
      beltPos.set([Math.cos(a) * rad, (Math.random() - 0.5) * 0.35, Math.sin(a) * rad], i * 3);
    }
    const beltGeo = new THREE.BufferGeometry();
    beltGeo.setAttribute("position", new THREE.BufferAttribute(beltPos, 3));
    const beltMat = new THREE.PointsMaterial({ size: 0.028, color: "#9b6bff", transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending });
    const belt = new THREE.Points(beltGeo, beltMat);
    belt.rotation.x = 0.35;
    root.add(belt);

    // Estado, ratón y tamaño
    const target = { ...STATE_LOOK.idle };
    const live = { speed: 1, pulse: 0.15, color: new THREE.Color("#00cb75") };
    const targetColor = new THREE.Color(target.color);
    const onState = (e: Event) => {
      const s = (e as CustomEvent<JarvisState>).detail;
      const look = STATE_LOOK[s] ?? STATE_LOOK.idle;
      target.speed = look.speed;
      target.pulse = look.pulse;
      targetColor.set(look.color);
    };
    window.addEventListener(JARVIS_EVENT, onState);

    const mouse = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      mouse.x = ((e.clientX - b.left) / b.width - 0.5) * 2;
      mouse.y = ((e.clientY - b.top) / b.height - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const resize = () => {
      const w = el.clientWidth || 300;
      const h = el.clientHeight || 300;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    let visible = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry?.isIntersecting ?? true));
    io.observe(el);

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      live.speed += (target.speed - live.speed) * 0.05;
      live.pulse += (target.pulse - live.pulse) * 0.06;
      live.color.lerp(targetColor, 0.06);

      coreMat.uniforms.uTime!.value = t * live.speed;
      coreMat.uniforms.uPulse!.value = live.pulse * (0.7 + 0.3 * Math.sin(t * 4 * live.speed));
      (coreMat.uniforms.uColor!.value as THREE.Color).copy(live.color);
      wireMat.color.copy(live.color);
      glowMat.color.copy(live.color);
      glowMat.opacity = 0.4 + live.pulse * 0.35;

      core.rotation.y += dt * 0.18 * live.speed;
      wire.rotation.y -= dt * 0.35 * live.speed;
      wire.rotation.x += dt * 0.12 * live.speed;
      ringGroups.forEach((r, i) => (r.g.rotation.z += dt * (0.12 + i * 0.05) * live.speed * (i % 2 ? -1 : 1)));
      belt.rotation.y += dt * 0.07 * live.speed;

      root.rotation.y += (mouse.x * 0.45 - root.rotation.y) * 0.04;
      root.rotation.x += (mouse.y * 0.3 - root.rotation.x) * 0.04;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener(JARVIS_EVENT, onState);
      window.removeEventListener("pointermove", onMove);
      ro.disconnect();
      io.disconnect();
      ringsApi.current = null;
      coreGeo.dispose();
      coreMat.dispose();
      wireGeo.dispose();
      glowTex.dispose();
      glowMat.dispose();
      wireMat.dispose();
      beltGeo.dispose();
      beltMat.dispose();
      ringGroups.forEach((r) => {
        r.trackGeo.dispose();
        r.trackMat.dispose();
        r.arc.geometry.dispose();
        r.arcMat.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
    // Escena montada una sola vez; las horas se aplican en el efecto de abajo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    ringsApi.current?.(hours);
  }, [hours]);

  return <div ref={host} aria-hidden="true" className="h-full w-full" />;
}
