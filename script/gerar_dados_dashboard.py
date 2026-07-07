import json
import logging
from pathlib import Path

import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

RAIZ = Path(__file__).resolve().parent.parent
ARQ_PARQUET = RAIZ / "data" / "processed" / "finbra_consolidado.parquet"
DIR_SAIDA = RAIZ / "dashboard" / "public" / "data"

REGIAO = {
    **dict.fromkeys(["AC", "AP", "AM", "PA", "RO", "RR", "TO"], "Norte"),
    **dict.fromkeys(["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"], "Nordeste"),
    **dict.fromkeys(["DF", "GO", "MT", "MS"], "Centro-Oeste"),
    **dict.fromkeys(["ES", "MG", "RJ", "SP"], "Sudeste"),
    **dict.fromkeys(["PR", "RS", "SC"], "Sul"),
}
RENOMEAR_ESTAGIO = {
    "Despesas Empenhadas": "empenhado",
    "Despesas Pagas": "pago",
    "Inscrição de Restos a Pagar Não Processados": "restos_np",
}


def pivota(df: pd.DataFrame, tipo: str) -> pd.DataFrame:
    """Pivota as linhas de um tipo_conta ('funcao' ou 'subfuncao') para uma linha por (ano, capital, conta)."""
    d = df[df["tipo_conta"] == tipo]
    w = d.pivot_table(
        index=["ano", "cod_ibge", "instituicao", "uf", "populacao", "conta"],
        columns="estagio", values="valor", aggfunc="sum",
    ).reset_index()
    w = w.rename(columns=RENOMEAR_ESTAGIO)
    for c in ["empenhado", "pago", "restos_np"]:
        if c not in w.columns:
            w[c] = 0.0
        w[c] = w[c].fillna(0.0)
    w["capital"] = w["instituicao"].str.extract(r"Municipal d[eo] (.+?) - ")  # Rio de Janeiro usa "do"
    w["regiao"] = w["uf"].map(REGIAO)
    return w


def tabela_funcoes(df: pd.DataFrame) -> pd.DataFrame:
    w = pivota(df, "funcao")
    w["nome"] = w["conta"].str.replace(r"^\d{2} - ", "", regex=True)
    w["empenhado_per_capita"] = (w["empenhado"] / w["populacao"]).round(2)
    w["pago_per_capita"] = (w["pago"] / w["populacao"]).round(2)
    w["taxa_execucao"] = w.apply(
        lambda r: round(r["pago"] / r["empenhado"] * 100, 1) if r["empenhado"] > 0 else 0.0, axis=1
    )
    return w


def anos_completos(w: pd.DataFrame) -> list:
    """Anos em que todas as 26 capitais entregaram dados (exclui 2025 parcial)."""
    n = w.groupby("ano")["cod_ibge"].nunique()
    return sorted(int(a) for a in n[n == n.max()].index)


def gerar_despesas(w: pd.DataFrame) -> list:
    cols = ["ano", "cod_ibge", "capital", "uf", "regiao", "populacao", "conta", "nome",
            "empenhado", "empenhado_per_capita", "pago", "pago_per_capita", "taxa_execucao"]
    return w[cols].round({"empenhado": 2, "pago": 2}).to_dict(orient="records")


def gerar_visao_geral(w: pd.DataFrame) -> dict:
    completos = anos_completos(w)
    wc = w[w["ano"].isin(completos)]
    emp, pago = wc["empenhado"].sum(), wc["pago"].sum()
    peso = (wc.groupby(["conta", "nome"])["empenhado"].sum()
            .sort_values(ascending=False).reset_index())

    ano_ref = max(completos)
    r = (w[w["ano"] == ano_ref].groupby(["capital", "uf"])
         .agg(emp=("empenhado", "sum"), pago=("pago", "sum")).reset_index())
    r["taxa"] = (r["pago"] / r["emp"] * 100).round(1)
    r = r.sort_values("taxa", ascending=False).reset_index(drop=True)
    r["rank"] = r.index + 1
    mac = r[r["capital"] == "Maceió"].iloc[0]

    return {
        "periodo": {"inicio": min(completos), "fim": max(completos)},
        "total_empenhado": round(emp, 2),
        "total_pago": round(pago, 2),
        "exec_media_capitais": round(pago / emp * 100, 1),
        "maceio_rank_execucao": {
            "ano": ano_ref, "posicao": int(mac["rank"]),
            "total": int(len(r)), "taxa": float(mac["taxa"]),
        },
        "funcoes_maior_peso": [
            {"conta": x["conta"], "nome": x["nome"], "empenhado": round(x["empenhado"], 2)}
            for _, x in peso.iterrows()
        ],
    }


def com_media_rank(w: pd.DataFrame) -> pd.DataFrame:
    g = (w.groupby(["ano", "conta"])
         .agg(emp=("empenhado", "sum"), pago=("pago", "sum"), n=("capital", "nunique")).reset_index())
    g["media_taxa"] = (g["pago"] / g["emp"] * 100).round(1)
    w = w.merge(g[["ano", "conta", "media_taxa", "n"]], on=["ano", "conta"], how="left")
    w["rank_per_capita"] = (w.groupby(["ano", "conta"])["pago_per_capita"]
                            .rank(ascending=False, method="min").astype(int))
    return w


