import { NextResponse } from "next/server";
import { generateRecommendedGames } from "@/lib/recommendation-engine";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { loteria, budget, price } = body;

        if (!loteria || !budget) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const games = generateRecommendedGames(loteria, parseFloat(budget), price ? parseFloat(price) : undefined);

        return NextResponse.json({
            loteria,
            budget,
            games,
            count: games.length
        });

    } catch (error) {
        console.error("Recommendation API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
