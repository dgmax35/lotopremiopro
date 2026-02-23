"use client";

import { use } from "react";
import { ARTICLES } from "../page";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Clock, Tag, FileText, Video } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const article = ARTICLES.find(a => a.slug === slug);

    if (!article) {
        return notFound();
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Link href="/library">
                <Button variant="ghost" className="mb-4 hover:bg-muted font-medium">
                    <ChevronLeft className="mr-2 h-4 w-4" /> Voltar para Biblioteca
                </Button>
            </Link>

            <article className="bg-white dark:bg-card rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                <div className="h-4 bg-[#005ca9]" />
                <div className="p-8 md:p-12 space-y-6">
                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-[#005ca9] dark:text-blue-400 rounded-full">
                            <Tag className="h-3.5 w-3.5" />
                            {article.category}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {article.readTime} de leitura
                        </span>
                        <span className="flex items-center gap-1.5">
                            {article.type === "video" ? <Video className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                            {article.type === "article" ? "Artigo" : article.type === "guide" ? "Guia" : "Vídeo"}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 dark:text-white leading-tight">
                        {article.title}
                    </h1>

                    <div className="prose prose-blue dark:prose-invert max-w-none">
                        <div
                            className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-4"
                            dangerouslySetInnerHTML={{ __html: article.content }}
                        />
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-muted/30 p-8 border-t dark:border-gray-800">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-1 text-center md:text-left">
                            <p className="font-bold text-gray-900 dark:text-white leading-none">Gostou deste conteúdo?</p>
                            <p className="text-sm text-muted-foreground">Compartilhe com outros apostadores estrategistas.</p>
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" className="bg-[#005ca9] font-bold">Compartilhar</Button>
                            <Button size="sm" variant="outline" className="font-bold">Salvar para depois</Button>
                        </div>
                    </div>
                </div>
            </article>

            {/* Disclaimer related to authentic Caixa style */}
            <div className="text-[10px] text-gray-400 text-center uppercase font-bold tracking-widest px-8">
                Este conteúdo é meramente educativo e não garante lucros. A matemática das probabilidades é a base para o jogo consciente.
            </div>
        </div>
    );
}
