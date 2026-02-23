export interface SavedBet {
    id: string;
    lottery: string;
    name: string; // e.g., "Closure R5 - 1"
    numbers: number[];
    date: string;
}

const STORAGE_KEY = "loto-premio-bets";

export function saveBet(bet: Omit<SavedBet, "id" | "date">) {
    if (typeof window === "undefined") return;

    try {
        const current = getSavedBets();
        if (current.length >= 500) {
            alert("Limite de 500 apostas atingido. Remova algumas para salvar novas.");
            return;
        }

        const newBet: SavedBet = {
            ...bet,
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify([newBet, ...current]));
    } catch (e) {
        console.error("Storage error:", e);
        alert("Erro ao salvar: Espaço de armazenamento cheio.");
    }
}

export function saveBets(bets: Omit<SavedBet, "id" | "date">[]) {
    if (typeof window === "undefined") return;

    try {
        const current = getSavedBets();
        const availableSpace = 500 - current.length;

        if (availableSpace <= 0) {
            alert("Limite de 500 apostas atingido.");
            return;
        }

        const betsToSave = bets.slice(0, availableSpace);
        const newBets: SavedBet[] = betsToSave.map(bet => ({
            ...bet,
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
        }));

        localStorage.setItem(STORAGE_KEY, JSON.stringify([...newBets, ...current]));

        if (bets.length > availableSpace) {
            alert(`Apenas ${availableSpace} apostas foram salvas (limite de 500 atingido).`);
        }
    } catch (e) {
        console.error("Storage error:", e);
        alert("Erro ao salvar lote: Ocorreu um erro ao gravar os dados.");
    }
}

export function getSavedBets(): SavedBet[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
        return JSON.parse(stored);
    } catch {
        return [];
    }
}

export function deleteBet(id: string) {
    if (typeof window === "undefined") return;
    const current = getSavedBets();
    const updated = current.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function deleteBets(ids: string[]) {
    if (typeof window === "undefined") return;
    const current = getSavedBets();
    const updated = current.filter(b => !ids.includes(b.id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
