import { LotteryHero } from "@/components/dashboard/LotteryHero";
import { LotteryListItem } from "@/components/dashboard/LotteryListItem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Featured Hero Strategy (+Milionária style placeholder) */}
      <LotteryHero
        lotterySlug="megasena"
        displayName="Mega-Sena"
      />

      <div className="container mx-auto max-w-6xl px-4 py-8 space-y-12">
        {/* Results List */}
        <section className="bg-white">
          <div className="border-t border-gray-100">
            <LotteryListItem
              lotterySlug="lotofacil"
              displayName="Lotofácil"
            />
            <LotteryListItem
              lotterySlug="quina"
              displayName="Quina"
            />
            {/* Added more as placeholders if you have the data, or keep it to existing ones */}
          </div>
        </section>

        {/* Tools Section */}
        <section className="space-y-6 pt-12 border-t border-gray-100">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Ferramentas Pro</h2>
            <p className="text-gray-500 font-medium">Aumente suas chances com inteligência matemática avançada.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-none shadow-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
              <CardHeader>
                <CardTitle className="text-xl font-black tracking-tight text-[#005ca9]">Analisador</CardTitle>
                <CardDescription>
                  Tendências e frequências dos últimos concursos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/analyzer" className="w-full">
                  <Button className="w-full bg-[#ff9d00] hover:bg-[#ff8c00] text-white border-none font-bold">
                    Acessar Análise <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
              <CardHeader>
                <CardTitle className="text-xl font-black tracking-tight text-[#005ca9]">Gerador Pro</CardTitle>
                <CardDescription>
                  Crie jogos com fechamentos matemáticos (R5, R7).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/generator" className="w-full">
                  <Button className="w-full bg-[#005ca9] hover:bg-[#004a8d] text-white border-none font-bold">
                    Gerar Jogos <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
              <CardHeader>
                <CardTitle className="text-xl font-black tracking-tight text-[#005ca9]">Conferidor</CardTitle>
                <CardDescription>
                  Verifique suas apostas automaticamente.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/checker" className="w-full">
                  <Button className="w-full bg-white border-2 border-[#005ca9] text-[#005ca9] hover:bg-gray-50 font-bold">
                    Conferir Agora <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      {/* Disclaimer / Footer placeholder to look authenticated */}
      <footer className="bg-gray-50 border-t border-gray-100 py-12 px-4 mt-auto">
        <div className="container mx-auto max-w-6xl flex flex-col items-center space-y-6 text-center">
          <div className="flex items-center space-x-2 text-[#005ca9] opacity-70">
            {/* 18+ Icon style */}
            <div className="w-10 h-10 border-4 border-[#005ca9] rounded-full flex items-center justify-center font-black text-sm">18+</div>
            <div className="text-xs font-bold leading-tight">JOGO<br />RESPONSÁVEL</div>
          </div>
          <p className="text-[10px] text-gray-400 max-w-2xl uppercase font-bold tracking-widest">
            Este sistema é uma ferramenta de auxílio estatístico e não possui vínculo oficial com a Caixa Econômica Federal.
            Os resultados apresentados são obtidos via integração pública e devem ser verificados em canais oficiais.
          </p>
        </div>
      </footer>
    </div>
  );
}
