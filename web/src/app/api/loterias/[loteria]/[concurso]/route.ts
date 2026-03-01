import { NextResponse } from "next/server";
import { fetchLatestOnly } from "@/lib/server-fetch";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ loteria: string; concurso: string }> }
) {
    try {
        const { loteria, concurso } = await params;
        const result = await fetchLatestOnly(loteria, concurso);

        if (!result) {
            return NextResponse.json({ error: "Contest not found" }, { status: 404 });
        }

        return NextResponse.json(result, {
            headers: {
                "Cache-Control": "no-cache",
            },
        });

    } catch (error) {
        console.error("Server Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
