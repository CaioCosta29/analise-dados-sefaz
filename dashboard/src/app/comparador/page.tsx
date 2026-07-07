"use client";

import Comparador, { Despesa } from "@/componentes/Comparador";
import { useEffect, useState } from "react";

export default function Page() {
    const [dados, setDados] = useState<Despesa[] | null>(null);

    useEffect(() => {
        fetch("/data/despesas.json")
            .then((r) => r.json())
            .then(setDados);
    }, []);

    if (!dados) {
        return <p className="text-sefaz-gray">Carregando dados das capitais…</p>;
    }
    return <Comparador dados={dados} />;
}