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
    Users,
    ShieldCheck,
    UserX,
    UserCheck,
    Trash2,
    MessageCircle,
    Crown,
    Clock
} from "lucide-react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminPage() {
    const { user, isAdmin, getAllUsers, updateUserStatus, deleteUser } = useAuth();
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        if (!isAdmin) {
            redirect("/");
        }
        setUsers(getAllUsers());
    }, [isAdmin]);

    const handleRefresh = () => {
        setUsers(getAllUsers());
    };

    const handleBlock = (email: string) => {
        updateUserStatus(email, "blocked", false);
        handleRefresh();
    };

    const handleRelease = (email: string, isPremium: boolean = true) => {
        updateUserStatus(email, "active", isPremium);
        handleRefresh();
    };

    const handleDelete = (email: string) => {
        if (confirm("Tem certeza que deseja excluir este usuário?")) {
            deleteUser(email);
            handleRefresh();
        }
    };

    if (!isAdmin) return null;

    return (
        <div className="p-4 md:p-8 space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tighter uppercase flex items-center gap-3">
                        <ShieldCheck className="h-8 w-8" />
                        Painel Administrativo
                    </h1>
                    <p className="text-muted-foreground font-medium">
                        Gerencie os usuários e acessos da plataforma.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="px-3 py-1 border-primary/20 text-primary">
                        Admin: {user?.email}
                    </Badge>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-xl bg-primary text-primary-foreground">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">Total Usuários</CardTitle>
                        <Users className="h-4 w-4 opacity-70" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black">{users.length}</div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">Aprovações</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black">{users.filter(u => u.status === "pending").length}</div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">Assinantes Premium</CardTitle>
                        <Crown className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black">{users.filter(u => u.isPremium).length}</div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">Bloqueados</CardTitle>
                        <UserX className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-destructive">{users.filter(u => u.status === "blocked").length}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-xl font-bold uppercase tracking-tight">Lista de Usuários</CardTitle>
                    <CardDescription>Visualize e gerencie as permissões de cada usuário.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="font-bold uppercase text-[10px]">Nome</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px]">Email</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px]">WhatsApp</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px]">Status</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px]">Acesso</TableHead>
                                    <TableHead className="text-right font-bold uppercase text-[10px]">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((u) => (
                                    <TableRow key={u.email} className="hover:bg-muted/30">
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
                                        <TableCell>
                                            {u.status === "active" ? (
                                                <Badge className="bg-green-500/10 text-green-600 border-none">Ativo</Badge>
                                            ) : u.status === "pending" ? (
                                                <Badge className="bg-amber-500/10 text-amber-600 border-none">Pendente</Badge>
                                            ) : (
                                                <Badge variant="destructive" className="border-none">Bloqueado</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {u.isPremium ? (
                                                <Badge className="bg-amber-500/10 text-amber-600 border-none flex items-center gap-1 w-fit">
                                                    <Crown className="h-3 w-3" />
                                                    Premium
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="border-none">Básico</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {u.status === "active" ? (
                                                    u.isPremium ? (
                                                        <Button size="sm" variant="outline" onClick={() => handleRelease(u.email, false)}>
                                                            Rebaixar
                                                        </Button>
                                                    ) : (
                                                        <Button size="sm" className="bg-amber-500 hover:bg-amber-600" onClick={() => handleRelease(u.email, true)}>
                                                            Tornar Premium
                                                        </Button>
                                                    )
                                                ) : null}

                                                {u.status === "active" ? (
                                                    <Button size="sm" variant="destructive" onClick={() => handleBlock(u.email)}>
                                                        Bloquear
                                                    </Button>
                                                ) : u.status === "pending" ? (
                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleRelease(u.email, false)}>
                                                        Aprovar
                                                    </Button>
                                                ) : (
                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleRelease(u.email, u.isPremium)}>
                                                        Desbloquear
                                                    </Button>
                                                )}

                                                {u.role !== "admin" && (
                                                    <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(u.email)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {users.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic">
                                            Nenhum usuário cadastrado.
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
