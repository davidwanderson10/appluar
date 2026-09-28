import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { FilterBar } from "@/components/FilterBar";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ExportExcelButton } from "@/components/ExportExcelButton";
import { formatBRL, formatDate } from "@/lib/format";

export default async function DespesasPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; inicio?: string; fim?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("despesas").select("*").order("data", { ascending: false });
  if (params.categoria) query = query.eq("categoria", params.categoria);
  if (params.inicio) query = query.gte("data", params.inicio);
  if (params.fim) query = query.lte("data", params.fim);

  const { data: despesas } = await query;
  const lista = despesas ?? [];
  const total = lista.reduce((acc, d) => acc + Number(d.valor), 0);

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
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3">Pagamento</th>
                <th className="px-4 py-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((d) => (
                <tr key={d.id} className="border-b border-border last:border-0 hover:bg-border/20">
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
                </tr>
              ))}
              {lista.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">
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
