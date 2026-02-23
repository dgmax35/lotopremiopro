export interface Resultado {
    loteria: string;
    concurso: number;
    data: string;
    local: string;
    dezenas: string[];
    dezenasOrdemSorteio: string[];
    trevos: string[];
    timeCoracao: string | null;
    mesSorte: string | null;
    premiacoes: {
        descricao: string;
        faixa: number;
        ganhadores: number;
        valorPremio: number;
    }[];
    estadosPremiados: any[];
    observacao: string;
    acumulou: boolean;
    proximoConcurso: number;
    dataProximoConcurso: string;
    localGanhadores: any[];
    valorArrecadado: number;
    valorAcumuladoConcurso_0_5: number;
    valorAcumuladoConcursoEspecial: number;
    valorAcumuladoProximoConcurso: number;
    valorEstimadoProximoConcurso: number;
}

// POINTING TO LOCAL NEXT.JS API
const BASE_URL = typeof window === "undefined"
    ? "http://localhost:3000/api/loterias"
    : "/api/loterias";

export async function getLotteries(): Promise<string[]> {
    try {
        const res = await fetch(`${BASE_URL}`);
        if (!res.ok) throw new Error("Failed to fetch lotteries");
        return res.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getResults(loteria: string): Promise<Resultado[]> {
    // Fetch ALL results using the new route
    try {
        const res = await fetch(`${BASE_URL}/${loteria}`);
        if (!res.ok) throw new Error(`Failed to fetch results for ${loteria}`);
        return res.json();
    } catch (error) {
        console.error("API Error (All Results):", error);
        // Fallback to latest if all fails? Or empty.
        return [];
    }
}

export async function getLatestResult(loteria: string): Promise<Resultado | null> {
    try {
        const res = await fetch(`${BASE_URL}/${loteria}/latest`);
        if (!res.ok) throw new Error(`Failed to fetch latest result for ${loteria}`);
        return res.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getResultById(loteria: string, concurso: number): Promise<Resultado | null> {
    // Mock for ID search using the same single result from db
    const latest = await getLatestResult(loteria);
    if (latest && latest.concurso === concurso) return latest;
    return null;
}
