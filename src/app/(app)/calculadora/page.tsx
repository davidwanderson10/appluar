import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { Calculadora } from "@/components/Calculadora";

export default async function CalculadoraPage() {
  const supabase = await createClient();
  const { data: config } = await supabase.from("config_precificacao").select("*").eq("id", 1).single();

  return (
    <div>
      <TopBar title="Calculadora de Precificação" />
      <div className="p-6">
        <Calculadora
          parametrosIniciais={{
            custoFilamentoKg: config?.custo_filamento_kg ?? 130,
            custoEnergiaKwh: config?.custo_energia_kwh ?? 1.2,
            potenciaImpressoraW: config?.potencia_impressora_w ?? 200,
            percentualFalha: config?.percentual_falha ?? 0,
            custoFixoMensal: config?.custo_fixo_mensal ?? 0,
            horasTrabalhadasMes: config?.horas_trabalhadas_mes ?? 0,
            maoDeObraHora: config?.mao_de_obra_hora ?? 0,
            fatorOverhead: config?.fator_overhead ?? 1,
            custoEmbalagem: config?.custo_embalagem ?? 0,
            margemDesejadaPct: config?.margem_desejada_pct ?? 100,
          }}
        />
      </div>
    </div>
  );
}
