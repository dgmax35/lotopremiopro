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

    for (let i = 0; i < 24; i++) {
        const iterationPool = [...pool];
        shuffleArray(iterationPool, prng);
        games.push(iterationPool.slice(0, 15).sort((a, b) => a - b));
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

    for (let i = 0; i < 24; i++) {
        const iterationPool = [...pool];
        shuffleArray(iterationPool, prng);
        games.push(iterationPool.slice(0, 15).sort((a, b) => a - b));
    }

    return games;
}

// Mega-Sena: 30 base numbers -> 45 games of 6.
export function generateMega30(base: number[]): number[][] {
    if (base.length !== 30) return [];

    const games: number[][] = [];
    const seed = hashBase(base);
    const prng = mulberry32(seed);

    for (let i = 0; i < 45; i++) {
        const iterationPool = [...base];
        shuffleArray(iterationPool, prng);
        games.push(iterationPool.slice(0, 6).sort((a, b) => a - b));
    }
    return games;
}

// Quina: 12 base -> 24 games of 5.
export function generateQuina12(base: number[]): number[][] {
    if (base.length !== 12) return [];

    const games: number[][] = [];
    const seed = hashBase(base);
    const prng = mulberry32(seed);

    for (let i = 0; i < 24; i++) {
        const iterationPool = [...base];
        shuffleArray(iterationPool, prng);
        games.push(iterationPool.slice(0, 5).sort((a, b) => a - b));
    }
    return games;
}

// Lotomania: 65 base -> 10 games of 50.
export function generateLotomania65(base: number[]): number[][] {
    if (base.length !== 65) return [];

    const games: number[][] = [];
    const seed = hashBase(base);
    const prng = mulberry32(seed);

    for (let i = 0; i < 10; i++) {
        const iterationPool = [...base];
        shuffleArray(iterationPool, prng);
        games.push(iterationPool.slice(0, 50).sort((a, b) => a - b));
    }
    return games;
}

// Dia de Sorte: 20 base -> 10 games of 7.
export function generateDiaDeSorte20(base: number[]): number[][] {
    if (base.length !== 20) return [];

    const games: number[][] = [];
    const seed = hashBase(base);
    const prng = mulberry32(seed);

    for (let i = 0; i < 10; i++) {
        const iterationPool = [...base];
        shuffleArray(iterationPool, prng);
        games.push(iterationPool.slice(0, 7).sort((a, b) => a - b));
    }
    return games;
}

// Dupla Sena: 24 base -> 12 games of 6.
export function generateDuplaSena24(base: number[]): number[][] {
    if (base.length !== 24) return [];

    const games: number[][] = [];
    const seed = hashBase(base);
    const prng = mulberry32(seed);

    for (let i = 0; i < 12; i++) {
        const iterationPool = [...base];
        shuffleArray(iterationPool, prng);
        games.push(iterationPool.slice(0, 6).sort((a, b) => a - b));
    }
    return games;
}

// Timemania: 25 base -> 10 games of 10.
export function generateTimemania25(base: number[]): number[][] {
    if (base.length !== 25) return [];

    const games: number[][] = [];
    const seed = hashBase(base);
    const prng = mulberry32(seed);

    for (let i = 0; i < 10; i++) {
        const iterationPool = [...base];
        shuffleArray(iterationPool, prng);
        games.push(iterationPool.slice(0, 10).sort((a, b) => a - b));
    }
    return games;
}
