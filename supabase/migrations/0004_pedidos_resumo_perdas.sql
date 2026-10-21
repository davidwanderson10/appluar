-- Luar Print · pedidos_resumo passa a descontar perdas de produção do lucro.
-- Reescrita usando subqueries agregadas antes do join (em vez de juntar itens_pedido e
-- perdas_producao direto na mesma query), senão o join dos dois ao mesmo tempo multiplica
-- as linhas (fan-out) e infla as somas.

create or replace view pedidos_resumo as
select
  p.*,
  c.nome as cliente_nome,
  coalesce(itens.venda_total, 0) as venda_total,
  coalesce(itens.custo_total, 0) as custo_total,
  coalesce(itens.venda_total, 0) - coalesce(itens.custo_total, 0) as lucro_total,
  coalesce(itens.qtd_itens, 0) as qtd_itens,
  coalesce(perdas.perdas_total, 0) as perdas_total,
  coalesce(itens.venda_total, 0) - coalesce(itens.custo_total, 0) - coalesce(perdas.perdas_total, 0) as lucro_real
from pedidos p
join clientes c on c.id = p.cliente_id
left join (
  select
    pedido_id,
    sum(quantidade * valor_unitario) as venda_total,
    sum(quantidade * custo_unitario) as custo_total,
    count(id) as qtd_itens
  from itens_pedido
  group by pedido_id
) itens on itens.pedido_id = p.id
left join (
  select pedido_id, sum(valor) as perdas_total
  from perdas_producao
  group by pedido_id
) perdas on perdas.pedido_id = p.id;
