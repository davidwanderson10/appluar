import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input, Textarea, Label, FieldGroup } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ClienteCombo } from "@/components/ClienteCombo";
import { PedidoItensEditor } from "@/components/PedidoItensEditor";
import { todayISO } from "@/lib/format";
import { createOrcamento } from "../actions";

export default async function NovoOrcamentoPage() {
  const supabase = await createClient();

  const [{ data: clientes }, { data: produtos }] = await Promise.all([
    supabase.from("clientes").select("id, nome").eq("status", "Ativo").order("nome"),
    supabase.from("produtos").select("id, nome, material, cor, custo, preco_venda").eq("ativo", true).order("nome"),
  ]);

  return (
    <div>
      <TopBar title="Novo Orçamento" />
      <div className="p-6">
        <form action={createOrcamento} className="max-w-4xl space-y-6">
          <Card>
            <CardTitle>Dados do orçamento</CardTitle>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldGroup className="sm:col-span-2">
                <Label required>Cliente</Label>
                <ClienteCombo clientes={clientes ?? []} />
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="data">Data</Label>
                <Input id="data" name="data" type="date" defaultValue={todayISO()} />
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="validade">Válido até</Label>
                <Input id="validade" name="validade" type="date" />
              </FieldGroup>
              <FieldGroup className="sm:col-span-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea id="observacoes" name="observacoes" rows={2} />
              </FieldGroup>
            </div>
          </Card>

          <Card>
            <CardTitle>Itens</CardTitle>
            <PedidoItensEditor produtos={produtos ?? []} />
          </Card>

          <Button type="submit">Criar orçamento</Button>
        </form>
      </div>
    </div>
  );
}
