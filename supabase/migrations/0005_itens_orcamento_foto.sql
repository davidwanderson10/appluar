-- Luar Print · foto por item de orçamento (ex.: render/foto da peça 3D pro cliente ver antes de aprovar).
-- Mesmo padrão de bucket já usado pra fotos de produto.

alter table itens_orcamento add column foto_url text;

insert into storage.buckets (id, name, public)
values ('orcamentos', 'orcamentos', true)
on conflict (id) do nothing;

create policy "leitura pública fotos de orçamento" on storage.objects for select
  using (bucket_id = 'orcamentos');
create policy "upload autenticado fotos de orçamento" on storage.objects for insert
  with check (bucket_id = 'orcamentos' and auth.role() = 'authenticated');
create policy "atualizar autenticado fotos de orçamento" on storage.objects for update
  using (bucket_id = 'orcamentos' and auth.role() = 'authenticated');
create policy "excluir autenticado fotos de orçamento" on storage.objects for delete
  using (bucket_id = 'orcamentos' and auth.role() = 'authenticated');
