import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import Nav from "@/componentes/Nav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-merriweather",
});

export const metadata: Metadata = {
  title: "Painel de Despesas Públicas · Sefaz Maceió",
  description:
    "Análise das despesas por função das 26 capitais brasileiras (Siconfi/FINBRA, 2020–2025).",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${merriweather.variable}`}
    >
      <body className="bg-sefaz-light text-sefaz-gray font-sans antialiased min-h-screen flex flex-col">
        <header className="bg-sefaz-green text-sefaz-light pt-6 pb-0 px-8 shadow-md">
          <div className="max-w-7xl mx-auto flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-maceio-amber text-white font-bold text-xl w-12 h-12 flex items-center justify-center rounded-md">
                SM
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-wide">
                  Sefaz Maceió
                </h1>
                <p className="text-sm text-green-200/80">
                  Painel de Despesas Públicas · Capitais Brasileiras
                </p>
              </div>
            </div>

            <div className="flex gap-3 text-xs font-semibold">
              <span className="border border-green-700/50 bg-sefaz-green/50 text-green-100 px-3 py-1.5 rounded-full">
                26 capitais
              </span>
              <span className="border border-green-700/50 bg-sefaz-green/50 text-green-100 px-3 py-1.5 rounded-full">
                2020 – 2025
              </span>
            </div>
          </div>

          <Nav />
        </header>

        <div className="bg-sefaz-light border-b border-black/5 px-8 py-2.5">
          <p className="max-w-7xl mx-auto text-xs text-sefaz-gray flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-maceio-amber inline-block" />
            Dados oficiais · Siconfi/FINBRA 2020–2025 · execução orçamentária
            declarada pelas capitais.
          </p>
        </div>

        <main className="flex-1 w-full max-w-7xl mx-auto p-8">{children}</main>

        <footer className="border-t border-black/5 bg-white/60 px-8 py-6 text-xs text-sefaz-gray">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            <p className="font-semibold text-sefaz-green">
              Painel de Despesas Públicas — Sefaz Maceió
            </p>
            <p>
              Fonte: <strong>Siconfi/FINBRA</strong> (Tesouro Nacional) —
              despesas por função das 26 capitais brasileiras, 2020–2025.
              Execução orçamentária declarada pelos próprios municípios.
            </p>
            <p>
              <strong>Método:</strong> 2025 é parcial (11 de 26 capitais) e fica
              de fora de rankings, médias e séries temporais. Comparações entre
              capitais usam gasto <strong>per capita</strong> (valor ÷ população).
              Taxa de execução = pago ÷ empenhado.
            </p>
            <p className="text-sefaz-gray/70">
              Pipeline em Python (pandas → Parquet → JSON estático) · interface em
              Next.js. Desafio técnico de Análise de Dados.
            </p>

            <p className="mt-1 font-semibold text-sefaz-green">
              Feito por Caio Costa Calheiros Barbosa
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}