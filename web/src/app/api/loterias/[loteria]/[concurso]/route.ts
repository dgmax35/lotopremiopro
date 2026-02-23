import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const EXTERNAL_API_BASE = "https://loteriascaixa-api.herokuapp.com/api";
const CACHE_DIR = path.join(process.cwd(), "src", "data", "cache");

export async function GET(
    request: Request,
    { params }: { params: Promise<{ loteria: string; concurso: string }> }
) {
    try {
        const { loteria, concurso } = await params;
        const slug = loteria.toLowerCase();
        const contestNumber = parseInt(concurso);

        if (isNaN(contestNumber)) {
            return NextResponse.json({ error: "Invalid contest number" }, { status: 400 });
        }

        // 1. Check Local File Cache (Fastest)
        const cacheFilePath = path.join(CACHE_DIR, `${slug}.json`);
        if (fs.existsSync(cacheFilePath)) {
            try {
                const fileContent = fs.readFileSync(cacheFilePath, "utf-8");
                const parsed = JSON.parse(fileContent);
                if (parsed.data && Array.isArray(parsed.data)) {
                    const cachedResult = parsed.data.find((r: any) => r.concurso === contestNumber);
                    if (cachedResult) {
                        return NextResponse.json(cachedResult);
                    }
                }
            } catch (e) {
                console.warn(`Failed to read cache for ${slug}`, e);
            }
        }

        // 2. Fetch from External API (Fallback)
        // console.log(`[API] Fetching external for ${slug}/${contestNumber}`);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

            const response = await fetch(`${EXTERNAL_API_BASE}/${slug}/${contestNumber}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                if (response.status === 404) {
                    return NextResponse.json({ error: "Contest not found" }, { status: 404 });
                }
                return NextResponse.json({ error: "External API Error" }, { status: response.status });
            }

            const data = await response.json();
            const transformed = transformData(data);
            return NextResponse.json(transformed);

        } catch (fetchError) {
            console.error(`Fetch error for ${slug}/${contestNumber}:`, fetchError);
            // Return 404 if we can't find it anywhere, instead of 500
            return NextResponse.json({ error: "Contest not found (or API unavailable)" }, { status: 404 });
        }

    } catch (error) {
        console.error("Server Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

function transformData(external: any) {
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
