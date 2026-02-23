"use client";
import { useEffect, useState } from "react";
import { Trophy, Dices } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLotteryUpdate } from "@/hooks/useLotteryUpdate";

interface LotteryWidgetProps {
    lotterySlug: string;
    displayName: string;
    icon: "trophy" | "dices";
}

export function LotteryWidget({ lotterySlug, displayName, icon }: LotteryWidgetProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const { status } = useLotteryUpdate();

    useEffect(() => {
        // Function to fetch data
        async function fetchData() {
            try {
                // console.log(`Fetching latest for ${lotterySlug}...`);
                const response = await fetch(`/api/loterias/${lotterySlug}/latest`);
                if (!response.ok) throw new Error("Failed");
                const json = await response.json();
                setData(json);
                setError(false);
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [lotterySlug, status]); // Re-run when status changes (new result detected)

    const Icon = icon === "trophy" ? Trophy : Dices;

    if (loading) {
        return (
            <div className="rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col justify-between space-y-2 h-[124px]">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-16" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col justify-between space-y-2">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <span className="text-sm font-medium">{displayName}</span>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-sm text-red-500">Erro ao carregar</div>
            </div>
        );
    }

    // Format currency
    const value = data.valorEstimadoProximoConcurso
        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.valorEstimadoProximoConcurso)
        : "Acumulado";

    const isToday = data.dataProximoConcurso === new Date().toLocaleDateString('pt-BR');

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col justify-between space-y-2">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-sm font-medium">{displayName}</span>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">
                {lotterySlug === 'megasena' ? (
                    <div className="text-xl">Próximo: {value}</div>
                ) : (
                    `Concurso ${data.proximoConcurso}`
                )}

            </div>
            <p className="text-xs text-muted-foreground">
                {isToday ? "Sorteio Hoje!" : `Próximo: ${data.dataProximoConcurso}`}
            </p>
        </div>
    );
}
