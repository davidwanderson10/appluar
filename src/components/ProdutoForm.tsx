"use client";

import { useState } from "react";
import Image from "next/image";
import { Input, Select, Textarea, Label, FieldGroup } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { calcularResultado, vendaPorLucro, vendaPorMargem } from "@/lib/calculations";
import type { Produto } from "@/types/database";

const CATEGORIAS = [
  "Personalizado",
  "Mascote de time",
  "Religioso",
  "Pokémon",
  "Gamer",
  "Maternidade",
  "Decoração",
  "Acessórios",
  "Outro",
];

export function ProdutoForm({
  produto,
  action,
}: {
  produto?: Produto;
  action: (formData: FormData) => void;
}) {
  const [custo, setCusto] = useState(produto?.custo ?? 0);
  const [precoVenda, setPrecoVenda] = useState(produto?.preco_venda ?? 0);

  const resultado = calcularResultado(custo, precoVenda);

  function onLucroChange(lucro: number) {
    setPrecoVenda(Number(vendaPorLucro(custo, lucro).toFixed(2)));
  }

  function onMargemChange(margemPct: number) {
    setPrecoVenda(Number(vendaPorMargem(custo, margemPct / 100).toFixed(2)));
  }

  return (
    <form action={action} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldGroup className="sm:col-span-2">
          <Label htmlFor="nome" required>
            Nome do produto
          </Label>
          <Input id="nome" name="nome" defaultValue={produto?.nome} required />
        </FieldGroup>

        <FieldGroup className="sm:col-span-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea id="descricao" name="descricao" rows={2} defaultValue={produto?.descricao ?? ""} />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="categoria">Categoria</Label>
          <Select id="categoria" name="categoria" defaultValue={produto?.categoria ?? ""}>
            <option value="">Selecione...</option>
            {CATEGORIAS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="material">Material</Label>
          <Input id="material" name="material" placeholder="PLA, PETG, Resina..." defaultValue={produto?.material ?? ""} />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="cor">Cor padrão</Label>
          <Input id="cor" name="cor" defaultValue={produto?.cor ?? ""} />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="foto">Foto</Label>
          <Input id="foto" name="foto" type="file" accept="image/*" />
          {produto?.foto_url && (
            <Image
              src={produto.foto_url}
              alt={produto.nome}
              width={96}
              height={96}
              className="mt-2 rounded-lg border border-border object-cover"
            />
          )}
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="tempo_impressao_h">Tempo de impressão (h)</Label>
          <Input id="tempo_impressao_h" name="tempo_impressao_h" type="number" step="0.1" defaultValue={produto?.tempo_impressao_h ?? ""} />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="consumo_filamento_g">Consumo de filamento (g)</Label>
          <Input id="consumo_filamento_g" name="consumo_filamento_g" type="number" step="1" defaultValue={produto?.consumo_filamento_g ?? ""} />
        </FieldGroup>
      </div>

      <div className="rounded-lg border border-border p-4">
        <p className="mb-3 text-sm font-semibold text-text">Custo e preço</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <FieldGroup className="mb-0">
            <Label htmlFor="custo">Custo (R$)</Label>
            <Input
              id="custo"
              name="custo"
              type="number"
              step="0.01"
              value={custo}
              onChange={(e) => setCusto(Number(e.target.value) || 0)}
            />
          </FieldGroup>
          <FieldGroup className="mb-0">
            <Label htmlFor="preco_venda">Preço de venda (R$)</Label>
            <Input
              id="preco_venda"
              name="preco_venda"
              type="number"
              step="0.01"
              value={precoVenda}
              onChange={(e) => setPrecoVenda(Number(e.target.value) || 0)}
            />
          </FieldGroup>
          <FieldGroup className="mb-0">
            <Label htmlFor="lucro_reais">Lucro (R$)</Label>
            <Input
              id="lucro_reais"
              type="number"
              step="0.01"
              value={resultado.lucro.toFixed(2)}
              onChange={(e) => onLucroChange(Number(e.target.value) || 0)}
            />
          </FieldGroup>
          <FieldGroup className="mb-0">
            <Label htmlFor="margem_pct">Margem (%)</Label>
            <Input
              id="margem_pct"
              type="number"
              step="0.1"
              value={(resultado.margemPct * 100).toFixed(1)}
              onChange={(e) => onMargemChange(Number(e.target.value) || 0)}
            />
          </FieldGroup>
        </div>
        <p className="mt-3 text-xs text-muted">Markup: {resultado.markup.toFixed(2)}x</p>
      </div>

      <FieldGroup className="flex items-center gap-2">
        <input id="ativo" name="ativo" type="checkbox" defaultChecked={produto?.ativo ?? true} className="h-4 w-4" />
        <Label htmlFor="ativo">Produto ativo (aparece na busca de pedidos)</Label>
      </FieldGroup>

      <Button type="submit">{produto ? "Salvar alterações" : "Cadastrar produto"}</Button>
    </form>
  );
}
