import { Card } from "@/components/ui/Card";
import { ConnectionRow } from "@/components/connect/ConnectionRow";
import { getConnectionsData } from "@/lib/data/connections";

export const dynamic = "force-dynamic";

/** 7.4 — las 11 conexiones en orden cronológico. */
export default async function ConectarPage() {
  const connections = await getConnectionsData();

  return (
    <Card>
      <h1 className="text-xl font-semibold text-text">Conectar</h1>
      <div className="mt-4 flex flex-col gap-3">
        {connections.map((connection) => (
          <ConnectionRow key={connection.code} connection={connection} />
        ))}
      </div>
    </Card>
  );
}
