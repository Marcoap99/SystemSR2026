export type JarvisState = "idle" | "listening" | "processing" | "responding";

/** Barra de comandos -> orbe 3D: evento de ventana, sin acoplar los dos componentes. */
export const JARVIS_EVENT = "jarvis-state";

export function emitJarvisState(state: JarvisState) {
  window.dispatchEvent(new CustomEvent<JarvisState>(JARVIS_EVENT, { detail: state }));
}
