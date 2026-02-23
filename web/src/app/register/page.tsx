"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = register({ name, email, password, whatsapp });
            if (!result.success) {
                setError(result.message || "Erro ao cadastrar.");
            }
        } catch (err) {
            setError("Ocorreu um erro inesperado.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/20 p-4">
            <Card className="w-full max-w-[400px]">
                <CardHeader>
                    <div className="flex justify-center mb-6">
                        <div className="relative h-28 w-full">
                            <Image
                                src="/logo.png"
                                alt="Loto Prêmio Pro"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>
                    <CardDescription className="text-center">Crie sua conta para começar a ganhar.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-md text-center font-medium">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">Nome Completo</label>
                            <Input
                                id="name"
                                placeholder="Seu nome"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
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
                            <label htmlFor="whatsapp" className="text-sm font-medium">WhatsApp</label>
                            <Input
                                id="whatsapp"
                                placeholder="(00) 00000-0000"
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
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
                            {isLoading ? "Cadastrando..." : "Criar Minha Conta"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center border-t py-4">
                    <Link href="/login" className="text-sm text-primary hover:underline font-medium">
                        Já tem uma conta? Entre aqui
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
