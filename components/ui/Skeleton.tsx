/** C.5: shimmer de carga — nunca un spinner. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-shimmer rounded-card ${className}`} />;
}
