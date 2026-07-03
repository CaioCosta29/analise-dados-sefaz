import logging
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)

RAIZ = Path(__file__).resolve().parent.parent

DIR_COMPACTOS = RAIZ / "dados_compactos"
DIR_EXTRAIDOS = RAIZ / "dados_extraidos"

DIR_PROCESSADO = RAIZ / "data" / "processed"
ARQ_PARQUET = DIR_PROCESSADO / "finbra_consolidado.parquet"