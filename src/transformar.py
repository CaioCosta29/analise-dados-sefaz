import logging
import re

import pandas as pd

from config import DIR_EXTRAIDOS

logger = logging.getLogger(__name__)

RENOMEAR_COLUNAS = {
    "Instituição": "instituicao",
    "Cod.IBGE": "cod_ibge",
    "UF": "uf",
    "População": "populacao",
    "Coluna": "estagio",       
    "Conta": "conta",
    "Identificador da Conta": "id_conta",
    "Valor": "valor",
}

def ler_csv_ano(caminho_csv, ano: int) -> pd.DataFrame:
    """Lê um finbra.csv (formato Siconfi) e devolve um DataFrame com a coluna 'ano'."""
    df = pd.read_csv(
        caminho_csv,
        sep=";",
        skiprows=3,
        encoding="latin-1",
        decimal=",",
    )
    df["ano"] = ano
    return df

def classificar_conta(conta: str) -> str:
    """Classifica um valor da coluna 'conta' em uma categoria.

    - agregado_total: 'Despesas Exceto/Intra...'  (totais — NÃO somar com funções)
    - agregado_demais_subfuncoes: 'FU10 - Demais Subfunções'
    - subfuncao: '10.301 - Atenção Básica'  (2 dígitos, ponto, 3 dígitos)
    - funcao: '10 - Saúde'                   (2 dígitos e espaço)
    """

    if not isinstance(conta, str):
        return "outro"
    if conta.startswith(("Despesas Exceto", "Despesas Intra")):
        return "agregado_total"
    if re.match(r"^FU\d{2} - ", conta):
        return "agregado_demais_subfuncoes"
    if re.match(r"^\d{2}\.\d{3} - ", conta):
        return "subfuncao"
    if re.match(r"^\d{2} - ", conta):
        return "funcao"
    return "outro"


def consolidar_anos() -> pd.DataFrame:
    pastas_ano = sorted(p for p in DIR_EXTRAIDOS.iterdir() if p.is_dir())

    dataframes = []
    for pasta_ano in pastas_ano:
        ano = int(pasta_ano.name)
        csvs = list(pasta_ano.glob("*.csv"))
        if not csvs:
            logger.warning("Nenhum CSV em %s — pulando.", pasta_ano.name)
            continue
        df_ano = ler_csv_ano(csvs[0], ano)
        logger.info("Ano %d: %d linhas lidas", ano, len(df_ano))
        dataframes.append(df_ano)

    df = pd.concat(dataframes, ignore_index=True)
    df = df.rename(columns=RENOMEAR_COLUNAS)
    df["tipo_conta"] = df["conta"].apply(classificar_conta)
    logger.info("Total consolidado: %d linhas", len(df))
    return df


if __name__ == "__main__":
    df = consolidar_anos()
    print("\n--- shape (linhas, colunas):", df.shape)
    print("\n--- colunas e tipos:")
    print(df.dtypes)
    print("\n--- tipo_conta (contagem):")
    print(df["tipo_conta"].value_counts())
    print("\n--- capitais distintas por ano (repare no 2025):")
    print(df.groupby("ano")["cod_ibge"].nunique())