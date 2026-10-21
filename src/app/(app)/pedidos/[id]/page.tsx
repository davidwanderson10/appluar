import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input, Select, Textarea, Label, FieldGroup } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { StatusPedidoBadge } from "@/components/ui/Badge";
import { AddItemPedidoForm } from "@/components/AddItemPedidoForm";
import { ItemLinhaEditavel } from "@/components/ItemLinhaEditavel";
import { formatBRL, formatDate, formatPercent } from "@/lib/format";
import { calcularResultado } from "@/lib/calculations";
import {
  updatePedido,
  addItemPedido,
  updateItemPedido,
  removeItemPedido,
  createPerdaPedido,
  deletePerdaPedido,
} from "../actions";

const STATUS_OPTIONS = ["Aguardando", "Em Impressão", "Pós-Processamento", "Pronto", "Entregue", "Cancelado"];

export default async function PedidoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: pedido } = await supabase.from("pedidos_resumo").select("*").eq("id", id).single();
  if (!pedido) notFound();

  const [{ data: itens }, { data: produtos }, { data: cliente }, { data: perdas }] = await Promise.all([
    supabase.from("itens_pedido").select("*").eq("pedido_id", id).order("id"),
    supabase.from("produtos").select("id, nome, material, cor, custo, preco_venda").eq("ativo", true).order("nome"),
    supabase.from("clientes").select("*").eq("id", pedido.cliente_id).single(),
    supabase.from("perdas_producao").select("*").eq("pedido_id", id).order("data", { ascending: false }),
  ]);

  const resultado = calcularResultado(pedido.custo_total, pedido.venda_total);
  const listaItens = itens ?? [];
  const listaPerdas = perdas ?? [];
  const perdasTotal = listaPerdas.reduce((acc, p) => acc + Number(p.valor), 0);
  const lucroReal = resultado.lucro - perdasTotal;

  const updateWithId = updatePedido.bind(null, pedido.id);
  const addItemWithId = addItemPedido.bind(null, pedido.id);
  const addPerdaWithId = createPerdaPedido.bind(null, pedido.id);

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
            <div className="mb-4 space-y-3">
              {listaItens.map((item) => {
                const nome = item.nome_avulso ?? produtos?.find((p) => p.id === item.produto_id)?.nome ?? "Item";
                const updateItemWithId = updateItemPedido.bind(null, pedido.id, item.id);
                const removeItemWithId = removeItemPedido.bind(null, pedido.id, item.id);
                return (
                  <ItemLinhaEditavel
                    key={item.id}
                    nome={nome}
                    item={item}
                    updateAction={updateItemWithId}
                    removeAction={removeItemWithId}
                  />
                );
              })}
              {listaItens.length === 0 && <p className="text-sm text-muted">Nenhum item.</p>}
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
              {perdasTotal > 0 && (
                <div className="sm:col-span-2">
                  <p className="text-muted">Lucro real (após perdas de {formatBRL(perdasTotal)})</p>
                  <p className={`font-semibold ${lucroReal >= 0 ? "text-text" : "text-red-500"}`}>
                    {formatBRL(lucroReal)}
                  </p>
                </div>
              )}
            </div>

            <AddItemPedidoForm produtos={produtos ?? []} action={addItemWithId} />
          </Card>

          <Card>
            <CardTitle>Perdas de produção</CardTitle>
            <p className="mb-4 -mt-2 text-sm text-muted">
              Registre quando uma impressão falhar (peça descolou, quebrou, etc.) pra refletir o custo real
              desse pedido. Cada perda lançada aqui também entra como despesa no relatório mensal.
            </p>

            {listaPerdas.length > 0 && (
              <ul className="mb-4 space-y-2">
                {listaPerdas.map((perda) => {
                  const removePerdaWithId = deletePerdaPedido.bind(null, pedido.id, perda.id);
                  const item = listaItens.find((i) => i.id === perda.item_pedido_id);
                  const nomeItem = item
                    ? (item.nome_avulso ?? produtos?.find((p) => p.id === item.produto_id)?.nome ?? "Item")
                    : null;
                  return (
                    <li key={perda.id} className="rounded-lg border border-border p-3 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-text">{perda.descricao}</p>
                          <p className="text-xs text-muted">
                            {formatDate(perda.data)}
                            {nomeItem ? ` · ${nomeItem}` : ""}
                            {perda.percentual_concluido != null ? ` · ${perda.percentual_concluido}% concluído` : ""}
                          </p>
                          {perda.observacoes && <p className="mt-1 text-xs text-muted">{perda.observacoes}</p>}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-medium text-red-500">{formatBRL(perda.valor)}</p>
                          <form action={removePerdaWithId}>
                            <button type="submit" className="text-xs text-red-500 hover:underline">
                              remover
                            </button>
                          </form>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <form action={addPerdaWithId} className="space-y-3 rounded-lg border border-dashed border-border p-4">
              <FieldGroup className="mb-0">
                <Label htmlFor="descricao" required>
                  O que aconteceu
                </Label>
                <Input
                  id="descricao"
                  name="descricao"
                  placeholder="Ex.: Peça descolou da placa"
                  required
                />
              </FieldGroup>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <FieldGroup className="mb-0">
                  <Label htmlFor="item_pedido_id">Item relacionado</Label>
                  <Select id="item_pedido_id" name="item_pedido_id" defaultValue="">
                    <option value="">Nenhum específico</option>
                    {listaItens.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nome_avulso ?? produtos?.find((p) => p.id === item.produto_id)?.nome ?? `Item #${item.id}`}
                      </option>
                    ))}
                  </Select>
                </FieldGroup>
                <FieldGroup className="mb-0">
                  <Label htmlFor="percentual_concluido">% concluído</Label>
                  <Input id="percentual_concluido" name="percentual_concluido" type="number" min={0} max={100} placeholder="Ex.: 85" />
                </FieldGroup>
                <FieldGroup className="mb-0">
                  <Label htmlFor="valor">Valor perdido (R$)</Label>
                  <Input id="valor" name="valor" type="number" step="0.01" min={0} defaultValue={0} />
                </FieldGroup>
              </div>
              <FieldGroup className="mb-0">
                <Label htmlFor="observacoes_perda">Observações</Label>
                <Textarea id="observacoes_perda" name="observacoes" rows={2} />
              </FieldGroup>
              <Button type="submit" variant="secondary">
                + Registrar perda
              </Button>
            </form>
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
                <Label htmlFor="data_pedido">Data do pedido</Label>
                <Input id="data_pedido" name="data_pedido" type="date" defaultValue={pedido.data_pedido} />
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
