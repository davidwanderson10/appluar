import type { SupabaseClient } from "@supabase/supabase-js";

// Ao adicionar um item de pedido/orçamento ligado a um produto com consumo de filamento cadastrado,
// tenta dar baixa automática no insumo (filamento) de mesmo material/cor. Nunca bloqueia a venda:
// se não achar o insumo correspondente, simplesmente não baixa nada.
export async function baixarEstoquePorItem(
  supabase: SupabaseClient,
  params: { produtoId: number | null; material: string | null; cor: string | null; quantidade: number; pedidoId: number }
) {
  if (!params.produtoId) return null;

  const { data: produto } = await supabase
    .from("produtos")
    .select("consumo_filamento_g")
    .eq("id", params.produtoId)
    .single();

  const consumo = produto?.consumo_filamento_g;
  if (!consumo || consumo <= 0) return null;

  let query = supabase.from("insumos").select("*").eq("tipo", "Filamento");
  if (params.material) query = query.ilike("material", params.material);
  if (params.cor) query = query.ilike("cor", params.cor);

  const { data: insumo } = await query.limit(1).maybeSingle();
  if (!insumo) return null;

  const quantidadeBaixada = consumo * params.quantidade;

  await supabase
    .from("insumos")
    .update({ quantidade_estoque: Number(insumo.quantidade_estoque) - quantidadeBaixada })
    .eq("id", insumo.id);

  await supabase.from("movimentacoes_estoque").insert({
    insumo_id: insumo.id,
    tipo: "Saída",
    quantidade: quantidadeBaixada,
    motivo: `Pedido #${params.pedidoId}`,
    pedido_id: params.pedidoId,
  });

  return { insumoId: insumo.id as number, quantidadeBaixada };
}

export async function estornarEstoque(
  supabase: SupabaseClient,
  params: { insumoId: number; quantidade: number; pedidoId: number }
) {
  const { data: insumo } = await supabase.from("insumos").select("quantidade_estoque").eq("id", params.insumoId).single();
  if (!insumo) return;

  await supabase
    .from("insumos")
    .update({ quantidade_estoque: Number(insumo.quantidade_estoque) + params.quantidade })
    .eq("id", params.insumoId);

  await supabase.from("movimentacoes_estoque").insert({
    insumo_id: params.insumoId,
    tipo: "Entrada",
    quantidade: params.quantidade,
    motivo: `Estorno pedido #${params.pedidoId}`,
    pedido_id: params.pedidoId,
  });
}
