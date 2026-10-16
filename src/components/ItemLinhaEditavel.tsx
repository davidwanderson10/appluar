import { Input } from "@/components/ui/Field";
import { formatBRL } from "@/lib/format";

// Linha de item (pedido/orçamento) com campos realmente editáveis. Usa dois botões "submit" com
// formAction diferentes (salvar/remover) no mesmo <form>, suportado nativamente pelo React/Next
// para actions — evita precisar de JS no cliente só pra isso.
export function ItemLinhaEditavel({
  nome,
  item,
  updateAction,
  removeAction,
}: {
  nome: string;
  item: { quantidade: number; material: string | null; cor: string | null; custo_unitario: number; valor_unitario: number };
  updateAction: (formData: FormData) => void;
  removeAction: (formData: FormData) => void;
}) {
  return (
    <form className="rounded-lg border border-border p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-text">{nome}</p>
        <p className="text-xs text-muted">
          Total: {formatBRL(item.quantidade * item.valor_unitario)}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-6 sm:items-end">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Qtd</label>
          <Input name="quantidade" type="number" min={1} step="1" defaultValue={item.quantidade} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Material</label>
          <Input name="material" defaultValue={item.material ?? ""} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Cor</label>
          <Input name="cor" defaultValue={item.cor ?? ""} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Custo unit.</label>
          <Input name="custo_unitario" type="number" step="0.01" defaultValue={item.custo_unitario} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Valor unit.</label>
          <Input name="valor_unitario" type="number" step="0.01" defaultValue={item.valor_unitario} />
        </div>
        <div className="flex items-center gap-3 pb-1">
          <button type="submit" formAction={updateAction} className="text-xs font-medium text-accent hover:underline">
            Salvar
          </button>
          <button type="submit" formAction={removeAction} className="text-xs text-red-500 hover:underline">
            Remover
          </button>
        </div>
      </div>
    </form>
  );
}
