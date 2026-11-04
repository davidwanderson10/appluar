"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirectWithToast } from "@/lib/toast";
import { baixarEstoquePorItem } from "@/lib/estoque";
import type { ItemPedidoInput } from "@/components/PedidoItensEditor";

// Foto da peça (render/foto) anexada a um item do orçamento, pra cliente ver antes de aprovar.
async function uploadFotoItem(supabase: Awaited<ReturnType<typeof createClient>>, formData: FormData, itemId: number) {
  const foto = formData.get("foto");
  if (!(foto instanceof File) || foto.size === 0) return undefined;

  const ext = foto.name.split(".").pop() || "jpg";
  const path = `item-${itemId}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("orcamentos").upload(path, foto, {
    contentType: foto.type,
    upsert: true,
  });
  if (error) throw new Error(`Falha ao enviar a foto: ${error.message}`);

  const { data } = supabase.storage.from("orcamentos").getPublicUrl(path);
  return data.publicUrl;
}

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
  redirectWithToast(`/orcamentos/${orcamento.id}`, "Orçamento criado com sucesso.");
}

export async function updateOrcamentoStatus(id: number, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("orcamentos")
    .update({
      status: String(formData.get("status") || "Enviado"),
      data: String(formData.get("data") || new Date().toISOString().slice(0, 10)),
      validade: String(formData.get("validade") || "") || null,
      observacoes: String(formData.get("observacoes") || "") || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/orcamentos");
  revalidatePath(`/orcamentos/${id}`);
  redirectWithToast(`/orcamentos/${id}`, "Orçamento atualizado com sucesso.");
}

export async function addItemOrcamento(orcamentoId: number, formData: FormData) {
  const supabase = await createClient();

  const produto_id = formData.get("produto_id") ? Number(formData.get("produto_id")) : null;
  const nome_avulso = String(formData.get("nome_avulso") || "") || null;
  const quantidade = Number(formData.get("quantidade") || 1);
  const material = String(formData.get("material") || "") || null;
  const cor = String(formData.get("cor") || "") || null;
  const custo_unitario = Number(formData.get("custo_unitario") || 0);
  const valor_unitario = Number(formData.get("valor_unitario") || 0);
  const foto_grande = String(formData.get("foto_tamanho") || "grande") !== "pequena";

  if (!produto_id && !nome_avulso) throw new Error("Informe um produto ou nome do item");

  const { data: itemInserido, error } = await supabase
    .from("itens_orcamento")
    .insert({
      orcamento_id: orcamentoId,
      produto_id,
      nome_avulso,
      quantidade,
      material,
      cor,
      custo_unitario,
      valor_unitario,
      foto_grande,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const fotoUrl = await uploadFotoItem(supabase, formData, itemInserido.id);
  if (fotoUrl) {
    await supabase.from("itens_orcamento").update({ foto_url: fotoUrl }).eq("id", itemInserido.id);
  }

  revalidatePath(`/orcamentos/${orcamentoId}`);
  redirectWithToast(`/orcamentos/${orcamentoId}`, "Item adicionado ao orçamento.");
}

export async function updateItemOrcamento(orcamentoId: number, itemId: number, formData: FormData) {
  const supabase = await createClient();

  const fotoUrl = await uploadFotoItem(supabase, formData, itemId);

  const { error } = await supabase
    .from("itens_orcamento")
    .update({
      quantidade: Number(formData.get("quantidade") || 1),
      material: String(formData.get("material") || "") || null,
      cor: String(formData.get("cor") || "") || null,
      custo_unitario: Number(formData.get("custo_unitario") || 0),
      valor_unitario: Number(formData.get("valor_unitario") || 0),
      foto_grande: String(formData.get("foto_tamanho") || "grande") !== "pequena",
      ...(fotoUrl ? { foto_url: fotoUrl } : {}),
    })
    .eq("id", itemId);
  if (error) throw new Error(error.message);

  revalidatePath(`/orcamentos/${orcamentoId}`);
  redirectWithToast(`/orcamentos/${orcamentoId}`, "Item atualizado.");
}

export async function removeItemOrcamento(orcamentoId: number, itemId: number) {
  const supabase = await createClient();
  await supabase.from("itens_orcamento").delete().eq("id", itemId);

  revalidatePath(`/orcamentos/${orcamentoId}`);
  redirectWithToast(`/orcamentos/${orcamentoId}`, "Item removido.");
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
  redirectWithToast(`/pedidos/${pedido.id}`, "Orçamento convertido em pedido.");
}

export async function deleteOrcamento(id: number) {
  const supabase = await createClient();
  await supabase.from("orcamentos").delete().eq("id", id);

  revalidatePath("/orcamentos");
  redirectWithToast("/orcamentos", "Orçamento excluído.");
}
