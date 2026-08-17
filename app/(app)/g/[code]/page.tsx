import { Card } from "@/components/ui/Card";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return (
    <Card>
      <h1 className="text-xl font-semibold text-text">Grupo {code}</h1>
      <p className="mt-2 text-sm text-text-muted">
        El detalle de sub-artefactos se construye en el siguiente paso.
      </p>
    </Card>
  );
}
