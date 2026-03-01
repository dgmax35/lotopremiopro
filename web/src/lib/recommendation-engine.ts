import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), 'src', 'data', 'cache');

export const LOTTERY_PRICES: Record<string, number> = {
    "megasena": 6.00,
    "lotofacil": 3.50,
    "quina": 3.00,
    "lotomania": 3.00,
    "timemania": 3.50,
    "diadesorte": 2.50,
    "duplasena": 3.00
};

export const LOTTERY_CONFIG: Record<string, {
    total: number;
    pick: number;
    evenOddRatio?: [number, number]; // Preferred [even, odd] count
    sumRange?: [number, number]; // [min, max]
    maxSequence?: number;
}> = {
    "megasena": { total: 60, pick: 6, evenOddRatio: [3, 3], sumRange: [150, 220], maxSequence: 4 },
    "lotofacil": { total: 25, pick: 15, evenOddRatio: [7, 8], sumRange: [160, 220], maxSequence: 5 },
    "quina": { total: 80, pick: 5, evenOddRatio: [2, 3], sumRange: [150, 250], maxSequence: 3 },
    "lotomania": { total: 100, pick: 50, evenOddRatio: [25, 25], sumRange: [2200, 2800], maxSequence: 7 },
    "timemania": { total: 80, pick: 10, evenOddRatio: [5, 5], sumRange: [350, 450], maxSequence: 4 },
    "diadesorte": { total: 31, pick: 7, evenOddRatio: [3, 4], sumRange: [80, 140], maxSequence: 4 },
    "duplasena": { total: 50, pick: 6, evenOddRatio: [3, 3], sumRange: [120, 180], maxSequence: 4 },
};

interface LotteryContext {
    previousResult?: number[];
    hot: number[];
    delayed: number[];
    cold: number[];
}

function getContext(loteria: string): LotteryContext | null {
    try {
        const filePath = path.join(CACHE_DIR, `${loteria}.json`);
        if (!fs.existsSync(filePath)) return null;

        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const results = content.data || [];
        if (results.length === 0) return null;

        const config = LOTTERY_CONFIG[loteria];

        // Calculate frequency and delay
        const counts: Record<number, number> = {};
        const lastSeen: Record<number, number> = {};
        const latestContest = Math.max(...results.map((r: any) => r.concurso));

        for (let i = 1; i <= config.total; i++) {
            counts[i] = 0;
            lastSeen[i] = 0;
        }

        results.forEach((r: any) => {
            r.dezenas.forEach((d: string) => {
                const n = parseInt(d);
                counts[n] = (counts[n] || 0) + 1;
                if (!lastSeen[n] || r.concurso > lastSeen[n]) {
                    lastSeen[n] = r.concurso;
                }
            });
        });

        const stats = [];
        for (let i = 1; i <= config.total; i++) {
            stats.push({
                n: i,
                count: counts[i],
                delay: latestContest - (lastSeen[i] || 0)
            });
        }

        const byFreqDesc = [...stats].sort((a, b) => b.count - a.count);
        const byFreqAsc = [...stats].sort((a, b) => a.count - b.count);
        const byDelayDesc = [...stats].sort((a, b) => b.delay - a.delay);

        return {
            previousResult: [...results].sort((a: any, b: any) => b.concurso - a.concurso)[0]?.dezenas.map((d: string) => parseInt(d)),
            hot: byFreqDesc.map(s => s.n),
            delayed: byDelayDesc.map(s => s.n),
            cold: byFreqAsc.map(s => s.n)
        };

    } catch (e) {
        console.error("Error gathering context:", e);
        return null;
    }
}

export function generateRecommendedGames(loteria: string, budget: number, customPrice?: number): number[][] {
    const price = customPrice || LOTTERY_PRICES[loteria];
    const config = LOTTERY_CONFIG[loteria];
    if (!price || !config) return [];

    const numberOfGames = Math.floor(budget / price);
    if (numberOfGames <= 0) return [];

    const context = getContext(loteria);
    const games: number[][] = [];

    for (let i = 0; i < numberOfGames; i++) {
        let game: number[] = [];
        let attempts = 0;
        let valid = false;

        while (!valid && attempts < 500) {
            game = generateDraftGame(config, context);
            valid = validateGame(game, config);
            attempts++;
        }
        games.push(game.sort((a, b) => a - b));
    }

    return games;
}

function generateDraftGame(config: any, context: LotteryContext | null): number[] {
    const game = new Set<number>();

    if (!context) {
        // Pure random fallback if no context
        while (game.size < config.pick) {
            game.add(Math.floor(Math.random() * config.total) + 1);
        }
        return Array.from(game);
    }

    // Proportional Split: 60% Quentes, 30% Atrasadas, 10% Zebras (Frias)
    const hotCount = Math.floor(config.pick * 0.6);
    const delayedCount = Math.floor(config.pick * 0.3);
    const coldCount = config.pick - hotCount - delayedCount;

    // 1. Pick Hot
    addRandomFromPool(game, context.hot, hotCount);

    // 2. Pick Delayed
    addRandomFromPool(game, context.delayed, delayedCount);

    // 3. Pick Cold
    addRandomFromPool(game, context.cold, coldCount);

    // Fallback if we didn't get enough (due to pool exhaustion or overlaps)
    if (game.size < config.pick) {
        const remaining = Array.from({ length: config.total }, (_, i) => i + 1);
        addRandomFromPool(game, remaining, config.pick - game.size);
    }

    return Array.from(game);
}

function validateGame(game: number[], config: any): boolean {
    // 1. Parity Check
    if (config.evenOddRatio) {
        const evens = game.filter(n => n % 2 === 0).length;
        const odds = game.length - evens;
        // Accept preferred ratio +/- 1
        if (Math.abs(evens - config.evenOddRatio[0]) > 1) return false;
    }

    // 2. Sum Check
    if (config.sumRange) {
        const sum = game.reduce((a, b) => a + b, 0);
        if (sum < config.sumRange[0] || sum > config.sumRange[1]) return false;
    }

    // 3. Sequence Check
    if (config.maxSequence) {
        const sorted = [...game].sort((a, b) => a - b);
        let currentSeq = 1;
        let maxSeq = 1;
        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] === sorted[i - 1] + 1) {
                currentSeq++;
                maxSeq = Math.max(maxSeq, currentSeq);
            } else {
                currentSeq = 1;
            }
        }
        if (maxSeq > config.maxSequence) return false;
    }

    return true;
}

function addRandomFromPool(currentSet: Set<number>, pool: number[], count: number) {
    if (pool.length === 0 || count <= 0) return;

    const available = pool.filter(n => !currentSet.has(n));
    const toAdd = Math.min(count, available.length);
    let added = 0;

    while (added < toAdd) {
        const idx = Math.floor(Math.random() * available.length);
        const num = available[idx];

        currentSet.add(num);
        added++;

        available.splice(idx, 1);
    }
}
