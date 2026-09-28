"use client";

import * as XLSX from "xlsx";

// Gera e baixa um .xlsx a partir de uma lista de objetos simples (client-side, sem round-trip ao servidor).
export function exportarExcel(nomeArquivo: string, aba: string, linhas: Record<string, unknown>[]) {
  const planilha = XLSX.utils.json_to_sheet(linhas);
  const livro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(livro, planilha, aba);
  XLSX.writeFile(livro, `${nomeArquivo}.xlsx`);
}
