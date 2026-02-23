"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Video } from "lucide-react";
import Link from "next/link";

export const ARTICLES = [
    {
        id: 1,
        slug: "como-funcionam-os-fechamentos",
        title: "Como funcionam os Fechamentos",
        category: "Estratégia",
        description: "Entenda a matemática por trás dos sistemas R5 e R7 e como eles garantem prêmios se as condições forem atendidas.",
        type: "article",
        readTime: "5 min",
        content: `
            <h2 class="text-2xl font-bold mb-4">O que são Fechamentos?</h2>
            <p class="mb-4">Os fechamentos (ou desdobramentos) são técnicas matemáticas que permitem apostar em mais números de forma otimizada. Em vez de fazer todas as combinações possíveis, os fechamentos eliminam as apostas repetidas desnecessárias, garantindo uma premiação mínima se certas condições forem atingidas.</p>
            
            <h3 class="text-xl font-bold mb-3">Sistemas R5 e R7</h3>
            <p class="mb-4">Os sistemas mais conhecidos na Lotofácil são o R5 (Erre 5) e o R7 (Erre 7). No R5, você escolhe 20 números dos 25 disponíveis. Se os 5 números sorteados estiverem entre os 5 que você NÃO escolheu (ou seja, você errou os 5), o sistema garante o prêmio de 14 pontos.</p>
            
            <h3 class="text-xl font-bold mb-3">Vantagens do Fechamento</h3>
            <ul class="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Economia:</strong> Custa muito menos do que uma aposta múltipla oficial.</li>
                <li><strong>Garantia Matemática:</strong> Premiações garantidas por lei de probabilidade.</li>
                <li><strong>Otimização:</strong> Cobertura de um campo maior de números.</li>
            </ul>
        `
    },
    {
        id: 2,
        slug: "analise-de-frequencia-mito-ou-verdade",
        title: "Análise de Frequência: Mito ou Verdade?",
        category: "Estatística",
        description: "Exploramos a lei dos grandes números e como a frequência passada pode (ou não) influenciar sorteios futuros.",
        type: "article",
        readTime: "8 min",
        content: `
            <h2 class="text-2xl font-bold mb-4">Números Quentes e Frios</h2>
            <p class="mb-4">Muitos apostadores acreditam que existem números "quentes" (que saem mais) e números "frios" (que estão atrasados). Do ponto de vista matemático, cada sorteio é um evento independente. A bolinha não tem memória.</p>
            
            <h3 class="text-xl font-bold mb-3">A Lei dos Grandes Números</h3>
            <p class="mb-4">Esta lei afirma que, conforme o número de sorteios aumenta (milhares ou milhões), a frequência de todos os números tende a se igualar. No entanto, no curto prazo (algumas centenas de sorteios), é normal vermos desvios estatísticos onde certos números aparecem mais.</p>
            
            <h3 class="text-xl font-bold mb-3">Como usar isso?</h3>
            <p class="mb-4">Muitas estratégias sugerem equilibrar seu jogo entre números que saem muito e números que estão atrasados, buscando o equilíbrio da média histórica.</p>
        `
    },
    {
        id: 3,
        slug: "gestao-de-banca-para-loterias",
        title: "Gestão de Banca para Loterias",
        category: "Educação Financeira",
        description: "Aprenda a jogar com responsabilidade definindo um orçamento mensal e estratégias de reinvestimento.",
        type: "guide",
        readTime: "12 min",
        content: `
            <h2 class="text-2xl font-bold mb-4">Nunca Aposte o que Não Pode Perder</h2>
            <p class="mb-4">O primeiro passo para o sucesso é a disciplina. Defina um valor mensal para suas apostas que não comprometa seu sustento ou de sua família.</p>
            
            <h3 class="text-xl font-bold mb-3">Técnica dos 30%</h3>
            <p class="mb-4">Uma estratégia comum em apostas profissionais é separar 30% dos prêmios ganhos para reinvestir em novos fechamentos, enquanto os 70% restantes são seu lucro líquido.</p>
            
            <h3 class="text-xl font-bold mb-3">Apostas Móveis</h3>
            <p class="mb-4">Aumente o valor das suas apostas apenas quando houver concursos acumulados ou especiais (como Mega da Virada ou Lotofácil da Independência), mantendo a base estável nos concursos comuns.</p>
        `
    },
    {
        id: 4,
        slug: "probabilidade-da-mega-sena",
        title: "Probabilidade da Mega-Sena",
        category: "Matemática",
        description: "Uma visão profunda sobre as chances reais de ganhar na principal loteria do país.",
        type: "video",
        readTime: "10 min",
        content: `
            <h2 class="text-2xl font-bold mb-4">1 em 50 Milhões</h2>
            <p class="mb-4">A chance matemática exata de acertar as 6 dezenas da Mega-Sena com uma aposta simples de 6 números é de 1 em 50.063.860.</p>
            
            <h3 class="text-xl font-bold mb-3">Aumentando as Chances</h3>
            <p class="mb-4">Ao jogar com 7 números, sua chance cai para 1 em 7 milhões. Com 15 números (o máximo permitido em cartela), a chance sobe para 1 em 10 mil.</p>
            
            <h3 class="text-xl font-bold mb-3">Dica de Ouro</h3>
            <p class="mb-4">Matematicamente, é mais eficiente participar de bolões com muitas dezenas do que fazer várias apostas simples individuais.</p>
        `
    }
];

export default function LibraryPage() {
    return (
        <div className="container mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Biblioteca do Apostador</h1>
                <p className="text-muted-foreground">
                    Conteúdos educativos, estratégias e guias matemáticos.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ARTICLES.map((article) => (
                    <Card key={article.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded-full mb-2 block w-fit">
                                    {article.category}
                                </span>
                                {article.type === "video" ? <Video className="h-4 w-4 text-muted-foreground" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
                            </div>
                            <CardTitle className="text-xl">{article.title}</CardTitle>
                            <CardDescription>{article.readTime} de leitura</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-muted-foreground">
                                {article.description}
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Link href={`/library/${article.slug}`} className="w-full">
                                <Button variant="outline" className="w-full hover:bg-primary hover:text-white transition-colors">
                                    <BookOpen className="mr-2 h-4 w-4" /> Ler Conteúdo
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
