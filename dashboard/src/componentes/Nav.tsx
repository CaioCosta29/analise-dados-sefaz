"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  { href: "/", label: "Visão Geral" },
  { href: "/raio-x", label: "Raio-X de Maceió" },
  { href: "/comparador", label: "Comparador de Capitais" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="max-w-7xl mx-auto flex gap-8 text-sm font-medium">
      {ITENS.map(({ href, label }) => {
        const ativo = path === href;
        return (
          <Link
            key={href}
            href={href}
            className={`pb-3 border-b-2 transition-colors ${
              ativo
                ? "border-maceio-amber text-white"
                : "border-transparent hover:text-white"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}