-- Luar Print · despesas gerais (marketing, embalagens, anúncios, materiais diversos...)
-- Separado de "insumos" (que é controle de quantidade em estoque, ex.: filamento).

create table despesas (
  id bigint generated always as identity primary key,
  data date not null default current_date,
  categoria text not null default 'Outros',
  descricao text not null,
  valor numeric not null default 0,
  forma_pagamento text,
  insumo_id bigint references insumos(id) on delete set null,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_despesas_updated_at before update on despesas
  for each row execute function set_updated_at();

alter table despesas enable row level security;

create policy "authenticated full access" on despesas for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
