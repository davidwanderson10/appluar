"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { baixarEstoquePorItem } from "@/lib/estoque";
import type { ItemPedidoInput } from "@/components/PedidoItensEditor";

export async function createOrcamento(formData: FormData) {
  const supabase = await createClient();

  const cliente_id = Number(formData.get("cliente_id"));
  if (!cliente_id) throw new Error("Selecione um cliente");

  const itens: ItemPedidoInput[] = JSON.parse(String(formData.get("itens_json") ?? "[]")).filter(
    (i: ItemPedidoInput) => i.produto_id || i.nome_avulso
  );
  if (itens.length === 0) throw new Error("Adicione ao menos um item");

  const { data: orcamento, error } = await supabase
    .from("orcamentos")
    .insert({
      cliente_id,
      data: String(formData.get("data") || new Date().toISOString().slice(0, 10)),
      validade: String(formData.get("validade") || "") || null,
      observacoes: String(formData.get("observacoes") || "") || null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await supabase.from("itens_orcamento").insert(
    itens.map((item) => ({
      orcamento_id: orcamento.id,
      produto_id: item.produto_id,
      nome_avulso: item.produto_id ? null : item.nome_avulso,
      quantidade: item.quantidade,
      material: item.material || null,
      cor: item.cor || null,
      custo_unitario: item.custo_unitario,
      valor_unitario: item.valor_unitario,
    }))
  );

  revalidatePath("/orcamentos");
  redirect(`/orcamentos/${orcamento.id}`);
}

export async function updateOrcamentoStatus(id: number, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("orcamentos")
    .update({
      status: String(formData.get("status") || "Enviado"),
      validade: String(formData.get("validade") || "") || null,
      observacoes: String(formData.get("observacoes") || "") || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/orcamentos");
  revalidatePath(`/orcamentos/${id}`);
  redirect(`/orcamentos/${id}`);
}

export async function converterEmPedido(orcamentoId: number) {
  const supabase = await createClient();

  const { data: orcamento } = await supabase.from("orcamentos").select("*").eq("id", orcamentoId).single();
  if (!orcamento) throw new Error("Orçamento não encontrado");

  const { data: itens } = await supabase.from("itens_orcamento").select("*").eq("orcamento_id", orcamentoId);

  const { data: pedido, error } = await supabase
    .from("pedidos")
    .insert({
      cliente_id: orcamento.cliente_id,
      data_pedido: new Date().toISOString().slice(0, 10),
      observacoes: orcamento.observacoes,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  for (const item of itens ?? []) {
    const { data: itemInserido } = await supabase
      .from("itens_pedido")
      .insert({
        pedido_id: pedido.id,
        produto_id: item.produto_id,
        nome_avulso: item.nome_avulso,
        quantidade: item.quantidade,
        material: item.material,
        cor: item.cor,
        custo_unitario: item.custo_unitario,
        valor_unitario: item.valor_unitario,
      })
      .select("id")
      .single();

    const baixa = await baixarEstoquePorItem(supabase, {
      produtoId: item.produto_id,
      material: item.material,
      cor: item.cor,
      quantidade: item.quantidade,
      pedidoId: pedido.id,
    });
    if (baixa && itemInserido) {
      await supabase
        .from("itens_pedido")
        .update({ insumo_id: baixa.insumoId, quantidade_baixada: baixa.quantidadeBaixada })
        .eq("id", itemInserido.id);
    }
  }

  await supabase.from("orcamentos").update({ status: "Convertido", pedido_id: pedido.id }).eq("id", orcamentoId);

  revalidatePath("/orcamentos");
  revalidatePath("/pedidos");
  revalidatePath("/estoque");
  redirect(`/pedidos/${pedido.id}`);
}

export async function deleteOrcamento(id: number) {
  const supabase = await createClient();
  await supabase.from("orcamentos").delete().eq("id", id);

  revalidatePath("/orcamentos");
}
