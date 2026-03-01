"use client";
import { useEffect, useState } from "react";
import { LotteryBall, LotteryClover } from "./LotteryBall";
import { LOTTERY_COLORS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface LotteryHeroProps {
    lotterySlug: string;
    displayName: string;
}

export function LotteryHero({ lotterySlug, displayName }: LotteryHeroProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`/api/loterias/${lotterySlug}/latest`);
                const json = await response.json();
                if (json && (json.concurso || json.numero)) {
                    setData(json);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [lotterySlug]);

    if (loading) return <Skeleton className="w-full h-[400px] rounded-none" />;
    if (!data) return null;

    const colors = LOTTERY_COLORS[lotterySlug] || { primary: "#005ca9", text: "#ffffff" };

    return (
        <div
            className="relative w-full overflow-hidden py-12 px-6 flex flex-col items-center justify-center text-white text-center"
            style={{
                background: `linear-gradient(135deg, #004a8d 0%, #00a4ba 100%)`, // Official Caixa Blue Gradient
            }}
        >
            <div className="max-w-4xl w-full space-y-6">
                <div className="flex items-center justify-center space-x-3">
                    {/* Placeholder for clover logo */}
                    <svg width="40" height="40" viewBox="0 0 40 40" className="fill-white">
                        <path d="M20 5c-4 0-6 2-6 6s2 6 6 6 6-2 6-6-2-6-6-6zm-10 10c0-4 2-6 6-6s6 2 6 6-2 6-6 6-6-2-6-6zm10 10c-4 0-6-2-6-6s2-6 6-6 6 2 6 6-2 6-6 6zm10-10c0 4-2 6-6 6s-6-2-6-6 2-6 6-6 6 2 6 6z" />
                    </svg>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">{displayName}</h2>
                </div>

                <div className="text-sm opacity-90 font-medium">
                    Sorteio nº {data.concurso}. {data.data}
                </div>

                <div className="flex flex-wrap justify-center gap-2 md:gap-4 my-8">
                    {data.dezenas && Array.isArray(data.dezenas) && data.dezenas.map((n: string) => (
                        <LotteryBall
                            key={n}
                            number={n}
                            size="lg"
                            className="bg-white border-none shadow-lg text-[#005ca9]"
                        />
                    ))}
                </div>

                {data.trevos && data.trevos.length > 0 && (
                    <div className="space-y-2">
                        <div className="text-sm uppercase font-bold tracking-widest opacity-80">Trevos sorteados:</div>
                        <div className="flex justify-center gap-4">
                            {data.trevos.map((t: string, i: number) => (
                                <LotteryClover key={i} number={t} />
                            ))}
                        </div>
                    </div>
                )}

                <div className="text-6xl md:text-8xl font-black tracking-tighter drop-shadow-md py-4">
                    {data.acumulou ? "Acumulou!" : "Deu Ganhador!"}
                </div>

                <Button
                    className="bg-[#ff9d00] hover:bg-[#ff8c00] text-white rounded-md px-10 py-6 text-xl font-bold border-none shadow-lg transition-transform hover:scale-105"
                >
                    Veja o resultado
                </Button>
            </div>
        </div>
    );
}
