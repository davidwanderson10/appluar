import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { FilterBar } from "@/components/FilterBar";
import { LinkButton } from "@/components/ui/Button";
import { StatusOrcamentoBadge } from "@/components/ui/Badge";
import { ExportExcelButton } from "@/components/ExportExcelButton";
import { formatBRL, formatDate } from "@/lib/format";

const STATUS_OPTIONS = ["Enviado", "Aprovado", "Recusado", "Convertido"];

export default async function OrcamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("orcamentos_resumo").select("*").order("data", { ascending: false });
  if (params.status) query = query.eq("status", params.status);

  const { data: orcamentos } = await query;
  const lista = orcamentos ?? [];

  return (
    <div>
      <TopBar title="Orçamentos" />
      <div className="p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <FilterBar
            action="/orcamentos"
            values={params}
            fields={[{ name: "status", label: "Status", options: STATUS_OPTIONS.map((s) => ({ value: s, label: s })) }]}
          />
          <div className="flex gap-2">
            <ExportExcelButton
              nomeArquivo="orcamentos-luar-print"
              aba="Orçamentos"
              linhas={lista.map((o) => ({
                Nº: o.id,
                Cliente: o.cliente_nome,
                Data: o.data,
                Validade: o.validade,
                Status: o.status,
                "Valor total": o.venda_total,
              }))}
            />
            <LinkButton href="/orcamentos/novo">+ Novo Orçamento</LinkButton>
          </div>
        </div>

        <div className="overflow-x-auto rounded-card border border-border bg-panel">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted">
                <th className="px-4 py-3">Nº</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Validade</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-border/20">
                  <td className="px-4 py-3">
                    <Link href={`/orcamentos/${o.id}`} className="font-medium text-text hover:text-accent">
                      #{o.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">{o.cliente_nome}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(o.data)}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(o.validade)}</td>
                  <td className="px-4 py-3">
                    <StatusOrcamentoBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-text">{formatBRL(o.venda_total)}</td>
                </tr>
              ))}
              {lista.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted">
                    Nenhum orçamento encontrado.
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
