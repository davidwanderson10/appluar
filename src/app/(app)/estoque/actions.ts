"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createInsumo(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("insumos").insert({
    nome: String(formData.get("nome") ?? "").trim(),
    tipo: String(formData.get("tipo") || "Filamento"),
    material: String(formData.get("material") || "") || null,
    cor: String(formData.get("cor") || "") || null,
    unidade: String(formData.get("unidade") || "g"),
    quantidade_estoque: Number(formData.get("quantidade_estoque") || 0),
    quantidade_minima: Number(formData.get("quantidade_minima") || 0),
    custo_unitario: Number(formData.get("custo_unitario") || 0),
    fornecedor: String(formData.get("fornecedor") || "") || null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/estoque");
  redirect("/estoque");
}

export async function updateInsumo(id: number, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("insumos")
    .update({
      nome: String(formData.get("nome") ?? "").trim(),
      tipo: String(formData.get("tipo") || "Filamento"),
      material: String(formData.get("material") || "") || null,
      cor: String(formData.get("cor") || "") || null,
      unidade: String(formData.get("unidade") || "g"),
      quantidade_estoque: Number(formData.get("quantidade_estoque") || 0),
      quantidade_minima: Number(formData.get("quantidade_minima") || 0),
      custo_unitario: Number(formData.get("custo_unitario") || 0),
      fornecedor: String(formData.get("fornecedor") || "") || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/estoque");
  redirect("/estoque");
}

export async function deleteInsumo(id: number) {
  const supabase = await createClient();
  await supabase.from("insumos").delete().eq("id", id);

  revalidatePath("/estoque");
}

export async function registrarMovimentacao(insumoId: number, formData: FormData) {
  const supabase = await createClient();

  const tipo = String(formData.get("tipo") || "Entrada");
  const quantidade = Number(formData.get("quantidade") || 0);
  const observacao = String(formData.get("observacao") || "") || null;
  const registrarDespesa = formData.get("registrar_despesa") === "on";
  if (quantidade <= 0) throw new Error("Quantidade deve ser maior que zero");

  const { data: insumo } = await supabase
    .from("insumos")
    .select("nome, quantidade_estoque, custo_unitario")
    .eq("id", insumoId)
    .single();
  if (!insumo) throw new Error("Insumo não encontrado");

  const novaQuantidade =
    tipo === "Entrada" ? Number(insumo.quantidade_estoque) + quantidade : Number(insumo.quantidade_estoque) - quantidade;

  await supabase.from("insumos").update({ quantidade_estoque: novaQuantidade }).eq("id", insumoId);
  await supabase.from("movimentacoes_estoque").insert({
    insumo_id: insumoId,
    tipo,
    quantidade,
    motivo: "Ajuste manual",
    observacao,
  });

  // Compra de insumo (Entrada) entra automaticamente como despesa, pra fechar o caixa do mês.
  if (tipo === "Entrada" && registrarDespesa) {
    const valor = quantidade * Number(insumo.custo_unitario ?? 0);
    await supabase.from("despesas").insert({
      categoria: "Insumos",
      descricao: `Compra de insumo: ${insumo.nome}`,
      valor,
      insumo_id: insumoId,
      observacoes: observacao,
    });
    revalidatePath("/despesas");
    revalidatePath("/dashboard");
  }

  revalidatePath("/estoque");
}
