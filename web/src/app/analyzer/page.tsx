"use client";

import { useState, useEffect, useMemo } from "react";
import { getResults, Resultado } from "@/lib/api";
import { calculateFrequencies, getTopNumbers, getBottomNumbers, calculateParImpar, getMostDelayed } from "@/lib/statistics";
import { FrequencyChart } from "@/components/lottery/FrequencyChart";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Using as base for select style
import { ArrowUpCircle, ArrowDownCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const LOTTERIES = [
    { value: "megasena", label: "Mega-Sena" },
    { value: "lotofacil", label: "Lotofácil" },
    { value: "quina", label: "Quina" },
    { value: "lotomania", label: "Lotomania" },
    { value: "timemania", label: "Timemania" },
    { value: "diadesorte", label: "Dia de Sorte" },
    { value: "duplasena", label: "Dupla Sena" },
];

export default function AnalyzerPage() {
    const [loteria, setLoteria] = useState("lotofacil");
    const [range, setRange] = useState("10"); // "10", "20", "50", "100", "all"
    const [results, setResults] = useState<Resultado[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchData = async () => {
        setLoading(true);
        setError("");

        try {
            // 1. Try to load from localStorage first
            const cachedKey = `lottery_cache_${loteria}`;
            const cachedData = localStorage.getItem(cachedKey);

            if (cachedData) {
                const { timestamp, data } = JSON.parse(cachedData);
                // If cache is less than 1 hour old and has history, use it
                if (Date.now() - timestamp < 1000 * 60 * 60 && data && data.length > 1) {
                    setResults(data);
                    setLoading(false);
                    return;
                } else {
                    // Cache is old or invalid (e.g. only 1 item from previous bug), clear it
                    localStorage.removeItem(cachedKey);
                }
            }

            // 2. Fetch fresh data
            // console.log("Fetching fresh data...");
            const data = await getResults(loteria);

            if (data && data.length > 0) {
                // Sort descending by date/concurso
                data.sort((a, b) => b.concurso - a.concurso);
                setResults(data);

                // Save to cache
                try {
                    localStorage.setItem(cachedKey, JSON.stringify({
                        timestamp: Date.now(),
                        data: data
                    }));
                } catch (e) {
                    console.warn("Quota exceeded for localStorage");
                }
            } else if (cachedData) {
                // Fallback to cache if fetch fails but we have old data
                setResults(JSON.parse(cachedData).data);
            }

        } catch (err) {
            console.error(err);
            setError("Erro ao buscar dados. Verifique sua conexão.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [loteria]);

    const filteredResults = useMemo(() => {
        if (range === "all") return results;
        const limit = parseInt(range);
        return results.slice(0, limit);
    }, [results, range]);

    const stats = useMemo(() => {
        if (filteredResults.length === 0) return null;
        const freqs = calculateFrequencies(filteredResults, results); // Pass all results for delay calc
        const top10 = getTopNumbers(freqs, 10);
        const bottom10 = getBottomNumbers(freqs, 10);
        const mostDelayed = getMostDelayed(freqs, 10);
        const parImpar = calculateParImpar(filteredResults);
        return { freqs, top10, bottom10, mostDelayed, parImpar };
    }, [filteredResults]);

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analisador Estatístico</h1>
                    <p className="text-muted-foreground">
                        Analise a frequência e tendências dos números sorteados.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        className="flex h-10 w-full md:w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={loteria}
                        onChange={(e) => setLoteria(e.target.value)}
                    >
                        {LOTTERIES.map((l) => (
                            <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                    </select>

                    <select
                        className="flex h-10 w-full md:w-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={range}
                        onChange={(e) => setRange(e.target.value)}
                    >
                        <option value="10">Últimos 10</option>
                        <option value="20">Últimos 20</option>
                        <option value="50">Últimos 50</option>
                        <option value="100">Últimos 100</option>
                        <option value="all">Todos</option>
                    </select>

                    <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {error ? (
                <div className="p-4 rounded-md bg-destructive/15 text-destructive font-medium border border-destructive/20">
                    {error}
                </div>
            ) : loading && results.length === 0 ? (
                <div className="flex justify-center py-20">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : stats ? (
                <div className="grid gap-6">
                    {/* KPI Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total de Concursos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{filteredResults.length}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pares / Ímpares</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.parImpar.pares} / {stats.parImpar.impares}</div>
                                <p className="text-xs text-muted-foreground">Distribuição total</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts Area */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Frequência dos Números</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <FrequencyChart data={stats.freqs} />
                            </CardContent>
                        </Card>

                        <div className="col-span-3 space-y-4">
                            <div className="grid grid-cols-2 gap-4 h-[45%]">
                                <Card>
                                    <CardHeader className="p-4">
                                        <CardTitle className="flex items-center gap-2 text-emerald-500 text-sm">
                                            <ArrowUpCircle className="h-4 w-4" /> Mais Sorteados
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <div className="flex flex-wrap gap-1.5 justify-center">
                                            {stats.top10.slice(0, 8).map((item) => (
                                                <div key={item.number} className="flex flex-col items-center bg-secondary p-1.5 rounded-md min-w-[2.5rem]">
                                                    <span className="font-bold text-md">{item.number}</span>
                                                    <span className="text-[10px] text-muted-foreground">{item.count}x</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="p-4">
                                        <CardTitle className="flex items-center gap-2 text-rose-500 text-sm">
                                            <ArrowDownCircle className="h-4 w-4" /> Menos Sorteados
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <div className="flex flex-wrap gap-1.5 justify-center">
                                            {stats.bottom10.slice(0, 8).map((item) => (
                                                <div key={item.number} className="flex flex-col items-center bg-secondary p-1.5 rounded-md min-w-[2.5rem]">
                                                    <span className="font-bold text-md">{item.number}</span>
                                                    <span className="text-[10px] text-muted-foreground">{item.count}x</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="h-[50%]">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-amber-500">
                                        <RefreshCw className="h-5 w-5" /> Mais Atrasados (Concursos sem sair)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {stats.mostDelayed.sort((a, b) => b.delay - a.delay).slice(0, 10).map((item) => (
                                            <div key={item.number} className="flex flex-col items-center bg-amber-500/10 border border-amber-500/20 p-2 rounded-md min-w-[3rem]">
                                                <span className="font-bold text-lg text-amber-700 dark:text-amber-400">{item.number}</span>
                                                <span className="text-xs text-muted-foreground">{item.delay}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="py-20 text-center text-muted-foreground">
                    Selecione uma loteria para carregar os dados.
                </div>
            )}
        </div>
    );
}
