"use client";

import { useState } from "react";
import { ComboBox } from "@/components/ComboBox";

export function ClienteCombo({
  clientes,
  defaultValue = "",
}: {
  clientes: { id: number; nome: string }[];
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <ComboBox
      name="cliente_id"
      required
      value={value}
      onChange={setValue}
      placeholder="Buscar cliente..."
      options={clientes.map((c) => ({ value: String(c.id), label: c.nome }))}
    />
  );
}
