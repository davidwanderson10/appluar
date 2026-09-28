# Luar Print · Sistema de Gestão

Painel interno da Luar Print para controle de clientes, produtos, pedidos, orçamentos e estoque, substituindo a planilha de controle. Next.js (App Router) + Supabase (Postgres/Auth/Storage), pensado para ser hospedado em `app.luarprint.com.br`.

## Stack

- **Next.js 16** (App Router, Server Actions) + TypeScript + Tailwind CSS
- **Supabase**: banco Postgres, autenticação e Storage (fotos de produto)
- **pdfkit** para gerar o PDF do orçamento
- **xlsx** para exportar listas em Excel direto no navegador

Logo e paleta de cores (`src/app/globals.css`, `public/logo-*.png`) foram extraídos do repositório do site (`luar-print`) para manter a identidade visual consistente entre o site e o painel.

## 1. Criar o projeto no Supabase

1. Crie uma conta/projeto em [supabase.com](https://supabase.com) (região São Paulo, se disponível).
2. Em **SQL Editor**, cole e rode o conteúdo de `supabase/migrations/0001_init.sql` e depois `0002_despesas.sql`, nessa ordem. Isso cria todas as tabelas, as views de resumo, o bucket de Storage `produtos` e as políticas de RLS.
3. Em **Authentication → Users**, crie o usuário administrador (seu e-mail e uma senha) — é o único login do sistema por enquanto.
4. Em **Project Settings → API**, copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` (guarde em segredo; hoje não é usada em runtime, mas fica pronta para tarefas administrativas futuras)

## 2. Rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha com os valores do Supabase
npm run dev
```

Acesse `http://localhost:3000`, você será redirecionado para `/login`.

## 3. Deploy na Vercel

1. Importe o repositório do GitHub na [Vercel](https://vercel.com/new).
2. Configure as variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) em **Project Settings → Environment Variables**.
3. Deploy. Framework é detectado automaticamente como Next.js.

## 4. Apontar o domínio app.luarprint.com.br

1. Na Vercel: **Project Settings → Domains** → adicione `app.luarprint.com.br`.
2. A Vercel mostra um registro `CNAME` (algo como `cname.vercel-dns.com`) para o subdomínio `app`.
3. No Registro.br, no DNS do domínio `luarprint.com.br`, crie um registro `CNAME` com host `app` apontando para o valor que a Vercel indicou.
4. Aguarde a propagação (a Vercel confirma automaticamente e emite o certificado SSL).

## Estrutura do projeto

```
src/
  app/
    login/                 tela de login
    (app)/                 área autenticada (sidebar + topbar)
      dashboard/
      clientes/
      produtos/
      pedidos/
      orcamentos/           inclui geração de PDF em /orcamentos/[id]/pdf
      despesas/             gastos gerais (marketing, embalagem, anúncios...)
      estoque/
      calculadora/
      configuracoes/
  components/               componentes de UI e formulários compartilhados
  lib/
    supabase/                clientes Supabase (browser/server)
    calculations.ts           regras de margem/markup/lucro e a calculadora de precificação
    estoque.ts                baixa/estorno automático de insumos
    excel.ts                  exportação de listas para .xlsx
    pdf/                       documento do orçamento em PDF
supabase/migrations/
  0001_init.sql              schema principal
  0002_despesas.sql          tabela de despesas gerais
```

## Regras de negócio implementadas

- Margem = lucro / venda · Markup = lucro / custo · Lucro sempre disponível em R$ (não só %).
- Clientes e produtos nunca são apagados — apenas inativados — preservando o histórico de pedidos.
- Pedidos e orçamentos têm múltiplos itens, cada um vinculado a um produto cadastrado (com custo/preço pré-preenchidos) ou avulso.
- Ao criar um item de pedido vinculado a um produto com consumo de filamento cadastrado, o sistema tenta dar baixa automática no insumo de mesmo material/cor; ao remover o item, o estoque é estornado.
- Orçamentos podem ser convertidos em pedido com um clique (copia cliente e itens, também tentando a baixa de estoque).
- **Estoque/Insumos** é só para materiais de produção com controle de quantidade (filamento, embalagem etc.). **Despesas** é o livro-caixa geral (marketing, anúncios, fitas, adesivos, taxas...), sem controle de quantidade, só valor.
- Ao registrar uma "Entrada" de insumo no Estoque, o sistema lança automaticamente uma despesa (categoria "Insumos", valor = quantidade × custo unitário) — dá pra desmarcar a caixinha "Lançar como despesa" se for só um ajuste de contagem, não uma compra de verdade.
- O Dashboard soma as despesas do mesmo período filtrado e mostra o **Resultado (Faturamento − Despesas)**, além do detalhamento por categoria.
- Tema claro/escuro com a paleta da Luar Print, persistido no navegador.

## Próximos passos sugeridos

- Popular a categoria/material/cor a partir da planilha atual (pode ser feito via Table Editor do Supabase ou importação CSV).
- Cadastrar os insumos de filamento (material + cor) para a baixa automática de estoque funcionar nos pedidos.
