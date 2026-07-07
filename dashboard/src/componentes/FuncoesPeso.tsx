"use client";

import { useState } from "react";
import { num } from "@/lib/formato";

interface FuncaoPeso {
  conta: string;
  nome: string;
  empenhado: number;
}

const bi = (v: number) => `R$ ${num(v / 1e9)} bi`;

export default function FuncoesPeso({ funcoes }: { funcoes: FuncaoPeso[] }) {
  const [expandido, setExpandido] = useState(false);
  const max = Math.max(...funcoes.map((f) => f.empenhado));
  const visiveis = expandido ? funcoes : funcoes.slice(0, 6);

  return (
    <section className="rounded-xl border border-black/5 bg-white p-6 shadow-sm">
      <h3 className="font-serif text-xl font-bold text-sefaz-green">
        Funções de maior peso financeiro
      </h3>
      <p className="mt-1 text-sm text-sefaz-gray">
        Total empenhado no período · 26 capitais
      </p>
      <ul className="mt-6 space-y-5">
        {visiveis.map((f, i) => {
          const destaque = i < 2; // Saúde e Educação: disparadamente as maiores
          return (
            <li key={f.conta}>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="font-medium text-sefaz-green">{f.nome}</span>
                <span className="font-semibold text-sefaz-green">{bi(f.empenhado)}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-black/5">
                <div
                  className={`h-full rounded-full ${
                    destaque ? "bg-sefaz-green" : "bg-sefaz-gray/40"
                  }`}
                  style={{ width: `${(f.empenhado / max) * 100}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      {funcoes.length > 6 && (
        <button
          onClick={() => setExpandido((v) => !v)}
          className="mt-6 text-sm font-semibold text-maceio-amber hover:underline"
        >
          {expandido ? "Ver menos" : `Ver todas as ${funcoes.length} funções →`}
        </button>
      )}
    </section>
  );
}