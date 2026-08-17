import { Card } from "@/components/ui/Card";

export default function DashboardPage() {
  return (
    <Card>
      <h1 className="text-xl font-semibold text-text">Panel</h1>
      <p className="mt-2 text-sm text-text-muted">
        El dashboard (semana, quests, rachas, barras, sellos, log y boss fights) se construye en el siguiente paso.
      </p>
    </Card>
  );
}
