// src/lib/gameStats.ts

export interface GameStats {
    oddCount?: number;
    evenCount?: number;
    sum?: number;
    probability?: string;
    description?: string;
    pointsExpected?: string;
}

export function calculateGameStats(game: number[], systemId: string, totalGames: number): GameStats {
    let oddCount = 0;
    let evenCount = 0;
    let sum = 0;

    game.forEach(n => {
        if (n % 2 === 0) evenCount++;
        else oddCount++;
        sum += n;
    });

    const stats: GameStats = { oddCount, evenCount, sum };

    if (systemId === "megasena-30") {
        // C(30, 6) = 593,775. So 45 games is 45 / 593,775 = 1 in 13,195 chance roughly for the Sena within this 30-pool.
        stats.probability = `1 em 13.195 (Base 30)`;
        stats.description = `Soma: ${sum} | ${evenCount}P ${oddCount}Í`;
    } else if (systemId.startsWith("lotofacil-r7")) {
        stats.probability = `Fechamento R7 - Alta probabilidade 14 pts`;
        stats.description = `Soma: ${sum} | ${evenCount}P ${oddCount}Í`;
    } else if (systemId === "lotomania-65") {
        stats.pointsExpected = `Metas: 18-20 pts`;
        stats.description = `Soma: ${sum} | ${evenCount}P ${oddCount}Í`;
    } else if (systemId === "quina-12") {
        stats.pointsExpected = `Foco: Quadra / Terno`;
        stats.description = `${evenCount}P ${oddCount}Í`;
    } else {
        stats.description = `Soma: ${sum} | ${evenCount}P ${oddCount}Í`;
    }

    return stats;
}
