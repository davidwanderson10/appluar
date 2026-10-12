import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { FilterBar } from "@/components/FilterBar";
import { SortableHeader } from "@/components/SortableHeader";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ExportExcelButton } from "@/components/ExportExcelButton";
import { RowActions } from "@/components/RowActions";
import { formatBRL, formatDate } from "@/lib/format";
import { resolveSort } from "@/lib/sort";
import { deleteDespesa } from "./actions";

const SORT_FIELDS = ["id", "data", "categoria", "descricao", "forma_pagamento", "valor"] as const;

export default async function DespesasPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; inicio?: string; fim?: string; sort?: string; dir?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const sort = resolveSort(params.sort, params.dir, SORT_FIELDS, "data");

  let query = supabase.from("despesas").select("*").order(sort.field, { ascending: sort.ascending });
  if (params.categoria) query = query.eq("categoria", params.categoria);
  if (params.inicio) query = query.gte("data", params.inicio);
  if (params.fim) query = query.lte("data", params.fim);

  const { data: despesas } = await query;
  const lista = despesas ?? [];
  const total = lista.reduce((acc, d) => acc + Number(d.valor), 0);

  const th = (label: string, field: (typeof SORT_FIELDS)[number], align?: "right") => (
    <SortableHeader label={label} field={field} action="/despesas" params={params} align={align} />
  );

  const { data: categoriasData } = await supabase.from("despesas").select("categoria");
  const categorias = Array.from(new Set((categoriasData ?? []).map((c) => c.categoria))).sort();

  return (
    <div>
      <TopBar title="Despesas" />
      <div className="p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <FilterBar
            action="/despesas"
            values={params}
            fields={[
              { name: "inicio", label: "De", type: "date" },
              { name: "fim", label: "Até", type: "date" },
              { name: "categoria", label: "Categoria", options: categorias.map((c) => ({ value: c, label: c })) },
            ]}
          />
          <div className="flex gap-2">
            <ExportExcelButton
              nomeArquivo="despesas-luar-print"
              aba="Despesas"
              linhas={lista.map((d) => ({
                Data: d.data,
                Categoria: d.categoria,
                Descrição: d.descricao,
                Valor: d.valor,
                "Forma de pagamento": d.forma_pagamento,
                Observações: d.observacoes,
              }))}
            />
            <LinkButton href="/despesas/novo">+ Nova Despesa</LinkButton>
          </div>
        </div>

        <div className="mb-4 rounded-card border border-border bg-panel px-4 py-3 text-sm">
          <span className="text-muted">Total no filtro atual: </span>
          <span className="font-semibold text-text">{formatBRL(total)}</span>
        </div>

        <div className="overflow-x-auto rounded-card border border-border bg-panel">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted">
                <th className="px-4 py-3">{th("ID", "id")}</th>
                <th className="px-4 py-3">{th("Data", "data")}</th>
                <th className="px-4 py-3">{th("Categoria", "categoria")}</th>
                <th className="px-4 py-3">{th("Descrição", "descricao")}</th>
                <th className="px-4 py-3">{th("Pagamento", "forma_pagamento")}</th>
                <th className="px-4 py-3 text-right">{th("Valor", "valor", "right")}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((d) => {
                const deleteWithId = deleteDespesa.bind(null, d.id);
                return (
                  <tr key={d.id} className="border-b border-border last:border-0 hover:bg-border/20">
                    <td className="px-4 py-3 text-muted">#{d.id}</td>
                    <td className="px-4 py-3 text-muted">{formatDate(d.data)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={d.categoria === "Insumos" ? "neutral" : "accent"}>{d.categoria}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/despesas/${d.id}`} className="font-medium text-text hover:text-accent">
                        {d.descricao}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{d.forma_pagamento ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-medium text-text">{formatBRL(d.valor)}</td>
                    <td className="px-4 py-3">
                      <RowActions
                        editHref={`/despesas/${d.id}`}
                        deleteAction={deleteWithId}
                        confirmText={`Excluir a despesa "${d.descricao}"?`}
                      />
                    </td>
                  </tr>
                );
              })}
              {lista.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted">
                    Nenhuma despesa encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
