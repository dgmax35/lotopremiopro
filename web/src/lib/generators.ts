import { LOTTERY_CONFIG, validateGame } from "./lottery-config";

// --- PRNG Utilities ---

// Generates a simple 32-bit hash from an array of numbers to use as a seed
function hashBase(base: number[]): number {
    let h = 0x811c9dc5;
    for (let i = 0; i < base.length; i++) {
        h ^= base[i];
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
}

// Mulberry32 deterministic PRNG
function mulberry32(a: number) {
    return function () {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

// Shuffles an array deterministically in-place based on a PRNG
function shuffleArray<T>(array: T[], prng: () => number) {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(prng() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Helper to find an optimal game from a pool that respects the official smart filter strategy
function generateValidGame(pool: number[], pick: number, config: any, prng: () => number, maxAttempts = 200): number[] {
    let bestCandidate: number[] = [];

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const iterationPool = [...pool];
        shuffleArray(iterationPool, prng);
        const candidate = iterationPool.slice(0, pick).sort((a, b) => a - b);

        if (attempt === 0) bestCandidate = candidate; // Fallback to first if strict rules can't be met

        if (config && validateGame(candidate, config)) {
            return candidate; // Found optimal game
        }
    }

    return bestCandidate;
}

// Utility to check if a set is valid
export function generateCombinations(source: number[], comboLength: number): number[][] {
    return [];
}

// Lotofácil R5: Exclude 5, 20 numbers remaining. Target: 24 games.
export function generateR5(excluded: number[]): number[][] {
    const allNumbers = Array.from({ length: 25 }, (_, i) => i + 1);
    const pool = allNumbers.filter(n => !excluded.includes(n));
    if (pool.length !== 20) return [];

    const games: number[][] = [];
    const seed = hashBase(excluded);
    const prng = mulberry32(seed);
    const config = LOTTERY_CONFIG["lotofacil"];

    for (let i = 0; i < 24; i++) {
        games.push(generateValidGame(pool, 15, config, prng));
    }

    return games;
}

// Lotofácil R7: Exclude 7. 18 numbers remaining. Target: 24 games.
export function generateR7(excluded: number[]): number[][] {
    const allNumbers = Array.from({ length: 25 }, (_, i) => i + 1);
    const pool = allNumbers.filter(n => !excluded.includes(n));
    if (pool.length !== 18) return [];

    const games: number[][] = [];
    const seed = hashBase(excluded);
    const prng = mulberry32(seed);
    const config = LOTTERY_CONFIG["lotofacil"];

    for (let i = 0; i < 24; i++) {
        games.push(generateValidGame(pool, 15, config, prng));
    }

    return games;
}

// Mega-Sena: 30 base numbers -> 45 games of 6.
export function generateMega30(base: number[]): number[][] {
    if (base.length !== 30) return [];

    const games: number[][] = [];
    const seed = hashBase(base);
    const prng = mulberry32(seed);
    const config = LOTTERY_CONFIG["megasena"];

    for (let i = 0; i < 45; i++) {
        games.push(generateValidGame(base, 6, config, prng));
    }
    return games;
}

// Quina: 12 base -> 24 games of 5.
export function generateQuina12(base: number[]): number[][] {
    if (base.length !== 12) return [];

    const games: number[][] = [];
    const seed = hashBase(base);
    const prng = mulberry32(seed);
    const config = LOTTERY_CONFIG["quina"];

    for (let i = 0; i < 24; i++) {
        games.push(generateValidGame(base, 5, config, prng));
    }
    return games;
}

// Lotomania: 65 base -> 10 games of 50.
export function generateLotomania65(base: number[]): number[][] {
    if (base.length !== 65) return [];

    const games: number[][] = [];
    const seed = hashBase(base);
    const prng = mulberry32(seed);
    const config = LOTTERY_CONFIG["lotomania"];

    for (let i = 0; i < 10; i++) {
        games.push(generateValidGame(base, 50, config, prng));
    }
    return games;
}

// Dia de Sorte: 20 base -> 10 games of 7.
export function generateDiaDeSorte20(base: number[]): number[][] {
    if (base.length !== 20) return [];

    const games: number[][] = [];
    const seed = hashBase(base);
    const prng = mulberry32(seed);
    const config = LOTTERY_CONFIG["diadesorte"];

    for (let i = 0; i < 10; i++) {
        games.push(generateValidGame(base, 7, config, prng));
    }
    return games;
}

// Dupla Sena: 24 base -> 12 games of 6.
export function generateDuplaSena24(base: number[]): number[][] {
    if (base.length !== 24) return [];

    const games: number[][] = [];
    const seed = hashBase(base);
    const prng = mulberry32(seed);
    const config = LOTTERY_CONFIG["duplasena"];

    for (let i = 0; i < 12; i++) {
        games.push(generateValidGame(base, 6, config, prng));
    }
    return games;
}

// Timemania: 25 base -> 10 games of 10.
export function generateTimemania25(base: number[]): number[][] {
    if (base.length !== 25) return [];

    const games: number[][] = [];
    const seed = hashBase(base);
    const prng = mulberry32(seed);
    const config = LOTTERY_CONFIG["timemania"];

    for (let i = 0; i < 10; i++) {
        games.push(generateValidGame(base, 10, config, prng));
    }
    return games;
}
