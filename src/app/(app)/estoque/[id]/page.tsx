import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { InsumoForm } from "@/components/InsumoForm";
import { updateInsumo, deleteInsumo } from "../actions";

export default async function InsumoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: insumo } = await supabase.from("insumos").select("*").eq("id", id).single();
  if (!insumo) notFound();

  const updateWithId = updateInsumo.bind(null, insumo.id);
  const deleteWithId = deleteInsumo.bind(null, insumo.id);

  return (
    <div>
      <TopBar title={insumo.nome} />
      <div className="p-6">
        <Card className="max-w-2xl">
          <InsumoForm insumo={insumo} action={updateWithId} />
          <form action={deleteWithId} className="mt-4 border-t border-border pt-4">
            <button type="submit" className="text-sm text-red-500 hover:underline">
              Excluir insumo
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
