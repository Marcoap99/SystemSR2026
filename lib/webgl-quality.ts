/**
 * Detecta si un contexto WebGL está corriendo en software rendering
 * (SwiftShader, llvmpipe, Mesa offscreen...) en vez de la GPU real --
 * pasa en máquinas con GPU integrada floja, ciertos drivers, o
 * entornos virtualizados/remotos. Un shader de pantalla completa
 * corriendo así puede pegar un núcleo de CPU entero de forma continua,
 * lo que se siente como lag en toda la app, no solo donde se ve el
 * fondo -- cualquier otra interacción compite por el mismo hilo
 * principal contra el loop de rAF del shader.
 */
export function isSoftwareRenderer(gl: WebGLRenderingContext): boolean {
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = info
    ? (gl.getParameter(info.UNMASKED_RENDERER_WEBGL) as string)
    : (gl.getParameter(gl.RENDERER) as string);
  if (!renderer) return false;
  return /swiftshader|llvmpipe|software|mesa offscreen|basic render|microsoft basic/i.test(renderer);
}

/**
 * true si conviene NO animar el fondo a pantalla completa: o bien el
 * sistema pide prefers-reduced-motion, o el contexto cayó a software
 * rendering. Da un control directo al usuario (vía el SO) además de
 * la detección automática.
 */
export function shouldSkipShaderAnimation(gl: WebGLRenderingContext): boolean {
  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return reducedMotion || isSoftwareRenderer(gl);
}
