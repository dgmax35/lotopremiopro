"use client";

import { useAuth } from "@/context/AuthContext";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    ShieldCheck,
    UserX,
    UserCheck,
    Trash2,
    MessageCircle,
    Clock,
    CheckCircle,
    XCircle
} from "lucide-react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function ApprovalsPage() {
    const { isAdmin, getAllUsers, updateUserStatus, deleteUser } = useAuth();
    const [pendingUsers, setPendingUsers] = useState<any[]>([]);

    useEffect(() => {
        if (!isAdmin) {
            redirect("/");
        }
        refreshUsers();
    }, [isAdmin]);

    const refreshUsers = () => {
        const all = getAllUsers();
        setPendingUsers(all.filter(u => u.status === "pending"));
    };

    const handleApprove = (email: string) => {
        updateUserStatus(email, "active", false); // Approve as basic user by default
        refreshUsers();
    };

    const handleBlock = (email: string) => {
        updateUserStatus(email, "blocked", false);
        refreshUsers();
    };

    const handleDelete = (email: string) => {
        if (confirm("Tem certeza que deseja excluir esta solicitação?")) {
            deleteUser(email);
            refreshUsers();
        }
    };

    if (!isAdmin) return null;

    return (
        <div className="p-4 md:p-8 space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tighter uppercase flex items-center gap-3">
                        <Clock className="h-8 w-8" />
                        Aprovações Pendentes
                    </h1>
                    <p className="text-muted-foreground font-medium">
                        Analise e autorize o acesso de novos usuários.
                    </p>
                </div>
            </div>

            <Card className="border-none shadow-2xl">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold uppercase tracking-tight">Solicitações</CardTitle>
                            <CardDescription>Usuários aguardando liberação do sistema.</CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">
                            {pendingUsers.length} Pendentes
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="font-bold uppercase text-[10px]">Data</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px]">Nome</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px]">Email</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px]">WhatsApp</TableHead>
                                    <TableHead className="text-right font-bold uppercase text-[10px]">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingUsers.map((u) => (
                                    <TableRow key={u.email} className="hover:bg-muted/30">
                                        <TableCell className="text-[11px] text-muted-foreground">
                                            {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                                        </TableCell>
                                        <TableCell className="font-bold">{u.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                                        <TableCell>
                                            <a
                                                href={`https://wa.me/${u.whatsapp?.replace(/\D/g, "")}`}
                                                target="_blank"
                                                className="flex items-center gap-1 text-green-600 hover:underline font-medium"
                                            >
                                                <MessageCircle className="h-4 w-4" />
                                                {u.whatsapp}
                                            </a>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700 gap-1"
                                                    onClick={() => handleApprove(u.email)}
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                    Aprovar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-destructive hover:bg-destructive/10 gap-1"
                                                    onClick={() => handleBlock(u.email)}
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                    Barrar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-muted-foreground hover:bg-destructive/10"
                                                    onClick={() => handleDelete(u.email)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {pendingUsers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-16 text-muted-foreground italic">
                                            Nenhuma aprovação pendente no momento.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
