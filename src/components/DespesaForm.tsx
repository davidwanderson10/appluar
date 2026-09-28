import { Input, Textarea, Label, FieldGroup } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { todayISO } from "@/lib/format";
import type { Despesa } from "@/types/database";

const CATEGORIAS_SUGERIDAS = [
  "Marketing",
  "Anúncios",
  "Embalagens",
  "Materiais diversos",
  "Ferramentas e equipamentos",
  "Taxas e impostos",
  "Frete",
  "Insumos",
  "Outros",
];

export function DespesaForm({
  despesa,
  action,
}: {
  despesa?: Despesa;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldGroup className="mb-0">
          <Label htmlFor="data" required>
            Data
          </Label>
          <Input id="data" name="data" type="date" defaultValue={despesa?.data ?? todayISO()} required />
        </FieldGroup>
        <FieldGroup className="mb-0">
          <Label htmlFor="categoria" required>
            Categoria
          </Label>
          <Input id="categoria" name="categoria" list="categorias-despesa" defaultValue={despesa?.categoria ?? ""} required />
          <datalist id="categorias-despesa">
            {CATEGORIAS_SUGERIDAS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </FieldGroup>
      </div>

      <FieldGroup>
        <Label htmlFor="descricao" required>
          Descrição
        </Label>
        <Input id="descricao" name="descricao" placeholder="Ex.: Impulsionamento Instagram, fita adesiva, etiquetas..." defaultValue={despesa?.descricao ?? ""} required />
      </FieldGroup>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldGroup className="mb-0">
          <Label htmlFor="valor" required>
            Valor (R$)
          </Label>
          <Input id="valor" name="valor" type="number" step="0.01" min="0" defaultValue={despesa?.valor ?? ""} required />
        </FieldGroup>
        <FieldGroup className="mb-0">
          <Label htmlFor="forma_pagamento">Forma de pagamento</Label>
          <Input id="forma_pagamento" name="forma_pagamento" placeholder="PIX, cartão, dinheiro..." defaultValue={despesa?.forma_pagamento ?? ""} />
        </FieldGroup>
      </div>

      <FieldGroup>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea id="observacoes" name="observacoes" rows={2} defaultValue={despesa?.observacoes ?? ""} />
      </FieldGroup>

      <Button type="submit">{despesa ? "Salvar alterações" : "Cadastrar despesa"}</Button>
    </form>
  );
}
