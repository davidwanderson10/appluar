import { Input, Select, Textarea, Label, FieldGroup } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { Cliente } from "@/types/database";

export function ClienteForm({
  cliente,
  action,
}: {
  cliente?: Cliente;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldGroup className="sm:col-span-2">
          <Label htmlFor="nome" required>
            Nome completo / Razão social
          </Label>
          <Input id="nome" name="nome" defaultValue={cliente?.nome} required />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="tipo">Tipo</Label>
          <Select id="tipo" name="tipo" defaultValue={cliente?.tipo ?? "Pessoa Física"}>
            <option>Pessoa Física</option>
            <option>Pessoa Jurídica</option>
          </Select>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="documento">CPF / CNPJ</Label>
          <Input id="documento" name="documento" defaultValue={cliente?.documento ?? ""} />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" defaultValue={cliente?.email ?? ""} />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="telefone">Telefone</Label>
          <Input id="telefone" name="telefone" defaultValue={cliente?.telefone ?? ""} />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="categoria">Categoria</Label>
          <Input id="categoria" name="categoria" defaultValue={cliente?.categoria ?? "Regular"} />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="status">Status</Label>
          <Select id="status" name="status" defaultValue={cliente?.status ?? "Ativo"}>
            <option>Ativo</option>
            <option>Inativo</option>
          </Select>
        </FieldGroup>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-text">Endereço (opcional)</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FieldGroup>
            <Label htmlFor="cep">CEP</Label>
            <Input id="cep" name="cep" defaultValue={cliente?.cep ?? ""} />
          </FieldGroup>
          <FieldGroup className="sm:col-span-2">
            <Label htmlFor="logradouro">Logradouro</Label>
            <Input id="logradouro" name="logradouro" defaultValue={cliente?.logradouro ?? ""} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="numero">Número</Label>
            <Input id="numero" name="numero" defaultValue={cliente?.numero ?? ""} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="complemento">Complemento</Label>
            <Input id="complemento" name="complemento" defaultValue={cliente?.complemento ?? ""} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="bairro">Bairro</Label>
            <Input id="bairro" name="bairro" defaultValue={cliente?.bairro ?? ""} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="cidade">Cidade</Label>
            <Input id="cidade" name="cidade" defaultValue={cliente?.cidade ?? ""} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="estado">UF</Label>
            <Input id="estado" name="estado" maxLength={2} defaultValue={cliente?.estado ?? ""} />
          </FieldGroup>
        </div>
      </div>

      <FieldGroup>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea id="observacoes" name="observacoes" rows={3} defaultValue={cliente?.observacoes ?? ""} />
      </FieldGroup>

      <Button type="submit">{cliente ? "Salvar alterações" : "Cadastrar cliente"}</Button>
    </form>
  );
}
