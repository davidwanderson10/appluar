-- Luar Print · schema inicial
-- Rodar no SQL Editor do Supabase (ou via `supabase db push`).

create extension if not exists "pgcrypto";

-- ========== CLIENTES ==========
create table clientes (
  id bigint generated always as identity primary key,
  nome text not null,
  documento text,
  email text,
  telefone text,
  cep text,
  logradouro text,
  numero text,
  complemento text,
  bairro text,
  cidade text,
  estado text,
  tipo text not null default 'Pessoa Física' check (tipo in ('Pessoa Física', 'Pessoa Jurídica')),
  categoria text default 'Regular',
  status text not null default 'Ativo' check (status in ('Ativo', 'Inativo')),
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========== PRODUTOS ==========
create table produtos (
  id bigint generated always as identity primary key,
  nome text not null,
  descricao text,
  categoria text,
  material text,
  cor text,
  tempo_impressao_h numeric,
  consumo_filamento_g numeric,
  custo numeric not null default 0,
  preco_venda numeric not null default 0,
  foto_url text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========== PEDIDOS ==========
create table pedidos (
  id bigint generated always as identity primary key,
  cliente_id bigint not null references clientes(id) on delete restrict,
  data_pedido date not null default current_date,
  prazo_entrega date,
  data_entrega date,
  status text not null default 'Aguardando' check (
    status in ('Aguardando', 'Em Impressão', 'Pós-Processamento', 'Pronto', 'Entregue', 'Cancelado')
  ),
  forma_pagamento text,
  valor_pago numeric not null default 0,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table itens_pedido (
  id bigint generated always as identity primary key,
  pedido_id bigint not null references pedidos(id) on delete cascade,
  produto_id bigint references produtos(id) on delete set null,
  nome_avulso text,
  quantidade numeric not null default 1,
  material text,
  cor text,
  custo_unitario numeric not null default 0,
  valor_unitario numeric not null default 0,
  insumo_id bigint,
  quantidade_baixada numeric,
  created_at timestamptz not null default now()
);

-- resumo financeiro de cada pedido, calculado a partir dos itens (sem denormalizar)
create view pedidos_resumo as
select
  p.*,
  c.nome as cliente_nome,
  coalesce(sum(i.quantidade * i.valor_unitario), 0) as venda_total,
  coalesce(sum(i.quantidade * i.custo_unitario), 0) as custo_total,
  coalesce(sum(i.quantidade * i.valor_unitario), 0) - coalesce(sum(i.quantidade * i.custo_unitario), 0) as lucro_total,
  count(i.id) as qtd_itens
from pedidos p
join clientes c on c.id = p.cliente_id
left join itens_pedido i on i.pedido_id = p.id
group by p.id, c.nome;

-- ========== ORÇAMENTOS ==========
create table orcamentos (
  id bigint generated always as identity primary key,
  cliente_id bigint not null references clientes(id) on delete restrict,
  data date not null default current_date,
  validade date,
  status text not null default 'Enviado' check (status in ('Enviado', 'Aprovado', 'Recusado', 'Convertido')),
  observacoes text,
  pedido_id bigint references pedidos(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table itens_orcamento (
  id bigint generated always as identity primary key,
  orcamento_id bigint not null references orcamentos(id) on delete cascade,
  produto_id bigint references produtos(id) on delete set null,
  nome_avulso text,
  quantidade numeric not null default 1,
  material text,
  cor text,
  custo_unitario numeric not null default 0,
  valor_unitario numeric not null default 0,
  created_at timestamptz not null default now()
);

create view orcamentos_resumo as
select
  o.*,
  c.nome as cliente_nome,
  coalesce(sum(i.quantidade * i.valor_unitario), 0) as venda_total,
  coalesce(sum(i.quantidade * i.custo_unitario), 0) as custo_total,
  coalesce(sum(i.quantidade * i.valor_unitario), 0) - coalesce(sum(i.quantidade * i.custo_unitario), 0) as lucro_total
from orcamentos o
join clientes c on c.id = o.cliente_id
left join itens_orcamento i on i.orcamento_id = o.id
group by o.id, c.nome;

-- ========== PRECIFICAÇÃO (parâmetros globais, uma única linha) ==========
create table config_precificacao (
  id bigint generated always as identity primary key,
  custo_filamento_kg numeric not null default 130,
  custo_energia_kwh numeric not null default 1.2,
  potencia_impressora_w numeric not null default 200,
  percentual_falha numeric not null default 0,
  custo_fixo_mensal numeric not null default 0,
  horas_trabalhadas_mes numeric not null default 0,
  mao_de_obra_hora numeric not null default 0,
  fator_overhead numeric not null default 1,
  margem_desejada_pct numeric not null default 100,
  custo_embalagem numeric not null default 0,
  updated_at timestamptz not null default now()
);

insert into config_precificacao (id) values (1);

-- ========== ESTOQUE ==========
create table insumos (
  id bigint generated always as identity primary key,
  nome text not null,
  tipo text not null default 'Filamento' check (tipo in ('Filamento', 'Embalagem', 'Outro')),
  material text,
  cor text,
  unidade text not null default 'g',
  quantidade_estoque numeric not null default 0,
  quantidade_minima numeric not null default 0,
  custo_unitario numeric not null default 0,
  fornecedor text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table movimentacoes_estoque (
  id bigint generated always as identity primary key,
  insumo_id bigint not null references insumos(id) on delete cascade,
  tipo text not null check (tipo in ('Entrada', 'Saída')),
  quantidade numeric not null,
  motivo text,
  pedido_id bigint references pedidos(id) on delete set null,
  data timestamptz not null default now(),
  observacao text
);

alter table itens_pedido
  add constraint itens_pedido_insumo_fk foreign key (insumo_id) references insumos(id) on delete set null;

-- ========== updated_at automático ==========
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_clientes_updated_at before update on clientes
  for each row execute function set_updated_at();
create trigger trg_produtos_updated_at before update on produtos
  for each row execute function set_updated_at();
create trigger trg_pedidos_updated_at before update on pedidos
  for each row execute function set_updated_at();
create trigger trg_orcamentos_updated_at before update on orcamentos
  for each row execute function set_updated_at();
create trigger trg_config_precificacao_updated_at before update on config_precificacao
  for each row execute function set_updated_at();
create trigger trg_insumos_updated_at before update on insumos
  for each row execute function set_updated_at();

-- ========== RLS: sistema interno, exige apenas usuário autenticado ==========
alter table clientes enable row level security;
alter table produtos enable row level security;
alter table pedidos enable row level security;
alter table itens_pedido enable row level security;
alter table orcamentos enable row level security;
alter table itens_orcamento enable row level security;
alter table config_precificacao enable row level security;
alter table insumos enable row level security;
alter table movimentacoes_estoque enable row level security;

create policy "authenticated full access" on clientes for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on produtos for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on pedidos for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on itens_pedido for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on orcamentos for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on itens_orcamento for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on config_precificacao for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on insumos for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on movimentacoes_estoque for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ========== STORAGE: fotos de produto ==========
insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', true)
on conflict (id) do nothing;

create policy "leitura pública fotos de produto" on storage.objects for select
  using (bucket_id = 'produtos');
create policy "upload autenticado fotos de produto" on storage.objects for insert
  with check (bucket_id = 'produtos' and auth.role() = 'authenticated');
create policy "atualizar autenticado fotos de produto" on storage.objects for update
  using (bucket_id = 'produtos' and auth.role() = 'authenticated');
create policy "excluir autenticado fotos de produto" on storage.objects for delete
  using (bucket_id = 'produtos' and auth.role() = 'authenticated');
