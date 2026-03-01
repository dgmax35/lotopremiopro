import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), 'src', 'data', 'cache');

function getCache(loteria: string) {
    try {
        const filePath = path.join(CACHE_DIR, `${loteria}.json`);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(content).data || [];
        }
    } catch (err) { }
    return [];
}

const history = getCache('lotofacil');
if (history.length === 0) {
    console.error("No history found for Lotofácil.");
    process.exit(1);
}

// Ensure sorted by newest first
history.sort((a: any, b: any) => b.concurso - a.concurso);

// Take last 20 + 50 (for context)
const last20 = history.slice(0, 20);
const contextForStats = history.slice(20, 70); // The 50 contests *before* the last 20, to simulate "Auto Friend" at that time

function countFrequency(results: any[]) {
    const counts: Record<string, number> = {};
    results.forEach(r => {
        r.dezenas.forEach((d: string) => {
            counts[d] = (counts[d] || 0) + 1;
        });
    });
    return Object.entries(counts).map(([num, count]) => ({ num, count })).sort((a, b) => a.count - b.count);
}

// 1. Simulate "Auto Friend" choosing the 5 least drawn numbers from the `contextForStats`
const freqs = countFrequency(contextForStats);
const bottom5 = freqs.slice(0, 5).map(f => parseInt(f.num));
console.log("Simulated bottom 5 from context:", bottom5);

import { generateR5 } from '../src/lib/generators';

// 2. Here we implement the backtester logic
function calculatePrize(hits: number) {
    if (hits === 15) return 2000000;
    if (hits === 14) return 2000; // Roughly 2k
    if (hits === 13) return 30;
    if (hits === 12) return 12;
    if (hits === 11) return 6;
    return 0;
}

let totalInvestment = 0;
let totalWon = 0;
let hits14or15 = 0;

console.log("Starting Backtest over last 20 contests...");

// Let's generate a single block of games based on the "Auto Friend" Bottom 5
// and test it against the actual drawn numbers in those 20 contests.
// A real backtest would re-generate BEFORE every single draw based on the history at that snapshot.
// To keep the script fast, we'll just test the generated games from the snapshot against the next 20.

const games = generateR5(bottom5);
console.log(`Generated ${games.length} heuristic games.`);

last20.forEach((contest: any) => {
    // Investment: Each game costs 3.00 (current Lotofacil price)
    const cost = games.length * 3.00;
    totalInvestment += cost;

    let contestWinnings = 0;
    const drawnNumbers = contest.dezenas.map(Number);

    games.forEach(game => {
        let hits = 0;
        game.forEach(n => {
            if (drawnNumbers.includes(n)) hits++;
        });

        if (hits >= 14) hits14or15++;
        contestWinnings += calculatePrize(hits);
    });

    totalWon += contestWinnings;
    console.log(`Concurso ${contest.concurso}: R$ ${contestWinnings} ganho (Custo R$ ${cost})`);
});

console.log('--- RESULTS ---');
console.log(`Lucro Líquido: R$ ${totalWon - totalInvestment}`);
console.log(`Prêmios Altos (14/15 pts): ${hits14or15}`);
