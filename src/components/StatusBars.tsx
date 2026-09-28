import { formatBRL } from "@/lib/format";
import { StatusPedidoBadge } from "@/components/ui/Badge";
import type { StatusPedido } from "@/types/database";

export function StatusBars({
  data,
}: {
  data: { status: StatusPedido; quantidade: number; valor: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.quantidade));

  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.status} className="flex items-center gap-3">
          <div className="w-40 shrink-0">
            <StatusPedidoBadge status={d.status} />
          </div>
          <div className="h-2.5 flex-1 rounded-full bg-border/50">
            <div
              className="h-2.5 rounded-full bg-accent"
              style={{ width: `${(d.quantidade / max) * 100}%` }}
            />
          </div>
          <div className="w-36 shrink-0 text-right text-sm text-muted">
            {d.quantidade} · {formatBRL(d.valor)}
          </div>
        </div>
      ))}
    </div>
  );
}