def _nivel(taxa: float, media: float, rank: int, total: int) -> str:
    deficit = media - taxa
    if taxa < 50 or deficit >= 40:
        return "ALERTA"
    if rank >= total - 1 or deficit >= 10:
        return "ATENCAO"
    return "OBSERVAR"


def gerar_raiox(w: pd.DataFrame) -> dict:
    completos = anos_completos(w)
    w = com_media_rank(w[w["ano"].isin(completos)])  # rankings excluem 2025
    mac = w[w["capital"] == "Maceió"].copy().rename(columns={"n": "total_capitais"})

    por_ano = {}
    for ano, grp in mac.groupby("ano"):
        grp = grp.sort_values("empenhado", ascending=False)
        funcoes = [
            {"conta": r["conta"], "nome": r["nome"], "empenhado": round(r["empenhado"], 2),
             "pago": round(r["pago"], 2), "restos_np": round(r["restos_np"], 2),
             "pago_per_capita": r["pago_per_capita"], "taxa_execucao": r["taxa_execucao"],
             "media_capitais_taxa": float(r["media_taxa"]), "rank_per_capita": int(r["rank_per_capita"]),
             "total_capitais": int(r["total_capitais"])}
            for _, r in grp.iterrows()
        ]
        g = grp.copy()
        g["deficit"] = (g["media_taxa"] - g["taxa_execucao"]).clip(lower=0)
        g["rr"] = (g["rank_per_capita"] - 1) / (g["total_capitais"] - 1).clip(lower=1)
        g["score"] = g["deficit"] / 100 + g["rr"]
        # so vira card se o desvio for relevante (>=10pp de deficit OU entre os 3 piores per capita)
        rel = g[(g["deficit"] >= 10) | (g["rank_per_capita"] >= g["total_capitais"] - 2)]
        piores = rel.sort_values("score", ascending=False).head(3)
        cards = [
            {"conta": r["conta"], "nome": r["nome"],
             "nivel": _nivel(r["taxa_execucao"], r["media_taxa"], int(r["rank_per_capita"]), int(r["total_capitais"])),
             "tipo_desvio": "execucao" if (r["media_taxa"] - r["taxa_execucao"]) >= 10 else "per_capita",
             "taxa_execucao": r["taxa_execucao"], "media_capitais_taxa": float(r["media_taxa"]),
             "rank_per_capita": int(r["rank_per_capita"]), "total_capitais": int(r["total_capitais"]),
             "pago_per_capita": r["pago_per_capita"], "restos_np": round(r["restos_np"], 2)}
            for _, r in piores.iterrows()
        ]
        por_ano[str(int(ano))] = {"ano": int(ano), "populacao": int(grp["populacao"].iloc[0]),
                                  "funcoes": funcoes, "cards": cards}

    hab = w[w["conta"] == "16 - Habitação"]
    serie = []
    for ano, gy in hab.groupby("ano"):
        m = gy[gy["capital"] == "Maceió"]
        if m.empty:
            continue
        m = m.iloc[0]
        serie.append({"ano": int(ano), "maceio_exec": float(m["taxa_execucao"]),
                      "media_exec": float(m["media_taxa"]), "empenhado": round(m["empenhado"], 2),
                      "pago": round(m["pago"], 2), "restos_np": round(m["restos_np"], 2)})

    return {"anos": sorted(int(a) for a in por_ano), "por_ano": por_ano,
            "insight_habitacao": {"serie": serie}}


def gerar_subfuncoes(df: pd.DataFrame) -> list:
    """Quebra por subfuncao de Saude (10) e Educacao (12) — 'para onde vai o dinheiro'."""
    w = pivota(df, "subfuncao")
    w["cod_funcao"] = w["conta"].str[:2]
    mapa = {"10": "10 - Saúde", "12": "12 - Educação"}
    w = w[w["cod_funcao"].isin(mapa)].copy()
    w["funcao"] = w["cod_funcao"].map(mapa)
    w["subfuncao"] = w["conta"].str.replace(r"^\d{2}\.\d{3} - ", "", regex=True)
    w = w[w["ano"].isin(anos_completos(w))]
    cols = ["ano", "capital", "uf", "regiao", "funcao", "conta", "subfuncao", "empenhado", "pago"]
    return w[cols].round({"empenhado": 2, "pago": 2}).to_dict(orient="records")


def salvar_json(nome: str, dados) -> None:
    DIR_SAIDA.mkdir(parents=True, exist_ok=True)
    caminho = DIR_SAIDA / nome
    caminho.write_text(json.dumps(dados, ensure_ascii=False, indent=2), encoding="utf-8")
    logger.info("%s salvo (%.1f KB)", nome, caminho.stat().st_size / 1024)


def main() -> None:
    logger.info("Lendo parquet: %s", ARQ_PARQUET)
    df = pd.read_parquet(ARQ_PARQUET)
    w = tabela_funcoes(df)
    salvar_json("despesas.json", gerar_despesas(w))
    salvar_json("visao_geral.json", gerar_visao_geral(w))
    salvar_json("raiox_maceio.json", gerar_raiox(w))
    salvar_json("subfuncoes.json", gerar_subfuncoes(df))
    logger.info("Concluido.")


if __name__ == "__main__":
    main()