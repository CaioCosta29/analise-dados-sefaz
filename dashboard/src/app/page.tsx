import FuncoesPeso from "@/componentes/FuncoesPeso";
import { readFile } from "fs/promises";
import path from "path";

interface FuncaoPeso {
  conta: string;
  nome: string;
  empenhado: number;
}

interface VisaoGeral {
  periodo: { inicio: number; fim: number };
  total_empenhado: number;
  total_pago: number;
  exec_media_capitais: number;
  maceio_rank_execucao: { ano: number; posicao: number; total: number; taxa: number };
  funcoes_maior_peso: FuncaoPeso[];
}

async function lerVisaoGeral(): Promise<VisaoGeral> {
  const p = path.join(process.cwd(), "public", "data", "visao_geral.json");
  return JSON.parse(await readFile(p, "utf-8"));
}

const num = (v: number) =>
  v.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const bi = (v: number) => `R$ ${num(v / 1e9)} bi`;

function Kpi({
  titulo,
  valor,
  rodape,
  destaque = false,
}: {
  titulo: string;
  valor: string;
  rodape: string;
  destaque?: boolean;
}) {
  return (
    <div
      className={`rounded-xl bg-white p-5 shadow-sm ${
        destaque ? "border-l-4 border-maceio-amber" : "border border-black/5"
      }`}
    >
      <p className="text-sm text-sefaz-gray">{titulo}</p>
      <p
        className={`mt-2 text-3xl font-bold ${
          destaque ? "text-maceio-amber" : "text-sefaz-green"
        }`}
      >
        {valor}
      </p>
      <p className="mt-2 text-xs text-sefaz-gray">{rodape}</p>
    </div>
  );
}

export default async function Home() {
  const d = await lerVisaoGeral();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-maceio-amber">
          Visão geral do período
        </p>
        <h2 className="mt-1 font-serif text-4xl font-bold text-sefaz-green">
          Despesas públicas das 26 capitais
        </h2>
        <p className="mt-2 max-w-2xl text-sefaz-gray">
          Execução orçamentária declarada entre {d.periodo.inicio} e{" "}
          {d.periodo.fim}. Maceió aparece destacada em{" "}
          <span className="font-semibold text-maceio-amber">âmbar</span> em todo
          o painel.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          titulo="Execução média das capitais"
          valor={`${num(d.exec_media_capitais)}%`}
          rodape="pago ÷ empenhado · período completo"
        />
        <Kpi
          titulo="Maceió no ranking de execução"
          valor={`${d.maceio_rank_execucao.posicao}º de ${d.maceio_rank_execucao.total}`}
          rodape={`execução em ${d.maceio_rank_execucao.ano}: ${num(d.maceio_rank_execucao.taxa)}%`}
          destaque
        />
        <Kpi
          titulo="Total empenhado no período"
          valor={bi(d.total_empenhado)}
          rodape="26 capitais · todas as funções"
        />
        <Kpi
          titulo="Total efetivamente pago"
          valor={bi(d.total_pago)}
          rodape={`${num(d.exec_media_capitais)}% do empenhado`}
        />
      </div>

      <FuncoesPeso funcoes={d.funcoes_maior_peso} />
    </div>
  );
}