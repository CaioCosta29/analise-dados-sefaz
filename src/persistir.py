import logging
from pathlib import Path
import pandas as pd

from config import DIR_PROCESSADO, ARQ_PARQUET

logger = logging.getLogger(__name__)


def salvar_parquet(df: pd.DataFrame) -> Path:
    """Salva o DataFrame consolidado em Parquet e retorna o caminho do arquivo."""

    DIR_PROCESSADO.mkdir(parents=True, exist_ok=True)
    df.to_parquet(ARQ_PARQUET, index=False)
    
    tamanho_kb = ARQ_PARQUET.stat().st_size / 1024
    logger.info("Parquet salvo: %s (%.1f KB)", ARQ_PARQUET, tamanho_kb)
    
    return ARQ_PARQUET


if __name__ == "__main__":
    from transformar import consolidar_anos
    df = consolidar_anos()
    salvar_parquet(df)