import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { FilterBar } from "@/components/FilterBar";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ExportExcelButton } from "@/components/ExportExcelButton";
import { formatBRL, formatPercent } from "@/lib/format";
import { calcularResultado } from "@/lib/calculations";

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("produtos").select("*").order("nome");
  if (params.q) query = query.ilike("nome", `%${params.q}%`);
  if (params.categoria) query = query.eq("categoria", params.categoria);

  const { data: produtos } = await query;
  const lista = produtos ?? [];

  const { data: categoriasData } = await supabase.from("produtos").select("categoria").not("categoria", "is", null);
  const categorias = Array.from(new Set((categoriasData ?? []).map((c) => c.categoria))).sort();

  return (
    <div>
      <TopBar title="Produtos" />
      <div className="p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <FilterBar
            action="/produtos"
            values={params}
            fields={[
              { name: "q", label: "Buscar por nome" },
              { name: "categoria", label: "Categoria", options: categorias.map((c) => ({ value: c!, label: c! })) },
            ]}
          />
          <div className="flex gap-2">
            <ExportExcelButton
              nomeArquivo="produtos-luar-print"
              aba="Produtos"
              linhas={lista.map((p) => {
                const r = calcularResultado(p.custo, p.preco_venda);
                return {
                  ID: p.id,
                  Nome: p.nome,
                  Categoria: p.categoria,
                  Material: p.material,
                  Custo: p.custo,
                  "Preço de venda": p.preco_venda,
                  "Lucro (R$)": Number(r.lucro.toFixed(2)),
                  "Margem (%)": Number((r.margemPct * 100).toFixed(1)),
                  Ativo: p.ativo ? "Sim" : "Não",
                };
              })}
            />
            <LinkButton href="/produtos/novo">+ Novo Produto</LinkButton>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {lista.map((p) => {
            const r = calcularResultado(p.custo, p.preco_venda);
            return (
              <Link
                key={p.id}
                href={`/produtos/${p.id}`}
                className="overflow-hidden rounded-card border border-border bg-panel hover:border-accent"
              >
                <div className="flex h-36 items-center justify-center bg-border/20">
                  {p.foto_url ? (
                    <Image src={p.foto_url} alt={p.nome} width={200} height={144} className="h-36 w-full object-cover" />
                  ) : (
                    <span className="text-3xl">📦</span>
                  )}
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="font-medium text-text">{p.nome}</p>
                    {!p.ativo && <Badge tone="neutral">Inativo</Badge>}
                  </div>
                  <p className="text-xs text-muted">{p.categoria ?? "Sem categoria"}</p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-muted">Custo {formatBRL(p.custo)}</span>
                    <span className="font-medium text-text">{formatBRL(p.preco_venda)}</span>
                  </div>
                  <p className="mt-1 text-xs text-accent">Margem {formatPercent(r.margemPct)}</p>
                </div>
              </Link>
            );
          })}
          {lista.length === 0 && <p className="text-sm text-muted">Nenhum produto encontrado.</p>}
        </div>
      </div>
    </div>
  );
}
