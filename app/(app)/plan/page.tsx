import { HowItWorks } from "@/components/plan/HowItWorks";
import { NorthStarGuardrails } from "@/components/plan/NorthStarGuardrails";
import { CareerTimeline } from "@/components/plan/CareerTimeline";
import { Scenarios } from "@/components/plan/Scenarios";
import { DecisionPoints } from "@/components/plan/DecisionPoints";
import { CodeKey } from "@/components/plan/CodeKey";
import { Backlog2027 } from "@/components/plan/Backlog2027";

/**
 * V1.1 Bloque B — /plan. De lectura, no de gestión: no toca la base de
 * datos, no tiene acciones. Es el mapa del sistema y de la carrera para
 * darle sentido a lo que las otras pantallas piden marcar.
 */
export default function PlanPage() {
  return (
    <div className="flex flex-col gap-6">
      <HowItWorks />
      <NorthStarGuardrails />
      <CareerTimeline />
      <Scenarios />
      <DecisionPoints />
      <CodeKey />
      <Backlog2027 />
    </div>
  );
}
