"use client";

import { Input } from "@/components/ui/Field";

// Entrada de duração em HH:MM, convertida internamente pra horas decimais
// (é o que as fórmulas de custo de energia/mão de obra usam, ex.: R$/kWh × horas).
export function DurationHoursInput({
  value,
  onChange,
  name,
}: {
  value: number;
  onChange: (horasDecimais: number) => void;
  name?: string;
}) {
  const totalMinutos = Math.max(0, Math.round((value || 0) * 60));
  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;

  function atualizar(novasHoras: number, novosMinutos: number) {
    const h = Math.max(0, novasHoras);
    const m = Math.min(59, Math.max(0, novosMinutos));
    onChange(h + m / 60);
  }

  return (
    <div className="flex items-center gap-2">
      {name && <input type="hidden" name={name} value={horas + minutos / 60} />}
      <Input
        type="number"
        min={0}
        step="1"
        value={horas}
        onChange={(e) => atualizar(Number(e.target.value) || 0, minutos)}
        className="w-20"
        aria-label="Horas"
      />
      <span className="text-sm text-muted">h</span>
      <Input
        type="number"
        min={0}
        max={59}
        step="1"
        value={minutos}
        onChange={(e) => atualizar(horas, Number(e.target.value) || 0)}
        className="w-20"
        aria-label="Minutos"
      />
      <span className="text-sm text-muted">min</span>
    </div>
  );
}
