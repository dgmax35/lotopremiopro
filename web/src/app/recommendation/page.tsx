"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Wallet } from "lucide-react";
import { saveBet } from "@/lib/bets";

const LOTTERIES = [
    { value: "megasena", label: "Mega-Sena", price: 6.00 },
    { value: "lotofacil", label: "Lotofácil", price: 3.50 },
    { value: "quina", label: "Quina", price: 3.00 },
    { value: "lotomania", label: "Lotomania", price: 3.00 },
    { value: "timemania", label: "Timemania", price: 3.50 },
    { value: "diadesorte", label: "Dia de Sorte", price: 2.50 },
    { value: "duplasena", label: "Dupla Sena", price: 3.00 },
];

export default function RecommendationPage() {
    const [loteria, setLoteria] = useState("lotofacil");
    const [budget, setBudget] = useState("30.00");
    const [games, setGames] = useState<number[][]>([]);
    const [loading, setLoading] = useState(false);
    const [prices, setPrices] = useState<Record<string, number>>({});
    const [msg, setMsg] = useState("");

    // Load dynamic prices from latest results
    useEffect(() => {
        const fetchPrices = async () => {
            const newPrices: Record<string, number> = {};
            for (const l of LOTTERIES) {
                try {
                    const res = await fetch(`/api/loterias/${l.value}/latest`);
                    if (res.ok) {
                        const data = await res.json();
                        // Smart Price Detection logic
                        let price = l.price;
                        if (l.value === "lotofacil") {
                            const faixa5 = data.premiacoes.find((p: any) => p.faixa === 5);
                            if (faixa5) price = faixa5.valorPremio / 2;
                        } else if (l.value === "diadesorte") {
                            const faixa4 = data.premiacoes.find((p: any) => p.faixa === 4);
                            if (faixa4) price = faixa4.valorPremio / 2;
                        }
                        newPrices[l.value] = price;
                    } else {
                        newPrices[l.value] = l.price;
                    }
                } catch (e) {
                    newPrices[l.value] = l.price;
                }
            }
            setPrices(newPrices);
        };
        fetchPrices();
    }, []);

    const getPrice = (slug: string) => prices[slug] || LOTTERIES.find(l => l.value === slug)?.price || 0;
    const currentPrice = getPrice(loteria);

    const selectedLottery = LOTTERIES.find(l => l.value === loteria);

    const handleGenerate = async () => {
        setLoading(true);
        setGames([]);
        setMsg("");

        try {
            const res = await fetch("/api/recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ loteria, budget, price: currentPrice })
            });

            if (!res.ok) throw new Error("Erro na geração");

            const data = await res.json();
            setGames(data.games);

            if (data.games.length === 0) {
                setMsg("Orçamento insuficiente para gerar jogos.");
            }
        } catch (e) {
            console.error(e);
            setMsg("Erro ao gerar recomendações.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAll = () => {
        games.forEach((game, idx) => {
            saveBet({
                lottery: loteria,
                numbers: game,
                name: `Recomendação ${idx + 1} - ${new Date().toLocaleDateString()}`
            });
        });
        setMsg("✅ Todos os jogos foram salvos em 'Meus Jogos'!");
        setTimeout(() => setMsg(""), 3000);
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-primary">Recomendação Inteligente</h1>
                <p className="text-muted-foreground">
                    Diga quanto quer gastar e nós criamos a melhor estratégia para você baseada nas estatísticas.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* CONTROL PANEL */}
                <Card className="md:col-span-4 h-fit border-l-4 border-l-primary">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="h-5 w-5" /> Configurar Aposta
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Escolha a Loteria</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                value={loteria}
                                onChange={(e) => setLoteria(e.target.value)}
                            >
                                {LOTTERIES.map(l => (
                                    <option key={l.value} value={l.value}>
                                        {l.label} (R$ {l.price.toFixed(2)})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Seu Orçamento (R$)</label>
                            <Input
                                type="number"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                min="0"
                                step="any"
                            />
                        </div>

                        <div className="bg-muted p-3 rounded-md text-sm space-y-1">
                            <div className="flex justify-between">
                                <span>Preço por aposta:</span>
                                <span className="font-bold">R$ {selectedLottery?.price.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t mt-2">
                                <span>Jogos possíveis:</span>
                                <Badge variant="default" className="text-lg">
                                    {Math.floor(parseFloat(budget || "0") / (currentPrice || 1))}
                                </Badge>
                            </div>
                        </div>

                        <Button className="w-full" size="lg" onClick={handleGenerate} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Gerar Recomendações"}
                        </Button>

                        {msg && <p className="text-center text-sm font-medium text-emerald-600 animate-pulse">{msg}</p>}

                    </CardContent>
                </Card>

                {/* RESULTS AREA */}
                <div className="md:col-span-8 space-y-4">
                    {games.length > 0 && (
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">{games.length} Jogos Gerados</h2>
                            <Button variant="outline" onClick={handleSaveAll} className="gap-2">
                                <Save className="h-4 w-4" /> Salvar Todos
                            </Button>
                        </div>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                        {games.length === 0 && !loading && (
                            <div className="col-span-full border-2 border-dashed rounded-lg p-10 text-center text-muted-foreground">
                                Preencha o orçamento ao lado e clique em Gerar para ver nossos palpites baseados em inteligência de dados.
                            </div>
                        )}

                        {games.map((game, i) => (
                            <Card key={i} className="hover:shadow-md transition-shadow">
                                <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between space-y-0">
                                    <span className="font-bold text-sm text-muted-foreground">Jogo #{i + 1}</span>
                                    <Badge variant="secondary" className="text-xs">Smart Pick</Badge>
                                </CardHeader>
                                <CardContent className="p-3">
                                    <div className="flex flex-wrap gap-1">
                                        {game.map(n => (
                                            <span key={n} className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                                                {n}
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
