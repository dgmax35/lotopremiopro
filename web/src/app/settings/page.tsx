"use client";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { User, Shield, Moon, Sun, Monitor, Trash2, LogOut, Bell } from "lucide-react";

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const [notifications, setNotifications] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem("loto-premio-notifications");
        if (stored !== null) {
            setNotifications(stored === "true");
        }
    }, []);

    const toggleNotifications = () => {
        const newState = !notifications;
        setNotifications(newState);
        localStorage.setItem("loto-premio-notifications", String(newState));
    };

    const clearCache = () => {
        // Clear application local storage related to cache but keep auth and theme
        Object.keys(localStorage).forEach(key => {
            if (key !== "loto-premio-user" && key !== "loto-premio-theme" && key !== "loto-premio-notifications") {
                localStorage.removeItem(key);
            }
        });
        alert("Cache de resultados limpo com sucesso!");
    };

    return (
        <div className="container mx-auto max-w-4xl p-6 space-y-8 animate-in fade-in duration-500">
            <div className="space-y-2 pt-4">
                <h1 className="text-3xl font-black tracking-tighter uppercase text-[#005ca9] dark:text-white">Configurações</h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Gerencie sua conta e preferências do sistema.</p>
            </div>

            <div className="grid gap-6">
                {/* Profile Section */}
                <Card className="border-none shadow-lg bg-white dark:bg-card overflow-hidden">
                    <div className="h-2 bg-[#005ca9]" />
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full text-[#005ca9] dark:text-blue-400">
                            <User className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Perfil do Usuário</CardTitle>
                            <CardDescription>Informações básicas da sua conta.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 dark:bg-muted/50 rounded-lg transition-colors">
                            <div>
                                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome de Usuário</p>
                                <p className="text-lg font-medium">{user?.name || "Visitante"}</p>
                            </div>
                            <div className="mt-4 md:mt-0">
                                <Badge variant={user?.isPremium ? "default" : "secondary"} className={user?.isPremium ? "bg-green-600 hover:bg-green-700" : ""}>
                                    {user?.isPremium ? (
                                        <div className="flex items-center gap-1">
                                            <Shield className="h-3 w-3" /> Conta Premium
                                        </div>
                                    ) : "Conta Gratuita"}
                                </Badge>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-muted/50 rounded-lg transition-colors">
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">E-mail</p>
                            <p className="text-lg font-medium">{user?.email || "usuario@exemplo.com"}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Appearance & Preferences */}
                <Card className="border-none shadow-lg bg-white dark:bg-card overflow-hidden">
                    <div className="h-2 bg-[#ff9d00]" />
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-full text-[#ff9d00] dark:text-orange-400">
                            <Sun className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Preferências</CardTitle>
                            <CardDescription>Personalize sua experiência visual.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tema da Interface</p>
                            <div className="grid grid-cols-3 gap-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setTheme("light")}
                                    className={cn(
                                        "flex flex-col items-center gap-2 h-20 border-2 transition-all",
                                        theme === "light" ? "border-[#005ca9] bg-blue-50/50 dark:bg-blue-900/20" : "hover:border-[#005ca9]"
                                    )}
                                >
                                    <Sun className={cn("h-5 w-5", theme === "light" && "text-[#005ca9]")} />
                                    <span className={cn(theme === "light" && "text-[#005ca9] font-bold")}>Claro</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setTheme("dark")}
                                    className={cn(
                                        "flex flex-col items-center gap-2 h-20 border-2 transition-all",
                                        theme === "dark" ? "border-[#005ca9] bg-blue-50/50 dark:bg-blue-900/20" : "hover:border-[#005ca9]"
                                    )}
                                >
                                    <Moon className={cn("h-5 w-5", theme === "dark" && "text-[#005ca9]")} />
                                    <span className={cn(theme === "dark" && "text-[#005ca9] font-bold")}>Escuro</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setTheme("system")}
                                    className={cn(
                                        "flex flex-col items-center gap-2 h-20 border-2 transition-all",
                                        theme === "system" ? "border-[#005ca9] bg-blue-50/50 dark:bg-blue-900/20" : "hover:border-[#005ca9]"
                                    )}
                                >
                                    <Monitor className={cn("h-5 w-5", theme === "system" && "text-[#005ca9]")} />
                                    <span className={cn(theme === "system" && "text-[#005ca9] font-bold")}>Sistema</span>
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-muted/50 rounded-lg transition-colors">
                            <div className="flex items-center gap-3">
                                <Bell className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="font-bold">Notificações</p>
                                    <p className="text-sm text-gray-500">Receber alertas de novos resultados.</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                onClick={toggleNotifications}
                                className={cn("font-bold px-4", notifications ? "text-green-600" : "text-gray-400")}
                            >
                                {notifications ? "Ativado" : "Desativado"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* System & Danger Zone */}
                <Card className="border-none shadow-lg bg-white dark:bg-card overflow-hidden">
                    <div className="h-2 bg-red-600" />
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full text-red-600">
                            <Trash2 className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-red-600">Gerenciamento e Log</CardTitle>
                            <CardDescription>Ações críticas do sistema.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border-2 border-dashed border-red-100 dark:border-red-900/30 rounded-lg group hover:border-red-200 transition-colors">
                            <div>
                                <p className="font-bold">Limpar Dados Locais</p>
                                <p className="text-sm text-gray-500">Remove o cache de resultados e estatísticas.</p>
                            </div>
                            <Button variant="ghost" onClick={clearCache} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                <Trash2 className="h-4 w-4 mr-2" /> Limpar
                            </Button>
                        </div>

                        <div className="pt-4 border-t flex justify-end">
                            <Button variant="destructive" onClick={logout} className="font-bold px-8">
                                <LogOut className="h-4 w-4 mr-2" /> Sair da Conta
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <p className="text-center text-xs text-gray-400 font-medium pb-8 uppercase tracking-widest">
                Versão do Sistema: 1.2.0-stable | Loto Prêmio Pro
            </p>
        </div>
    );
}
