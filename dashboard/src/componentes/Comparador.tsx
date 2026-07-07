"use client";

import { useMemo, useState } from "react";
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { num, compacto, moeda } from "@/lib/formato";

export interface Despesa {
    ano: number;
    cod_ibge: number;
    capital: string;
    uf: string;
    regiao: string;
    populacao: number;
    conta: string;
    nome: string;
    empenhado: number;
    empenhado_per_capita: number;
    pago: number;
    pago_per_capita: number;
    taxa_execucao: number;
}

type Metrica = "per_capita" | "absoluto";

export default function Comparador({ dados }: { dados: Despesa[] }) {
    const funcoes = useMemo(() => {
        const m = new Map<string, string>();
        dados.forEach((d) => m.set(d.conta, d.nome));
        return [...m.entries()]
            .map(([conta, nome]) => ({ conta, nome }))
            .sort((a, b) => a.conta.localeCompare(b.conta));
    }, [dados]);

    const anos = useMemo(() => {
        const cont = new Map<number, Set<number>>();
        dados.forEach((d) =>
            (cont.get(d.ano) ?? cont.set(d.ano, new Set()).get(d.ano)!).add(d.cod_ibge)
        );
        const max = Math.max(...[...cont.values()].map((s) => s.size));
        return [...cont.entries()]
            .filter(([, s]) => s.size === max)
            .map(([a]) => a)
            .sort((a, b) => a - b);
    }, [dados]);

    const [funcao, setFuncao] = useState("10 - Saúde");
    const [anoSel, setAnoSel] = useState<number | null>(null);
    const [metrica, setMetrica] = useState<Metrica>("per_capita");
    const ano = anoSel ?? Math.max(...anos);

    const nomeFuncao = funcoes.find((f) => f.conta === funcao)?.nome ?? "";
    const regiaoMaceio = dados.find((d) => d.capital === "Maceió")?.regiao;
    const perCap = metrica === "per_capita";
    const fmtValor = (v: number) => (perCap ? moeda(v) : compacto(v));

    const ranking = useMemo(() => {
        const regs = dados.filter((d) => d.conta === funcao && d.ano === ano);
        return regs
            .map((d) => ({
                capital: d.capital,
                pago: perCap ? d.pago_per_capita : d.pago,
                emp: perCap ? d.empenhado_per_capita : d.empenhado,
                exec: d.taxa_execucao,
            }))
            .sort((a, b) => b.pago - a.pago);
    }, [dados, funcao, ano, perCap]);
    const maxEmp = Math.max(...ranking.map((r) => r.emp), 1);

    const serie = useMemo(() => {
        return anos.map((a) => {
            const regs = dados.filter((d) => d.conta === funcao && d.ano === a);
            const val = (d: Despesa) => (perCap ? d.pago_per_capita : d.pago);
            const mac = regs.find((d) => d.capital === "Maceió");
            const media = regs.length ? regs.reduce((s, d) => s + val(d), 0) / regs.length : 0;
            return { ano: a, maceio: mac ? val(mac) : null, media };
        });
    }, [dados, funcao, anos, perCap]);

    const regioes = useMemo(() => {
        const acc: Record<string, { pago: number; emp: number; pop: number }> = {};
        dados
            .filter((d) => d.conta === funcao && d.ano === ano)
            .forEach((d) => {
                const r = (acc[d.regiao] ??= { pago: 0, emp: 0, pop: 0 });
                r.pago += d.pago;
                r.emp += d.empenhado;
                r.pop += d.populacao;
            });
        return Object.entries(acc)
            .map(([regiao, v]) => ({
                regiao,
                valor: perCap ? v.pago / v.pop : v.pago,
                exec: v.emp > 0 ? (v.pago / v.emp) * 100 : 0,
            }))
            .sort((a, b) => b.valor - a.valor);
    }, [dados, funcao, ano, perCap]);
    const maxReg = Math.max(...regioes.map((r) => r.valor), 1);

    return (
        <div className="space-y-8">
            <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-maceio-amber">
                    Comparador de Capitais
                </p>
                <h2 className="mt-1 font-serif text-4xl font-bold text-sefaz-green">
                    Como as capitais gastam em {nomeFuncao}
                </h2>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap items-end gap-4 rounded-xl border border-black/5 bg-white p-4 shadow-sm">
                <label className="flex-1 min-w-[16rem] text-xs font-semibold uppercase tracking-wide text-sefaz-gray">
                    Função
                    <select
                        value={funcao}
                        onChange={(e) => setFuncao(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-normal text-sefaz-green focus:border-maceio-amber focus:outline-none"
                    >
                        {funcoes.map((f) => (
                            <option key={f.conta} value={f.conta}>
                                {f.conta.replace(" - ", " · ")}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="text-xs font-semibold uppercase tracking-wide text-sefaz-gray">
                    Ano
                    <select
                        value={ano}
                        onChange={(e) => setAnoSel(Number(e.target.value))}
                        className="mt-1 block rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-normal text-sefaz-green focus:border-maceio-amber focus:outline-none"
                    >
                        {[...anos].sort((a, b) => b - a).map((a) => (
                            <option key={a} value={a}>
                                {a}
                            </option>
                        ))}
                    </select>
                </label>

                <div className="text-xs font-semibold uppercase tracking-wide text-sefaz-gray">
                    Métrica
                    <div className="mt-1 flex overflow-hidden rounded-md border border-black/10">
                        {([["per_capita", "Per capita"], ["absoluto", "Absoluto"]] as const).map(([v, rot]) => (
                            <button
                                key={v}
                                onClick={() => setMetrica(v)}
                                className={`px-3 py-2 text-sm font-normal transition-colors ${metrica === v ? "bg-sefaz-green text-white" : "bg-white text-sefaz-gray hover:bg-black/5"
                                    }`}
                            >
                                {rot}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <section className="rounded-xl border border-black/5 bg-white p-6 shadow-sm">
                    <div className="flex items-baseline justify-between">
                        <h3 className="font-serif text-xl font-bold text-sefaz-green">Ranking das capitais</h3>
                        <span className="text-xs text-sefaz-gray">{perCap ? "R$ por habitante" : "R$ absoluto"}</span>
                    </div>
                    <p className="mt-1 text-sm text-sefaz-gray">
                        {nomeFuncao} · {ano} · valor pago
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-sefaz-gray">
                        <span className="flex items-center gap-1">
                            <span className="h-2 w-3 rounded-sm bg-sefaz-green/20" /> empenhado
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="h-2 w-3 rounded-sm bg-sefaz-green" /> pago
                        </span>
                        <span>· o vão até o fim da barra é o que não foi executado · passe o mouse para os valores</span>
                    </div>

                    <ul className="mt-4 max-h-[520px] space-y-2 overflow-y-auto pr-1">
                        {ranking.map((r, i) => {
                            const mac = r.capital === "Maceió";
                            const naoExec = r.emp - r.pago;
                            return (
                                <li key={r.capital} className={`rounded-md px-2 py-1.5 ${mac ? "bg-maceio-light" : ""}`}>
                                    <div className="flex items-center gap-3">
                                        <span className="w-5 shrink-0 text-right text-xs text-sefaz-gray">{i + 1}</span>
                                        <span
                                            className={`w-28 shrink-0 truncate text-sm ${mac ? "font-bold text-maceio-amber" : "text-sefaz-green"
                                                }`}
                                        >
                                            {r.capital}
                                        </span>
                                        <div
                                            className="relative h-4 flex-1 rounded bg-black/5"
                                            title={
                                                `${r.capital}\n` +
                                                `Empenhado: ${fmtValor(r.emp)}\n` +
                                                `Pago: ${fmtValor(r.pago)}\n` +
                                                `Não executado: ${fmtValor(naoExec)}\n` +
                                                `Execução: ${num(r.exec)}%`
                                            }
                                        >
                                            <div
                                                className="absolute inset-y-0 left-0 rounded bg-sefaz-green/20"
                                                style={{ width: `${(r.emp / maxEmp) * 100}%` }}
                                            />
                                            <div
                                                className={`absolute inset-y-0 left-0 rounded ${mac ? "bg-maceio-amber" : "bg-sefaz-green"}`}
                                                style={{ width: `${(r.pago / maxEmp) * 100}%` }}
                                            />
                                        </div>
                                        <div className="w-32 shrink-0 text-right leading-tight">
                                            <div className="text-xs font-semibold text-sefaz-green">{fmtValor(r.pago)}</div>
                                            <div className="text-[11px] text-sefaz-gray">
                                                de {fmtValor(r.emp)} · {num(r.exec)}%
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </section>

                <section className="rounded-xl border border-black/5 bg-white p-6 shadow-sm">
                    <h3 className="font-serif text-xl font-bold text-sefaz-green">Evolução temporal</h3>
                    <p className="mt-1 text-sm text-sefaz-gray">
                        {nomeFuncao} · Maceió vs média das capitais · {perCap ? "R$ por habitante" : "R$ absoluto"}
                    </p>
                    <div className="mt-3 flex gap-4 text-xs text-sefaz-gray">
                        <span className="flex items-center gap-1">
                            <span className="h-0.5 w-4 bg-maceio-amber" /> Maceió
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="h-0.5 w-4 bg-sefaz-green" /> Média 26 capitais
                        </span>
                    </div>
                    <div className="mt-4 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={serie} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#00000010" vertical={false} />
                                <XAxis dataKey="ano" tick={{ fontSize: 12, fill: "#5C6A64" }} axisLine={false} tickLine={false} />
                                <YAxis
                                    tick={{ fontSize: 11, fill: "#5C6A64" }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={70}
                                    tickFormatter={(v: number) => (perCap ? `R$ ${num(v, 0)}` : compacto(v))}
                                />
                                <Tooltip formatter={(value) => fmtValor(Number(value))} labelFormatter={(l) => `Ano ${l}`} />
                                <Line type="monotone" dataKey="maceio" name="Maceió" stroke="#D97925" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
                                <Line type="monotone" dataKey="media" name="Média 26 capitais" stroke="#0B4232" strokeWidth={2.5} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            </div>

            <section className="rounded-xl border border-black/5 bg-white p-6 shadow-sm">
                <div className="flex items-baseline justify-between">
                    <h3 className="font-serif text-xl font-bold text-sefaz-green">Por região</h3>
                    <span className="text-xs text-sefaz-gray">
                        {nomeFuncao} · {ano}
                    </span>
                </div>
                <p className="mt-1 text-sm text-sefaz-gray">
                    {perCap ? "Gasto por habitante" : "Gasto absoluto"} e taxa de execução de cada região.
                </p>
                <ul className="mt-5 space-y-4">
                    {regioes.map((r) => {
                        const mac = r.regiao === regiaoMaceio;
                        return (
                            <li key={r.regiao}>
                                <div className="mb-1 flex items-baseline justify-between text-sm">
                                    <span className={`font-medium ${mac ? "text-maceio-amber" : "text-sefaz-green"}`}>
                                        {r.regiao}
                                        {mac && " · Maceió"}
                                    </span>
                                    <span className="text-sefaz-gray">
                                        <span className="font-semibold text-sefaz-green">{fmtValor(r.valor)}</span>
                                        <span className="ml-2 text-xs">exec. {num(r.exec)}%</span>
                                    </span>
                                </div>
                                <div className="h-2.5 w-full rounded-full bg-black/5">
                                    <div
                                        className={`h-full rounded-full ${mac ? "bg-maceio-amber" : "bg-sefaz-green"}`}
                                        style={{ width: `${(r.valor / maxReg) * 100}%` }}
                                    />
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </section>
        </div>
    );
}