"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function clienteFromForm(formData: FormData) {
  const str = (key: string) => {
    const v = formData.get(key);
    return v ? String(v).trim() || null : null;
  };

  return {
    nome: String(formData.get("nome") ?? "").trim(),
    tipo: str("tipo") ?? "Pessoa Física",
    documento: str("documento"),
    email: str("email"),
    telefone: str("telefone"),
    categoria: str("categoria") ?? "Regular",
    status: str("status") ?? "Ativo",
    cep: str("cep"),
    logradouro: str("logradouro"),
    numero: str("numero"),
    complemento: str("complemento"),
    bairro: str("bairro"),
    cidade: str("cidade"),
    estado: str("estado"),
    observacoes: str("observacoes"),
  };
}

export async function createCliente(formData: FormData) {
  const supabase = await createClient();
  const cliente = clienteFromForm(formData);
  if (!cliente.nome) throw new Error("Nome é obrigatório");

  const { data, error } = await supabase.from("clientes").insert(cliente).select("id").single();
  if (error) throw new Error(error.message);

  revalidatePath("/clientes");
  redirect(`/clientes/${data.id}`);
}

export async function updateCliente(id: number, formData: FormData) {
  const supabase = await createClient();
  const cliente = clienteFromForm(formData);
  if (!cliente.nome) throw new Error("Nome é obrigatório");

  const { error } = await supabase.from("clientes").update(cliente).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  redirect(`/clientes/${id}`);
}
