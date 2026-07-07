export const num = (v: number, dec = 1) =>
  v.toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec });

export function compacto(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1e9) return `R$ ${num(v / 1e9)} bi`;
  if (abs >= 1e6) return `R$ ${num(v / 1e6)} mi`;
  if (abs >= 1e3) return `R$ ${num(v / 1e3, 0)} mil`;
  return `R$ ${num(v, 2)}`;
}

export const moeda = (v: number) => `R$ ${num(v, 2)}`;