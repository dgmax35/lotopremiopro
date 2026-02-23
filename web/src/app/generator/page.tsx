"use client";

import { useState } from "react";
import { NumberSelector } from "@/components/lottery/NumberSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    generateR5,
    generateR7,
    generateMega30,
    generateLotomania65,
    generateQuina12,
    generateDiaDeSorte20,
    generateDuplaSena24,
    generateTimemania25
} from "@/lib/generators";
import { saveBet, saveBets } from "@/lib/bets";
import { getResults } from "@/lib/api";
import { calculateFrequencies, getTopNumbers, getBottomNumbers } from "@/lib/statistics";
import { Settings2, Save, Play, Trash2, Sparkles, Wand2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type SystemType = "lotofacil-r5" | "lotofacil-r7" | "megasena-30" | "lotomania-65" | "quina-12" | "diadesorte-20" | "duplasena-24" | "timemania-25";

const SYSTEMS = [
    { id: "lotofacil-r5", label: "Lotofácil R5 (Excluir 5)", lottery: "lotofacil", total: 25, selectCount: 5, action: "exclude" },
    { id: "lotofacil-r7", label: "Lotofácil R7 (Excluir 7)", lottery: "lotofacil", total: 25, selectCount: 7, action: "exclude" },
    { id: "megasena-30", label: "Mega-Sena (30 Base)", lottery: "megasena", total: 60, selectCount: 30, action: "select" },
    { id: "quina-12", label: "Quina (12 Base)", lottery: "quina", total: 80, selectCount: 12, action: "select" },
    { id: "lotomania-65", label: "Lotomania (65 Base)", lottery: "lotomania", total: 100, selectCount: 65, action: "select" },
    { id: "diadesorte-20", label: "Dia de Sorte (20 Base)", lottery: "diadesorte", total: 31, selectCount: 20, action: "select" },
    { id: "duplasena-24", label: "Dupla Sena (24 Base)", lottery: "duplasena", total: 50, selectCount: 24, action: "select" },
    { id: "timemania-25", label: "Timemania (25 Base)", lottery: "timemania", total: 80, selectCount: 25, action: "select" },
];

export default function GeneratorPage() {
    const [systemId, setSystemId] = useState<SystemType>("lotofacil-r5");
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const [generatedGames, setGeneratedGames] = useState<number[][]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAutoFriendLoading, setIsAutoFriendLoading] = useState(false);

    const activeSystem = SYSTEMS.find(s => s.id === systemId) || SYSTEMS[0];

    const toggleNumber = (n: number) => {
        if (selectedNumbers.includes(n)) {
            setSelectedNumbers(selectedNumbers.filter(x => x !== n));
        } else {
            if (selectedNumbers.length < activeSystem.selectCount) {
                setSelectedNumbers([...selectedNumbers, n]);
            }
        }
    };

    const handleGenerate = (nums: number[] = selectedNumbers) => {
        setIsGenerating(true);
        setTimeout(() => { // Simulate calculation delay for heavy UI feel
            let games: number[][] = [];

            if (systemId === "lotofacil-r5") games = generateR5(nums);
            else if (systemId === "lotofacil-r7") games = generateR7(nums);
            else if (systemId === "megasena-30") games = generateMega30(nums);
            else if (systemId === "quina-12") games = generateQuina12(nums);
            else if (systemId === "lotomania-65") games = generateLotomania65(nums);
            else if (systemId === "diadesorte-20") games = generateDiaDeSorte20(nums);
            else if (systemId === "duplasena-24") games = generateDuplaSena24(nums);
            else if (systemId === "timemania-25") games = generateTimemania25(nums);

            setGeneratedGames(games);
            setIsGenerating(false);
        }, 500);
    };

    const handleAutoFriend = async () => {
        setIsAutoFriendLoading(true);
        try {
            const results = await getResults(activeSystem.lottery);
            if (!results || results.length === 0) {
                alert("Não foi possível carregar dados estatísticos para o Amigo Automático.");
                return;
            }

            const stats = calculateFrequencies(results.slice(0, 10), results);
            let autoSelected: number[] = [];

            if (activeSystem.action === "exclude") {
                // For "Erre X", exclude the LEAST frequent (Bottom Numbers)
                // Now sorting by count ASC, then Delay DESC (most delayed if tied)
                const bottom = getBottomNumbers(stats, activeSystem.selectCount);
                autoSelected = bottom.map(s => parseInt(s.number)).sort((a, b) => a - b);
            } else {
                // For "Base X", select the MOST frequent (Top Numbers)
                const top = getTopNumbers(stats, activeSystem.selectCount);
                autoSelected = top.map(s => parseInt(s.number)).sort((a, b) => a - b);
            }

            // If stats returned fewer numbers than needed (unlikely for large history), fill with randoms
            if (autoSelected.length < activeSystem.selectCount) {
                const available = Array.from({ length: activeSystem.total }, (_, i) => i + 1)
                    .filter(n => !autoSelected.includes(n));
                while (autoSelected.length < activeSystem.selectCount && available.length > 0) {
                    const idx = Math.floor(Math.random() * available.length);
                    autoSelected.push(available[idx]);
                    available.splice(idx, 1);
                }
            }

            setSelectedNumbers(autoSelected);
            handleGenerate(autoSelected);
        } catch (error) {
            console.error("Auto Friend error:", error);
            alert("Erro ao executar Amigo Automático.");
        } finally {
            setIsAutoFriendLoading(false);
        }
    };

    const handleSave = (game: number[], index: number) => {
        saveBet({
            lottery: activeSystem.lottery,
            name: `${activeSystem.label} - Jogo ${index + 1}`,
            numbers: game
        });
        alert("Aposta salva com sucesso!");
    };

    const handleSaveAll = () => {
        if (generatedGames.length === 0) return;

        const betsToSave = generatedGames.map((game, idx) => ({
            lottery: activeSystem.lottery,
            name: `${activeSystem.label} - Jogo ${idx + 1}`,
            numbers: game
        }));

        saveBets(betsToSave);
        alert(`${generatedGames.length} apostas salvas com sucesso!`);
    };

    const clearSelection = () => {
        setSelectedNumbers([]);
        setGeneratedGames([]);
    };

    return (
        <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black tracking-tighter uppercase text-[#005ca9] dark:text-white">Gerador Inteligente</h1>
                    <p className="text-gray-500 font-medium">
                        Selecione um sistema estratégico e gere suas apostas otimizadas.
                    </p>
                </div>
                {generatedGames.length > 0 && (
                    <Button
                        onClick={handleSaveAll}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-tighter h-12 px-6 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all animate-in zoom-in duration-300"
                    >
                        <Save className="mr-2 h-5 w-5" />
                        Salvar Todas ({generatedGames.length})
                    </Button>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* CONFIGURATION PANEL */}
                <div className="md:col-span-4 space-y-6">
                    <Card className="border-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-[#005ca9] dark:text-blue-400">
                                <Settings2 className="h-5 w-5" /> Configuração
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Sistema</label>
                                <select
                                    className="flex h-11 w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-sm font-bold ring-offset-background focus:outline-none focus:ring-2 focus:ring-[#005ca9] focus:ring-offset-2 transition-all"
                                    value={systemId}
                                    onChange={(e) => {
                                        setSystemId(e.target.value as SystemType);
                                        setSelectedNumbers([]);
                                        setGeneratedGames([]);
                                    }}
                                >
                                    {SYSTEMS.map(s => (
                                        <option key={s.id} value={s.id}>{s.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="p-4 bg-muted/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 text-sm font-medium">
                                {activeSystem.action === "exclude" ? (
                                    <p>Escolha <strong>{activeSystem.selectCount}</strong> números para <strong>EXCLUIR</strong>. O sistema gerará jogos com os restantes.</p>
                                ) : (
                                    <p>Escolha <strong>{activeSystem.selectCount}</strong> números <strong>BASE</strong>. O sistema combinará esses números.</p>
                                )}
                            </div>

                            <div className="space-y-3 pt-2">
                                <Button
                                    className="w-full h-12 text-md font-bold bg-[#005ca9] hover:bg-[#004a88] shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                                    onClick={() => handleGenerate()}
                                    disabled={selectedNumbers.length !== activeSystem.selectCount || isGenerating || isAutoFriendLoading}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processando...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="mr-2 h-5 w-5 fill-current" /> Gerar Apostas
                                        </>
                                    )}
                                </Button>

                                <Button
                                    onClick={handleAutoFriend}
                                    disabled={isAutoFriendLoading || isGenerating}
                                    className={cn(
                                        "w-full h-12 text-md font-black uppercase tracking-tighter border-2 shadow-xl transition-all active:scale-[0.98]",
                                        "bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white border-yellow-300 dark:border-yellow-600"
                                    )}
                                >
                                    {isAutoFriendLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 fill-yellow-200" />
                                            Amigo Automático
                                        </div>
                                    )}
                                </Button>

                                <Button
                                    variant="ghost"
                                    className="w-full font-bold text-gray-400 hover:text-destructive hover:bg-destructive/5"
                                    onClick={clearSelection}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Limpar Seleção
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* INTERACTION PANEL */}
                <div className="md:col-span-8 space-y-6">
                    <Card className="border-2 shadow-xl rounded-3xl overflow-hidden">
                        <CardHeader className="bg-gray-50 dark:bg-muted/30 border-b pb-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-xl font-bold">Seleção de Números</CardTitle>
                                    <CardDescription className="uppercase font-black text-[#005ca9] dark:text-blue-400 tracking-widest text-xs">
                                        {activeSystem.lottery}
                                    </CardDescription>
                                </div>
                                <div className="px-3 py-1 bg-white dark:bg-card border-2 rounded-full text-xs font-black">
                                    {selectedNumbers.length} / {activeSystem.selectCount}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <NumberSelector
                                totalNumbers={activeSystem.total}
                                selected={selectedNumbers}
                                onToggle={toggleNumber}
                                maxSelect={activeSystem.selectCount}
                                label={activeSystem.action === "exclude" ? "Números para Excluir" : "Números Base"}
                            />
                        </CardContent>
                    </Card>

                    {generatedGames.length > 0 && (
                        <div className="grid gap-4 animate-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-center gap-2">
                                <Wand2 className="h-5 w-5 text-emerald-500" />
                                <h2 className="text-xl font-black uppercase text-gray-800 dark:text-white">Jogos Gerados ({generatedGames.length})</h2>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {generatedGames.map((game, idx) => (
                                    <Card key={idx} className="relative group border-2 hover:border-[#005ca9] transition-all hover:shadow-xl rounded-2xl overflow-hidden bg-white dark:bg-card">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 group-hover:bg-[#005ca9] transition-colors" />
                                        <CardContent className="p-5">
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {game.map(n => (
                                                    <span key={n} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-100 dark:border-blue-800 text-sm font-black text-[#005ca9] dark:text-blue-400 group-hover:scale-110 transition-transform">
                                                        {n}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex justify-between items-center mt-2 border-t pt-3">
                                                <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Aposta {idx + 1}</span>
                                                <Button
                                                    size="sm"
                                                    className="h-9 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl active:scale-95 transition-all"
                                                    onClick={() => handleSave(game, idx)}
                                                >
                                                    <Save className="h-4 w-4 mr-2" /> Salvar
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
