"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateConfigPrecificacao(formData: FormData) {
  const supabase = await createClient();

  const num = (key: string) => Number(formData.get(key) || 0);

  const { error } = await supabase
    .from("config_precificacao")
    .update({
      custo_filamento_kg: num("custo_filamento_kg"),
      custo_energia_kwh: num("custo_energia_kwh"),
      potencia_impressora_w: num("potencia_impressora_w"),
      percentual_falha: num("percentual_falha"),
      custo_fixo_mensal: num("custo_fixo_mensal"),
      horas_trabalhadas_mes: num("horas_trabalhadas_mes"),
      mao_de_obra_hora: num("mao_de_obra_hora"),
      fator_overhead: num("fator_overhead"),
      margem_desejada_pct: num("margem_desejada_pct"),
      custo_embalagem: num("custo_embalagem"),
    })
    .eq("id", 1);

  if (error) throw new Error(error.message);

  revalidatePath("/configuracoes");
  revalidatePath("/calculadora");
}
