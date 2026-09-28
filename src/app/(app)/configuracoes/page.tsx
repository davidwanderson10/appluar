import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input, Label, FieldGroup } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { updateConfigPrecificacao } from "./actions";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const { data: config } = await supabase.from("config_precificacao").select("*").eq("id", 1).single();

  return (
    <div>
      <TopBar title="Configurações" />
      <div className="p-6">
        <Card className="max-w-3xl">
          <CardTitle>Parâmetros de precificação</CardTitle>
          <p className="mb-4 -mt-2 text-sm text-muted">
            Usados como valor padrão na Calculadora e no cadastro de produtos. Sempre editáveis por pedido.
          </p>
          <form action={updateConfigPrecificacao} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldGroup>
              <Label htmlFor="custo_filamento_kg">Filamento (R$/kg)</Label>
              <Input id="custo_filamento_kg" name="custo_filamento_kg" type="number" step="0.01" defaultValue={config?.custo_filamento_kg} />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="custo_energia_kwh">Energia (R$/kWh)</Label>
              <Input id="custo_energia_kwh" name="custo_energia_kwh" type="number" step="0.01" defaultValue={config?.custo_energia_kwh} />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="potencia_impressora_w">Potência da impressora (W)</Label>
              <Input id="potencia_impressora_w" name="potencia_impressora_w" type="number" step="1" defaultValue={config?.potencia_impressora_w} />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="percentual_falha">% Falha/desperdício</Label>
              <Input id="percentual_falha" name="percentual_falha" type="number" step="1" defaultValue={config?.percentual_falha} />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="custo_embalagem">Custo de embalagem (R$)</Label>
              <Input id="custo_embalagem" name="custo_embalagem" type="number" step="0.01" defaultValue={config?.custo_embalagem} />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="mao_de_obra_hora">Mão de obra (R$/h)</Label>
              <Input id="mao_de_obra_hora" name="mao_de_obra_hora" type="number" step="0.01" defaultValue={config?.mao_de_obra_hora} />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="custo_fixo_mensal">Custo fixo mensal (R$)</Label>
              <Input id="custo_fixo_mensal" name="custo_fixo_mensal" type="number" step="0.01" defaultValue={config?.custo_fixo_mensal} />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="horas_trabalhadas_mes">Horas trabalhadas/mês</Label>
              <Input id="horas_trabalhadas_mes" name="horas_trabalhadas_mes" type="number" step="1" defaultValue={config?.horas_trabalhadas_mes} />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="fator_overhead">Fator de overhead</Label>
              <Input id="fator_overhead" name="fator_overhead" type="number" step="0.1" defaultValue={config?.fator_overhead} />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="margem_desejada_pct">Margem de lucro desejada (%)</Label>
              <Input id="margem_desejada_pct" name="margem_desejada_pct" type="number" step="1" defaultValue={config?.margem_desejada_pct} />
              <p className="mt-1 text-xs text-muted">100% dobra o custo, 200% triplica, etc.</p>
            </FieldGroup>
            <div className="sm:col-span-2">
              <Button type="submit">Salvar parâmetros</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
