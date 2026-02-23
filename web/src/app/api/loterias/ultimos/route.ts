import { NextResponse } from "next/server";

// Using the Guidi wrapper as it supports "all latest" via individual calls or similar.
// Actually, fetching "Ultimos" (Latest of ALL) usually requires N fetches.
// loteriascaixa-api doesn't have a single "all latest" endpoint.
// We will implement it by firing parallel requests.

const EXTERNAL_API_BASE = "https://loteriascaixa-api.herokuapp.com/api";
const LOTTERIES = [
    "megasena",
    "lotofacil",
    "quina",
    "lotomania",
    "timemania",
    "duplasena",
    "diadesorte",
    "supersete",
    "maismilionaria",
    "loteca",
    "federal"
];

export async function GET() {
    try {
        // Parallel fetch all latest
        const promises = LOTTERIES.map(async (slug) => {
            try {
                const res = await fetch(`${EXTERNAL_API_BASE}/${slug}/latest`);
                if (!res.ok) return null;
                const data = await res.json();
                return {
                    loteria: slug,
                    resultado: data // Nesting to match previous "MOCK_DATA" structure if needed, or just return flattened?
                    // The previous "MOCK_DATA" in db.ts was [{ loteria: "...", resultado: { ... } }]
                    // My api.ts client expects THIS structure for "getResults"? 
                    // No, getResults expects Resultado[]. 
                    // But the "ultimos" endpoint wasn't standard.

                    // Let's check `src/lib/api.ts`. It doesn't seemingly use "ultimos" endpoint?
                    // It uses `getLotteries` (list of strings) and `getLatestResult` (single).

                    // The USER asked for "ultimos" earlier. I will maintain the structure:
                    // [{ "loteria": "MEGA-SENA", "resultado": { ... } }]
                };
            } catch (e) {
                return null;
            }
        });

        const results = await Promise.all(promises);
        const validResults = results.filter(r => r !== null);

        return NextResponse.json(validResults);

    } catch (error) {
        return NextResponse.json([], { status: 500 });
    }
}
