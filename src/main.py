"""Orquestrador do pipeline: Extrair -> Transformar -> Validar -> Persistir.

Ponto de entrada oficial do projeto. Rode este arquivo para reproduzir todo o
processo do zero, partindo de dados_compactos/.
"""

import logging

from extrair import descompactar_todos
from transformar import consolidar_anos
from validar import validar
from persistir import salvar_parquet

logger = logging.getLogger(__name__)


def rodar_pipeline() -> None:
    logger.info("========== Iniciando pipeline ==========")
    
    descompactar_todos()

    df = consolidar_anos()

    validar(df)

    salvar_parquet(df)

    logger.info("========== Pipeline concluido ==========")


if __name__ == "__main__":
    rodar_pipeline()