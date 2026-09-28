import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { ProdutoForm } from "@/components/ProdutoForm";
import { createProduto } from "../actions";

export default function NovoProdutoPage() {
  return (
    <div>
      <TopBar title="Novo Produto" />
      <div className="p-6">
        <Card className="max-w-3xl">
          <ProdutoForm action={createProduto} />
        </Card>
      </div>
    </div>
  );
}
