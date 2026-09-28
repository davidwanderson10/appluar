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

export async function registrarMovimentacao(insumoId: number, formData: FormData) {
  const supabase = await createClient();

  const tipo = String(formData.get("tipo") || "Entrada");
  const quantidade = Number(formData.get("quantidade") || 0);
  const observacao = String(formData.get("observacao") || "") || null;
  if (quantidade <= 0) throw new Error("Quantidade deve ser maior que zero");

  const { data: insumo } = await supabase.from("insumos").select("quantidade_estoque").eq("id", insumoId).single();
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

  revalidatePath("/estoque");
}
