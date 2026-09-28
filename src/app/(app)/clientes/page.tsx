import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { FilterBar } from "@/components/FilterBar";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ExportExcelButton } from "@/components/ExportExcelButton";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("clientes").select("*").order("nome");
  if (params.q) query = query.ilike("nome", `%${params.q}%`);
  if (params.status) query = query.eq("status", params.status);

  const { data: clientes } = await query;
  const lista = clientes ?? [];

  return (
    <div>
      <TopBar title="Clientes" />
      <div className="p-6">
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
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3">Cidade/UF</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-border/20">
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
                </tr>
              ))}
              {lista.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted">
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
