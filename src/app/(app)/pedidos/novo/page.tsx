import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input, Select, Textarea, Label, FieldGroup } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ClienteCombo } from "@/components/ClienteCombo";
import { PedidoItensEditor } from "@/components/PedidoItensEditor";
import { todayISO } from "@/lib/format";
import { createPedido } from "../actions";

export default async function NovoPedidoPage() {
  const supabase = await createClient();

  const [{ data: clientes }, { data: produtos }] = await Promise.all([
    supabase.from("clientes").select("id, nome").eq("status", "Ativo").order("nome"),
    supabase
      .from("produtos")
      .select("id, nome, material, cor, custo, preco_venda")
      .eq("ativo", true)
      .order("nome"),
  ]);

  return (
    <div>
      <TopBar title="Novo Pedido" />
      <div className="p-6">
        <form action={createPedido} className="max-w-4xl space-y-6">
          <Card>
            <CardTitle>Dados do pedido</CardTitle>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldGroup className="sm:col-span-2">
                <Label required>Cliente</Label>
                <ClienteCombo clientes={clientes ?? []} />
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="data_pedido">Data do pedido</Label>
                <Input id="data_pedido" name="data_pedido" type="date" defaultValue={todayISO()} />
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="prazo_entrega">Prazo de entrega</Label>
                <Input id="prazo_entrega" name="prazo_entrega" type="date" />
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="forma_pagamento">Forma de pagamento</Label>
                <Select id="forma_pagamento" name="forma_pagamento" defaultValue="">
                  <option value="">Selecione...</option>
                  <option>PIX</option>
                  <option>Cartão</option>
                  <option>Dinheiro</option>
                  <option>Transferência</option>
                </Select>
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="valor_pago">Valor já pago (R$)</Label>
                <Input id="valor_pago" name="valor_pago" type="number" step="0.01" defaultValue={0} />
              </FieldGroup>
              <FieldGroup className="sm:col-span-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea id="observacoes" name="observacoes" rows={2} />
              </FieldGroup>
            </div>
          </Card>

          <Card>
            <CardTitle>Itens do pedido</CardTitle>
            <PedidoItensEditor produtos={produtos ?? []} />
          </Card>

          <Button type="submit">Criar pedido</Button>
        </form>
      </div>
    </div>
  );
}
