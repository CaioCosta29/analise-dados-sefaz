# Análise de Despesas das Capitais — Sefaz Maceió

Desafio técnico de Análise de Dados. Pipeline em **Python** que trata as
despesas por função das **26 capitais brasileiras** (Siconfi/FINBRA, 2020–2025)
e um **dashboard em Next.js** que explora os dados, com foco em **Maceió**.

🔗 **Demo:** https://analise-dados-sefaz.vercel.app  ·  📊 **Insights:** [INSIGHTS.md](INSIGHTS.md)

## O que o projeto faz

Seguindo os passos do desafio:

1. **Extrai** os ZIPs anuais do Siconfi.
2. **Consolida** os CSVs num único DataFrame (formato *long*).
3. **Persiste** em **Parquet** (formato colunar otimizado).
4. **Analisa** indicadores — execução orçamentária (pago ÷ empenhado), gasto
   per capita, rankings entre capitais, evolução temporal e subfunções.

## Estrutura

```
├── dados_compactos/       # ZIPs originais do Siconfi (versionado)
├── dados_extraidos/       # CSVs extraídos (gerado, gitignored)
├── data/processed/        # finbra_consolidado.parquet (gerado, gitignored)
├── src/                   # pipeline ETL
│   ├── config.py          # caminhos + logging centralizados
│   ├── extrair.py         # 1. descompacta os ZIPs por ano
│   ├── transformar.py     # 2. lê, consolida e classifica as contas
│   ├── persistir.py       # 3. salva em Parquet
│   ├── validar.py         # checagens de qualidade
│   └── main.py            # orquestra o pipeline completo
├── script/
│   └── gerar_dados_dashboard.py   # 4. Parquet -> JSONs do dashboard
├── notebooks/analise.ipynb        # análise exploratória
├── dashboard/             # app Next.js (App Router, Tailwind, Recharts)
│   └── public/data/*.json # dados estáticos consumidos pelo front (versionado)
├── INSIGHTS.md            # os 5 insights, com método e implicações
└── requirements.txt
```

## Como rodar

### Pipeline de dados (Python 3.13)

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

python src/main.py               # extrai -> consolida -> classifica -> Parquet
python script/gerar_dados_dashboard.py   # Parquet -> dashboard/public/data/*.json
```

### Dashboard (Node 18+)

```bash
cd dashboard
npm install
npm run dev                      # http://localhost:3000
```

> Os JSONs em `dashboard/public/data/` já vão versionados, então o dashboard
> roda (e faz deploy) sem precisar rodar o Python — só rode o pipeline se quiser
> regenerar os dados.

## Arquitetura e decisões

- **Parquet em formato *long*** (uma linha por ano × capital × conta × estágio).
  O *pivot* para *wide* acontece sob demanda na análise/exportação, nunca na
  consolidação.
- **Sem banco de dados nem API.** Os dados do Siconfi são fechados após
  processados; o pipeline gera **JSON estático** e o Next.js consome direto
  (SSG puro). Único elo Python ↔ front: `script/gerar_dados_dashboard.py`.
- **Três telas:** Visão Geral do período, **Raio-X de Maceió** e Comparador de
  Capitais (filtros Função · Ano · Métrica, client-side).
- **Logging** (não `print`) no pipeline; uma função = uma responsabilidade.

## Notas de método (qualidade dos dados)

- **26 capitais** completas em 2020–2024; **2025 tem só 11** — excluído de
  rankings, médias e séries.
- Comparações entre capitais usam **per capita** (evita penalizar/beneficiar por
  tamanho).
- Agregados (`Despesas Exceto/Intra`, `Demais Subfunções`) são classificados e
  **excluídos das somas por função**, evitando dupla contagem.
- Valores negativos existem apenas em *Restos a Pagar* (cancelamentos) e não
  afetam a taxa de execução.

## Stack

Python (pandas, pyarrow) · Next.js 16 (App Router) · TypeScript · Tailwind CSS ·
Recharts · deploy na Vercel.