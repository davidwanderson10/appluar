"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function produtoFromForm(formData: FormData) {
  const str = (key: string) => {
    const v = formData.get(key);
    return v ? String(v).trim() || null : null;
  };
  const num = (key: string) => {
    const v = formData.get(key);
    if (v === null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  return {
    nome: String(formData.get("nome") ?? "").trim(),
    descricao: str("descricao"),
    categoria: str("categoria"),
    material: str("material"),
    cor: str("cor"),
    tempo_impressao_h: num("tempo_impressao_h"),
    consumo_filamento_g: num("consumo_filamento_g"),
    custo: num("custo") ?? 0,
    preco_venda: num("preco_venda") ?? 0,
    ativo: formData.get("ativo") === "on",
  };
}

async function uploadFoto(formData: FormData, produtoId: number) {
  const supabase = await createClient();
  const foto = formData.get("foto");
  if (!(foto instanceof File) || foto.size === 0) return undefined;

  const ext = foto.name.split(".").pop() || "jpg";
  const path = `produto-${produtoId}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("produtos").upload(path, foto, {
    contentType: foto.type,
    upsert: true,
  });
  if (error) return undefined;

  const { data } = supabase.storage.from("produtos").getPublicUrl(path);
  return data.publicUrl;
}

export async function createProduto(formData: FormData) {
  const supabase = await createClient();
  const produto = produtoFromForm(formData);
  if (!produto.nome) throw new Error("Nome é obrigatório");

  const { data, error } = await supabase.from("produtos").insert(produto).select("id").single();
  if (error) throw new Error(error.message);

  const fotoUrl = await uploadFoto(formData, data.id);
  if (fotoUrl) {
    await supabase.from("produtos").update({ foto_url: fotoUrl }).eq("id", data.id);
  }

  revalidatePath("/produtos");
  redirect(`/produtos/${data.id}`);
}

export async function updateProduto(id: number, formData: FormData) {
  const supabase = await createClient();
  const produto = produtoFromForm(formData);
  if (!produto.nome) throw new Error("Nome é obrigatório");

  const fotoUrl = await uploadFoto(formData, id);

  const { error } = await supabase
    .from("produtos")
    .update({ ...produto, ...(fotoUrl ? { foto_url: fotoUrl } : {}) })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/produtos");
  revalidatePath(`/produtos/${id}`);
  redirect(`/produtos/${id}`);
}

export async function deleteProduto(id: number) {
  const supabase = await createClient();
  await supabase.from("produtos").delete().eq("id", id);

  revalidatePath("/produtos");
}
