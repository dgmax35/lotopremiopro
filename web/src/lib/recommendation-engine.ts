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
    weights: Record<number, number>;
    previousResult?: number[];
    hot: number[];
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
        const weights: Record<number, number> = {};
        for (let i = 1; i <= config.total; i++) weights[i] = 1.0; // Base weight

        // Trend analysis (Last 10, 50, total)
        const applyTrend = (slice: any[], weightMultiplier: number) => {
            slice.forEach(r => {
                r.dezenas.forEach((d: string) => {
                    const n = parseInt(d);
                    weights[n] = (weights[n] || 1) + weightMultiplier;
                });
            });
        };

        applyTrend(results.slice(0, 10), 5.0); // Recent trend is very strong
        applyTrend(results.slice(0, 50), 2.0); // Medium trend
        applyTrend(results, 0.5); // Historical baseline

        const sorted = Object.entries(weights)
            .map(([n, w]) => ({ n: parseInt(n), w }))
            .sort((a, b) => b.w - a.w);

        const allNumbers = sorted.map(s => s.n);
        const qtr = Math.floor(allNumbers.length / 4);

        return {
            weights,
            previousResult: results[0]?.dezenas.map((d: string) => parseInt(d)),
            hot: allNumbers.slice(0, qtr),
            cold: allNumbers.slice(-qtr)
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
            game = generateDraftGame(loteria, config, context);
            valid = validateGame(game, config);
            attempts++;
        }
        games.push(game.sort((a, b) => a - b));
    }

    return games;
}

function generateDraftGame(loteria: string, config: any, context: LotteryContext | null): number[] {
    const game = new Set<number>();

    // Rule for Lotofácil: Repeat 8-10 from previous
    if (loteria === "lotofacil" && context?.previousResult) {
        const countToRepeat = Math.floor(Math.random() * 3) + 8; // 8, 9 or 10
        addRandomFromPool(game, context.previousResult, countToRepeat);
    }

    if (!context) {
        // Pure random fallback if no context
        while (game.size < config.pick) {
            game.add(Math.floor(Math.random() * config.total) + 1);
        }
        return Array.from(game);
    }

    // Smart pick based on weights
    const pool = Object.keys(context.weights).map(Number);
    const totalWeight = Object.values(context.weights).reduce((a, b) => a + b, 0);

    while (game.size < config.pick) {
        let r = Math.random() * totalWeight;
        for (const n of pool) {
            r -= context.weights[n];
            if (r <= 0) {
                game.add(n);
                break;
            }
        }
        // Safety break
        if (game.size === pool.length) break;
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
    if (pool.length === 0) return;
    const initialSize = currentSet.size;
    const targetSize = Math.min(initialSize + count, pool.length);
    let attempts = 0;
    while (currentSet.size < targetSize && attempts < 100) {
        const idx = Math.floor(Math.random() * pool.length);
        currentSet.add(pool[idx]);
        attempts++;
    }
}
