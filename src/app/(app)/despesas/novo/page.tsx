import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { DespesaForm } from "@/components/DespesaForm";
import { createDespesa } from "../actions";

export default function NovaDespesaPage() {
  return (
    <div>
      <TopBar title="Nova Despesa" />
      <div className="p-6">
        <Card className="max-w-2xl">
          <DespesaForm action={createDespesa} />
        </Card>
      </div>
    </div>
  );
}
