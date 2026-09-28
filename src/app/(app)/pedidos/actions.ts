"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { baixarEstoquePorItem, estornarEstoque } from "@/lib/estoque";
import type { ItemPedidoInput } from "@/components/PedidoItensEditor";

export async function createPedido(formData: FormData) {
  const supabase = await createClient();

  const cliente_id = Number(formData.get("cliente_id"));
  if (!cliente_id) throw new Error("Selecione um cliente");

  const itens: ItemPedidoInput[] = JSON.parse(String(formData.get("itens_json") ?? "[]")).filter(
    (i: ItemPedidoInput) => i.produto_id || i.nome_avulso
  );
  if (itens.length === 0) throw new Error("Adicione ao menos um item");

  const { data: pedido, error } = await supabase
    .from("pedidos")
    .insert({
      cliente_id,
      data_pedido: String(formData.get("data_pedido") || new Date().toISOString().slice(0, 10)),
      prazo_entrega: String(formData.get("prazo_entrega") || "") || null,
      forma_pagamento: String(formData.get("forma_pagamento") || "") || null,
      valor_pago: Number(formData.get("valor_pago") || 0),
      observacoes: String(formData.get("observacoes") || "") || null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  for (const item of itens) {
    const { data: itemInserido } = await supabase
      .from("itens_pedido")
      .insert({
        pedido_id: pedido.id,
        produto_id: item.produto_id,
        nome_avulso: item.produto_id ? null : item.nome_avulso,
        quantidade: item.quantidade,
        material: item.material || null,
        cor: item.cor || null,
        custo_unitario: item.custo_unitario,
        valor_unitario: item.valor_unitario,
      })
      .select("id")
      .single();

    const baixa = await baixarEstoquePorItem(supabase, {
      produtoId: item.produto_id,
      material: item.material || null,
      cor: item.cor || null,
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

  revalidatePath("/pedidos");
  revalidatePath("/estoque");
  redirect(`/pedidos/${pedido.id}`);
}

export async function updatePedido(id: number, formData: FormData) {
  const supabase = await createClient();

  const status = String(formData.get("status") || "Aguardando");
  const data_entrega =
    status === "Entregue"
      ? String(formData.get("data_entrega") || new Date().toISOString().slice(0, 10))
      : String(formData.get("data_entrega") || "") || null;

  const { error } = await supabase
    .from("pedidos")
    .update({
      status,
      prazo_entrega: String(formData.get("prazo_entrega") || "") || null,
      data_entrega,
      forma_pagamento: String(formData.get("forma_pagamento") || "") || null,
      valor_pago: Number(formData.get("valor_pago") || 0),
      observacoes: String(formData.get("observacoes") || "") || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/pedidos");
  revalidatePath(`/pedidos/${id}`);
  redirect(`/pedidos/${id}`);
}

export async function addItemPedido(pedidoId: number, formData: FormData) {
  const supabase = await createClient();

  const produto_id = formData.get("produto_id") ? Number(formData.get("produto_id")) : null;
  const nome_avulso = String(formData.get("nome_avulso") || "") || null;
  const quantidade = Number(formData.get("quantidade") || 1);
  const material = String(formData.get("material") || "") || null;
  const cor = String(formData.get("cor") || "") || null;
  const custo_unitario = Number(formData.get("custo_unitario") || 0);
  const valor_unitario = Number(formData.get("valor_unitario") || 0);

  if (!produto_id && !nome_avulso) throw new Error("Informe um produto ou nome do item");

  const { data: itemInserido, error } = await supabase
    .from("itens_pedido")
    .insert({ pedido_id: pedidoId, produto_id, nome_avulso, quantidade, material, cor, custo_unitario, valor_unitario })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const baixa = await baixarEstoquePorItem(supabase, { produtoId: produto_id, material, cor, quantidade, pedidoId });
  if (baixa) {
    await supabase
      .from("itens_pedido")
      .update({ insumo_id: baixa.insumoId, quantidade_baixada: baixa.quantidadeBaixada })
      .eq("id", itemInserido.id);
  }

  revalidatePath(`/pedidos/${pedidoId}`);
  revalidatePath("/estoque");
}

export async function removeItemPedido(pedidoId: number, itemId: number) {
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("itens_pedido")
    .select("insumo_id, quantidade_baixada")
    .eq("id", itemId)
    .single();

  if (item?.insumo_id && item.quantidade_baixada) {
    await estornarEstoque(supabase, { insumoId: item.insumo_id, quantidade: item.quantidade_baixada, pedidoId });
  }

  await supabase.from("itens_pedido").delete().eq("id", itemId);

  revalidatePath(`/pedidos/${pedidoId}`);
  revalidatePath("/estoque");
}

export async function deletePedido(id: number) {
  const supabase = await createClient();

  const { data: itens } = await supabase
    .from("itens_pedido")
    .select("insumo_id, quantidade_baixada")
    .eq("pedido_id", id);

  for (const item of itens ?? []) {
    if (item.insumo_id && item.quantidade_baixada) {
      await estornarEstoque(supabase, { insumoId: item.insumo_id, quantidade: item.quantidade_baixada, pedidoId: id });
    }
  }

  await supabase.from("pedidos").delete().eq("id", id);

  revalidatePath("/pedidos");
  revalidatePath("/estoque");
  revalidatePath("/dashboard");
}
