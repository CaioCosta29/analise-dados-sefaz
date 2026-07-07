# Dashboard — Painel de Despesas Públicas

Interface Next.js (App Router) que visualiza os dados gerados pelo pipeline
(`../script/gerar_dados_dashboard.py`). Consome JSON estático de `public/data/` —
sem backend.

## Rodar

```bash
npm install
npm run dev      # http://localhost:3000
```

## Telas

- `/` — Visão Geral do período (KPIs + funções de maior peso)
- `/raio-x` — Raio-X de Maceió (desvios, insights validados, tabela, subfunções)
- `/comparador` — Comparador de Capitais (ranking empenhado × pago, evolução, região)

## Deploy (Vercel)

Importe o repositório e defina **Root Directory = `dashboard`**. O framework
(Next.js) é detectado automaticamente. Os dados são estáticos e já versionados.