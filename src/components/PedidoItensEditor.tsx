"use client";

import { useMemo, useState } from "react";
import { ComboBox } from "@/components/ComboBox";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { calcularResultado } from "@/lib/calculations";
import { formatBRL, formatPercent } from "@/lib/format";

export interface ProdutoOpcao {
  id: number;
  nome: string;
  material: string | null;
  cor: string | null;
  custo: number;
  preco_venda: number;
}

export interface ItemPedidoInput {
  produto_id: number | null;
  nome_avulso: string;
  quantidade: number;
  material: string;
  cor: string;
  custo_unitario: number;
  valor_unitario: number;
}

const ITEM_VAZIO: ItemPedidoInput = {
  produto_id: null,
  nome_avulso: "",
  quantidade: 1,
  material: "",
  cor: "",
  custo_unitario: 0,
  valor_unitario: 0,
};

const AVULSO = "avulso";

export function PedidoItensEditor({
  produtos,
  itensIniciais,
}: {
  produtos: ProdutoOpcao[];
  itensIniciais?: ItemPedidoInput[];
}) {
  const [itens, setItens] = useState<ItemPedidoInput[]>(itensIniciais?.length ? itensIniciais : [ITEM_VAZIO]);

  const produtoOptions = useMemo(
    () => [
      { value: AVULSO, label: "+ Item novo (não cadastrado)" },
      ...produtos.map((p) => ({
        value: String(p.id),
        label: p.nome,
        hint: `Custo ${formatBRL(p.custo)} · Venda ${formatBRL(p.preco_venda)}`,
      })),
    ],
    [produtos]
  );

  function atualizarItem(index: number, patch: Partial<ItemPedidoInput>) {
    setItens((atual) => atual.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function selecionarProduto(index: number, valor: string) {
    if (valor === AVULSO) {
      atualizarItem(index, { produto_id: null });
      return;
    }
    const produto = produtos.find((p) => String(p.id) === valor);
    if (!produto) return;
    atualizarItem(index, {
      produto_id: produto.id,
      nome_avulso: "",
      material: produto.material ?? "",
      cor: produto.cor ?? "",
      custo_unitario: produto.custo,
      valor_unitario: produto.preco_venda,
    });
  }

  function adicionarLinha() {
    setItens((atual) => [...atual, ITEM_VAZIO]);
  }

  function removerLinha(index: number) {
    setItens((atual) => atual.filter((_, i) => i !== index));
  }

  const totais = itens.reduce(
    (acc, item) => {
      acc.custo += item.custo_unitario * item.quantidade;
      acc.venda += item.valor_unitario * item.quantidade;
      return acc;
    },
    { custo: 0, venda: 0 }
  );
  const resultado = calcularResultado(totais.custo, totais.venda);

  return (
    <div>
      <input type="hidden" name="itens_json" value={JSON.stringify(itens)} />

      <div className="space-y-4">
        {itens.map((item, index) => (
          <div key={index} className="rounded-lg border border-border p-4">
            <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Produto</label>
                <ComboBox
                  options={produtoOptions}
                  value={item.produto_id ? String(item.produto_id) : item.nome_avulso ? AVULSO : ""}
                  onChange={(v) => selecionarProduto(index, v)}
                  placeholder="Escolher produto..."
                />
              </div>
              {!item.produto_id && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">Nome do item</label>
                  <Input
                    value={item.nome_avulso}
                    onChange={(e) => atualizarItem(index, { nome_avulso: e.target.value })}
                    placeholder="Ex.: Mascote personalizado"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Qtd</label>
                <Input
                  type="number"
                  min={1}
                  step="1"
                  value={item.quantidade}
                  onChange={(e) => atualizarItem(index, { quantidade: Number(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Material</label>
                <Input value={item.material} onChange={(e) => atualizarItem(index, { material: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Cor</label>
                <Input value={item.cor} onChange={(e) => atualizarItem(index, { cor: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Custo unit.</label>
                <Input
                  type="number"
                  step="0.01"
                  value={item.custo_unitario}
                  onChange={(e) => atualizarItem(index, { custo_unitario: Number(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Valor unit.</label>
                <Input
                  type="number"
                  step="0.01"
                  value={item.valor_unitario}
                  onChange={(e) => atualizarItem(index, { valor_unitario: Number(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-end">
                <Button type="button" variant="danger" onClick={() => removerLinha(index)} disabled={itens.length === 1}>
                  Remover
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button type="button" variant="secondary" onClick={adicionarLinha} className="mt-3">
        + Adicionar item
      </Button>

      <div className="mt-5 grid grid-cols-2 gap-4 rounded-lg border border-border bg-border/10 p-4 text-sm sm:grid-cols-4">
        <div>
          <p className="text-muted">Custo total</p>
          <p className="font-semibold text-text">{formatBRL(totais.custo)}</p>
        </div>
        <div>
          <p className="text-muted">Valor total</p>
          <p className="font-semibold text-text">{formatBRL(totais.venda)}</p>
        </div>
        <div>
          <p className="text-muted">Lucro</p>
          <p className="font-semibold text-text">{formatBRL(resultado.lucro)}</p>
        </div>
        <div>
          <p className="text-muted">Margem / Markup</p>
          <p className="font-semibold text-text">
            {formatPercent(resultado.margemPct)} · {resultado.markup.toFixed(2)}x
          </p>
        </div>
      </div>
    </div>
  );
}
