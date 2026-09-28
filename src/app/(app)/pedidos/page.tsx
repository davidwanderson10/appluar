import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { FilterBar } from "@/components/FilterBar";
import { LinkButton } from "@/components/ui/Button";
import { StatusPedidoBadge } from "@/components/ui/Badge";
import { ExportExcelButton } from "@/components/ExportExcelButton";
import { formatBRL, formatDate, formatPercent } from "@/lib/format";

const STATUS_OPTIONS = ["Aguardando", "Em Impressão", "Pós-Processamento", "Pronto", "Entregue", "Cancelado"];

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; cliente_id?: string; inicio?: string; fim?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: clientesOptions } = await supabase.from("clientes").select("id, nome").order("nome");

  let query = supabase.from("pedidos_resumo").select("*").order("data_pedido", { ascending: false });
  if (params.status) query = query.eq("status", params.status);
  if (params.cliente_id) query = query.eq("cliente_id", params.cliente_id);
  if (params.inicio) query = query.gte("data_pedido", params.inicio);
  if (params.fim) query = query.lte("data_pedido", params.fim);

  const { data: pedidos } = await query;
  const lista = pedidos ?? [];

  return (
    <div>
      <TopBar title="Pedidos" />
      <div className="p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <FilterBar
            action="/pedidos"
            values={params}
            fields={[
              { name: "inicio", label: "De", type: "date" },
              { name: "fim", label: "Até", type: "date" },
              { name: "status", label: "Status", options: STATUS_OPTIONS.map((s) => ({ value: s, label: s })) },
              {
                name: "cliente_id",
                label: "Cliente",
                options: (clientesOptions ?? []).map((c) => ({ value: String(c.id), label: c.nome })),
              },
            ]}
          />
          <div className="flex gap-2">
            <ExportExcelButton
              nomeArquivo="pedidos-luar-print"
              aba="Pedidos"
              linhas={lista.map((p) => ({
                Nº: p.id,
                Cliente: p.cliente_nome,
                "Data pedido": p.data_pedido,
                "Prazo entrega": p.prazo_entrega,
                "Data entrega": p.data_entrega,
                Status: p.status,
                "Valor total": p.venda_total,
                "Custo total": p.custo_total,
                "Lucro": p.lucro_total,
                "Valor pago": p.valor_pago,
              }))}
            />
            <LinkButton href="/pedidos/novo">+ Novo Pedido</LinkButton>
          </div>
        </div>

        <div className="overflow-x-auto rounded-card border border-border bg-panel">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted">
                <th className="px-4 py-3">Nº</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Prazo</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3 text-right">Margem</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => {
                const margem = p.venda_total > 0 ? p.lucro_total / p.venda_total : 0;
                return (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-border/20">
                    <td className="px-4 py-3">
                      <Link href={`/pedidos/${p.id}`} className="font-medium text-text hover:text-accent">
                        #{p.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{p.cliente_nome}</td>
                    <td className="px-4 py-3 text-muted">{formatDate(p.data_pedido)}</td>
                    <td className="px-4 py-3 text-muted">{formatDate(p.prazo_entrega)}</td>
                    <td className="px-4 py-3">
                      <StatusPedidoBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-text">{formatBRL(p.venda_total)}</td>
                    <td className="px-4 py-3 text-right text-muted">{formatPercent(margem)}</td>
                  </tr>
                );
              })}
              {lista.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted">
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
