import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input, Select, Label, FieldGroup } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ExportExcelButton } from "@/components/ExportExcelButton";
import { RowActions } from "@/components/RowActions";
import { formatBRL, formatDateTime } from "@/lib/format";
import { createInsumo, registrarMovimentacao, deleteInsumo } from "./actions";

export default async function EstoquePage() {
  const supabase = await createClient();

  const [{ data: insumos }, { data: movimentacoes }] = await Promise.all([
    supabase.from("insumos").select("*").order("nome"),
    supabase
      .from("movimentacoes_estoque")
      .select("*, insumos(nome)")
      .order("data", { ascending: false })
      .limit(20),
  ]);

  const lista = insumos ?? [];

  return (
    <div>
      <TopBar title="Estoque de Insumos" />
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="flex justify-end">
            <ExportExcelButton
              nomeArquivo="estoque-luar-print"
              aba="Insumos"
              linhas={lista.map((i) => ({
                Nome: i.nome,
                Tipo: i.tipo,
                Material: i.material,
                Cor: i.cor,
                "Qtd em estoque": i.quantidade_estoque,
                Unidade: i.unidade,
                "Qtd mínima": i.quantidade_minima,
                "Custo unitário": i.custo_unitario,
                Fornecedor: i.fornecedor,
              }))}
            />
          </div>

          <div className="overflow-x-auto rounded-card border border-border bg-panel">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted">
                  <th className="px-4 py-3">Insumo</th>
                  <th className="px-4 py-3">Material/Cor</th>
                  <th className="px-4 py-3 text-right">Estoque</th>
                  <th className="px-4 py-3">Movimentar</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {lista.map((i) => {
                  const baixo = i.quantidade_estoque <= i.quantidade_minima;
                  const registrarWithId = registrarMovimentacao.bind(null, i.id);
                  const deleteWithId = deleteInsumo.bind(null, i.id);
                  return (
                    <tr key={i.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium text-text">{i.nome}</p>
                        <p className="text-xs text-muted">{i.tipo}</p>
                      </td>
                      <td className="px-4 py-3 text-muted">{[i.material, i.cor].filter(Boolean).join(" / ") || "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-medium text-text">
                          {i.quantidade_estoque} {i.unidade}
                        </span>
                        {baixo && (
                          <div className="mt-1">
                            <Badge tone="danger">estoque baixo</Badge>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <form action={registrarWithId} className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Select name="tipo" className="w-28" defaultValue="Entrada">
                              <option>Entrada</option>
                              <option>Saída</option>
                            </Select>
                            <Input name="quantidade" type="number" step="0.01" className="w-24" placeholder="qtd" />
                            <Button type="submit" variant="secondary" className="whitespace-nowrap">
                              Registrar
                            </Button>
                          </div>
                          <label className="flex items-center gap-1.5 text-xs text-muted">
                            <input type="checkbox" name="registrar_despesa" defaultChecked className="h-3.5 w-3.5" />
                            Lançar como despesa (compra)
                          </label>
                        </form>
                      </td>
                      <td className="px-4 py-3">
                        <RowActions
                          editHref={`/estoque/${i.id}`}
                          deleteAction={deleteWithId}
                          confirmText={`Excluir o insumo "${i.nome}"?`}
                        />
                      </td>
                    </tr>
                  );
                })}
                {lista.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted">
                      Nenhum insumo cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Card>
            <CardTitle>Últimas movimentações</CardTitle>
            <ul className="space-y-2 text-sm">
              {(movimentacoes ?? []).map((m) => (
                <li key={m.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                  <span>
                    {m.tipo === "Entrada" ? "↑" : "↓"} {m.insumos?.nome} · {m.quantidade} · {m.motivo}
                  </span>
                  <span className="text-xs text-muted">{formatDateTime(m.data)}</span>
                </li>
              ))}
              {(movimentacoes ?? []).length === 0 && <p className="text-muted">Nenhuma movimentação ainda.</p>}
            </ul>
          </Card>
        </div>

        <Card>
          <CardTitle>Novo insumo</CardTitle>
          <form action={createInsumo} className="space-y-4">
            <FieldGroup>
              <Label htmlFor="nome" required>
                Nome
              </Label>
              <Input id="nome" name="nome" placeholder="Ex.: Filamento PLA Preto" required />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="tipo">Tipo</Label>
              <Select id="tipo" name="tipo" defaultValue="Filamento">
                <option>Filamento</option>
                <option>Embalagem</option>
                <option>Outro</option>
              </Select>
            </FieldGroup>
            <div className="grid grid-cols-2 gap-3">
              <FieldGroup className="mb-0">
                <Label htmlFor="material">Material</Label>
                <Input id="material" name="material" placeholder="PLA" />
              </FieldGroup>
              <FieldGroup className="mb-0">
                <Label htmlFor="cor">Cor</Label>
                <Input id="cor" name="cor" />
              </FieldGroup>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FieldGroup className="mb-0">
                <Label htmlFor="quantidade_estoque">Qtd em estoque</Label>
                <Input id="quantidade_estoque" name="quantidade_estoque" type="number" step="0.01" defaultValue={0} />
              </FieldGroup>
              <FieldGroup className="mb-0">
                <Label htmlFor="unidade">Unidade</Label>
                <Select id="unidade" name="unidade" defaultValue="g">
                  <option value="g">gramas</option>
                  <option value="kg">kg</option>
                  <option value="un">unidade</option>
                </Select>
              </FieldGroup>
            </div>
            <FieldGroup>
              <Label htmlFor="quantidade_minima">Qtd mínima (alerta)</Label>
              <Input id="quantidade_minima" name="quantidade_minima" type="number" step="0.01" defaultValue={0} />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="custo_unitario">Custo unitário (R$)</Label>
              <Input id="custo_unitario" name="custo_unitario" type="number" step="0.01" defaultValue={0} />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="fornecedor">Fornecedor</Label>
              <Input id="fornecedor" name="fornecedor" />
            </FieldGroup>
            <Button type="submit" className="w-full">
              Cadastrar insumo
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
