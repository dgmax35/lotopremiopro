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

export function validateGame(game: number[], config: any): boolean {
    // 1. Parity Check
    if (config.evenOddRatio) {
        const evens = game.filter(n => n % 2 === 0).length;
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
