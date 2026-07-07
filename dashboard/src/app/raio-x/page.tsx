import RaioX, { RaioxDados, Subfuncao } from "@/componentes/RaioX";
import { readFile } from "fs/promises";
import path from "path";

async function ler<T>(arquivo: string): Promise<T> {
  const p = path.join(process.cwd(), "public", "data", arquivo);
  return JSON.parse(await readFile(p, "utf-8"));
}

export default async function Page() {
  const dados = await ler<RaioxDados>("raiox_maceio.json");
  const todas = await ler<Subfuncao[]>("subfuncoes.json");
  const subfuncoes = todas.filter((s) => s.capital === "Maceió");
  return <RaioX dados={dados} subfuncoes={subfuncoes} />;
}