import { cn } from "@/lib/cn";
import type { StatusOrcamento, StatusPedido } from "@/types/database";

const statusPedidoColors: Record<StatusPedido, string> = {
  Aguardando: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  "Em Impressão": "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  "Pós-Processamento": "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  Pronto: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  Entregue: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Cancelado: "bg-red-500/15 text-red-600 dark:text-red-400",
};

const statusOrcamentoColors: Record<StatusOrcamento, string> = {
  Enviado: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Aprovado: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Recusado: "bg-red-500/15 text-red-600 dark:text-red-400",
  Convertido: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
};

export function StatusPedidoBadge({ status }: { status: StatusPedido }) {
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap", statusPedidoColors[status])}>
      {status}
    </span>
  );
}

export function StatusOrcamentoBadge({ status }: { status: StatusOrcamento }) {
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap", statusOrcamentoColors[status])}>
      {status}
    </span>
  );
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "accent" | "danger" }) {
  const tones = {
    neutral: "bg-border/60 text-muted",
    accent: "bg-accent/15 text-accent",
    danger: "bg-red-500/15 text-red-600 dark:text-red-400",
  };
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap", tones[tone])}>{children}</span>;
}
