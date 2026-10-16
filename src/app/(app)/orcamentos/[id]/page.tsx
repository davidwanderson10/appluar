import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input, Select, Textarea, Label, FieldGroup } from "@/components/ui/Field";
import { Button, LinkButton } from "@/components/ui/Button";
import { StatusOrcamentoBadge } from "@/components/ui/Badge";
import { AddItemPedidoForm } from "@/components/AddItemPedidoForm";
import { ItemLinhaEditavel } from "@/components/ItemLinhaEditavel";
import { formatBRL, formatPercent } from "@/lib/format";
import { calcularResultado } from "@/lib/calculations";
import {
  updateOrcamentoStatus,
  converterEmPedido,
  addItemOrcamento,
  updateItemOrcamento,
  removeItemOrcamento,
} from "../actions";

const STATUS_OPTIONS = ["Enviado", "Aprovado", "Recusado", "Convertido"];

export default async function OrcamentoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: orcamento } = await supabase.from("orcamentos_resumo").select("*").eq("id", id).single();
  if (!orcamento) notFound();

  const [{ data: itens }, { data: cliente }, { data: produtos }] = await Promise.all([
    supabase.from("itens_orcamento").select("*").eq("orcamento_id", id).order("id"),
    supabase.from("clientes").select("*").eq("id", orcamento.cliente_id).single(),
    supabase.from("produtos").select("id, nome, material, cor, custo, preco_venda").eq("ativo", true).order("nome"),
  ]);

  const produtoIds = (itens ?? []).map((i) => i.produto_id).filter((v): v is number => v != null);
  const { data: produtosItens } = produtoIds.length
    ? await supabase.from("produtos").select("id, nome").in("id", produtoIds)
    : { data: [] as { id: number; nome: string }[] };
  const nomeProduto = new Map((produtosItens ?? []).map((p) => [p.id, p.nome]));

  const resultado = calcularResultado(orcamento.custo_total, orcamento.venda_total);
  const listaItens = itens ?? [];
  const updateWithId = updateOrcamentoStatus.bind(null, orcamento.id);
  const converterWithId = converterEmPedido.bind(null, orcamento.id);
  const addItemWithId = addItemOrcamento.bind(null, orcamento.id);
  const editavel = orcamento.status !== "Convertido";

  return (
    <div>
      <TopBar title={`Orçamento #${orcamento.id}`} />
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <CardTitle className="mb-0">Itens</CardTitle>
              <div className="flex items-center gap-2">
                <StatusOrcamentoBadge status={orcamento.status} />
                <LinkButton href={`/orcamentos/${orcamento.id}/pdf`} variant="secondary">
                  Baixar PDF
                </LinkButton>
              </div>
            </div>

            <div className="space-y-3">
              {listaItens.map((item) => {
                const nome = item.nome_avulso ?? (item.produto_id ? nomeProduto.get(item.produto_id) : null) ?? "Item";
                const updateItemWithId = updateItemOrcamento.bind(null, orcamento.id, item.id);
                const removeItemWithId = removeItemOrcamento.bind(null, orcamento.id, item.id);
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

            {editavel && (
              <div className="mt-4">
                <AddItemPedidoForm produtos={produtos ?? []} action={addItemWithId} label="+ Adicionar item ao orçamento" />
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg border border-border bg-border/10 p-4 text-sm sm:grid-cols-4">
              <div>
                <p className="text-muted">Custo total</p>
                <p className="font-semibold text-text">{formatBRL(orcamento.custo_total)}</p>
              </div>
              <div>
                <p className="text-muted">Valor total</p>
                <p className="font-semibold text-text">{formatBRL(orcamento.venda_total)}</p>
              </div>
              <div>
                <p className="text-muted">Lucro</p>
                <p className="font-semibold text-text">{formatBRL(resultado.lucro)}</p>
              </div>
              <div>
                <p className="text-muted">Margem</p>
                <p className="font-semibold text-text">{formatPercent(resultado.margemPct)}</p>
              </div>
            </div>

            {orcamento.status !== "Convertido" && (
              <form action={converterWithId} className="mt-4">
                <Button type="submit" variant="secondary">
                  Converter em pedido
                </Button>
              </form>
            )}
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
            <CardTitle>Status</CardTitle>
            <form action={updateWithId} className="space-y-4">
              <FieldGroup>
                <Label htmlFor="status">Status</Label>
                <Select id="status" name="status" defaultValue={orcamento.status}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="data">Data</Label>
                <Input id="data" name="data" type="date" defaultValue={orcamento.data} />
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="validade">Válido até</Label>
                <Input id="validade" name="validade" type="date" defaultValue={orcamento.validade ?? ""} />
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea id="observacoes" name="observacoes" rows={3} defaultValue={orcamento.observacoes ?? ""} />
              </FieldGroup>
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
