"use client";

import { useState } from "react";
import { num, compacto, moeda } from "@/lib/formato";

export interface FuncaoRaiox {
    conta: string;
    nome: string;
    empenhado: number;
    pago: number;
    restos_np: number;
    pago_per_capita: number;
    taxa_execucao: number;
    media_capitais_taxa: number;
    rank_per_capita: number;
    total_capitais: number;
}
export interface CardRaiox {
    conta: string;
    nome: string;
    nivel: "ALERTA" | "ATENCAO" | "OBSERVAR";
    tipo_desvio: "execucao" | "per_capita";
    taxa_execucao: number;
    media_capitais_taxa: number;
    rank_per_capita: number;
    total_capitais: number;
    pago_per_capita: number;
    restos_np: number;
}
export interface AnoRaiox {
    ano: number;
    populacao: number;
    funcoes: FuncaoRaiox[];
    cards: CardRaiox[];
}
export interface SerieHab {
    ano: number;
    maceio_exec: number;
    media_exec: number;
    empenhado: number;
    pago: number;
    restos_np: number;
}
export interface RaioxDados {
    anos: number[];
    por_ano: Record<string, AnoRaiox>;
    insight_habitacao: { serie: SerieHab[] };
}
export interface Subfuncao {
    ano: number;
    capital: string;
    funcao: string;
    subfuncao: string;
    empenhado: number;
    pago: number;
}

const NIVEL = {
    ALERTA: { badge: "bg-red-100 text-red-700", texto: "text-red-600", borda: "border-red-500", rotulo: "ALERTA" },
    ATENCAO: { badge: "bg-amber-100 text-amber-800", texto: "text-maceio-amber", borda: "border-maceio-amber", rotulo: "ATENÇÃO" },
    OBSERVAR: { badge: "bg-gray-100 text-gray-600", texto: "text-sefaz-green", borda: "border-gray-300", rotulo: "OBSERVAR" },
} as const;

function corRank(rank: number, total: number) {
    const terco = Math.ceil(total / 3);
    if (rank <= terco) return "text-emerald-600";
    if (rank > total - terco) return "text-red-600";
    return "text-sefaz-gray";
}

function posicaoLabel(rank: number, total: number) {
    if (rank >= total - 2) return `${total - rank + 1}º menor entre as capitais`;
    if (rank <= 3) return `${rank}º maior entre as capitais`;
    return "posição mediana";
}

function CardDesvio({ c }: { c: CardRaiox }) {
    const e = NIVEL[c.nivel];
    const execLed = c.tipo_desvio === "execucao";
    return (
        <div className={`rounded-xl border border-black/5 border-t-4 ${e.borda} bg-white p-5 shadow-sm`}>
            <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-sefaz-green">{c.nome}</h4>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${e.badge}`}>{e.rotulo}</span>
            </div>
            <p className={`mt-3 text-4xl font-bold ${e.texto}`}>
                {execLed ? `${num(c.taxa_execucao)}%` : `${c.rank_per_capita}º`}
                <span className="ml-2 text-sm font-normal text-sefaz-gray">
                    {execLed ? "execução" : `de ${c.total_capitais} capitais`}
                </span>
            </p>
            <p className="mt-3 text-sm text-sefaz-gray">
                {execLed
                    ? `Média das capitais nesta função: ${num(c.media_capitais_taxa)}%. ${compacto(c.restos_np)} ficaram como restos a pagar não processados.`
                    : `Pago per capita de ${moeda(c.pago_per_capita)}. Execução de ${num(c.taxa_execucao)}% (média das capitais: ${num(c.media_capitais_taxa)}%).`}
            </p>
            <p className="mt-4 border-t border-black/5 pt-3 text-xs text-sefaz-gray">
                Ranking per capita:{" "}
                <span className="font-semibold text-sefaz-green">{c.rank_per_capita}º / {c.total_capitais}</span>
            </p>
        </div>
    );
}

