import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { FilterBar } from "@/components/FilterBar";
import { SortableHeader } from "@/components/SortableHeader";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ExportExcelButton } from "@/components/ExportExcelButton";
import { RowActions } from "@/components/RowActions";
import { resolveSort } from "@/lib/sort";
import { deleteCliente } from "./actions";

const SORT_FIELDS = ["id", "nome", "telefone", "cidade", "tipo", "categoria", "status"] as const;

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; erro?: string; sort?: string; dir?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const sort = resolveSort(params.sort, params.dir, SORT_FIELDS, "nome");

  let query = supabase.from("clientes").select("*").order(sort.field, { ascending: sort.ascending });
  if (params.q) query = query.ilike("nome", `%${params.q}%`);
  if (params.status) query = query.eq("status", params.status);

  const { data: clientes } = await query;
  const lista = clientes ?? [];

  const th = (label: string, field: (typeof SORT_FIELDS)[number], align?: "right") => (
    <SortableHeader label={label} field={field} action="/clientes" params={params} align={align} />
  );

  return (
    <div>
      <TopBar title="Clientes" />
      <div className="p-6">
        {params.erro && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {params.erro}
          </div>
        )}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <FilterBar
            action="/clientes"
            values={params}
            fields={[
              { name: "q", label: "Buscar por nome" },
              {
                name: "status",
                label: "Status",
                options: [
                  { value: "Ativo", label: "Ativo" },
                  { value: "Inativo", label: "Inativo" },
                ],
              },
            ]}
          />
          <div className="flex gap-2">
            <ExportExcelButton
              nomeArquivo="clientes-luar-print"
              aba="Clientes"
              linhas={lista.map((c) => ({
                ID: c.id,
                Nome: c.nome,
                Tipo: c.tipo,
                Documento: c.documento,
                Email: c.email,
                Telefone: c.telefone,
                Categoria: c.categoria,
                Cidade: c.cidade,
                UF: c.estado,
                Status: c.status,
              }))}
            />
            <LinkButton href="/clientes/novo">+ Novo Cliente</LinkButton>
          </div>
        </div>

        <div className="overflow-x-auto rounded-card border border-border bg-panel">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted">
                <th className="px-4 py-3">{th("ID", "id")}</th>
                <th className="px-4 py-3">{th("Nome", "nome")}</th>
                <th className="px-4 py-3">{th("Telefone", "telefone")}</th>
                <th className="px-4 py-3">{th("Cidade/UF", "cidade")}</th>
                <th className="px-4 py-3">{th("Tipo", "tipo")}</th>
                <th className="px-4 py-3">{th("Categoria", "categoria")}</th>
                <th className="px-4 py-3">{th("Status", "status")}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((c) => {
                const deleteWithId = deleteCliente.bind(null, c.id);
                return (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-border/20">
                    <td className="px-4 py-3 text-muted">#{c.id}</td>
                    <td className="px-4 py-3">
                      <Link href={`/clientes/${c.id}`} className="font-medium text-text hover:text-accent">
                        {c.nome}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{c.telefone ?? "—"}</td>
                    <td className="px-4 py-3 text-muted">
                      {c.cidade ? `${c.cidade}${c.estado ? "/" + c.estado : ""}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted">{c.tipo}</td>
                    <td className="px-4 py-3 text-muted">{c.categoria ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge tone={c.status === "Ativo" ? "accent" : "neutral"}>{c.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <RowActions
                        editHref={`/clientes/${c.id}`}
                        deleteAction={deleteWithId}
                        confirmText={`Excluir o cliente "${c.nome}"?`}
                      />
                    </td>
                  </tr>
                );
              })}
              {lista.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted">
                    Nenhum cliente encontrado.
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
