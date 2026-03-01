"use client";

import { useState, useEffect, useMemo } from "react";
import { getResults, Resultado, getLotteries } from "@/lib/api";
import { getSavedBets, SavedBet } from "@/lib/bets";
import { calculateFrequencies, FrequencyStats } from "@/lib/statistics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    TrendingUp,
    Calendar,
    CheckCircle2,
    AlertCircle,
    History,
    ArrowRight,
    Trophy,
    Target,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface LotterySchedule {
    days: number[]; // 0 = Sunday, 1 = Monday, ...
}

const LOTTERY_SCHEDULES: Record<string, LotterySchedule> = {
    megasena: { days: [2, 4, 6] },
    lotofacil: { days: [1, 2, 3, 4, 5, 6] },
    quina: { days: [1, 2, 3, 4, 5, 6] },
    lotomania: { days: [1, 3, 5] },
    timemania: { days: [2, 4, 6] },
    duplasena: { days: [1, 3, 5] },
    diadesorte: { days: [2, 4, 6] },
    federal: { days: [3, 6] },
    supersete: { days: [1, 3, 5] },
    maismilionaria: { days: [3, 6] },
};

function getNextDrawDate(lottery: string): string {
    const schedule = LOTTERY_SCHEDULES[lottery.toLowerCase()];
    if (!schedule) return "Sob consulta";

    const now = new Date();
    const currentDay = now.getDay();

    // Check if there's a draw today later than now (simple simplification)
    // For a more accurate result, we'd need the time of the draw.
    // Assuming draws are at night (~20h).

    let daysUntilNext = -1;
    for (let i = 0; i < 7; i++) {
        const checkDay = (currentDay + i) % 7;
        if (schedule.days.includes(checkDay)) {
            // If it's today, only count if it's before 20:00
            if (i === 0 && now.getHours() >= 20) continue;
            daysUntilNext = i;
            break;
        }
    }

    if (daysUntilNext === -1) return "Data não encontrada";

    const nextDate = new Date();
    nextDate.setDate(now.getDate() + daysUntilNext);

    if (daysUntilNext === 0) return "Hoje";
    if (daysUntilNext === 1) return "Amanhã";

    return nextDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

interface Recommendation {
    lottery: string;
    betName: string;
    score: number;
    explanation: string;
    details: SavedBet;
}

export default function PossibleGainsPage() {
    const [bets, setBets] = useState<SavedBet[]>([]);
    const [loading, setLoading] = useState(true);
    const [bestPerLottery, setBestPerLottery] = useState<Recommendation[]>([]);

    const fetchData = async () => {
        setLoading(true);
        const savedBets = getSavedBets();
        setBets(savedBets);

        if (savedBets.length === 0) {
            setLoading(false);
            return;
        }

        const lottosToAnalyze = Array.from(new Set(savedBets.map(b => b.lottery)));
        const allResults: Record<string, Resultado[]> = {};
        const allStats: Record<string, FrequencyStats[]> = {};

        try {
            // Fetch results for all lotteries present in bets
            await Promise.all(lottosToAnalyze.map(async (slug) => {
                const results = await getResults(slug);
                if (results && results.length > 0) {
                    allResults[slug] = results;
                    // Analyze last 100 for trends
                    const slice = results.slice(0, 100);
                    allStats[slug] = calculateFrequencies(slice, results);
                }
            }));

            // Score each bet
            const recs: Recommendation[] = savedBets.map(bet => {
                const stats = allStats[bet.lottery];
                if (!stats) return null;

                const numberMap = new Map(stats.map(s => [s.number.padStart(2, '0'), s]));

                let totalScore = 0;
                let hotCount = 0;

                bet.numbers.forEach(num => {
                    const numStr = String(num).padStart(2, '0');
                    const stat = numberMap.get(numStr);
                    if (stat) {
                        // Score based on frequency (count) and recency (inverse delay)
                        // Frequency weight: 70%, Delay weight: 30%
                        const freqScore = stat.count / 100; // max possible around 0.1 - 0.5 depending on lotto
                        const delayScore = stat.delay === 0 ? 1 : 1 / stat.delay;

                        totalScore += (freqScore * 0.7) + (delayScore * 0.3);

                        if (stat.count > 15) hotCount++; // arbitrary "hot" threshold
                    }
                });

                const normalizedScore = (totalScore / bet.numbers.length) * 100;

                return {
                    lottery: bet.lottery,
                    betName: bet.name,
                    score: Math.round(normalizedScore * 10) / 10,
                    explanation: `${hotCount} números nesta aposta estão entre os mais frequentes recentemente.`,
                    details: bet
                };
            }).filter(r => r !== null) as Recommendation[];

            // Group by lottery and find the best per lottery
            const bestsByLotto = new Map<string, Recommendation>();

            recs.forEach(rec => {
                const currentBest = bestsByLotto.get(rec.lottery);
                if (!currentBest || rec.score > currentBest.score) {
                    bestsByLotto.set(rec.lottery, rec);
                }
            });

            // Convert to array and sort by overall score just to order the cards nicely
            const finalBests = Array.from(bestsByLotto.values()).sort((a, b) => b.score - a.score);
            setBestPerLottery(finalBests);

        } catch (err) {
            console.error("Error analyzing gains:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh]">
                <Zap className="h-12 w-12 text-primary animate-pulse mb-4" />
                <h2 className="text-xl font-bold">Analisando suas chances...</h2>
                <p className="text-muted-foreground">Cruzando dados de sorteios com suas apostas.</p>
            </div>
        );
    }

    if (bets.length === 0) {
        return (
            <div className="container mx-auto p-6 space-y-8">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tighter uppercase text-[#005ca9] dark:text-white">Ganhos Possíveis</h1>
                    <p className="text-gray-500 font-medium">Potencialize seus ganhos com análise de tendências.</p>
                </div>

                <Card className="border-2 border-dashed border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-card/50">
                    <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                        <History className="h-16 w-16 text-gray-200 mb-6" />
                        <h2 className="text-2xl font-black text-gray-400">Sem apostas para analisar</h2>
                        <p className="text-gray-400 max-w-sm mt-2">
                            Você precisa ter apostas salvas no seu Gerenciador para que possamos calcular as probabilidades de ganho.
                        </p>
                        <Link href="/generator" className="mt-8">
                            <Button className="bg-[#005ca9] font-bold px-8">
                                <Zap className="mr-2 h-4 w-4" /> Gerar Jogos Agora
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tighter uppercase text-[#005ca9] dark:text-white">Ganhos Possíveis</h1>
                    <p className="text-gray-500 font-medium">As melhores chances de ganho em cada loteria gerada.</p>
                </div>
                <Button variant="outline" onClick={fetchData} className="font-bold border-2">
                    <History className="mr-2 h-4 w-4" /> Reanalisar Opções
                </Button>
            </div>

            <div className="grid gap-8">
                {bestPerLottery.map((best, index) => (
                    <Card key={best.lottery} className="bg-gradient-to-br from-[#005ca9] to-[#003d70] text-white border-none shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Trophy className="h-48 w-48 text-white" />
                        </div>
                        <CardHeader>
                            <div className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-2 backdrop-blur-sm w-fit">
                                {index === 0 ? "🏆 Melhor Chance Global" : `🔥 Destaque ${best.lottery.charAt(0).toUpperCase() + best.lottery.slice(1)}`}
                            </div>
                            <CardTitle className="text-4xl font-black tracking-tighter uppercase">{best.lottery.charAt(0).toUpperCase() + best.lottery.slice(1)}</CardTitle>
                            <CardDescription className="text-blue-100 text-lg font-medium">
                                Aposta recomendada da loteria: <span className="text-white font-bold">{best.betName}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 relative z-10">
                            <div className="grid md:grid-cols-2 gap-8 items-center">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Target className="h-6 w-6 text-emerald-400" />
                                        <span className="text-3xl font-black">{best.score}%</span>
                                        <span className="text-blue-200 font-medium">de afinidade com tendências</span>
                                    </div>
                                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                                        <p className="font-medium">{best.explanation}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-blue-100">
                                        <Calendar className="h-5 w-5" />
                                        <span className="font-bold">Próximo Sorteio:</span>
                                        <span className="text-white font-black uppercase">{getNextDrawDate(best.lottery)}</span>
                                    </div>
                                </div>
                                <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-lg border border-white/20">
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-blue-200 mb-4">Números da Aposta</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {best.details.numbers.map(n => (
                                            <div key={n} className="w-10 h-10 rounded-full bg-white text-[#005ca9] flex items-center justify-center font-black text-lg shadow-lg">
                                                {n}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900 shadow-sm relative overflow-hidden group md:col-span-2">
                    <div className="absolute top-0 right-0 p-4 transform translate-x-4 -translate-y-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform">
                        <TrendingUp className="h-24 w-24 text-emerald-500/10" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" /> Por que jogar hoje?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-emerald-600 dark:text-emerald-500 text-sm font-medium leading-relaxed">
                        Nossa inteligência detectou uma convergência de números "quentes" com suas apostas salvas. A probabilidade matemática de repetição de padrões recentes é maior em dias de sorteio acumulado.
                    </CardContent>
                </Card>

                <Card className="border-2 border-gray-100 dark:border-gray-800 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-400">Dica Pro</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-3">
                            <div className="mt-1"><CheckCircle2 className="h-4 w-4 text-[#005ca9]" /></div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Foque nas apostas com porcentagens acima de 60%.</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="mt-1"><CheckCircle2 className="h-4 w-4 text-[#005ca9]" /></div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Salve diversas opções do "Amigo Automático" para que o sistema consiga filtrar as estatisticamente mais aptas de cada jogo.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
