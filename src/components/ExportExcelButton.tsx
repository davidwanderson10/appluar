"use client";

import { Button } from "@/components/ui/Button";
import { exportarExcel } from "@/lib/excel";

export function ExportExcelButton({
  nomeArquivo,
  aba,
  linhas,
}: {
  nomeArquivo: string;
  aba: string;
  linhas: Record<string, unknown>[];
}) {
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() => exportarExcel(nomeArquivo, aba, linhas)}
      disabled={linhas.length === 0}
    >
      Baixar Excel
    </Button>
  );
}
