import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { DespesaForm } from "@/components/DespesaForm";
import { updateDespesa, deleteDespesa } from "../actions";

export default async function DespesaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: despesa } = await supabase.from("despesas").select("*").eq("id", id).single();
  if (!despesa) notFound();

  const updateWithId = updateDespesa.bind(null, despesa.id);
  const deleteWithId = deleteDespesa.bind(null, despesa.id);

  return (
    <div>
      <TopBar title="Editar Despesa" />
      <div className="p-6">
        <Card className="max-w-2xl">
          <DespesaForm despesa={despesa} action={updateWithId} />
          <form action={deleteWithId} className="mt-4 border-t border-border pt-4">
            <button type="submit" className="text-sm text-red-500 hover:underline">
              Excluir despesa
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
