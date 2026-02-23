"use client";
import { useEffect, useState } from "react";
import { LotteryBall } from "./LotteryBall";
import { LOTTERY_COLORS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";

interface LotteryListItemProps {
    lotterySlug: string;
    displayName: string;
}

export function LotteryListItem({ lotterySlug, displayName }: LotteryListItemProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`/api/loterias/${lotterySlug}/latest`);
                const json = await response.json();
                setData(json);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [lotterySlug]);

    if (loading) return <Skeleton className="w-full h-[150px] rounded-xl" />;
    if (!data) return null;

    const colors = LOTTERY_COLORS[lotterySlug] || { primary: "#333", text: "#fff" };

    return (
        <div className="border-b border-gray-100 last:border-0 py-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 bg-white hover:bg-gray-50/50 transition-colors px-4">
            {/* Name and Prize */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left w-full md:w-1/4">
                <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 rounded-full" style={{ backgroundColor: colors.primary }}>
                        <svg viewBox="0 0 40 40" className="w-full h-full fill-white p-1.5">
                            <path d="M20 5c-4 0-6 2-6 6s2 6 6 6 6-2 6-6-2-6-6-6zm-10 10c0-4 2-6 6-6s6 2 6 6-2 6-6 6-6-2-6-6zm10 10c-4 0-6-2-6-6s2-6 6-6 6 2 6 6-2 6-6 6zm10-10c0 4-2 6-6 6s-6-2-6-6 2-6 6-6 6 2 6 6z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold tracking-tighter" style={{ color: colors.primary }}>{displayName}</h3>
                </div>
                {data.valorEstimadoProximoConcurso > 0 && (
                    <div className="space-y-1">
                        <p className="text-xs text-gray-400 font-medium">Estimativa de prêmio do próximo concurso. Sorteio em {data.dataProximoConcurso}:</p>
                        <p className="text-2xl font-black" style={{ color: colors.primary }}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.valorEstimadoProximoConcurso)}
                        </p>
                    </div>
                )}
            </div>

            {/* Results Balls */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <div className="flex flex-wrap justify-center gap-2">
                    {data.dezenas.map((n: string) => (
                        <LotteryBall
                            key={n}
                            number={n}
                            color={colors.primary}
                            textColor="#fff"
                        />
                    ))}
                </div>
                <div className="text-center">
                    <p className="text-2xl font-black text-[#005ca9] uppercase tracking-tighter leading-none mb-2">
                        {data.acumulou ? "Acumulou!" : "1 Ganhador"}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                        Concurso {data.concurso} - {data.data}
                    </p>
                </div>
            </div>

            {/* Link */}
            <div className="w-full md:w-auto flex justify-center">
                <a
                    href="#"
                    className="text-[#ff9d00] font-bold text-sm flex items-center hover:underline uppercase tracking-tight"
                >
                    Confira o resultado <ChevronRight className="w-4 h-4 ml-0.5" />
                </a>
            </div>
        </div>
    );
}