function InsightHabitacao({ serie }: { serie: SerieHab[] }) {
    const d2021 = serie.find((s) => s.ano === 2021);
    return (
        <div className="rounded-xl border border-black/5 border-t-4 border-red-500 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">ALERTA</span>
                <h4 className="font-semibold text-sefaz-green">Habitação praticamente não executada</h4>
            </div>
            {d2021 && (
                <div className="mt-4 flex items-start gap-4">
                    <div className="shrink-0">
                        <p className="text-4xl font-bold text-red-600">{num(d2021.maceio_exec, 2)}%</p>
                        <p className="text-xs text-sefaz-gray">taxa de execução · 2021</p>
                    </div>
                    <p className="text-sm text-sefaz-gray">
                        De <strong>{compacto(d2021.empenhado)}</strong> empenhados, apenas{" "}
                        <strong>{moeda(d2021.pago)}</strong> foram pagos. Quase tudo —{" "}
                        <strong>{compacto(d2021.restos_np)}</strong> — ficou como resto a pagar não processado.
                    </p>
                </div>
            )}
            <div className="mt-5 rounded-lg bg-sefaz-light/60 p-4">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-sefaz-gray">
                    Maceió vs média das capitais · execução de Habitação
                </p>
                <div className="space-y-3">
                    {serie.map((s) => (
                        <div key={s.ano} className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3">
                            <span className="text-sm font-medium text-sefaz-green">{s.ano}</span>
                            <div className="space-y-1">
                                <div className="h-2 rounded-full bg-black/5">
                                    <div className="h-full rounded-full bg-maceio-amber" style={{ width: `${Math.min(s.maceio_exec, 100)}%` }} />
                                </div>
                                <div className="h-2 rounded-full bg-black/5">
                                    <div className="h-full rounded-full bg-sefaz-gray/50" style={{ width: `${Math.min(s.media_exec, 100)}%` }} />
                                </div>
                            </div>
                            <div className="text-right text-xs leading-tight">
                                <p className="font-semibold text-maceio-amber">Maceió {num(s.maceio_exec)}%</p>
                                <p className="text-sefaz-gray">Média {num(s.media_exec)}%</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-3 flex gap-4 text-[11px] text-sefaz-gray">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-maceio-amber" /> Maceió</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-sefaz-gray/50" /> Média 26 capitais</span>
                </div>
            </div>
        </div>
    );
}

function MiniContraste({ titulo, f, tom }: { titulo: string; f: FuncaoRaiox; tom: "verde" | "vermelho" }) {
    const bg = tom === "verde" ? "bg-emerald-50" : "bg-red-50";
    const chip = tom === "verde" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700";
    return (
        <div className={`rounded-lg ${bg} p-4`}>
            <p className="text-[10px] font-bold uppercase tracking-wide text-sefaz-gray">{titulo}</p>
            <p className="mt-1 text-2xl font-bold text-sefaz-green">{moeda(f.pago_per_capita)}</p>
            <p className="text-xs text-sefaz-gray">pago per capita</p>
            <div className="mt-3 space-y-1 text-xs">
                <div className="flex justify-between">
                    <span className="text-sefaz-gray">Ranking</span>
                    <span className={`font-semibold ${corRank(f.rank_per_capita, f.total_capitais)}`}>{f.rank_per_capita}º / {f.total_capitais}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sefaz-gray">Execução</span>
                    <span className="font-semibold text-sefaz-green">{num(f.taxa_execucao)}%</span>
                </div>
            </div>
            <p className={`mt-3 rounded-md ${chip} px-2 py-1 text-center text-xs font-medium`}>
                {posicaoLabel(f.rank_per_capita, f.total_capitais)}
            </p>
        </div>
    );
}

function Breakdown({ titulo, itens }: { titulo: string; itens: Subfuncao[] }) {
    const total = itens.reduce((s, x) => s + x.pago, 0);
    const ord = [...itens].sort((a, b) => b.pago - a.pago);
    const top = ord.slice(0, 5).map((s) => ({ nome: s.subfuncao, pago: s.pago }));
    const resto = ord.slice(5);
    const linhas = resto.length
        ? [...top, { nome: `Outras (${resto.length})`, pago: resto.reduce((s, x) => s + x.pago, 0) }]
        : top;

    return (
        <div className="rounded-xl border border-black/5 bg-white p-5 shadow-sm">
            <h4 className="font-semibold text-sefaz-green">{titulo}</h4>
            <p className="mt-0.5 text-xs text-sefaz-gray">Total pago: {compacto(total)}</p>
            <ul className="mt-4 space-y-3">
                {linhas.map((s) => {
                    const share = total ? (s.pago / total) * 100 : 0;
                    return (
                        <li key={s.nome}>
                            <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                                <span className="truncate text-sefaz-green">{s.nome}</span>
                                <span className="shrink-0 text-sefaz-gray">
                                    <span className="font-semibold text-sefaz-green">{num(share)}%</span>
                                    <span className="ml-2 text-xs">{compacto(s.pago)}</span>
                                </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-black/5">
                                <div className="h-full rounded-full bg-sefaz-green" style={{ width: `${share}%` }} />
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

function Tabela({ ano, dados }: { ano: number; dados: AnoRaiox }) {
    const flag = new Set(dados.cards.map((c) => c.conta));
    return (
        <section className="rounded-xl border border-black/5 bg-white shadow-sm">
            <div className="flex items-start justify-between gap-4 px-6 py-4">
                <div>
                    <h3 className="font-serif text-xl font-bold text-sefaz-green">
                        Todas as funções · Maceió em {ano}
                    </h3>
                    <p className="mt-0.5 max-w-xl text-xs text-sefaz-gray">
                        Ranking = posição de Maceió entre as capitais no gasto{" "}
                        <strong>por habitante</strong> de cada função. Cada linha é
                        independente — o mesmo número pode se repetir.
                    </p>
                </div>
                <span className="shrink-0 text-xs text-sefaz-gray">ordenado por valor empenhado</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-y border-black/5 text-[11px] uppercase tracking-wide text-sefaz-gray">
                            <th className="px-6 py-2 text-left font-medium">Função</th>
                            <th className="px-4 py-2 text-right font-medium">Empenhado</th>
                            <th className="px-4 py-2 text-right font-medium">Pago</th>
                            <th className="px-4 py-2 text-right font-medium">Pago / hab.</th>
                            <th className="px-4 py-2 text-left font-medium">Execução</th>
                            <th className="px-6 py-2 text-right font-medium">Ranking per capita</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dados.funcoes.map((f) => (
                            <tr key={f.conta} className={`border-b border-black/5 ${flag.has(f.conta) ? "bg-maceio-light" : ""}`}>
                                <td className="px-6 py-2.5 font-medium text-sefaz-green">{f.nome}</td>
                                <td className="px-4 py-2.5 text-right text-sefaz-gray">{compacto(f.empenhado)}</td>
                                <td className="px-4 py-2.5 text-right text-sefaz-gray">{compacto(f.pago)}</td>
                                <td className="px-4 py-2.5 text-right text-sefaz-gray">{moeda(f.pago_per_capita)}</td>
                                <td className="px-4 py-2.5">
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-16 rounded-full bg-black/5">
                                            <div
                                                className={`h-full rounded-full ${f.taxa_execucao >= 85 ? "bg-emerald-500" : "bg-maceio-amber"}`}
                                                style={{ width: `${Math.min(f.taxa_execucao, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-sefaz-gray">{num(f.taxa_execucao)}%</span>
                                    </div>
                                </td>
                                <td className={`px-6 py-2.5 text-right font-semibold ${corRank(f.rank_per_capita, f.total_capitais)}`}>
                                    {f.rank_per_capita}º/{f.total_capitais}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default function RaioX({ dados, subfuncoes }: { dados: RaioxDados; subfuncoes: Subfuncao[] }) {
    const [ano, setAno] = useState(Math.max(...dados.anos));
    const atual = dados.por_ano[String(ano)];

    const anoContraste = Math.max(...dados.anos);
    const funcoesContraste = dados.por_ano[String(anoContraste)].funcoes;
    const saude = funcoesContraste.find((f) => f.conta === "10 - Saúde");
    const educacao = funcoesContraste.find((f) => f.conta === "12 - Educação");

    const subAno = subfuncoes.filter((s) => s.ano === ano);
    const saudeSub = subAno.filter((s) => s.funcao === "10 - Saúde");
    const educSub = subAno.filter((s) => s.funcao === "12 - Educação");

    return (
        <div className="space-y-10">
            {/* Cabeçalho + seletor */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-maceio-amber">
                        <span className="h-1.5 w-1.5 rounded-full bg-maceio-amber" /> Raio-X de Maceió
                    </p>
                    <h2 className="mt-1 font-serif text-4xl font-bold text-sefaz-green">Onde Maceió foge do padrão</h2>
                    <p className="mt-2 text-sefaz-gray">
                        Execução por função frente às 26 capitais. População de referência:{" "}
                        {num(atual.populacao, 0)} hab.
                    </p>
                </div>
                <label className="text-xs font-semibold uppercase tracking-wide text-sefaz-gray">
                    Ano-base
                    <select
                        value={ano}
                        onChange={(e) => setAno(Number(e.target.value))}
                        className="mt-1 block rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-normal text-sefaz-green shadow-sm focus:border-maceio-amber focus:outline-none"
                    >
                        {[...dados.anos].sort((a, b) => b - a).map((a) => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                    </select>
                </label>
            </div>

            {/* Pontos fora do padrão */}
            <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sefaz-gray">
                    Pontos fora do padrão · {ano}
                </p>
                {atual.cards.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {atual.cards.map((c) => <CardDesvio key={c.conta} c={c} />)}
                    </div>
                ) : (
                    <p className="rounded-xl border border-black/5 bg-white p-5 text-sm text-sefaz-gray shadow-sm">
                        Nenhum desvio relevante em {ano} — Maceió acompanhou o padrão das capitais nas funções principais.
                    </p>
                )}
            </div>

            {/* Insights validados */}
            <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sefaz-gray">Insights validados</p>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <InsightHabitacao serie={dados.insight_habitacao.serie} />
                    {saude && educacao && (
                        <div className="rounded-xl border border-black/5 border-t-4 border-sefaz-green bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-2">
                                <span className="rounded-full bg-sefaz-green/10 px-2 py-0.5 text-[10px] font-bold text-sefaz-green">
                                    CONTRASTE · {anoContraste}
                                </span>
                                <h4 className="font-semibold text-sefaz-green">Saúde forte, Educação frágil</h4>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <MiniContraste titulo="Saúde" f={saude} tom="verde" />
                                <MiniContraste titulo="Educação" f={educacao} tom="vermelho" />
                            </div>
                            <p className="mt-4 text-sm text-sefaz-gray">
                                Maceió investe em Saúde perto da mediana nacional e executa quase tudo. Em Educação, o
                                gasto por habitante é dos mais baixos do país <strong>e</strong> a execução ainda cai para{" "}
                                {num(educacao.taxa_execucao)}%.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabela completa */}
            <Tabela ano={ano} dados={atual} />

            {/* Para onde vai o dinheiro (subfunções) */}
            {(saudeSub.length > 0 || educSub.length > 0) && (
                <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sefaz-gray">
                        Para onde vai o dinheiro · Maceió em {ano}
                    </p>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {saudeSub.length > 0 && <Breakdown titulo="Saúde · por subfunção" itens={saudeSub} />}
                        {educSub.length > 0 && <Breakdown titulo="Educação · por subfunção" itens={educSub} />}
                    </div>
                </div>
            )}
        </div>
    );
}