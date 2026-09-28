import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input, Select, Textarea, Label, FieldGroup } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { StatusPedidoBadge } from "@/components/ui/Badge";
import { AddItemPedidoForm } from "@/components/AddItemPedidoForm";
import { formatBRL, formatPercent } from "@/lib/format";
import { calcularResultado } from "@/lib/calculations";
import { updatePedido, addItemPedido, removeItemPedido } from "../actions";

const STATUS_OPTIONS = ["Aguardando", "Em Impressão", "Pós-Processamento", "Pronto", "Entregue", "Cancelado"];

export default async function PedidoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: pedido } = await supabase.from("pedidos_resumo").select("*").eq("id", id).single();
  if (!pedido) notFound();

  const [{ data: itens }, { data: produtos }, { data: cliente }] = await Promise.all([
    supabase.from("itens_pedido").select("*").eq("pedido_id", id).order("id"),
    supabase.from("produtos").select("id, nome, material, cor, custo, preco_venda").eq("ativo", true).order("nome"),
    supabase.from("clientes").select("*").eq("id", pedido.cliente_id).single(),
  ]);

  const resultado = calcularResultado(pedido.custo_total, pedido.venda_total);
  const listaItens = itens ?? [];

  const updateWithId = updatePedido.bind(null, pedido.id);
  const addItemWithId = addItemPedido.bind(null, pedido.id);

  return (
    <div>
      <TopBar title={`Pedido #${pedido.id}`} />
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <CardTitle className="mb-0">Itens</CardTitle>
              <StatusPedidoBadge status={pedido.status} />
            </div>
            <div className="mb-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase text-muted">
                    <th className="py-2">Item</th>
                    <th className="py-2">Qtd</th>
                    <th className="py-2">Material/Cor</th>
                    <th className="py-2 text-right">Custo</th>
                    <th className="py-2 text-right">Valor</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {listaItens.map((item) => (
                    <tr key={item.id} className="border-b border-border last:border-0">
                      <td className="py-2">{item.nome_avulso ?? produtos?.find((p) => p.id === item.produto_id)?.nome ?? "—"}</td>
                      <td className="py-2">{item.quantidade}</td>
                      <td className="py-2 text-muted">{[item.material, item.cor].filter(Boolean).join(" / ") || "—"}</td>
                      <td className="py-2 text-right">{formatBRL(item.custo_unitario * item.quantidade)}</td>
                      <td className="py-2 text-right font-medium">{formatBRL(item.valor_unitario * item.quantidade)}</td>
                      <td className="py-2 text-right">
                        <form action={removeItemPedido.bind(null, pedido.id, item.id)}>
                          <button type="submit" className="text-xs text-red-500 hover:underline">
                            remover
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                  {listaItens.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-muted">
                        Nenhum item.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4 rounded-lg border border-border bg-border/10 p-4 text-sm sm:grid-cols-4">
              <div>
                <p className="text-muted">Custo total</p>
                <p className="font-semibold text-text">{formatBRL(pedido.custo_total)}</p>
              </div>
              <div>
                <p className="text-muted">Valor total</p>
                <p className="font-semibold text-text">{formatBRL(pedido.venda_total)}</p>
              </div>
              <div>
                <p className="text-muted">Lucro</p>
                <p className="font-semibold text-text">{formatBRL(resultado.lucro)}</p>
              </div>
              <div>
                <p className="text-muted">Margem / Markup</p>
                <p className="font-semibold text-text">
                  {formatPercent(resultado.margemPct)} · {resultado.markup.toFixed(2)}x
                </p>
              </div>
            </div>

            <AddItemPedidoForm produtos={produtos ?? []} action={addItemWithId} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardTitle>Cliente</CardTitle>
            {cliente && (
              <div className="text-sm">
                <Link href={`/clientes/${cliente.id}`} className="font-medium text-text hover:text-accent">
                  {cliente.nome}
                </Link>
                <p className="mt-1 text-muted">{cliente.telefone ?? "—"}</p>
                <p className="text-muted">{cliente.email ?? "—"}</p>
              </div>
            )}
          </Card>

          <Card>
            <CardTitle>Status e entrega</CardTitle>
            <form action={updateWithId} className="space-y-4">
              <FieldGroup>
                <Label htmlFor="status">Status</Label>
                <Select id="status" name="status" defaultValue={pedido.status}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="prazo_entrega">Prazo de entrega</Label>
                <Input id="prazo_entrega" name="prazo_entrega" type="date" defaultValue={pedido.prazo_entrega ?? ""} />
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="data_entrega">Data de entrega</Label>
                <Input id="data_entrega" name="data_entrega" type="date" defaultValue={pedido.data_entrega ?? ""} />
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="forma_pagamento">Forma de pagamento</Label>
                <Select id="forma_pagamento" name="forma_pagamento" defaultValue={pedido.forma_pagamento ?? ""}>
                  <option value="">Selecione...</option>
                  <option>PIX</option>
                  <option>Cartão</option>
                  <option>Dinheiro</option>
                  <option>Transferência</option>
                </Select>
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="valor_pago">Valor pago (R$)</Label>
                <Input id="valor_pago" name="valor_pago" type="number" step="0.01" defaultValue={pedido.valor_pago} />
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea id="observacoes" name="observacoes" rows={3} defaultValue={pedido.observacoes ?? ""} />
              </FieldGroup>
              <p className="text-xs text-muted">
                Pendente: {formatBRL(Math.max(pedido.venda_total - pedido.valor_pago, 0))}
              </p>
              <Button type="submit" className="w-full">
                Salvar
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
