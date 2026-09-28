import path from "path";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { gerarOrcamentoPdf } from "@/lib/pdf/orcamentoPdf";

export const runtime = "nodejs";

const LOGO_PATH = path.join(process.cwd(), "public", "logo-wide.png");

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: orcamento } = await supabase.from("orcamentos").select("*").eq("id", id).single();
  if (!orcamento) return new NextResponse("Orçamento não encontrado", { status: 404 });

  const [{ data: cliente }, { data: itens }] = await Promise.all([
    supabase.from("clientes").select("nome, telefone, email").eq("id", orcamento.cliente_id).single(),
    supabase.from("itens_orcamento").select("*").eq("orcamento_id", id),
  ]);

  const produtoIds = (itens ?? []).map((i) => i.produto_id).filter((v): v is number => v != null);
  const { data: produtos } = produtoIds.length
    ? await supabase.from("produtos").select("id, nome").in("id", produtoIds)
    : { data: [] as { id: number; nome: string }[] };
  const nomeProduto = new Map((produtos ?? []).map((p) => [p.id, p.nome]));

  const vendaTotal = (itens ?? []).reduce((acc, i) => acc + i.valor_unitario * i.quantidade, 0);

  const buffer = await gerarOrcamentoPdf(
    {
      id: orcamento.id,
      data: orcamento.data,
      validade: orcamento.validade,
      cliente: cliente ?? { nome: "Cliente", telefone: null, email: null },
      itens: (itens ?? []).map((i) => ({
        nome: i.nome_avulso ?? (i.produto_id ? nomeProduto.get(i.produto_id) : null) ?? "Item",
        quantidade: i.quantidade,
        valorUnitario: i.valor_unitario,
      })),
      vendaTotal,
    },
    LOGO_PATH
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="orcamento-${orcamento.id}-luar-print.pdf"`,
    },
  });
}
