// Regras de negócio de precificação usadas em Produtos, Pedidos, Orçamentos e na Calculadora.
// margem = lucro / venda · markup = lucro / custo (mesma fórmula da planilha original)

export interface ResultadoPrecificacao {
  lucro: number;
  margemPct: number;
  markup: number;
}

export function calcularResultado(custo: number, venda: number): ResultadoPrecificacao {
  const lucro = venda - custo;
  return {
    lucro,
    margemPct: venda > 0 ? lucro / venda : 0,
    markup: custo > 0 ? lucro / custo : 0,
  };
}

// Dado o custo e a margem % desejada, qual o preço de venda? (venda = custo / (1 - margem))
export function vendaPorMargem(custo: number, margemPct: number) {
  if (margemPct >= 1) return custo > 0 ? custo * 100 : 0;
  return custo / (1 - margemPct);
}

// Dado o custo e o lucro em R$ desejado, qual o preço de venda?
export function vendaPorLucro(custo: number, lucro: number) {
  return custo + lucro;
}

export interface ParametrosCalculadora {
  custoFilamentoKg: number;
  custoEnergiaKwh: number;
  potenciaImpressoraW: number;
  percentualFalha: number;
  custoFixoMensal: number;
  horasTrabalhadasMes: number;
  maoDeObraHora: number;
  fatorOverhead: number;
  custoEmbalagem: number;
  margemDesejadaPct: number;
}

export interface EntradaCalculadora {
  tempoImpressaoH: number;
  consumoFilamentoG: number;
}

export interface SaidaCalculadora {
  custoFilamento: number;
  custoEnergia: number;
  custoFixoRateado: number;
  custoMaoDeObra: number;
  custoEmbalagem: number;
  subtotal: number;
  overhead: number;
  custoTotal: number;
  precoSugerido: number;
  lucro: number;
}

export function calcularPrecificacao(
  params: ParametrosCalculadora,
  entrada: EntradaCalculadora
): SaidaCalculadora {
  const fatorFalha = 1 + params.percentualFalha / 100;

  const custoFilamento =
    (entrada.consumoFilamentoG / 1000) * params.custoFilamentoKg * fatorFalha;

  const custoEnergia =
    (params.potenciaImpressoraW / 1000) * entrada.tempoImpressaoH * params.custoEnergiaKwh;

  const custoFixoRateado =
    params.horasTrabalhadasMes > 0
      ? (params.custoFixoMensal / params.horasTrabalhadasMes) * entrada.tempoImpressaoH
      : 0;

  const custoMaoDeObra = params.maoDeObraHora * entrada.tempoImpressaoH;

  const custoEmbalagem = params.custoEmbalagem;

  const subtotal = custoFilamento + custoEnergia + custoFixoRateado + custoMaoDeObra + custoEmbalagem;

  const overhead = subtotal * Math.max(params.fatorOverhead - 1, 0);
  const custoTotal = subtotal + overhead;
  // "Margem de lucro desejada" aqui funciona como markup sobre o custo (ex.: 100% = dobra o
  // custo), igual à calculadora de precificação que a Luar Print já usa no dia a dia.
  // Usar a fórmula de margem-sobre-venda quebraria em 100% (preço tenderia a infinito).
  const precoSugerido = custoTotal * (1 + params.margemDesejadaPct / 100);
  const lucro = precoSugerido - custoTotal;

  return {
    custoFilamento,
    custoEnergia,
    custoFixoRateado,
    custoMaoDeObra,
    custoEmbalagem,
    subtotal,
    overhead,
    custoTotal,
    precoSugerido,
    lucro,
  };
}
