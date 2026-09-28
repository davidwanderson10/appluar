"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function despesaFromForm(formData: FormData) {
  const str = (key: string) => {
    const v = formData.get(key);
    return v ? String(v).trim() || null : null;
  };

  return {
    data: String(formData.get("data") || new Date().toISOString().slice(0, 10)),
    categoria: String(formData.get("categoria") ?? "").trim() || "Outros",
    descricao: String(formData.get("descricao") ?? "").trim(),
    valor: Number(formData.get("valor") || 0),
    forma_pagamento: str("forma_pagamento"),
    observacoes: str("observacoes"),
  };
}

export async function createDespesa(formData: FormData) {
  const supabase = await createClient();
  const despesa = despesaFromForm(formData);
  if (!despesa.descricao) throw new Error("Descrição é obrigatória");

  const { error } = await supabase.from("despesas").insert(despesa);
  if (error) throw new Error(error.message);

  revalidatePath("/despesas");
  revalidatePath("/dashboard");
  redirect("/despesas");
}

export async function updateDespesa(id: number, formData: FormData) {
  const supabase = await createClient();
  const despesa = despesaFromForm(formData);
  if (!despesa.descricao) throw new Error("Descrição é obrigatória");

  const { error } = await supabase.from("despesas").update(despesa).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/despesas");
  revalidatePath("/dashboard");
  redirect("/despesas");
}

export async function deleteDespesa(id: number) {
  const supabase = await createClient();
  await supabase.from("despesas").delete().eq("id", id);

  revalidatePath("/despesas");
  revalidatePath("/dashboard");
  redirect("/despesas");
}
