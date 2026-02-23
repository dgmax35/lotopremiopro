"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Dices,
    CheckCircle2,
    Library,
    Settings,
    Menu,
    FileText,
    BarChart3,
    Wallet,
    ShieldCheck,
    Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const sidebarItems = [
    {
        title: "Painel",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        title: "Análise",
        href: "/analyzer",
        icon: BarChart3,
    },
    {
        title: "Gerar Jogos",
        href: "/generator",
        icon: Dices,
    },
    {
        title: "Conferir",
        href: "/checker",
        icon: CheckCircle2,
    },
    {
        title: "Minhas Apostas",
        href: "/bets",
        icon: FileText,
    },
    {
        title: "Recomendação",
        href: "/recommendation",
        icon: Wallet,
    },
    {
        title: "Biblioteca",
        href: "/library",
        icon: Library,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { isAdmin, user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    console.log("Sidebar Auth Status:", { isAdmin, userEmail: user?.email });

    const items = [...sidebarItems];
    if (isAdmin) {
        items.push({
            title: "Aprovações",
            href: "/admin/approvals",
            icon: Clock,
        });
        items.push({
            title: "Administração",
            href: "/admin",
            icon: ShieldCheck,
        });
    }
    items.push({
        title: "Configurações",
        href: "/settings",
        icon: Settings,
    });

    return (
        <>
            <div className="md:hidden p-4 border-b flex items-center justify-between bg-card">
                <Link href="/" className="relative h-20 w-64">
                    <Image
                        src="/logo.png"
                        alt="Loto Prêmio Pro"
                        fill
                        className="object-contain object-left"
                        priority
                    />
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                    <Menu className="h-6 w-6" />
                </Button>
            </div>

            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen md:block",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-44 items-center justify-center border-b p-4">
                    <Link href="/" className="relative w-full h-full">
                        <Image
                            src="/logo.png"
                            alt="Loto Prêmio Pro"
                            fill
                            className="object-contain"
                            priority
                        />
                    </Link>
                </div>
                <nav className="p-4 space-y-2">
                    {items.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                pathname === item.href
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.title}
                        </Link>
                    ))}
                </nav>
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
