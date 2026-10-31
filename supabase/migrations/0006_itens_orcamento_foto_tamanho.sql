-- Luar Print · permite escolher, por item, se a foto sai grande (~5cm) ou pequena (miniatura)
-- no PDF do orçamento — útil quando tem muitos itens e precisa economizar espaço.

alter table itens_orcamento add column foto_grande boolean not null default true;
