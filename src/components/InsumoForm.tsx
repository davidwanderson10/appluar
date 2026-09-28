import { Input, Select, Label, FieldGroup } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { Insumo } from "@/types/database";

export function InsumoForm({
  insumo,
  action,
}: {
  insumo?: Insumo;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="space-y-4">
      <FieldGroup>
        <Label htmlFor="nome" required>
          Nome
        </Label>
        <Input id="nome" name="nome" placeholder="Ex.: Filamento PLA Preto" defaultValue={insumo?.nome ?? ""} required />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="tipo">Tipo</Label>
        <Select id="tipo" name="tipo" defaultValue={insumo?.tipo ?? "Filamento"}>
          <option>Filamento</option>
          <option>Embalagem</option>
          <option>Outro</option>
        </Select>
      </FieldGroup>
      <div className="grid grid-cols-2 gap-3">
        <FieldGroup className="mb-0">
          <Label htmlFor="material">Material</Label>
          <Input id="material" name="material" placeholder="PLA" defaultValue={insumo?.material ?? ""} />
        </FieldGroup>
        <FieldGroup className="mb-0">
          <Label htmlFor="cor">Cor</Label>
          <Input id="cor" name="cor" defaultValue={insumo?.cor ?? ""} />
        </FieldGroup>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FieldGroup className="mb-0">
          <Label htmlFor="quantidade_estoque">Qtd em estoque</Label>
          <Input
            id="quantidade_estoque"
            name="quantidade_estoque"
            type="number"
            step="0.01"
            defaultValue={insumo?.quantidade_estoque ?? 0}
          />
        </FieldGroup>
        <FieldGroup className="mb-0">
          <Label htmlFor="unidade">Unidade</Label>
          <Select id="unidade" name="unidade" defaultValue={insumo?.unidade ?? "g"}>
            <option value="g">gramas</option>
            <option value="kg">kg</option>
            <option value="un">unidade</option>
          </Select>
        </FieldGroup>
      </div>
      <FieldGroup>
        <Label htmlFor="quantidade_minima">Qtd mínima (alerta)</Label>
        <Input
          id="quantidade_minima"
          name="quantidade_minima"
          type="number"
          step="0.01"
          defaultValue={insumo?.quantidade_minima ?? 0}
        />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="custo_unitario">Custo unitário (R$)</Label>
        <Input id="custo_unitario" name="custo_unitario" type="number" step="0.01" defaultValue={insumo?.custo_unitario ?? 0} />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="fornecedor">Fornecedor</Label>
        <Input id="fornecedor" name="fornecedor" defaultValue={insumo?.fornecedor ?? ""} />
      </FieldGroup>
      <Button type="submit" className="w-full">
        {insumo ? "Salvar alterações" : "Cadastrar insumo"}
      </Button>
    </form>
  );
}
