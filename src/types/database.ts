export type StatusPedido =
  | "Aguardando"
  | "Em Impressão"
  | "Pós-Processamento"
  | "Pronto"
  | "Entregue"
  | "Cancelado";

export type StatusOrcamento = "Enviado" | "Aprovado" | "Recusado" | "Convertido";

export type StatusCliente = "Ativo" | "Inativo";

export type TipoCliente = "Pessoa Física" | "Pessoa Jurídica";

export type TipoInsumo = "Filamento" | "Embalagem" | "Outro";

export type TipoMovimentacao = "Entrada" | "Saída";

export interface Cliente {
  id: number;
  nome: string;
  documento: string | null;
  email: string | null;
  telefone: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  tipo: TipoCliente;
  categoria: string | null;
  status: StatusCliente;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Produto {
  id: number;
  nome: string;
  descricao: string | null;
  categoria: string | null;
  material: string | null;
  cor: string | null;
  tempo_impressao_h: number | null;
  consumo_filamento_g: number | null;
  custo: number;
  preco_venda: number;
  foto_url: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Pedido {
  id: number;
  cliente_id: number;
  data_pedido: string;
  prazo_entrega: string | null;
  data_entrega: string | null;
  status: StatusPedido;
  forma_pagamento: string | null;
  valor_pago: number;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItemPedido {
  id: number;
  pedido_id: number;
  produto_id: number | null;
  nome_avulso: string | null;
  quantidade: number;
  material: string | null;
  cor: string | null;
  custo_unitario: number;
  valor_unitario: number;
  insumo_id: number | null;
  quantidade_baixada: number | null;
  created_at: string;
}

export interface Orcamento {
  id: number;
  cliente_id: number;
  data: string;
  validade: string | null;
  status: StatusOrcamento;
  observacoes: string | null;
  pedido_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface ItemOrcamento {
  id: number;
  orcamento_id: number;
  produto_id: number | null;
  nome_avulso: string | null;
  quantidade: number;
  material: string | null;
  cor: string | null;
  custo_unitario: number;
  valor_unitario: number;
  created_at: string;
}

export interface ConfigPrecificacao {
  id: number;
  custo_filamento_kg: number;
  custo_energia_kwh: number;
  potencia_impressora_w: number;
  percentual_falha: number;
  custo_fixo_mensal: number;
  horas_trabalhadas_mes: number;
  mao_de_obra_hora: number;
  fator_overhead: number;
  margem_desejada_pct: number;
  custo_embalagem: number;
  updated_at: string;
}

export interface Insumo {
  id: number;
  nome: string;
  tipo: TipoInsumo;
  material: string | null;
  cor: string | null;
  unidade: string;
  quantidade_estoque: number;
  quantidade_minima: number;
  custo_unitario: number;
  fornecedor: string | null;
  created_at: string;
  updated_at: string;
}

export interface MovimentacaoEstoque {
  id: number;
  insumo_id: number;
  tipo: TipoMovimentacao;
  quantidade: number;
  motivo: string | null;
  pedido_id: number | null;
  data: string;
  observacao: string | null;
}
