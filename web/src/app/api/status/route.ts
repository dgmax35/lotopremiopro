import { NextResponse } from "next/server";
import { lotteryWatcher } from "@/lib/services/LotteryWatcher";

export async function GET() {
    const status = lotteryWatcher.getStatus();
    return NextResponse.json({
        timestamp: Date.now(),
        status
    });
}
