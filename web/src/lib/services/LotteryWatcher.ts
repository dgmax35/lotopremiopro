import { getLatestResult, Resultado } from "@/lib/api";

type LotteryStatus = {
    lottery: string;
    lastContest: number;
    lastUpdate: number;
};

// In-memory storage for the latest known contests
// In a production app with multiple instances, this should be in Redis or a DB.
let latestStatus: Record<string, LotteryStatus> = {
    megasena: { lottery: "megasena", lastContest: 0, lastUpdate: 0 },
    lotofacil: { lottery: "lotofacil", lastContest: 0, lastUpdate: 0 },
    quina: { lottery: "quina", lastContest: 0, lastUpdate: 0 },
    lotomania: { lottery: "lotomania", lastContest: 0, lastUpdate: 0 },
    timemania: { lottery: "timemania", lastContest: 0, lastUpdate: 0 },
    diadesorte: { lottery: "diadesorte", lastContest: 0, lastUpdate: 0 },
    duplasena: { lottery: "duplasena", lastContest: 0, lastUpdate: 0 },
};

const POLLING_INTERVAL_MS = 60 * 1000; // 1 minute

class LotteryWatcherService {
    private static instance: LotteryWatcherService;
    private intervalId: NodeJS.Timeout | null = null;

    private constructor() { }

    public static getInstance(): LotteryWatcherService {
        if (!LotteryWatcherService.instance) {
            LotteryWatcherService.instance = new LotteryWatcherService();
        }
        return LotteryWatcherService.instance;
    }

    public start() {
        if (this.intervalId) return;

        console.log("[LotteryWatcher] Service started.");

        // Delay initial check to allow server to bind port
        setTimeout(() => {
            console.log("[LotteryWatcher] Starting initial check/warmup...");
            this.checkAll();
        }, 10000);

        this.intervalId = setInterval(() => {
            this.checkAll();
        }, POLLING_INTERVAL_MS);
    }

    public stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    public getStatus() {
        return latestStatus;
    }

    private async checkAll() {
        const lotteries = [
            "megasena",
            "lotofacil",
            "quina",
            "lotomania",
            "timemania",
            "diadesorte",
            "duplasena"
        ];

        // Warm up cache (fetch full results) and check for updates
        // Use sequential execution to avoid rate limiting
        for (const slug of lotteries) {
            // 1. Warm up full cache
            try {
                const { getResults } = require("@/lib/api");
                await getResults(slug);
            } catch (e) {
                console.error(`[LotteryWatcher] Failed to warm up cache for ${slug}`, e);
            }

            // 2. Check latest for updates
            await this.checkLottery(slug);

            // Small delay between requests to be gentle
            await new Promise(r => setTimeout(r, 2000));
        }
    }

    private async checkLottery(slug: string) {
        try {
            // console.log(`[LotteryWatcher] Checking ${slug}...`);
            const result = await getLatestResult(slug);

            if (result) {
                const current = latestStatus[slug];

                // If it's the first run (0) or a new contest
                if (current.lastContest < result.concurso) {
                    if (current.lastContest !== 0) {
                        console.log(`[LotteryWatcher] NEW RESULT DETECTED: ${slug} ${result.concurso}`);
                    }

                    latestStatus[slug] = {
                        lottery: slug,
                        lastContest: result.concurso,
                        lastUpdate: Date.now()
                    };
                }
            }
        } catch (error) {
            console.error(`[LotteryWatcher] Error checking ${slug}:`, error);
        }
    }
}

export const lotteryWatcher = LotteryWatcherService.getInstance();
