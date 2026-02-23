import { NextResponse } from "next/server";

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
    return NextResponse.json(LOTTERIES);
}
