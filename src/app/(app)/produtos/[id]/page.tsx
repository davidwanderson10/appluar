import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { ProdutoForm } from "@/components/ProdutoForm";
import { updateProduto } from "../actions";

export default async function ProdutoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: produto } = await supabase.from("produtos").select("*").eq("id", id).single();
  if (!produto) notFound();

  const updateWithId = updateProduto.bind(null, produto.id);

  return (
    <div>
      <TopBar title={produto.nome} />
      <div className="p-6">
        <Card className="max-w-3xl">
          <ProdutoForm produto={produto} action={updateWithId} />
        </Card>
      </div>
    </div>
  );
}
