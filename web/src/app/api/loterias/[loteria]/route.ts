import { NextResponse } from "next/server";
import { fetchWithHistory } from "@/lib/server-fetch";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ loteria: string }> }
) {
    try {
        const { loteria } = await params;
        const results = await fetchWithHistory(loteria);

        if (!results || results.length === 0) {
            return NextResponse.json({ error: "No data available" }, { status: 404 });
        }

        return NextResponse.json(results, {
            headers: {
                "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
            },
        });

    } catch (error) {
        console.error("Server Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
