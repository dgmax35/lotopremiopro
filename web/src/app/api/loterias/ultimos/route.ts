import { NextResponse } from "next/server";
import { fetchLatestOnly } from "@/lib/server-fetch";

const LOTTERIES = [
    "megasena",
    "lotofacil",
    "quina",
    "lotomania",
    "timemania",
    "duplasena",
    "diadesorte",
    "maismilionaria"
];

export async function GET() {
    try {
        console.log(`[API] Fetching LATEST for ALL lotteries with fallback logic...`);

        // Parallel fetch all latest with fallback support
        const promises = LOTTERIES.map(async (slug) => {
            try {
                const result = await fetchLatestOnly(slug);
                if (!result) return null;
                return {
                    loteria: slug,
                    resultado: result
                };
            } catch (e) {
                return null;
            }
        });

        const results = await Promise.all(promises);
        const validResults = results.filter(r => r !== null);

        return NextResponse.json(validResults, {
            headers: {
                "Cache-Control": "public, s-maxage=60",
            }
        });

    } catch (error) {
        return NextResponse.json([], { status: 500 });
    }
}
