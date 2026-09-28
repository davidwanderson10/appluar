"use client";

import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input, Label, FieldGroup } from "@/components/ui/Field";
import { calcularPrecificacao, type ParametrosCalculadora } from "@/lib/calculations";
import { formatBRL } from "@/lib/format";

export function Calculadora({ parametrosIniciais }: { parametrosIniciais: ParametrosCalculadora }) {
  const [params, setParams] = useState(parametrosIniciais);
  const [tempoImpressaoH, setTempoImpressaoH] = useState(8);
  const [consumoFilamentoG, setConsumoFilamentoG] = useState(90);

  const resultado = calcularPrecificacao(params, { tempoImpressaoH, consumoFilamentoG });

  function set<K extends keyof ParametrosCalculadora>(key: K, value: number) {
    setParams((atual) => ({ ...atual, [key]: value }));
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardTitle>Sua peça</CardTitle>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup className="mb-0">
              <Label>Duração da impressão (h)</Label>
              <Input type="number" step="0.1" value={tempoImpressaoH} onChange={(e) => setTempoImpressaoH(Number(e.target.value) || 0)} />
            </FieldGroup>
            <FieldGroup className="mb-0">
              <Label>Filamento usado (g)</Label>
              <Input
                type="number"
                step="1"
                value={consumoFilamentoG}
                onChange={(e) => setConsumoFilamentoG(Number(e.target.value) || 0)}
              />
            </FieldGroup>
          </div>
        </Card>

        <Card>
          <CardTitle>Parâmetros (pré-preenchidos, edite se precisar)</CardTitle>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup className="mb-0">
              <Label>Filamento (R$/kg)</Label>
              <Input type="number" step="0.01" value={params.custoFilamentoKg} onChange={(e) => set("custoFilamentoKg", Number(e.target.value) || 0)} />
            </FieldGroup>
            <FieldGroup className="mb-0">
              <Label>Energia (R$/kWh)</Label>
              <Input type="number" step="0.01" value={params.custoEnergiaKwh} onChange={(e) => set("custoEnergiaKwh", Number(e.target.value) || 0)} />
            </FieldGroup>
            <FieldGroup className="mb-0">
              <Label>Potência da impressora (W)</Label>
              <Input type="number" step="1" value={params.potenciaImpressoraW} onChange={(e) => set("potenciaImpressoraW", Number(e.target.value) || 0)} />
            </FieldGroup>
            <FieldGroup className="mb-0">
              <Label>% Falha/desperdício</Label>
              <Input type="number" step="1" value={params.percentualFalha} onChange={(e) => set("percentualFalha", Number(e.target.value) || 0)} />
            </FieldGroup>
            <FieldGroup className="mb-0">
              <Label>Custo de embalagem (R$)</Label>
              <Input type="number" step="0.01" value={params.custoEmbalagem} onChange={(e) => set("custoEmbalagem", Number(e.target.value) || 0)} />
            </FieldGroup>
            <FieldGroup className="mb-0">
              <Label>Mão de obra (R$/h)</Label>
              <Input type="number" step="0.01" value={params.maoDeObraHora} onChange={(e) => set("maoDeObraHora", Number(e.target.value) || 0)} />
            </FieldGroup>
            <FieldGroup className="mb-0">
              <Label>Custo fixo mensal (R$)</Label>
              <Input type="number" step="0.01" value={params.custoFixoMensal} onChange={(e) => set("custoFixoMensal", Number(e.target.value) || 0)} />
            </FieldGroup>
            <FieldGroup className="mb-0">
              <Label>Horas trabalhadas/mês</Label>
              <Input type="number" step="1" value={params.horasTrabalhadasMes} onChange={(e) => set("horasTrabalhadasMes", Number(e.target.value) || 0)} />
            </FieldGroup>
            <FieldGroup className="mb-0">
              <Label>Fator de overhead</Label>
              <Input type="number" step="0.1" value={params.fatorOverhead} onChange={(e) => set("fatorOverhead", Number(e.target.value) || 0)} />
            </FieldGroup>
            <FieldGroup className="mb-0">
              <Label>Margem de lucro desejada (%)</Label>
              <Input type="number" step="1" value={params.margemDesejadaPct} onChange={(e) => set("margemDesejadaPct", Number(e.target.value) || 0)} />
              <p className="mt-1 text-xs text-muted">100% dobra o custo, 200% triplica, etc.</p>
            </FieldGroup>
          </div>
        </Card>
      </div>

      <Card>
        <CardTitle>Resultado</CardTitle>
        <div className="space-y-2 text-sm">
          <Linha label="Custo do filamento" valor={resultado.custoFilamento} />
          <Linha label="Custo de energia" valor={resultado.custoEnergia} />
          <Linha label="Custo fixo rateado" valor={resultado.custoFixoRateado} />
          <Linha label="Mão de obra" valor={resultado.custoMaoDeObra} />
          <Linha label="Embalagem" valor={resultado.custoEmbalagem} />
          <Linha label="Overhead" valor={resultado.overhead} />
          <div className="my-2 border-t border-border" />
          <Linha label="Custo total" valor={resultado.custoTotal} destaque />
          <Linha label="Lucro" valor={resultado.lucro} />
        </div>
        <div className="mt-4 rounded-lg bg-accent/10 p-4 text-center">
          <p className="text-xs text-muted">Preço sugerido</p>
          <p className="text-2xl font-semibold text-accent">{formatBRL(resultado.precoSugerido)}</p>
        </div>
      </Card>
    </div>
  );
}

function Linha({ label, valor, destaque }: { label: string; valor: number; destaque?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className={destaque ? "font-semibold text-text" : "text-text"}>{formatBRL(valor)}</span>
    </div>
  );
}
