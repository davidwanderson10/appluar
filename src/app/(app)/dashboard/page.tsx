import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { StatCard } from "@/components/StatCard";
import { StatusBars } from "@/components/StatusBars";
import { FilterBar } from "@/components/FilterBar";
import { Card, CardTitle } from "@/components/ui/Card";
import { formatBRL, formatDate } from "@/lib/format";
import { StatusPedidoBadge } from "@/components/ui/Badge";
import Link from "next/link";
import type { StatusPedido } from "@/types/database";

const STATUS_ORDEM: StatusPedido[] = [
  "Aguardando",
  "Em Impressão",
  "Pós-Processamento",
  "Pronto",
  "Entregue",
  "Cancelado",
];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ inicio?: string; fim?: string; cliente_id?: string; produto_id?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const [{ data: clientesOptions }, { data: produtosOptions }] = await Promise.all([
    supabase.from("clientes").select("id, nome").eq("status", "Ativo").order("nome"),
    supabase.from("produtos").select("id, nome").eq("ativo", true).order("nome"),
  ]);

  let pedidoIdsPorProduto: number[] | null = null;
  if (params.produto_id) {
    const { data } = await supabase
      .from("itens_pedido")
      .select("pedido_id")
      .eq("produto_id", params.produto_id);
    pedidoIdsPorProduto = (data ?? []).map((r) => r.pedido_id);
  }

  let query = supabase.from("pedidos_resumo").select("*");
  if (params.inicio) query = query.gte("data_pedido", params.inicio);
  if (params.fim) query = query.lte("data_pedido", params.fim);
  if (params.cliente_id) query = query.eq("cliente_id", params.cliente_id);
  if (pedidoIdsPorProduto) query = query.in("id", pedidoIdsPorProduto.length ? pedidoIdsPorProduto : [-1]);

  const { data: pedidos } = await query;
  const lista = pedidos ?? [];

  const naoCancelados = lista.filter((p) => p.status !== "Cancelado");
  const faturamentoTotal = naoCancelados.reduce((acc, p) => acc + Number(p.venda_total), 0);
  const pedidosEntregues = lista.filter((p) => p.status === "Entregue").length;
  const valorPendente = naoCancelados.reduce(
    (acc, p) => acc + Math.max(Number(p.venda_total) - Number(p.valor_pago), 0),
    0
  );

  let despesasQuery = supabase.from("despesas").select("*");
  if (params.inicio) despesasQuery = despesasQuery.gte("data", params.inicio);
  if (params.fim) despesasQuery = despesasQuery.lte("data", params.fim);
  const { data: despesas } = await despesasQuery;
  const listaDespesas = despesas ?? [];
  const despesasTotal = listaDespesas.reduce((acc, d) => acc + Number(d.valor), 0);
  const resultado = faturamentoTotal - despesasTotal;

  const despesasPorCategoria = Object.entries(
    listaDespesas.reduce<Record<string, number>>((acc, d) => {
      acc[d.categoria] = (acc[d.categoria] ?? 0) + Number(d.valor);
      return acc;
    }, {})
  )
    .map(([categoria, valor]) => ({ categoria, valor }))
    .sort((a, b) => b.valor - a.valor);

  const { count: clientesCadastrados } = await supabase
    .from("clientes")
    .select("id", { count: "exact", head: true })
    .eq("status", "Ativo");
  const { count: produtosCadastrados } = await supabase
    .from("produtos")
    .select("id", { count: "exact", head: true })
    .eq("ativo", true);

  const porStatus = STATUS_ORDEM.map((status) => {
    const doStatus = lista.filter((p) => p.status === status);
    return {
      status,
      quantidade: doStatus.length,
      valor: doStatus.reduce((acc, p) => acc + Number(p.venda_total), 0),
    };
  });

  const proximasEntregas = lista
    .filter((p) => p.prazo_entrega && !["Entregue", "Cancelado"].includes(p.status))
    .sort((a, b) => (a.prazo_entrega! < b.prazo_entrega! ? -1 : 1))
    .slice(0, 6);

  return (
    <div>
      <TopBar title="Dashboard" />
      <div className="p-6">
        <FilterBar
          action="/dashboard"
          values={params}
          fields={[
            { name: "inicio", label: "De", type: "date" },
            { name: "fim", label: "Até", type: "date" },
            {
              name: "cliente_id",
              label: "Cliente",
              options: (clientesOptions ?? []).map((c) => ({ value: String(c.id), label: c.nome })),
            },
            {
              name: "produto_id",
              label: "Produto",
              options: (produtosOptions ?? []).map((p) => ({ value: String(p.id), label: p.nome })),
            },
          ]}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Total de Pedidos" value={String(lista.length)} />
          <StatCard label="Faturamento (não cancelados)" value={formatBRL(faturamentoTotal)} />
          <StatCard label="Despesas do Período" value={formatBRL(despesasTotal)} />
          <StatCard
            label="Resultado (Faturamento − Despesas)"
            value={formatBRL(resultado)}
            hint={resultado >= 0 ? "Saldo positivo" : "Saldo negativo"}
          />
          <StatCard label="Pedidos Entregues" value={String(pedidosEntregues)} />
          <StatCard label="Valor Pendente a Receber" value={formatBRL(valorPendente)} />
          <StatCard label="Clientes Cadastrados" value={String(clientesCadastrados ?? 0)} />
          <StatCard label="Produtos Cadastrados" value={String(produtosCadastrados ?? 0)} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardTitle>Pedidos por status</CardTitle>
            <StatusBars data={porStatus} />
          </Card>

          <Card>
            <CardTitle>Próximas entregas</CardTitle>
            {proximasEntregas.length === 0 && <p className="text-sm text-muted">Nada no radar.</p>}
            <ul className="space-y-3">
              {proximasEntregas.map((p) => (
                <li key={p.id}>
                  <Link href={`/pedidos/${p.id}`} className="block rounded-lg border border-border p-3 hover:bg-border/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-text">#{p.id} · {p.cliente_nome}</span>
                      <StatusPedidoBadge status={p.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted">Prazo: {formatDate(p.prazo_entrega)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <CardTitle className="mb-0">Despesas por categoria</CardTitle>
            <Link href="/despesas" className="text-sm text-accent hover:underline">
              Ver todas
            </Link>
          </div>
          {despesasPorCategoria.length === 0 && <p className="text-sm text-muted">Nenhuma despesa no período.</p>}
          <ul className="space-y-2">
            {despesasPorCategoria.map((d) => (
              <li key={d.categoria} className="flex items-center justify-between text-sm">
                <span className="text-muted">{d.categoria}</span>
                <span className="font-medium text-text">{formatBRL(d.valor)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
