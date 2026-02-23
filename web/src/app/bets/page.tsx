"use client";

import { useState, useEffect } from "react";
import { getSavedBets, deleteBet, deleteBets, SavedBet } from "@/lib/bets";
import { exportBetsToPDF } from "@/lib/pdf";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, FileDown, Printer, CheckSquare, Square, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BetsPage() {
    const [bets, setBets] = useState<SavedBet[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        setBets(getSavedBets());
    }, []);

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === bets.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(bets.map(b => b.id)));
        }
    };

    const handleDelete = (id: string) => {
        if (confirm("Tem certeza que deseja excluir esta aposta?")) {
            deleteBet(id);
            setBets(getSavedBets());
            const newSelected = new Set(selectedIds);
            newSelected.delete(id);
            setSelectedIds(newSelected);
        }
    };

    const handleDeleteSelected = () => {
        const count = selectedIds.size;
        if (count === 0) return;

        const message = count === bets.length
            ? "Tem certeza que deseja excluir TODAS as apostas?"
            : `Tem certeza que deseja excluir as ${count} apostas selecionadas?`;

        if (confirm(message)) {
            deleteBets(Array.from(selectedIds));
            setBets(getSavedBets());
            setSelectedIds(new Set());
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        exportBetsToPDF(bets);
    };

    return (
        <div className="container mx-auto p-6 space-y-8 print:p-0 print:space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tighter uppercase text-[#005ca9] dark:text-white">Gerenciador de Apostas</h1>
                    <p className="text-gray-500 font-medium">
                        Visualize e gerencie suas apostas salvas.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {bets.length > 0 && (
                        <>
                            <Button
                                variant="outline"
                                onClick={toggleSelectAll}
                                className={cn("font-bold border-2", selectedIds.size === bets.length ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "")}
                            >
                                <CheckSquare className="mr-2 h-4 w-4" />
                                {selectedIds.size === bets.length ? "Desmarcar Tudo" : "Selecionar Tudo"}
                            </Button>
                            {selectedIds.size > 0 && (
                                <Button variant="destructive" onClick={handleDeleteSelected} className="font-bold">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir Selecionados ({selectedIds.size})
                                </Button>
                            )}
                        </>
                    )}
                    <Button variant="outline" onClick={handlePrint} className="font-bold border-2">
                        <Printer className="mr-2 h-4 w-4" /> Imprimir
                    </Button>
                    <Button onClick={handleExport} className="bg-[#005ca9] font-bold">
                        <FileDown className="mr-2 h-4 w-4" /> Exportar PDF
                    </Button>
                </div>
            </div>

            {/* Print Header */}
            <div className="hidden print:block text-center mb-6">
                <h1 className="text-2xl font-bold">Loto Prêmio Pro - Relatório de Apostas</h1>
                <p className="text-sm">Gerado em {new Date().toLocaleDateString()}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 print:grid-cols-2 print:gap-2">
                {bets.length === 0 ? (
                    <div className="col-span-full text-center py-24 bg-white dark:bg-card rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800 animate-in fade-in duration-700">
                        <div className="inline-flex p-4 bg-gray-50 dark:bg-muted/50 rounded-full mb-4">
                            <CheckCircle2 className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-400">Nenhuma aposta salva</h3>
                        <p className="text-gray-400">Utilize o Gerador para criar seus próximos jogos.</p>
                    </div>
                ) : (
                    bets.map((bet) => (
                        <Card
                            key={bet.id}
                            onClick={() => toggleSelect(bet.id)}
                            className={cn(
                                "relative print:border-black print:shadow-none break-inside-avoid transition-all duration-200 cursor-pointer overflow-hidden border-2",
                                selectedIds.has(bet.id)
                                    ? "border-[#005ca9] shadow-md bg-blue-50/10 dark:bg-blue-900/10"
                                    : "border-transparent shadow-sm hover:border-gray-200 dark:hover:border-gray-700"
                            )}
                        >
                            <div className={cn(
                                "absolute top-0 left-0 w-1 h-full transition-colors",
                                selectedIds.has(bet.id) ? "bg-[#005ca9]" : "bg-gray-100 dark:bg-gray-800"
                            )} />

                            <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                                <div className="flex gap-3">
                                    <div className="mt-1">
                                        {selectedIds.has(bet.id) ? (
                                            <CheckSquare className="h-5 w-5 text-[#005ca9]" />
                                        ) : (
                                            <Square className="h-5 w-5 text-gray-300" />
                                        )}
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-bold">{bet.name}</CardTitle>
                                        <CardDescription className="text-xs font-medium uppercase tracking-wider text-gray-500">
                                            {bet.lottery} • {new Date(bet.date).toLocaleDateString()}
                                        </CardDescription>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10 print:hidden relative z-10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(bet.id);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="p-4 pt-2 pl-12">
                                <div className="flex flex-wrap gap-1.5">
                                    {bet.numbers.map(n => (
                                        <span key={n} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-muted border-2 border-gray-100 dark:border-gray-800 text-sm font-black text-[#005ca9] dark:text-blue-400 print:border print:bg-white shadow-sm">
                                            {n}
                                        </span>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
