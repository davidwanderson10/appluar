-- Luar Print · perdas de produção (peça descolou, falha de impressão, etc.)
-- Vinculada a um pedido (e opcionalmente a um item), pra refletir o custo real do pedido
-- quando uma impressão falha e precisa ser refeita. Gera uma despesa automática
-- (categoria "Perdas de produção") pra entrar no relatório mensal, igual já acontece
-- com compra de insumo em Estoque.

create table perdas_producao (
  id bigint generated always as identity primary key,
  pedido_id bigint not null references pedidos(id) on delete cascade,
  item_pedido_id bigint references itens_pedido(id) on delete set null,
  data date not null default current_date,
  percentual_concluido numeric,
  descricao text not null,
  valor numeric not null default 0,
  despesa_id bigint references despesas(id) on delete set null,
  observacoes text,
  created_at timestamptz not null default now()
);

alter table perdas_producao enable row level security;

create policy "authenticated full access" on perdas_producao for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
