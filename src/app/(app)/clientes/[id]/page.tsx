import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { Card, CardTitle } from "@/components/ui/Card";
import { ClienteForm } from "@/components/ClienteForm";
import { StatusPedidoBadge } from "@/components/ui/Badge";
import { formatBRL, formatDate } from "@/lib/format";
import { updateCliente } from "../actions";

export default async function ClienteDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: cliente } = await supabase.from("clientes").select("*").eq("id", id).single();
  if (!cliente) notFound();

  const { data: pedidos } = await supabase
    .from("pedidos_resumo")
    .select("*")
    .eq("cliente_id", id)
    .order("data_pedido", { ascending: false });

  const lista = pedidos ?? [];
  const totalGasto = lista
    .filter((p) => p.status !== "Cancelado")
    .reduce((acc, p) => acc + Number(p.venda_total), 0);

  const updateWithId = updateCliente.bind(null, cliente.id);

  return (
    <div>
      <TopBar title={cliente.nome} />
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle>Dados do cliente</CardTitle>
          <ClienteForm cliente={cliente} action={updateWithId} />
        </Card>

        <div className="space-y-6">
          <Card>
            <CardTitle>Resumo</CardTitle>
            <p className="text-sm text-muted">Total de pedidos</p>
            <p className="mb-3 text-xl font-semibold text-text">{lista.length}</p>
            <p className="text-sm text-muted">Total gasto (não cancelados)</p>
            <p className="text-xl font-semibold text-text">{formatBRL(totalGasto)}</p>
          </Card>

          <Card>
            <CardTitle>Histórico de pedidos</CardTitle>
            <ul className="space-y-2">
              {lista.map((p) => (
                <li key={p.id}>
                  <Link href={`/pedidos/${p.id}`} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-border/30">
                    <div>
                      <p className="text-sm font-medium text-text">#{p.id} · {formatDate(p.data_pedido)}</p>
                      <p className="text-xs text-muted">{formatBRL(p.venda_total)}</p>
                    </div>
                    <StatusPedidoBadge status={p.status} />
                  </Link>
                </li>
              ))}
              {lista.length === 0 && <p className="text-sm text-muted">Nenhum pedido ainda.</p>}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
