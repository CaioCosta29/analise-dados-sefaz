import logging
import zipfile

from config import DIR_COMPACTOS, DIR_EXTRAIDOS

logger = logging.getLogger(__name__)


def descompactar_todos() -> None:
    pastas_ano = []

    for pasta in DIR_COMPACTOS.iterdir():
        if pasta.is_dir():
            pastas_ano.append(pasta)

    pastas_ano.sort()
    
    logger.info(
        "Encontradas %d pastas de ano: %s",
        len(pastas_ano),
        [p.name for p in pastas_ano],
    )

    for pasta_ano in pastas_ano:
        ano = pasta_ano.name
        zips = list(pasta_ano.glob("*.zip"))

        if not zips:
            logger.warning("Nenhum .zip em %s — pulando.", pasta_ano.name)
            continue
        if len(zips) > 1:
            logger.warning(
                "%s tem %d zips; usando o primeiro: %s",
                pasta_ano.name, len(zips), zips[0].name,
            )

        zip_path = zips[0]
        destino = DIR_EXTRAIDOS / ano
        destino.mkdir(parents=True, exist_ok=True)

        with zipfile.ZipFile(zip_path, "r") as z:
            z.extractall(destino)
            logger.info(
                "%s: extraído %s (%d arquivo[s]) -> %s",
                ano, zip_path.name, len(z.namelist()), destino.name,
            )


if __name__ == "__main__":
    descompactar_todos()