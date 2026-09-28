"use client";

import { useState } from "react";
import { ComboBox } from "@/components/ComboBox";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { ProdutoOpcao } from "@/components/PedidoItensEditor";

const AVULSO = "avulso";

export function AddItemPedidoForm({
  produtos,
  action,
}: {
  produtos: ProdutoOpcao[];
  action: (formData: FormData) => void;
}) {
  const [produtoId, setProdutoId] = useState("");
  const [nomeAvulso, setNomeAvulso] = useState("");
  const [material, setMaterial] = useState("");
  const [cor, setCor] = useState("");
  const [custo, setCusto] = useState(0);
  const [valor, setValor] = useState(0);

  const options = [
    { value: AVULSO, label: "+ Item novo (não cadastrado)" },
    ...produtos.map((p) => ({ value: String(p.id), label: p.nome })),
  ];

  function onSelect(v: string) {
    setProdutoId(v);
    if (v === AVULSO) return;
    const produto = produtos.find((p) => String(p.id) === v);
    if (!produto) return;
    setMaterial(produto.material ?? "");
    setCor(produto.cor ?? "");
    setCusto(produto.custo);
    setValor(produto.preco_venda);
  }

  const isAvulso = produtoId === AVULSO || produtoId === "";

  return (
    <form action={action} className="space-y-3 rounded-lg border border-dashed border-border p-4">
      <input type="hidden" name="produto_id" value={produtoId === AVULSO ? "" : produtoId} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Produto</label>
          <ComboBox options={options} value={produtoId} onChange={onSelect} placeholder="Escolher produto..." />
        </div>
        {isAvulso && (
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Nome do item</label>
            <Input name="nome_avulso" value={nomeAvulso} onChange={(e) => setNomeAvulso(e.target.value)} />
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Qtd</label>
          <Input name="quantidade" type="number" min={1} step="1" defaultValue={1} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Material</label>
          <Input name="material" value={material} onChange={(e) => setMaterial(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Cor</label>
          <Input name="cor" value={cor} onChange={(e) => setCor(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Custo unit.</label>
          <Input name="custo_unitario" type="number" step="0.01" value={custo} onChange={(e) => setCusto(Number(e.target.value) || 0)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Valor unit.</label>
          <Input name="valor_unitario" type="number" step="0.01" value={valor} onChange={(e) => setValor(Number(e.target.value) || 0)} />
        </div>
      </div>
      <Button type="submit" variant="secondary">
        + Adicionar item ao pedido
      </Button>
    </form>
  );
}
