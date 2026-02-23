"use client";

import { useState, useEffect, useMemo } from "react";
import { getLatestResult, Resultado } from "@/lib/api";
import { getSavedBets, SavedBet } from "@/lib/bets";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Trophy, CheckCircle2, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const LOTTERIES = [
    { value: "megasena", label: "Mega-Sena" },
    { value: "lotofacil", label: "Lotofácil" },
    { value: "quina", label: "Quina" },
    { value: "lotomania", label: "Lotomania" },
    { value: "timemania", label: "Timemania" },
    { value: "diadesorte", label: "Dia de Sorte" },
    { value: "duplasena", label: "Dupla Sena" },
];

export default function CheckerPage() {
    const [loteria, setLoteria] = useState("lotofacil");
    const [concursoInput, setConcursoInput] = useState("");

    const [currentResult, setCurrentResult] = useState<Resultado | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [savedBets, setSavedBets] = useState<SavedBet[]>([]);

    useEffect(() => {
        setSavedBets(getSavedBets());
    }, []);

    const fetchResult = async (contestNumber?: number) => {
        setLoading(true);
        setError("");
        setCurrentResult(null);

        try {
            let data: Resultado | null = null;
            if (contestNumber) {
                if (isNaN(contestNumber) || contestNumber <= 0) {
                    setError("Número de concurso inválido.");
                    setLoading(false);
                    return;
                }

                // Fetch specific
                console.log(`Fetching specific: /api/loterias/${loteria}/${contestNumber}`);
                const res = await fetch(`/api/loterias/${loteria}/${contestNumber}`);

                if (res.status === 404) {
                    setError("Concurso não encontrado. Verifique o número digitado.");
                    setLoading(false);
                    return;
                }

                if (!res.ok) {
                    const errText = await res.text();
                    console.error("API Error Response:", res.status, errText);
                    throw new Error("Erro na API");
                }
                data = await res.json();
            } else {
                // Fetch latest
                data = await getLatestResult(loteria);
            }

            if (data) {
                setCurrentResult(data);
                setConcursoInput(data.concurso.toString());
            } else {
                setError("Não foi possível obter os dados. Tente novamente.");
            }
        } catch (err) {
            console.error(err);
            setError("Erro ao buscar resultado. Verifique sua conexão.");
        } finally {
            setLoading(false);
        }
    };

    // Initial load (latest)
    useEffect(() => {
        fetchResult();
    }, [loteria]);

    const handleSearch = () => {
        if (!concursoInput) {
            fetchResult();
        } else {
            fetchResult(parseInt(concursoInput));
        }
    };

    const handlePrevious = () => {
        if (currentResult && currentResult.concurso > 1) {
            const prev = currentResult.concurso - 1;
            setConcursoInput(prev.toString());
            fetchResult(prev);
        }
    };

    const handleNext = () => {
        if (currentResult) {
            const next = currentResult.concurso + 1;
            setConcursoInput(next.toString());
            fetchResult(next);
        }
    };

    const countHits = (betNumbers: number[], resultNumbersStr: string[]) => {
        const resultNumbers = resultNumbersStr.map(s => parseInt(s));
        let hits = 0;
        betNumbers.forEach(n => {
            if (resultNumbers.includes(n)) hits++;
        });
        return hits;
    };

    const getMinHitsToWin = (lottery: string) => {
        switch (lottery) {
            case "lotofacil": return 11;
            case "megasena": return 4;
            case "quina": return 2;
            case "lotomania": return 15;
            case "duplasena": return 3;
            case "diadesorte": return 4;
            case "timemania": return 3;
            default: return 100;
        }
    };

    const calculatePrize = (lottery: string, hits: number, result: Resultado) => {
        if (!result.premiacoes || result.premiacoes.length === 0) return 0;

        let targetFaixa = -1;
        switch (lottery) {
            case "lotofacil":
                if (hits === 15) targetFaixa = 1;
                else if (hits === 14) targetFaixa = 2;
                else if (hits === 13) targetFaixa = 3;
                else if (hits === 12) targetFaixa = 4;
                else if (hits === 11) targetFaixa = 5;
                break;
            case "megasena":
                if (hits === 6) targetFaixa = 1;
                else if (hits === 5) targetFaixa = 2;
                else if (hits === 4) targetFaixa = 3;
                break;
            case "quina":
                if (hits === 5) targetFaixa = 1;
                else if (hits === 4) targetFaixa = 2;
                else if (hits === 3) targetFaixa = 3;
                else if (hits === 2) targetFaixa = 4;
                break;
            case "lotomania":
                if (hits === 20) targetFaixa = 1;
                else if (hits === 19) targetFaixa = 2;
                else if (hits === 18) targetFaixa = 3;
                else if (hits === 17) targetFaixa = 4;
                else if (hits === 16) targetFaixa = 5;
                else if (hits === 15) targetFaixa = 6;
                else if (hits === 0) targetFaixa = 7;
                break;
            case "timemania":
                if (hits === 7) targetFaixa = 1;
                else if (hits === 6) targetFaixa = 2;
                else if (hits === 5) targetFaixa = 3;
                else if (hits === 4) targetFaixa = 4;
                else if (hits === 3) targetFaixa = 5;
                break;
            case "duplasena":
                if (hits === 6) targetFaixa = 1;
                else if (hits === 5) targetFaixa = 2;
                else if (hits === 4) targetFaixa = 3;
                else if (hits === 3) targetFaixa = 4;
                break;
            case "diadesorte":
                if (hits === 7) targetFaixa = 1;
                else if (hits === 6) targetFaixa = 2;
                else if (hits === 5) targetFaixa = 3;
                else if (hits === 4) targetFaixa = 4;
                break;
        }

        if (targetFaixa === -1) return 0;

        const prize = result.premiacoes.find(p => p.faixa === targetFaixa);
        return prize ? prize.valorPremio : 0;
    };

    const relevantBets = savedBets.filter(b => b.lottery === loteria);

    const totalWinnings = useMemo(() => {
        if (!currentResult || relevantBets.length === 0) return 0;
        return relevantBets.reduce((acc, bet) => {
            const hits = countHits(bet.numbers, currentResult.dezenas);
            return acc + calculatePrize(loteria, hits, currentResult);
        }, 0);
    }, [currentResult, relevantBets, loteria]);

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Conferir Resultados</h1>
                    <p className="text-muted-foreground">
                        Consulte o histórico completo e confira suas apostas.
                    </p>
                </div>
                <div className="w-full md:w-[200px]">
                    <label className="text-xs font-semibold uppercase text-muted-foreground mb-1 block">Loteria</label>
                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        value={loteria}
                        onChange={(e) => {
                            setLoteria(e.target.value);
                            setConcursoInput("");
                        }}
                    >
                        {LOTTERIES.map(l => (
                            <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <Card className="border-t-4 border-t-primary">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="space-y-2 w-full md:w-[300px]">
                            <label className="text-sm font-medium">Número do Concurso</label>
                            <div className="flex gap-2">
                                <Button onClick={handlePrevious} variant="outline" size="icon" disabled={loading || (currentResult?.concurso === 1)}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Input
                                    placeholder="Último"
                                    value={concursoInput}
                                    onChange={(e) => setConcursoInput(e.target.value)}
                                    type="number"
                                    className="text-center font-bold"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <Button onClick={handleNext} variant="outline" size="icon" disabled={loading}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button onClick={handleSearch} disabled={loading} className="w-24 shrink-0">
                                    {loading ? <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" /> : "Buscar"}
                                </Button>
                            </div>
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </CardContent>
            </Card>

            {currentResult && (
                <div className="grid gap-6 md:grid-cols-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* RESULT CARD */}
                    <div className="md:col-span-12 lg:col-span-5 space-y-6">
                        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <Trophy className="text-yellow-500 h-6 w-6" />
                                            {currentResult.loteria.toUpperCase()}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-1 mt-1">
                                            <Calendar className="h-3 w-3" /> {currentResult.data}
                                        </CardDescription>
                                    </div>
                                    <Badge variant="secondary" className="text-lg">
                                        Concurso {currentResult.concurso}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {currentResult.dezenas.map(d => (
                                        <div key={d} className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-sm">
                                            {d}
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Premiação</h4>
                                    <div className="space-y-1">
                                        {currentResult.premiacoes.map((p, idx) => (
                                            <div key={idx} className="flex justify-between text-sm py-1 border-b last:border-0">
                                                <span>{p.descricao}</span>
                                                <div className="text-right">
                                                    <span className="font-bold block">{p.ganhadores} ganhadores</span>
                                                    <span className="text-muted-foreground text-xs">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valorPremio)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {currentResult.acumulou && (
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 p-3 rounded-md text-center font-bold text-sm">
                                        ACUMULOU!
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* SAVED BETS CHECK */}
                    <div className="md:col-span-12 lg:col-span-7 space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                Conferência Automática
                            </h2>
                            {totalWinnings > 0 && (
                                <div className="bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-md animate-bounce">
                                    <span className="text-xs uppercase font-bold block opacity-80">Total Ganho</span>
                                    <span className="text-xl font-black">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalWinnings)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {relevantBets.length === 0 ? (
                            <div className="p-10 border rounded-md text-center text-muted-foreground border-dashed">
                                Nenhuma aposta salva para esta loteria.
                                <br />
                                <span className="text-xs">Crie apostas no Gerador para conferir aqui.</span>
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {relevantBets.map((bet) => {
                                    const hits = countHits(bet.numbers, currentResult.dezenas);
                                    const isWin = hits >= getMinHitsToWin(loteria);

                                    return (
                                        <Card key={bet.id} className={cn("transition-all border-l-4", isWin ? "border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-l-muted-foreground/30")}>
                                            <CardHeader className="p-3 pb-1">
                                                <CardTitle className="text-sm font-bold flex justify-between uppercase">
                                                    <span>{bet.name}</span>
                                                    {isWin && <Badge className="bg-emerald-500 hover:bg-emerald-600">Premiado</Badge>}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-3">
                                                <div className="flex flex-wrap gap-1 mb-2">
                                                    {bet.numbers.map(n => {
                                                        const wasDrawn = currentResult.dezenas.includes(n.toString().padStart(2, '0'));
                                                        return (
                                                            <span key={n} className={cn("w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold", wasDrawn ? "bg-emerald-500 text-white" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800")}>
                                                                {n}
                                                            </span>
                                                        )
                                                    })}
                                                </div>
                                                <div className="flex justify-between items-end mt-2">
                                                    {isWin && (
                                                        <div className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                                                            Paga: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculatePrize(loteria, hits, currentResult))}
                                                        </div>
                                                    )}
                                                    <div className="text-xs font-medium text-right text-muted-foreground flex-1">
                                                        Acertos: <span className={cn(isWin ? "text-emerald-600 dark:text-emerald-400 text-lg font-bold" : "text-foreground font-bold")}>{hits}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
