const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.join(__dirname, '..', 'src', 'data', 'cache');

const LOTTERIES = [
    "megasena",
    "lotofacil",
    "quina",
    "lotomania",
    "timemania",
    "diadesorte",
    "duplasena"
];

function calculateStats(loteria) {
    const filePath = path.join(CACHE_DIR, `${loteria}.json`);
    if (!fs.existsSync(filePath)) {
        console.log(`[${loteria}] No data found.`);
        return;
    }

    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const results = content.data; // Array of results

    if (!results || results.length === 0) {
        console.log(`[${loteria}] Empty data.`);
        return;
    }

    // Frequency Map
    const freq = {};
    results.forEach(r => {
        r.dezenas.forEach(d => {
            // Ensure data consistency (remove leading zeros for integer comparison, or keep string? existing apps usually use string '01')
            // The API returns strings like "01", "10".
            const key = d;
            freq[key] = (freq[key] || 0) + 1;
        });
    });

    // Sort
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);

    const top5 = sorted.slice(0, 5).map(x => `${x[0]}(${x[1]})`).join(', ');
    const bottom5 = sorted.slice(-5).map(x => `${x[0]}(${x[1]})`).join(', ');

    console.log(`\n=== ${loteria.toUpperCase()} (${results.length} concursos) ===`);
    console.log(`Mais Sorteados: ${top5}`);
    console.log(`Menos Sorteados: ${bottom5}`);
}

console.log("Verificando estatísticas com base no cache local...");
LOTTERIES.forEach(calculateStats);
