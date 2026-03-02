import fs from 'fs';
import path from 'path';
import { LOTTERY_PRICES, LOTTERY_CONFIG, validateGame } from './lottery-config';

const CACHE_DIR = path.join(process.cwd(), 'src', 'data', 'cache');

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
