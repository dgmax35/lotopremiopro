"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Lock } from "lucide-react";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get("pending") === "true") {
            setSuccess("Cadastro realizado com sucesso! Sua conta está aguardando aprovação administrativa.");
        }
    }, [searchParams]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const result = login(email, password);
        if (!result.success) {
            setError(result.message || "Erro ao entrar.");
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-[400px]">
            <CardHeader>
                <div className="flex justify-center mb-6">
                    <div className="relative h-36 w-full">
                        <Image
                            src="/logo.png"
                            alt="Loto Prêmio Pro"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>
                <CardDescription className="text-center">Entre para acessar a plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-md text-center font-medium">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-500/10 text-green-600 text-xs p-3 rounded-md text-center font-medium">
                            {success}
                        </div>
                    )}
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium">Senha</label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Entrando..." : "Entrar"}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 border-t py-4">
                <Link href="/register" className="text-sm text-primary hover:underline font-medium">
                    Não tem conta? Cadastre-se agora
                </Link>
                <div className="text-[10px] text-muted-foreground text-center">
                    Admin: diegomaximo47@gmail.com / senha: 123
                </div>
            </CardFooter>
        </Card>
    );
}

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/20 p-4">
            <Suspense fallback={<div className="text-sm text-muted-foreground">Carregando...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
