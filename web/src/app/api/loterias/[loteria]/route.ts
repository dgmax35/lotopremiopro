import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Using a reliable public API wrapper for Caixa lotteries
const EXTERNAL_API_BASE = "https://loteriascaixa-api.herokuapp.com/api";

const CACHE_DIR = path.join(process.cwd(), "src", "data", "cache");
const CACHE_DURATION_MS = 1000 * 60 * 60 * 24; // 24 Hours

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
    try {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
        console.log(`[Cache] Created directory: ${CACHE_DIR}`);
    } catch (e) {
        console.error(`[Cache] Failed to create directory: ${CACHE_DIR}`, e);
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ loteria: string }> }
) {
    try {
        const { loteria } = await params;
        const slug = loteria.toLowerCase();
        const cacheFilePath = path.join(CACHE_DIR, `${slug}.json`);

        // Check File Cache
        let cachedData = null;
        let cacheTimestamp = 0;

        if (fs.existsSync(cacheFilePath)) {
            try {
                const fileContent = fs.readFileSync(cacheFilePath, "utf-8");
                const parsed = JSON.parse(fileContent);
                if (parsed.data && parsed.timestamp) {
                    cachedData = parsed.data;
                    cacheTimestamp = parsed.timestamp;
                }
            } catch (e) {
                console.warn(`Failed to read cache for ${slug}`, e);
            }
        }

        let dataToReturn = cachedData;

        let shouldFetch = !cachedData;
        if (cachedData && (Date.now() - cacheTimestamp > CACHE_DURATION_MS)) {
            shouldFetch = true;
        }

        if (shouldFetch) {
            try {
                console.log(`[Cache] Fetching fresh data for ${slug}...`);

                const controller = new AbortController();
                // 60 seconds timeout for large datasets
                const timeoutId = setTimeout(() => controller.abort(), 60000);

                const response = await fetch(`${EXTERNAL_API_BASE}/${slug}`, {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                console.log(`[Cache] Response for ${slug}: ${response.status}`);

                if (response.ok) {
                    const data = await response.json();
                    const transformedData = Array.isArray(data) ? data.map(transformData) : [];

                    // Update File Cache
                    fs.writeFileSync(cacheFilePath, JSON.stringify({
                        timestamp: Date.now(),
                        data: transformedData
                    }));

                    dataToReturn = transformedData;
                } else if (!dataToReturn) {
                    return NextResponse.json({ error: "External API Error" }, { status: response.status });
                }
            } catch (err) {
                console.error(`Fetch Error for ${slug}:`, err);
                if (!dataToReturn) return NextResponse.json({ error: "Fetch Failed" }, { status: 500 });
            }
        }

        return NextResponse.json(dataToReturn, {
            headers: {
                "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
            },
        });

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
