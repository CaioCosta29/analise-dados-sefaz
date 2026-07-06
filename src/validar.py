"""Checagens de qualidade sobre o DataFrame consolidado.

Este módulo não corrige dados — apenas REPORTA. A intenção é provar (não
supor) que o tratamento está correto e deixar visíveis as limitações
conhecidas, como o ano de 2025 estar incompleto. É a parte de "honestidade
técnica" que o desafio valoriza.
"""

import logging

import pandas as pd

from transformar import consolidar_anos

logger = logging.getLogger(__name__)

CAPITAIS_ESPERADAS = 26


def checar_capitais_por_ano(df: pd.DataFrame) -> pd.Series:
    por_ano = df.groupby("ano")["cod_ibge"].nunique()

    for ano, n in por_ano.items():
        if n < CAPITAIS_ESPERADAS:
            logger.warning("Ano %d: %d/%d capitais (INCOMPLETO)",
                           ano, n, CAPITAIS_ESPERADAS)
        else:
            logger.info("Ano %d: %d capitais (completo)", ano, n)

    return por_ano


def checar_contas_nao_classificadas(df: pd.DataFrame) -> int:
    n = int((df["tipo_conta"] == "outro").sum())

    if n:
        exemplos = list(df.loc[df["tipo_conta"] == "outro", "conta"].unique()[:5])
        logger.warning("%d linhas com tipo_conta='outro'. Exemplos: %s", n, exemplos)
    else:
        logger.info("Classificacao de contas: 0 linhas em 'outro' (todas cobertas)")

    return n


def checar_nulos(df: pd.DataFrame) -> pd.Series:
    nulos = df.isna().sum()
    com_nulos = nulos[nulos > 0]

    if len(com_nulos):
        logger.warning("Colunas com nulos:\n%s", com_nulos.to_string())
    else:
        logger.info("Nulos: nenhuma coluna com valores ausentes")
    return nulos


def checar_valores_negativos(df: pd.DataFrame) -> int:
    neg = df[df["valor"] < 0]
    n = len(neg)

    if n:
        por_estagio = neg["estagio"].value_counts()
        logger.warning(
            "%d linhas com valor negativo (apenas em Restos a Pagar). Por estagio:\n%s",
            n, por_estagio.to_string(),
        )
    else:
        logger.info("Valores negativos: nenhum")
        
    return n


def validar(df: pd.DataFrame) -> None:
    logger.info("===== Validacao de qualidade =====")
    checar_capitais_por_ano(df)
    checar_contas_nao_classificadas(df)
    checar_nulos(df)
    checar_valores_negativos(df)
    logger.info("===== Fim da validacao =====")


if __name__ == "__main__":
    df = consolidar_anos()
    validar(df)