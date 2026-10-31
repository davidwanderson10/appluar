import fs from "fs";
import PDFDocument from "pdfkit";
import { formatBRL, formatDate } from "@/lib/format";

// Dados de contato replicados do site luarprint.com.br (index.html, seção Contato/Redes).
const CONTATO = {
  cidade: "Fortaleza / CE",
  telefone: "(85) 99188-2209",
  whatsapp: "wa.me/5585991882209",
  email: "luarprint3d@gmail.com",
  instagram: "@luarprint",
};

// Paleta oficial (css/styles.css: --brand-navy / --brand-orange).
const ACCENT = "#e1601c";
const TEXT = "#16264a";
const MUTED = "#4a5878";
const BORDER = "#e2e7f1";

const MARGIN = 40;
const PAGE_WIDTH = 595.28; // A4 em pt

export interface OrcamentoPdfData {
  id: number;
  data: string;
  validade: string | null;
  cliente: { nome: string; telefone: string | null; email: string | null };
  itens: { nome: string; quantidade: number; valorUnitario: number; fotoBuffer?: Buffer | null }[];
  vendaTotal: number;
}

export function gerarOrcamentoPdf(orcamento: OrcamentoPdfData, logoPath: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: MARGIN });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const contentWidth = PAGE_WIDTH - MARGIN * 2;

    // Cabeçalho: logo à esquerda, dados do orçamento à direita
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, MARGIN, MARGIN, { width: 120 });
    }
    doc
      .fontSize(9)
      .fillColor(MUTED)
      .text("Onde ideias ganham forma", MARGIN, MARGIN + 62);

    doc
      .fontSize(14)
      .fillColor(TEXT)
      .text(`Orçamento Nº ${orcamento.id}`, MARGIN, MARGIN, { width: contentWidth, align: "right" });
    doc
      .fontSize(9)
      .fillColor(MUTED)
      .text(`Data: ${formatDate(orcamento.data)}`, { width: contentWidth, align: "right" });
    if (orcamento.validade) {
      doc.text(`Válido até: ${formatDate(orcamento.validade)}`, { width: contentWidth, align: "right" });
    }

    let y = MARGIN + 100;

    // Bloco do cliente
    doc.roundedRect(MARGIN, y, contentWidth, 60, 6).strokeColor(BORDER).stroke();
    doc
      .fontSize(8)
      .fillColor(MUTED)
      .text("CLIENTE", MARGIN + 12, y + 10);
    doc
      .fontSize(11)
      .fillColor(TEXT)
      .text(orcamento.cliente.nome, MARGIN + 12, y + 24);
    const contatoCliente = [orcamento.cliente.telefone, orcamento.cliente.email].filter(Boolean).join("  ·  ");
    if (contatoCliente) {
      doc.fontSize(9).fillColor(MUTED).text(contatoCliente, MARGIN + 12, y + 42);
    }

    y += 84;

    // Cabeçalho da tabela de itens
    const colItem = MARGIN;
    const colQtd = MARGIN + contentWidth * 0.55;
    const colUnit = MARGIN + contentWidth * 0.7;
    const colTotal = MARGIN + contentWidth * 0.85;

    doc.fontSize(8).fillColor(MUTED);
    doc.text("ITEM", colItem, y, { width: colQtd - colItem });
    doc.text("QTD", colQtd, y, { width: colUnit - colQtd, align: "center" });
    doc.text("VALOR UNIT.", colUnit, y, { width: colTotal - colUnit, align: "right" });
    doc.text("TOTAL", colTotal, y, { width: MARGIN + contentWidth - colTotal, align: "right" });
    y += 14;
    doc.moveTo(MARGIN, y).lineTo(MARGIN + contentWidth, y).strokeColor(BORDER).stroke();
    y += 8;

    const THUMB = 32;
    for (const item of orcamento.itens) {
      const temFoto = item.fotoBuffer && item.fotoBuffer.length > 0;
      const linhaY = y;
      const textX = temFoto ? colItem + THUMB + 8 : colItem;

      if (temFoto) {
        try {
          doc.image(item.fotoBuffer as Buffer, colItem, linhaY, { fit: [THUMB, THUMB] });
        } catch {
          // imagem inválida/corrompida — ignora e segue sem a miniatura
        }
      }

      doc.fontSize(10).fillColor(TEXT).text(item.nome, textX, linhaY, { width: colQtd - textX });
      doc.text(String(item.quantidade), colQtd, linhaY, { width: colUnit - colQtd, align: "center" });
      doc.text(formatBRL(item.valorUnitario), colUnit, linhaY, { width: colTotal - colUnit, align: "right" });
      doc.text(formatBRL(item.valorUnitario * item.quantidade), colTotal, linhaY, {
        width: MARGIN + contentWidth - colTotal,
        align: "right",
      });

      y = linhaY + (temFoto ? THUMB + 10 : 20);
      doc.moveTo(MARGIN, y - 6).lineTo(MARGIN + contentWidth, y - 6).strokeColor(BORDER).stroke();
    }

    y += 16;
    doc.fontSize(10).fillColor(MUTED).text("Total do orçamento", MARGIN, y, { width: contentWidth - 140, align: "right" });
    doc
      .fontSize(16)
      .fillColor(ACCENT)
      .text(formatBRL(orcamento.vendaTotal), MARGIN + contentWidth - 140, y - 3, { width: 140, align: "right" });

    // Rodapé fixo próximo à base da página
    const footerY = doc.page.height - MARGIN - 20;
    doc.moveTo(MARGIN, footerY).lineTo(MARGIN + contentWidth, footerY).strokeColor(BORDER).stroke();
    doc
      .fontSize(8)
      .fillColor(MUTED)
      .text(
        `${CONTATO.cidade} · ${CONTATO.telefone} (${CONTATO.whatsapp}) · ${CONTATO.email}`,
        MARGIN,
        footerY + 8,
        { width: contentWidth * 0.7 }
      );
    doc.text(`Instagram ${CONTATO.instagram}`, MARGIN + contentWidth * 0.7, footerY + 8, {
      width: contentWidth * 0.3,
      align: "right",
    });

    doc.end();
  });
}
