import fs from 'fs';
import path from 'path';

const CAIXA_BASE = "https://servicebus2.caixa.gov.br/portaldeloterias/api";
const HEROKU_BASE = "https://loteriascaixa-api.herokuapp.com/api";

const CACHE_DIR = path.join(process.cwd(), 'src', 'data', 'cache');

const BROWSER_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Referer": "https://loterias.caixa.gov.br/",
    "Origin": "https://loterias.caixa.gov.br",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
};

export async function fetchWithHistory(loteria: string) {
    const slug = loteria.toLowerCase();

    // 1. Load history from local cache
    let results: any[] = [];
    try {
        const filePath = path.join(CACHE_DIR, `${slug}.json`);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            const parsed = JSON.parse(content);
            results = parsed.data || [];
        }
    } catch (err) {
        console.error(`[Fetcher] History error for ${slug}:`, err);
    }

    // 2. Fetch Latest from API
    const latest = await fetchLatestOnly(slug);

    // 3. Merge if it's a new contest
    if (latest && latest.concurso) {
        const alreadyExists = results.some(r => r.concurso === latest.concurso);
        if (!alreadyExists) {
            console.log(`[Fetcher] Appending new contest ${latest.concurso} to ${slug} in-memory`);
            results.unshift(latest); // Add to beginning
        }
    }

    return results;
}

export async function fetchLatestOnly(loteria: string, contest?: string | number) {
    const slug = loteria.toLowerCase();

    // TRIES: Official Caixa -> Heroku Proxy

    // Try Caixa (Official)
    try {
        const url = contest
            ? `${CAIXA_BASE}/${slug}/${contest}`
            : `${CAIXA_BASE}/${slug}/`;

        const response = await fetch(url, {
            headers: BROWSER_HEADERS,
            next: { revalidate: 0 }
        });

        if (response.ok) {
            const data = await response.json();
            if (data && (data.numero || data.concurso)) {
                return transformCaixa(data);
            }
        }
    } catch (err) { }

    // Fallback Heroku
    try {
        const url = contest
            ? `${HEROKU_BASE}/${slug}/${contest}`
            : `${HEROKU_BASE}/${slug}/latest`;

        const response = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
            next: { revalidate: 0 }
        });

        if (response.ok) {
            const data = await response.json();
            if (data && (data.concurso || data.numero)) {
                return transformHeroku(data);
            }
        }
    } catch (err) { }

    return null;
}

function transformCaixa(ext: any) {
    return {
        loteria: ext.tipoJogo ? ext.tipoJogo.toLowerCase().replace(/_/g, '') : "unknown",
        concurso: ext.numero,
        data: ext.dataApuracao,
        local: (ext.localSorteio || "") + " em " + (ext.nomeMunicipioUFSorteio || ""),
        dezenas: ext.listaDezenas || [],
        dezenasOrdemSorteio: ext.dezenasSorteadasOrdemSorteio || ext.listaDezenas || [],
        trevos: ext.trevosSorteados || [],
        timeCoracao: ext.nomeTimeCoracaoMesSorte || null,
        mesSorte: ext.nomeTimeCoracaoMesSorte || null,
        premiacoes: ext.listaRateioPremio?.map((p: any) => ({
            descricao: p.descricaoFaixa,
            faixa: p.faixa,
            ganhadores: p.numeroDeGanhadores,
            valorPremio: p.valorPremio
        })) || [],
        estadosPremiados: ext.listaMunicipioUFGanhadores || [],
        observacao: ext.observacao || "",
        acumulou: ext.acumulado,
        proximoConcurso: ext.numeroConcursoProximo,
        dataProximoConcurso: ext.dataProximoConcurso,
        localGanhadores: ext.listaMunicipioUFGanhadores || [],
        valorArrecadado: ext.valorArrecadado,
        valorAcumuladoConcurso_0_5: ext.valorAcumuladoConcurso_0_5,
        valorAcumuladoConcursoEspecial: ext.valorAcumuladoConcursoEspecial,
        valorAcumuladoProximoConcurso: ext.valorAcumuladoProximoConcurso,
        valorEstimadoProximoConcurso: ext.valorEstimadoProximoConcurso
    };
}

function transformHeroku(ext: any) {
    return {
        loteria: ext.nome ? ext.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, '').replace(/-/g, '') : "unknown",
        concurso: ext.concurso || ext.numero,
        data: ext.data || ext.dataApuracao,
        local: ext.local || "",
        dezenas: ext.dezenas || ext.listaDezenas || [],
        dezenasOrdemSorteio: ext.dezenasOrdemSorteio || ext.listaDezenas || [],
        trevos: ext.trevos || ext.trevosSorteados || [],
        timeCoracao: ext.timeCoracao || null,
        mesSorte: ext.mesSorte || null,
        premiacoes: ext.premiacoes?.map((p: any) => ({
            descricao: p.descricao || p.faixa,
            faixa: p.faixa,
            ganhadores: p.ganhadores,
            valorPremio: p.valorPremio
        })) || [],
        estadosPremiados: ext.estadosPremiados || [],
        observacao: ext.observacao || "",
        acumulou: ext.acumulou,
        proximoConcurso: ext.proximoConcurso,
        dataProximoConcurso: ext.dataProximoConcurso,
        localGanhadores: ext.localGanhadores || [],
        valorArrecadado: ext.valorArrecadado,
        valorAcumuladoConcurso_0_5: ext.valorAcumuladoConcurso_0_5,
        valorAcumuladoConcursoEspecial: ext.valorAcumuladoConcursoEspecial,
        valorAcumuladoProximoConcurso: ext.valorAcumuladoProximoConcurso,
        valorEstimadoProximoConcurso: ext.valorEstimadoProximoConcurso
    };
}
