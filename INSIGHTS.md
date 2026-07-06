# Insights — Despesas das Capitais (Siconfi/FINBRA, 2020–2025)

Análise das despesas por função das 26 capitais brasileiras, com foco na
diferença entre o que foi **empenhado** (reservado) e o que foi **pago** (a
*Taxa de Execução* = pago ÷ empenhado). O recorte central é **Maceió**, sempre
comparada com as demais capitais.

> **Nota de método:** 2025 está incompleto (11 de 26 capitais entregaram os
> dados), por isso é excluído das séries temporais e de qualquer ranking. Todas
> as comparações entre capitais usam gasto **per capita** (valor ÷ população),
> para não penalizar/beneficiar capitais por tamanho.

---

## 1. Maceió é forte na Saúde, mas fica para trás na Educação

Em 2024, Maceió pagou **R$ 1.314/hab** em Saúde (13ª de 26 capitais, na mediana)
e executou **97,4%** do que empenhou. Já em Educação, pagou apenas **R$ 715/hab**
— **25ª de 26**, à frente só de Belém — e a execução caiu para **85,5%**.

**Hipótese:** não é uma limitação geral de caixa, e sim uma **priorização**: a
Saúde é bem financiada e executada; a Educação recebe menos e ainda deixa mais
recurso pelo caminho.

**Implicação:** a Educação de Maceió é a área com maior espaço de melhoria — tanto
em volume de investimento quanto em capacidade de executar o orçamento.

## 2. A execução de Maceió na Habitação é errática — e colapsou em 2021

Em 2021, Maceió empenhou **R$ 929 mil** em Habitação e pagou **R$ 305** — uma
execução de **0,03%**, contra uma média de **78,6%** das capitais. Quase todo o
valor virou restos a pagar. E o padrão não é estável: a execução saltou de 30%
(2020) para 0% (2021), 99% (2022), 86% (2023) e 30% (2024).

**Hipótese:** o problema é de **planejamento/gestão** dessa área específica (obras
que não saem do papel), não de escassez — afinal, na Saúde a execução é constante
em ~97%.

**Implicação:** a imprevisibilidade da Habitação sugere fragilidade na capacidade
de levar projetos habitacionais até o pagamento.

## 3. As regiões mais pobres executam melhor — mas gastam menos

Agrupando as capitais por região (2024), as do **Norte (96%)** e **Nordeste (94%)**
executam, em média, uma proporção **maior** do orçamento que as do **Sudeste (92%)**
e **Sul (91%)**. Ao mesmo tempo, gastam bem menos por habitante: em Saúde, o
Sudeste paga **R$ 1.614/hab** contra **R$ 962/hab** no Norte.

**Hipótese:** com menos recurso, as capitais do Norte/Nordeste empenham de forma
mais conservadora e conseguem pagar quase tudo; as mais ricas empenham com folga e
deixam mais em restos a pagar.

**Implicação:** **executar bem o orçamento não é o mesmo que ter recurso.** Alta
execução é um bom sinal de gestão, mas precisa ser lida junto do volume gasto.

## 4. No geral, Maceió executa abaixo dos vizinhos de região

Somando todas as funções em 2024, Maceió tem taxa de execução de **92,4%** —
**18ª de 26**, abaixo da mediana (94,1%). Como o Nordeste executa 93,9% em média,
**Maceió puxa a média da própria região para baixo**. O topo é Belém (98,4%); o
fim, Natal (86,4%).

**Implicação:** há margem para Maceió se aproximar do desempenho de execução das
capitais nordestinas de referência.

## 5. Na Saúde, o gasto de Maceió se concentra no hospitalar

Dentro da Saúde de Maceió (2024), **86% do gasto** vai para duas subfunções:
**Assistência Hospitalar e Ambulatorial (58,5%)** e **Atenção Básica (27,5%)**.

**Hipótese:** o município prioriza média/alta complexidade sobre a atenção
primária — o oposto da lógica de "porta de entrada" do SUS.

**Implicação:** vale investigar se a baixa fatia da Atenção Básica reflete escolha
de política ou subfinanciamento da rede primária.

---

## Nota de qualidade dos dados

Durante o tratamento, algumas verificações formais (em `src/validar.py`):

- **26 capitais** em 2020–2024; **apenas 11 em 2025** (incompleto).
- **0 contas** fora dos padrões esperados de função/subfunção/agregado.
- **114 valores negativos**, todos em *Inscrição de Restos a Pagar* — são
  cancelamentos de restos de anos anteriores (ex.: Salvador cancelou ~R$ 228
  milhões em 2020). Não afetam a Taxa de Execução, que usa empenhado e pago.
- Agregados (`Despesas Exceto/Intra` e `FUxx - Demais Subfunções`) foram
  **classificados e excluídos** das somas por função, evitando contagem em dobro.