import { NextResponse } from "next/server";

// Using a reliable public API wrapper for Caixa lotteries
const EXTERNAL_API_BASE = "https://loteriascaixa-api.herokuapp.com/api";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ loteria: string }> } // Params is a Promise in Next.js 15+
) {
    try {
        const { loteria } = await params;

        // Determine the correct endpoint name (API expects 'megasena', 'lotofacil', etc.)
        // My app uses the same slugs generally.
        const slug = loteria.toLowerCase();

        const response = await fetch(`${EXTERNAL_API_BASE}/${slug}`);

        if (!response.ok) {
            // Try 'latest' if the root slug returns a list (some APIs differ)
            // Actually loteriascaixa-api returns an array of ALL results for /{slug}, which is heavy.
            // It serves /{slug}/latest for the latest.
            const responseLatest = await fetch(`${EXTERNAL_API_BASE}/${slug}/latest`);
            if (!responseLatest.ok) {
                return NextResponse.json({ error: "External API Error" }, { status: responseLatest.status });
            }
            const data = await responseLatest.json();
            return NextResponse.json(transformData(data));
        }

        // Since I want 'latest', let's stick to the convention of my internal route.
        // If the user calls /api/loterias/megasena/latest, I should call external /megasena/latest (or just 0 index of list if needed, but latest is safer).

        // Wait, the API `loteriascaixa-api.herokuapp.com/api/megasena` returns ALL results.
        // `loteriascaixa-api.herokuapp.com/api/megasena/latest` returns the ONE latest.

        const responseLatest = await fetch(`${EXTERNAL_API_BASE}/${slug}/latest`);
        if (!responseLatest.ok) {
            return NextResponse.json({ error: "External API Error" }, { status: responseLatest.status });
        }
        const data = await responseLatest.json();
        return NextResponse.json(transformData(data));

    } catch (error) {
        console.error("Fetch Error Detail:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

function transformData(external: any) {
    // Map external API format to my Resultado interface
    // External API format (typical):
    // { nome: 'MEGA-SENA', concurso: 2670, data: '05/01/2024', dezenas: ['01',...], ... }

    // It is almost identical to what I need usually.
    return {
        loteria: external.nome ? external.nome.toLowerCase().replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ç/g, 'c').replace(/ã/g, 'a').replace(/õ/g, 'o').replace(/ /g, '') : "unknown",
        concurso: external.concurso,
        data: external.data,
        local: external.local || "",
        dezenas: external.dezenas,
        dezenasOrdemSorteio: external.dezenasOrdemSorteio || external.dezenas,
        trevos: external.trevos || [],
        timeCoracao: external.timeCoracao || null,
        mesSorte: external.mesSorte || null,
        premiacoes: external.premiacoes?.map((p: any) => ({
            descricao: p.descricao || p.faixa,
            faixa: p.faixa,
            ganhadores: p.ganhadores,
            valorPremio: p.valorPremio
        })) || [],
        estadosPremiados: external.estadosPremiados || [],
        observacao: external.observacao || "",
        acumulou: external.acumulou,
        proximoConcurso: external.proximoConcurso,
        dataProximoConcurso: external.dataProximoConcurso,
        localGanhadores: external.localGanhadores || [],
        valorArrecadado: external.valorArrecadado,
        valorAcumuladoConcurso_0_5: external.valorAcumuladoConcurso_0_5,
        valorAcumuladoConcursoEspecial: external.valorAcumuladoConcursoEspecial,
        valorAcumuladoProximoConcurso: external.valorAcumuladoProximoConcurso,
        valorEstimadoProximoConcurso: external.valorEstimadoProximoConcurso
    };
}
