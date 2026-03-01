import { NextResponse } from "next/server";
import { fetchLatestOnly } from "@/lib/server-fetch";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ loteria: string }> }
) {
    try {
        const { loteria } = await params;
        const result = await fetchLatestOnly(loteria);

        if (!result) {
            return NextResponse.json({ error: "Failed to fetch lottery data" }, { status: 404 });
        }

        return NextResponse.json(result, {
            headers: {
                "Cache-Control": "no-store, max-age=0",
            },
        });

    } catch (error) {
        console.error("Server Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
