import { Resultado } from "./api";

export interface FrequencyStats {
    number: string;
    count: number;
    percentage: number;
    delay: number; // New field for Delay (Atraso)
}

export function calculateFrequencies(results: Resultado[], totalAvailableResults: Resultado[]): FrequencyStats[] {
    const counts: Record<string, number> = {};
    const lastAppearance: Record<string, number> = {};

    // Sort total results by contest descending (just to be safe)
    // Actually, usually they come 1..N. Logic depends on order.
    // Let's assume 'results' is the SLICE we are analyzing (e.g. Last 10).
    // And 'totalAvailableResults' is the FULL history (e.g. 3000 contests) to calculate delays accurately?
    // Wait, Delay is "Current Contest - Last Seen Contest".
    // If I select "Last 10", do I want the delay *within those 10* or the *current actual delay*?
    // "Delays" usually means "How long has it been since it appeared?". This is an absolute value from the LATEST contest.
    // So if I am analyzing "Last 10", the delay of number X is still 5 if it appeared 5 games ago.
    // The delay calculation requires knowing the latest contest number.

    // Let's iterate the 'results' (the range selected) to count frequencies.
    results.forEach((r) => {
        r.dezenas.forEach((d) => {
            counts[d] = (counts[d] || 0) + 1;
        });
    });

    const totalContests = results.length;
    if (totalContests === 0) return [];

    // Find the very latest contest number in the available data to calculate delay from
    const latestContestNum = totalAvailableResults.length > 0
        ? Math.max(...totalAvailableResults.map(r => r.concurso))
        : 0;

    // Calculate Delays
    // Iterate ALL available results to find the LAST appearance of each number
    // We only need to find the FIRST occurrence when iterating backwards from latest.

    // Initialize all possible numbers for the lottery? 
    // Or just those that appeared? Better to calculate for all found in history or at least known range.
    // For simplicity, let's calculate delay for numbers found in the 'counts' (or all if we want to show zeros).
    // The user wants "Least Drawn" too, which might imply numbers with 0 count in the range.

    // Let's build a map of "Last Seen Concurso" for ALL numbers found in 'totalAvailableResults'.
    totalAvailableResults.forEach(r => {
        r.dezenas.forEach(d => {
            // We want the MAX contest number for each number
            if (!lastAppearance[d] || r.concurso > lastAppearance[d]) {
                lastAppearance[d] = r.concurso;
            }
        });
    });

    // Now build stats
    // We should include numbers that might have 0 count in the selected 'results' slice but exist in 'totalAvailableResults'
    // to show "Least Drawn" correctly (0 times).
    const allNumbers = new Set([...Object.keys(counts), ...Object.keys(lastAppearance)]);

    const stats: FrequencyStats[] = Array.from(allNumbers).map((num) => {
        const count = counts[num] || 0;
        const lastSeen = lastAppearance[num] || 0;
        const delay = latestContestNum - lastSeen;

        return {
            number: num,
            count,
            percentage: (count / totalContests) * 100,
            delay
        };
    });

    return stats.sort((a, b) => b.count - a.count);
}

export function getTopNumbers(stats: FrequencyStats[], count: number = 10) {
    // Sort by count DESC, then by delay ASC (most frequent and most recent)
    return [...stats].sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.delay - b.delay;
    }).slice(0, count);
}

export function getBottomNumbers(stats: FrequencyStats[], count: number = 10) {
    // Sort by count ASC, then by delay DESC (least frequent and least recent/most delayed)
    return [...stats].sort((a, b) => {
        if (a.count !== b.count) return a.count - b.count;
        return b.delay - a.delay;
    }).slice(0, count);
}

export function getMostDelayed(stats: FrequencyStats[], count: number = 10) {
    // Sort by delay DESC
    return [...stats].sort((a, b) => b.delay - a.delay).slice(0, count);
}

export function calculateParImpar(results: Resultado[]) {
    let pares = 0;
    let impares = 0;

    results.forEach(r => {
        r.dezenas.forEach(d => {
            if (parseInt(d) % 2 === 0) pares++;
            else impares++;
        })
    })

    return { pares, impares };
}
