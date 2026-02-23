const fs = require('fs');
const path = require('path');

const EXTERNAL_API_BASE = "https://loteriascaixa-api.herokuapp.com/api";
const CACHE_DIR = path.join(__dirname, '..', 'src', 'data', 'cache');

if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
}

async function fetchAndCache(slug) {
    console.log(`Fetching ${slug}...`);
    try {
        const response = await fetch(`${EXTERNAL_API_BASE}/${slug}`);
        if (!response.ok) {
            throw new Error(`Failed: ${response.status}`);
        }
        const data = await response.json();

        const transformedData = Array.isArray(data) ? data.map(transformData) : [];

        const filePath = path.join(CACHE_DIR, `${slug}.json`);
        fs.writeFileSync(filePath, JSON.stringify({
            timestamp: Date.now(),
            data: transformedData
        }));
        console.log(`Saved ${slug} to ${filePath} (${transformedData.length} records)`);
    } catch (e) {
        console.error(`Error fetching ${slug}:`, e);
    }
}

function transformData(external) {
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
        premiacoes: external.premiacoes?.map((p) => ({
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

// Run for missing lotteries
(async () => {
    await fetchAndCache('lotofacil');
    await fetchAndCache('lotomania');
    await fetchAndCache('quina');
})();
